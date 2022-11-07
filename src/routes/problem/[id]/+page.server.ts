import { Problem } from '$lib/server/problem';
import type { Actions, PageServerLoad } from './$types';
import { error, redirect } from '@sveltejs/kit';
import { toPlainObj } from '$lib/utils';
import { renderMd } from '$lib/renderer';
import { createSubmission } from '$lib/server/judger/judge';

export const actions: Actions = {
    async submit({ params, request}) {
        const id = params.id;
        const code = JSON.parse((await request.formData()).get('code') as string) as string;
        if (!code) throw error(400, 'no code is provided');

        const status = await createSubmission({
            problemId: id,
            code,
            runtime: 'gcc9',
        });
        
        throw redirect(303, `/submission/${status.id}`);
    }
};

export const load : PageServerLoad = async ({ params }) => {
    const id = params.id;
    try {
        const obj = toPlainObj(await Problem.getProblem(id));
        obj.content = await renderMd(obj.content);
        return obj
    } catch {
        throw error(404);
    }
};