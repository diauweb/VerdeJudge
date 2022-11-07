<script lang="ts">
    export let title: string;
</script>

<div>
    <div class="uk-card uk-card-body uk-card-default">
        <h3 class="uk-card-title">
            {title}
        </h3>
        <p>
            <slot/>
        </p>
    </div>
</div>