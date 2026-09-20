<script lang="ts">
	import { onMount } from 'svelte';
	import { Circle, Lock, Home, RotateCcw } from 'lucide-svelte';
	import AccessGate from '$lib/components/simulator/AccessGate.svelte';
	import { readSession } from '$lib/auth';

	let { children } = $props();

	let authed = $state(false);

	onMount(() => {
		authed = readSession();
	});
</script>

<svelte:head>
	<meta name="robots" content="noindex" />
	<title>ASTRO — CONTROL TOWER</title>
</svelte:head>

{#if authed}
	<div class="flex min-h-screen flex-col bg-void font-mono">
		<!-- Admin strip -->
		<div class="hazard-stripes h-1 w-full opacity-70"></div>
		<header class="flex items-center justify-between border-b border-gold/40 bg-char px-4 py-2">
			<div class="flex items-center gap-3">
				<span class="font-mono text-xs font-bold tracking-[0.25em] text-gold">ASTRO//ADMIN</span>
				<span class="hidden font-mono text-[10px] tracking-widest text-solder-dim sm:block">
					FIRMWARE TESTBENCH · ESP32-S3
				</span>
			</div>
			<div class="flex items-center gap-3">
				<span class="flex items-center gap-2 font-mono text-[10px] tracking-widest text-oled">
					<Circle size={8} class="animate-pulse fill-oled" />
					CONTROL TOWER ONLINE
				</span>
				<a
					href="/"
					class="flex items-center gap-1.5 border border-solder/40 px-3 py-1.5 font-mono text-[10px] tracking-widest text-solder transition-colors hover:border-gold hover:text-gold"
				>
					<Home size={12} />
					EXIT
				</a>
			</div>
		</header>

		{@render children()}
	</div>
{:else}
	<AccessGate onUnlock={() => (authed = true)} />
{/if}