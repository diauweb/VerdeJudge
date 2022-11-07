<script lang="ts">
	import type { PageServerData } from './$types';
	import 'katex/dist/katex.min.css';
	import CodeMirror from 'svelte-codemirror-editor';
	import { cpp } from '@codemirror/lang-cpp';
	export let data: PageServerData;

	let editorValue: string;
	
    $: formValue = JSON.stringify(editorValue);
</script>

<article class="uk-article uk-margin-large-bottom">
	<h1 class="uk-article-title">{data.meta.id} {data.meta.name}</h1>
	<div class="uk-card uk-card-default uk-padding">
		{@html data.content}
	</div>
	<div class="uk-card uk-card-default uk-padding uk-margin-top">
		<h2>Submit Code</h2>
		<form method="POST" action="?/submit" class="uk-margin-bottom uk-flex">
			<!-- <select class="uk-select">
				<option>GCC 9 + CPP</option>
			</select> -->
            <input hidden name="code" value={formValue}>
			<button type="submit" class="uk-button uk-button-primary margin-left">Submit</button>
		</form>
		<CodeMirror lang={cpp()} bind:value={editorValue} styles={{ '&': { height: '20rem' } }} />
	</div>
</article>
