import { Problem, type ProblemMeta } from "$lib/server/problem";
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async function() {
    // todo pagination
    const problems = await Problem.allProblem();
    const ret: { id: string, name: string }[] = [];
    problems.forEach((v, k) => {
        ret.push({
            id: k,
            name: v.meta.name,
        });
    });

    return { problems: ret };
}
