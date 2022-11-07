import { Submission, User } from "$lib/server/db";
import type { SubmissionType } from "$lib/server/model/Submission";
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async function() {
    // todo pagination
    const submissions = await Submission.findAll({ include: [{ model: User }]});
    return { submissions: submissions.map(e => e.toJSON<SubmissionType>())};
}

