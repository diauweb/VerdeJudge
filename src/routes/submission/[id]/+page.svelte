<script lang="ts">
	import type { PageServerData } from './$types';
	import CodeMirror from 'svelte-codemirror-editor';
	import { cpp } from '@codemirror/lang-cpp';
	import { json } from '@codemirror/lang-json';

	import dayjs from 'dayjs';
	import JudgeStatus from './JudgeStatus.svelte';
	import { ResultType } from '$lib/result';

	export let data: PageServerData;
	let status = data.submission?.status;
	let rawResultText = JSON.stringify(JSON.parse(data.submission?.details as unknown as string), null, 2);
	let memoryMB: unknown = data.submission?.usedMemory;
	memoryMB = typeof memoryMB === 'number' ? (memoryMB / 1024 / 1024).toFixed(2) : 'N/A';

</script>

<article class="uk-article uk-margin-large-bottom">
	<h1 class="uk-article-title">Submission #{data.submission?.id}</h1>
	<div class="uk-card uk-card-default uk-padding">
		<table class="uk-table uk-table-small">
			<thead>
				<tr>
					<th>Id</th>
					<th>Status</th>
					<th>Score</th>
					<th>Problem</th>
					<th>Time</th>
					<th>Memory</th>
					<th>Submit Time</th>
				</tr>
			</thead>
			<tbody>
				<tr>
					<td>{data.submission?.id}</td>
					<td><JudgeStatus result={status}/></td>
					<td>{data.submission?.score ?? 'N/A'}</td>
					<td><a href={`/problem/${data.submission?.problemId}`}>{data.submission?.problemId}</a></td>
					<td>{data.submission?.usedTime ?? 'N/A'}ms</td>
					<td>{memoryMB}MB</td>
					<td>{dayjs(data.submission?.createdAt).format('YY-MM-DD hh:mm:ss')}</td>
				</tr>
			</tbody>
		</table>
	</div>
	<div class="uk-card uk-card-default uk-padding uk-margin-top">
		{#if status === ResultType.STATUS_CONTINUE}
			<div data-uk-spinner></div>
		{:else if status === ResultType.STATUS_ORPHAN}
			<i>This submission is invalid because it has been interrupted during judge.</i>
		{:else}
		<ul class="uk-subnav uk-subnav-pill" data-uk-switcher>
			<li><a href={"#"}>Info</a></li>
			<li><a href={"#"}>Raw</a></li>
		</ul>
		
		<ul class="uk-switcher uk-margin">
			<li>Hello!</li>
			<li><CodeMirror lang={json()} value={rawResultText} readonly/></li>
		</ul>
		{/if}
	</div>
	<div class="uk-card uk-card-default uk-padding uk-margin-top">
		<CodeMirror lang={cpp()} value={data.submission?.code} readonly />
	</div>
</article>
