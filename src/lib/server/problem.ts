import { promises as fs, existsSync } from 'fs';
import path from 'path';
import YAML from 'yaml';

export interface Problem {
	meta: ProblemMeta;
	content: string;
}

export interface ProblemMeta {
	id: string;
	name: string;
	testcases: Testcase[];
	[x: string]: unknown;
}

export interface TestcaseGroup {
	children: Testcase[];
}

export interface TestcaseItem {
	type: string;
	[x: string]: unknown;
}

export type Testcase = TestcaseGroup | TestcaseItem;

const PROBLEM_PATH = './data/problem';
const problems = new Map<string, Problem>();
export class Problem {
    [x: string]: unknown;
	path: string;

	private constructor(problemPath: string, meta: ProblemMeta, content: string) {
		this.path = problemPath;
		this.meta = meta;
		this.content = content;
	}

	public static async listDiskProblem(): Promise<string[]> {
		const ret: string[] = [];
		const files = await fs.readdir(PROBLEM_PATH);
		for (const f of files) {
			if (existsSync(path.join(PROBLEM_PATH, f, 'problem.yml'))) {
				ret.push(f);
			}
		}
		return ret;
	}

	public static reload() {
		problems.clear();
	}
	
	public static async allProblem(): Promise<Map<string, Problem>> {
		const names = await this.listDiskProblem();
		const objects = new Map<string, Problem>();
		await Promise.all(names.map(async e => objects.set(e, await this.getProblem(e))));
		return objects;
	}

	public static async getProblem(problem: string): Promise<Problem> {
		let prob = problems.get(problem);
		
		if (!prob) {
			const meta = YAML.parse((await fs.readFile(path.join(PROBLEM_PATH, problem, 'problem.yml'))).toString())
			const content = (await fs.readFile(path.join(PROBLEM_PATH, problem, 'README.md'))).toString();
			prob = new Problem(path.join(PROBLEM_PATH, problem), meta, content);
			problems.set(problem, prob);
		}
		
		return prob;
	}
}
