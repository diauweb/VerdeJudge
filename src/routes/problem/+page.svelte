<script lang="ts">
	import type { PageServerData } from "./$types";

    export let data: PageServerData;

</script>

<h1>Problems</h1>

<table class="uk-table uk-table-striped">
    <thead>
        <tr>
            <th>ID</th>
            <th>Name</th>
        </tr>
    </thead>
    <tbody>
        {#each data.problems as p}
        <tr>
            <th>{p.id}</th>
            <th><a href={`/problem/${p.id}`}>{p.name}</a></th>
        </tr>
        {/each}
    </tbody>
</table>