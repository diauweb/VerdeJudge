<script lang="ts">
	import type { PageServerData } from "./$types";

    export let data: PageServerData;

</script>

<h1>Submissions</h1>

<table class="uk-table uk-table-striped">
    <thead>
        <tr>
            <th>ID</th>
            <th>Name</th>
        </tr>
    </thead>
    <tbody>
        {#each data.submissions as p}
        <tr>
            <th>{p.id}</th>
            <th><a href={`/submission/${p.id}`}>{p.problemId}</a></th>
        </tr>
        {/each}
    </tbody>
</table>