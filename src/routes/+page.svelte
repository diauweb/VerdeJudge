<script lang="ts">
	import type { Contest } from "$lib/server/model/Contest";
	import IndexCard from "../components/IndexCard.svelte";
    import dayjs from 'dayjs';
    import dayjsRelativeTime from 'dayjs/plugin/relativeTime';
	import { enhance } from "$app/forms";

    dayjs.extend(dayjsRelativeTime);
    
    const appVer = __APP_VERSION__;
    
    export let data: {
        contests: Contest[],
    };
</script>

<div class="uk-grid-small" data-uk-grid>
    <IndexCard title="Welcome to VerdeJudge">
            <span>Start by submitting a problem or joining a contest.</span>
            <br/>
            <i class="uk-text-meta">VerdeJudge Version {appVer}</i>
    </IndexCard>
    <IndexCard title="Ongoing Contests">
        {#each data.contests as c}
            <a href={`/contest/${c.id}`} >{c.name}</a>
            <span>End {dayjs().to(c.endTime)}</span>
        {:else}
        <i>No contests for now...</i>
        {/each}
    </IndexCard>
</div>

