import { Submission } from "../db";
import { startSubmissionWorker } from "./worker";

export interface SubmissionStatus {
    id: number,
    phase: string,
    worker: Promise<void> | null,
    options: CreateSubmissionOptions,
}

interface CreateSubmissionOptions {
    problemId: string,
    runtime: string,
    code: string,
}

const submissions = new Map<number, SubmissionStatus>();
export async function createSubmission(options: CreateSubmissionOptions): Promise<SubmissionStatus> {
    const submission = await Submission.create({
        problemId: options.problemId,
        status: 0,
        code: options.code,
        details: '{}'
    });

    const status : SubmissionStatus = {
        id: submission.get('id') as number,
        phase: 'init',
        worker: null,
        options,
    }

    status.worker = startSubmissionWorker(status);

    submissions.set(status.id, status);
    return status;
}

export async function getSubmissionStatus(id: number) {
    const v = submissions.get(id);
    return v;
}
