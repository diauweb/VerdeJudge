import Runtime from "$lib/server/judger/runtime";
import { toPlainObj } from "$lib/utils";
import type { Actions } from "@sveltejs/kit";
import { Contest } from "../lib/server/db";

export const actions: Actions = {
    async debug() {
        const rt = await Runtime.getRuntime('gcc9');
        console.log("]", rt);
    },
};

export async function load() {
    const contests = toPlainObj((await Contest.findAll({})).filter(e => e.get('isOngoing')));
	return {
        contests,
    };
}
