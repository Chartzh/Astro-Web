<script lang="ts">
	import { Menu, X, Lock, Activity, Cpu, Terminal, Wrench } from 'lucide-svelte';

	let open = $state(false);

	const links = [
		{ label: 'DOCUMENTATION', href: '#engineering', icon: Terminal },
		{ label: 'TELEMETRY', href: '#testbench', icon: Activity },
		{ label: 'DIAGNOSTICS', href: '#gallery', icon: Wrench }
	];
</script>

<header class="sticky top-0 z-50 border-b border-gold/40 bg-void/95 backdrop-blur">
	<div class="hazard-stripes h-1 w-full opacity-70"></div>
	<nav class="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
		<a href="#top" class="group flex items-center gap-3">
			<div class="btn-rivet flex h-9 w-9 items-center justify-center border border-gold bg-char">
				<span class="font-mono text-lg font-bold text-gold">A</span>
			</div>
			<div class="hidden sm:block">
				<span class="font-mono text-xl font-bold tracking-[0.25em] text-gold">ASTRO</span>
			</div>
			<div class="ml-1 hidden flex-col text-[10px] leading-tight text-solder-dim sm:flex">
				<span class="text-gold-dim">REV.M1</span>
				<span class="font-mono tracking-widest">ESP32-S3</span>
			</div>
		</a>

		<div class="hidden items-center gap-1 md:flex">
			{#each links as link}
				<a
					href={link.href}
					class="font-mono text-xs tracking-widest text-solder transition-colors hover:bg-gold/10 hover:text-gold"
				>
					<span class="px-4 py-2">{link.label}</span>
				</a>
			{/each}
		</div>

		<div class="flex items-center gap-3">
			<a
				href="#testbench"
				class="btn-rivet hidden items-center gap-2 border border-gold bg-gold px-4 py-2 font-mono text-xs font-bold tracking-widest text-black transition-colors hover:bg-brass sm:flex"
			>
				<Lock size={13} />
				SYS_ADMIN
			</a>
			<button
				class="flex h-9 w-9 items-center justify-center border border-gold/40 text-gold md:hidden"
				aria-label="Toggle menu"
				onclick={() => (open = !open)}
			>
				{#if open}
					<X size={18} />
				{:else}
					<Menu size={18} />
				{/if}
			</button>
		</div>
	</nav>

	{#if open}
		<div class="border-t border-gold/20 bg-char md:hidden">
			<div class="flex flex-col px-4 py-2">
				{#each links as link}
					<a
						href={link.href}
						class="border-b border-solder/10 py-3 font-mono text-sm tracking-widest text-solder hover:text-gold"
						onclick={() => (open = false)}
					>
						{link.label}
					</a>
				{/each}
				<a
					href="#testbench"
					class="mt-3 mb-2 flex items-center justify-center gap-2 border border-gold bg-gold px-4 py-3 font-mono text-xs font-bold tracking-widest text-black"
				>
					<Lock size={13} />
					SYS_ADMIN LOGIN
				</a>
			</div>
		</div>
	{/if}
</header>