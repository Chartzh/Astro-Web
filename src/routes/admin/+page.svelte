<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	onMount(() => {
		goto('/admin/simulator', { replaceState: true });
	});
</script>

<svelte:head>
	<title>ASTRO — CONTROL TOWER</title>
</svelte:head>

<div class="flex min-h-screen items-center justify-center bg-void font-mono text-[11px] tracking-widest text-gold">
	<div class="animate-pulse border border-gold/50 px-6 py-4">REDIRECTING_TO_SIMULATOR…</div>
</div>