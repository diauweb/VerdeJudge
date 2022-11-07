import { ResultType, type Result } from '$lib/result';
import type { Problem, Testcase, TestcaseGroup, TestcaseItem } from '../problem';
import { promises as fs } from 'fs';
import path from 'path';
import { TaskDirectory } from '$lib/utils';
import type Runtime from './runtime';

type TestcaseTypeProcessor = (testcase: TestcaseItem, options: TestOptions) => Promise<TestResult>;
type TestOptions = { problem: Problem, executable: string, runtime: Runtime };

const processors = new Map<string, TestcaseTypeProcessor>();

function getProcessor(name: string): TestcaseTypeProcessor | undefined {
	return processors.get(name);
}

interface TestResult extends Result {
	data: {
        message?: string,
		score: number;
		usedTime: number;
		usedMemory: number;
		children?: TestResult[];
        input_file?: string,
        answer_file?: string,
	};
}

async function testBasic(testcase: TestcaseItem, options: TestOptions): Promise<TestResult> {
    const matchInput = new RegExp(testcase['match_input'] as string);
    const withAnswer = testcase['with_answer'] as string;
    const timeLimit = testcase['time_limit'] as number;
    const memoryLimit = testcase['memory_limit'] as number;
    const perScore = testcase['per_score'] as number;

    const testcasesDir = path.join(options.problem.path, 'testcases');
    let [score, usedTime, usedMemory] = [0, 0, 0];
    let status = ResultType.STATUS_OK;
    const children: TestResult[] = [];

    const inputs = (await fs.readdir(testcasesDir)).filter(e => matchInput.test(e))
    
    for (const i of inputs) {
        const answerFile = i.replace(matchInput, withAnswer);
        const ansContent = (await fs.readFile(path.join(testcasesDir, answerFile))).toString();

        const dir = await TaskDirectory.make();
        await fs.copyFile(options.executable, dir.path('program.out'));
        await fs.copyFile(path.join(testcasesDir, i), dir.path('problem.in'));
        const arts = new TaskDirectory(await options.runtime.runTask({
            containerTimeout: Math.floor(timeLimit / 1000) + 5,
            containerCreateOptions: {},
            artifacts: dir.name,
            payload: {
                type: 'run',
                time_limit: timeLimit,
                memory_limit: memoryLimit,
            }
        }));

        const result = await arts.findResult() as TestResult;
        result.data.score = 0;
        usedTime += result?.data.usedTime;
        usedMemory += result?.data.usedMemory;
        
        result.data.input_file = i;
        result.data.answer_file = answerFile;
        result.data.message = (await fs.readFile(arts.path('problem.out'))).toString();

        if (result?.status !== ResultType.STATUS_CONTINUE) {
            status = ResultType.STATUS_UNACCEPTED;
        } else {
            const outContent = (await fs.readFile(arts.path('problem.out'))).toString();
            if (ansContent.trim() === outContent.trim()) {
                score += perScore;
                result.data.score = perScore;
            } else {
                result.status = ResultType.STATUS_WRONG_ANSWER;
                status = ResultType.STATUS_UNACCEPTED;
            }
        }

        children.push(result);
    }
    
    return {
        status,
        data: { score, usedTime, usedMemory, children }
    }
}
processors.set('basic', testBasic);

async function testItem(testcase: TestcaseItem, options: TestOptions): Promise<TestResult> {
    const proc = getProcessor(testcase.type);
    if (proc) {
        return proc(testcase, options);
    }
    return {
        status: ResultType.STATUS_EXCEPTION,
        data: {
            score: 0,
            usedMemory: 0,
            usedTime: 0,
            message: `cannot find judger ${testcase.type}`
        }
    };
}

async function testGroup(testcase: TestcaseGroup, options: TestOptions): Promise<TestResult> {
	let [score, usedTime, usedMemory] = [0, 0, 0];
	let status = ResultType.STATUS_OK;
	const children: TestResult[] = [];

	for (const i of testcase.children) {
		const testItemResult =
			'type' in i ? await testItem(i, options) : await testGroup(i, options);

		if (testItemResult.status !== ResultType.STATUS_OK) status = ResultType.STATUS_UNACCEPTED;
		score += testItemResult.data.score;
		usedTime += testItemResult.data.usedTime;
		usedMemory = Math.max(testItemResult.data.usedMemory, usedMemory);
        children.push(testItemResult);
	}

	return {
		status,
		data: { score, usedMemory, usedTime, children }
	};
}

export function test(testcases: Testcase[], options: TestOptions): Promise<TestResult> {
	return testGroup({ children: testcases }, options);
}
