<script>
	import { onMount } from 'svelte';
	import { routes } from './routes';
	import { Router } from 'svelte-hash-router';
	import isElectron from 'is-electron';

	import { isLoading } from './stores/ui';

	import GlobalStyles from './styles/GlobalStyles.svelte';

	// LOADING //////////////////////////

	isLoading.set(true);

	if(isElectron()){
		const win = window.remote.getCurrentWindow();

		const unsubscribe = isLoading.subscribe(value => {
			win.setDocumentEdited(value);

			if(value) console.log('is loading');
			else console.log('is NOT loading');
		});
	}

	onMount(async () => {
		isLoading.set(false);
	});
</script>


<div class="wrapper">
	<main class="content">
		<Router/>
	</main>
</div>

<style lang="scss">
	.wrapper{
		display: flex;
		flex-direction: row;
		min-height: 100vh;
		overflow: hidden;
	}
</style>
