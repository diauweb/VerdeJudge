<script lang="ts">
	import 'uikit/dist/js/uikit.js';
	import 'uikit/dist/css/uikit.css';

	import { page } from '$app/stores';

	$: isHome = $page.url.pathname === '/';
	$: isProblem = $page.url.pathname.startsWith('/problem');
	$: isSubmission = $page.url.pathname.startsWith('/submission');
</script>

<header>
	<nav class="uk-navbar-container uk-padding uk-padding-remove-vertical" data-uk-navbar>
		<div class="uk-navbar-left">
			<span class="uk-navbar-item uk-logo">VerdeJudge</span>
			<ul class="uk-navbar-nav">
				<li class:uk-active={isHome}><a href="/">Home</a></li>
				<li class:uk-active={isProblem}><a href="/problem">Problem</a></li>
				<li class:uk-active={isSubmission}><a href="/submission">Submission</a></li>
				<li class="uk-parent"><a href={''}>Contest</a></li>
			</ul>
		</div>
		<!-- <div class="uk-navbar-right">
            <ul class="uk-navbar-nav">
                <li>
                    <a href={"#"}>Account <span data-uk-navbar-parent-icon></span></a>
                    <div class="uk-navbar-dropdown">
                        <ul class="uk-nav uk-navbar-dropdown-nav">
                            <li><a href="#">Login</a></li>
                            <li class="uk-nav-divider"></li>
                            <li><a href="#">Admin</a></li>
                        </ul>
                    </div>
                </li>
            </ul>
        </div> -->
	</nav>
</header>

<main>
	<div class="uk-container uk-margin-top">
		<slot />
	</div>
</main>
