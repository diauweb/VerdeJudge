<script lang="ts">
    import { ResultType } from "$lib/result";

    export let result;
    let style = 'muted';
    let label = '...';

    const color: {[x: number]: [string, string]} = {
        [ResultType.STATUS_ORPHAN]: ['danger', 'Interrupted'],
        [ResultType.STATUS_EXCEPTION]: ['danger', 'Unknown Error'],
        [ResultType.STATUS_CONTINUE]: ['primary', 'Judging'],
        [ResultType.STATUS_OK]: ['success', 'Accepted'],
        [ResultType.STATUS_UNACCEPTED]: ['warning', 'Unaccepted'],
        [ResultType.STATUS_WRONG_ANSWER]: ['warning', 'Wrong Answer'],
        [ResultType.STATUS_TIME_LIMIT_EXCEEDED]: ['warning', 'Time Limit Exceeded'],
        [ResultType.STATUS_MEMORY_LIMIT_EXCEEDED]: ['warning', 'Memory Limit Exceeded'],
        [ResultType.STATUS_COMPILE_ERROR]: ['warning', 'Compilation Error'],
        [ResultType.STATUS_RUNTIME_ERROR]: ['warning', 'Runtime Error'],
        [ResultType.STATUS_SYSTEM_ERROR]: ['danger', 'System Error'],
    };
    
    [style, label] = color[result] ?? ['muted', '...'];
</script>

<span class={`uk-text-${style}`}>{label}</span>