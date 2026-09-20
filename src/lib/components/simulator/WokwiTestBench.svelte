<script lang="ts">
	//
	// WokwiTestBench.svelte — test-bench panel of the simulator.
	//
	// Embeds a real Wokwi project iframe. Without a live project URL we render
	// a branded "RIG: OFFLINE" placeholder wired to the same control row.
	// The COMPILE & RUN button reads the sketch out of the IDE (via the
	// global editor handle set by MontexCodeEditor) and logs a transmit line
	// into the bench console.
	//

	import { onMount } from 'svelte';
	import { Play, RotateCcw, Radio, Wifi, Cpu, Loader2 } from 'lucide-svelte';
	import { readSketchFromEditor } from './store';

	const WOKWI_EMBED = import.meta.env.VITE_WOKWI_PROJECT_URL as string | undefined;

	let { logs, pushLog }: { logs: { ts: string; text: string; kind: 'tx' | 'rx' | 'sys' }[]; pushLog: (kind: 'tx' | 'rx' | 'sys', text: string) => void } =
		$props();

	let compiling = $state(false);
	let iframeRef: HTMLIFrameElement | undefined = $state(undefined);

	function stamp(): string {
		const d = new Date();
		return [d.getHours(), d.getMinutes(), d.getSeconds()]
			.map((n) => String(n).padStart(2, '0'))
			.join(':');
	}

	async function compileAndRun() {
		const source: string = readSketchFromEditor();
		compiling = true;
		pushLog('tx', 'COMPILE → cross-cc ESP32-S3 …');
		pushLog('sys', `WOKWI RIG ${WOKWI_EMBED ? 'LINKED' : 'OFFLINE'}`);
		await new Promise((r) => setTimeout(r, 900));
		if (WOKWI_EMBED && iframeRef) {
			// Real embed: just focus the sim. Firing messages into the Wokwi
			// project editor API (diagram.update, source.patch) can be layered
			// here once a project URL is configured.
			iframeRef.contentWindow?.postMessage('__astro_ping__', '*');
			pushLog('rx', 'rig ACK — digital twin standing by.');
		} else {
			pushLog('rx', `compiled ${source ? `${source.length}B` : 'EMPTY'} sketch @ ${stamp()}`);
			pushLog('sys', 'NO WOKWI PROJECT URL — set VITE_WOKWI_PROJECT_URL to link a rig.');
		}
		compiling = false;
	}

	let rebooting = $state(false);
	async function reboot() {
		rebooting = true;
		pushLog('tx', 'REBOOT → power cycle rig bus.');
		await new Promise((r) => setTimeout(r, 600));
		pushLog('rx', '[ESP32-S3] boot seq 0x3C · ready');
		rebooting = false;
	}

	onMount(() => {
		pushLog('sys', `BENCH UPLINK ${WOKWI_EMBED ? 'LIVE' : 'OFFLINE'} // v1.0`);
	});
</script>

<div class="flex h-full min-h-0 flex-col">
	<!-- Control rail -->
	<div class="flex shrink-0 items-center justify-between gap-2 border-b border-gold/40 bg-char px-3 py-2">
		<div class="flex items-center gap-2 font-mono text-[11px] tracking-widest text-gold">
			<Cpu size={13} />
			WOKWI_RIG
			<span class="text-solder-dim">ESP32-S3</span>
		</div>
		<div class="flex items-center gap-2">
			<button
				class="btn-rivet flex items-center gap-2 border border-gold bg-gold px-3 py-1.5 font-mono text-[11px] font-bold tracking-widest text-black transition-colors hover:bg-brass disabled:opacity-50"
				disabled={compiling}
				onclick={compileAndRun}
			>
				{#if compiling}
					<Loader2 size={13} class="animate-spin" />
				{:else}
					<Play size={13} />
				{/if}
				COMPILE & RUN
			</button>
			<button
				class="btn-rivet flex items-center gap-2 border border-solder/40 px-3 py-1.5 font-mono text-[11px] tracking-widest text-solder transition-colors hover:border-gold hover:text-gold disabled:opacity-50"
				disabled={rebooting}
				onclick={reboot}
			>
				<RotateCcw size={13} />
				REBOOT
			</button>
		</div>
	</div>

	<!-- Simulator canvas -->
	<div class="relative min-h-0 flex-1 border-b border-black bg-char-3">
		{#if WOKWI_EMBED}
			<iframe
				bind:this={iframeRef}
				src={WOKWI_EMBED}
				class="h-full w-full"
				title="Wokwi digital twin"
				sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-modals"
			></iframe>
		{:else}
			<div class="flex h-full w-full items-center justify-center">
				<div class="blueprint-grid-dense flex flex-col items-center gap-3 border border-gold/20 bg-void px-8 py-10 text-center">
					<Radio size={32} class="text-solder-dim" />
					<span class="font-mono text-xs tracking-widest text-gold">RIG: OFFLINE</span>
					<span class="max-w-[26ch] font-mono text-[11px] leading-relaxed text-solder-dim">
						No Wokwi rig linked. Set VITE_WOKWI_PROJECT_URL to embed the digital twin here.
					</span>
				</div>
			</div>
		{/if}

		<!-- Cursor readout -->
		<div class="pointer-events-none absolute right-2 bottom-2 hidden font-mono text-[9px] tracking-widest text-solder-dim md:block">
			RIG LINK <span class="text-gold">{WOKWI_EMBED ? 'ESTABLISHED' : 'STANDBY'}</span>
		</div>
	</div>

	<!-- Bench console -->
	<div class="flex min-h-0 shrink-0 flex-col border-t border-gold/30 bg-black">
		<div class="flex items-center justify-between border-b border-gold/30 bg-char px-3 py-1.5">
			<span class="flex items-center gap-2 font-mono text-[10px] tracking-widest text-solder-dim">
				<Wifi size={11} />
				BENCH_CONSOLE
			</span>
			<span class="font-mono text-[10px] tracking-widest text-gold-dim">LEGACY: RAW</span>
		</div>
		<div class="h-28 overflow-y-auto px-3 py-2 font-mono text-[11px] leading-relaxed">
			{#if logs.length === 0}
				<span class="text-solder-dim">— awaiting first command —</span>
			{:else}
				{#each logs as line, i (i)}
					<div class="whitespace-pre-wrap break-words">
						<span class="text-solder-dim">[{line.ts}]</span>{' '}
						{#if line.kind === 'tx'}
							<span class="text-gold">{line.text}</span>
						{:else if line.kind === 'rx'}
							<span class="text-oled text-glow-oled">{line.text}</span>
						{:else}
							<span class="text-solder-dim">{line.text}</span>
						{/if}
					</div>
				{/each}
			{/if}
			{#if compiling}
				<div class="flex items-center gap-1 text-[10px] text-solder-dim">
					<Loader2 size={10} class="animate-spin text-gold" />
					cross-compiling sketch…
				</div>
			{/if}
		</div>
	</div>
</div>