import { ResultType } from '$lib/result';
import { Submission } from '$lib/server/db';
import { getSubmissionStatus } from '$lib/server/judger/judge';
import type { SubmissionType } from '$lib/server/model/Submission';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
    const id = params.id;
    const submission = await Submission.findByPk(id);
    let phase = null;
    if (submission?.get('status') === ResultType.STATUS_CONTINUE) {
        const c = await getSubmissionStatus(parseInt(id));
        if (c === undefined) {
            await submission.update({ status: ResultType.STATUS_ORPHAN });
        } else {
            phase = c.phase;
        }
    }
    
    return {
        submission: submission?.toJSON<SubmissionType>(),
        inPhase: phase,
    };
};