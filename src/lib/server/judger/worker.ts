import { TaskDirectory } from '$lib/utils';
import { promises as fs } from 'fs';
import log from 'npmlog';
import { Submission } from '../db';
import { Problem } from '../problem';
import type { SubmissionStatus } from './judge';
import deepMerge from 'deepmerge';

import { ResultType } from '$lib/result';
import Runtime from './runtime';
import { test } from './testcase';

export async function startSubmissionWorker(status: SubmissionStatus) {
	if (status.phase === 'finished') return;

	const dbSubmission = await Submission.findByPk(status.id);
	if (dbSubmission === null) {
		status.phase = 'finished';
		log.warn('runtime', 'failed to start a worker without submission item in db');
		return;
	}

	const problem = await Problem.getProblem(dbSubmission.get('problemId') as string);
	if (problem === undefined) {
		status.phase = 'finished';
		log.warn('runtime', 'failed to start a worker without valid problem');
	}

	const runtime = await Runtime.getRuntime(status.options.runtime);
	if (status.phase === 'init') {
		status.phase = 'compile';

		const compileContext = await TaskDirectory.make();
		await fs.writeFile(compileContext.path('program.cpp'), status.options.code);
		const compileResult = new TaskDirectory(
			await runtime.runTask({
				artifacts: compileContext.name,
				containerTimeout: 10,
				containerCreateOptions: {},
				payload: {
					type: 'compile',
					source_file: 'program.cpp',
					optimization: true
				}
			})
		);

		const compileResultJSON = await compileResult.findResult();
		log.verbose('worker', '%j', compileResultJSON);

		if (compileResultJSON === null || compileResultJSON.status !== ResultType.STATUS_CONTINUE) {
			status.phase = 'finished';
			dbSubmission.set('details', JSON.stringify(compileResultJSON));
            return;
		}

		status.phase = 'run';
		const testcases = problem.meta.testcases;
        const executable = compileResult.path('program.out');
        const testResult = await test(testcases, { executable, problem, runtime });

        const finalResult = deepMerge(compileResultJSON, testResult);
        
        status.phase = 'finished';
        await dbSubmission.update({
			status: finalResult.status,
            score: finalResult.data.score,
			usedTime: finalResult.data.usedTime,
			usedMemory: finalResult.data.usedMemory,
			details: JSON.stringify(finalResult),
        });
		return;
	}

	// ya shall not go there
	status.phase = 'unknown';
}
