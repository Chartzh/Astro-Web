<script lang="ts">
	import { onMount } from 'svelte';
	import {
		SquareTerminal,
		Mic,
		Activity,
		Cpu,
		Server,
		Wifi,
		Battery,
		Power,
		Loader2,
		Circle,
		Volume2
	} from 'lucide-svelte';
	import EyeVisualizer, { type OledState } from './EyeVisualizer.svelte';
	import { mockGemini, speak, HARDWARE_ENABLED, GEMINI_ENABLED } from '$lib/hardware';
	import type { LogLine } from '$lib/types';

	const logs: LogLine[] = $state([]);
	let input = $state('');
	let busy = $state(false);
	let listening = $state(false);
	let speaking = $state(false);
	let taskInput = $state('');
	let source = $state(
		HARDWARE_ENABLED ? 'LIVE_LINK' : GEMINI_ENABLED ? 'REAL_GEMINI' : 'SIM'
	);

	// Last Q/A — mirrored from the firmware's `handleAsk` flow, which shows the
	// answer as a chat card on device ("Q:" + question, "A:" + answer).
	let lastQA = $state<{ q: string; a: string } | null>(null);

	// OLED state machine — mirrors the firmware OledState enum.
	let oledState = $state<OledState>('idle');

	let id = 0;
	function stamp(): string {
		const d = new Date();
		const hh = String(d.getHours()).padStart(2, '0');
		const mm = String(d.getMinutes()).padStart(2, '0');
		const ss = String(d.getSeconds()).padStart(2, '0');
		return `${hh}:${mm}:${ss}`;
	}
	function push(dir: LogLine['dir'], text: string) {
		logs.push({ id: id++, ts: stamp(), dir, text });
	}
	function sleep(ms: number) {
		return new Promise((r) => setTimeout(r, ms));
	}

	onMount(() => {
		push('sys', 'ASTRO.UPLINK v1.0 // channel 0x3C established');
		push('sys', `${source} MODE — hand-soldered unit, copper chassis`);
		push('sys', 'READY. Awaiting command sequence.');
	});

	function transmit() {
		const q = input.trim();
		if (!q || busy) return;
		input = '';
		void runCommand(q, false);
	}

	async function runCommand(q: string, viaVoice: boolean) {
		if (busy) return;
		busy = true;
		taskInput = q;
		push('tx', `> ${q}`);
		if (viaVoice) push('sys', 'VOICE_OVERRIDE: SpeechRecognition input (id-ID)');
		try {
			// 1) ST_BUSY — querying the (mock) Gemini endpoint
			oledState = 'busy';
			lastQA = null;
			push('sys', 'STATE → ST_BUSY // CORE1 AI handler active');

			const t0 = performance.now();
			const { text } = await mockGemini(q);
			const latency = Math.round(performance.now() - t0);

			// 2) ST_HAPPY for HAPPY_DURATION (1200ms)
			oledState = 'happy';
			push('sys', 'STATE → ST_HAPPY // response decoded');
			push('rx', `< ${text}  (${latency})`);
			lastQA = { q, a: text };
			await sleep(1200);

			// 3) ST_TALKING while speechSynthesis reads the answer
			oledState = 'talking';
			push('sys', 'STATE → ST_TALKING // TTS utterance');
			speaking = true;
			await speak(text);
			speaking = false;

			// 4) back to idle
			oledState = 'idle';
			push('sys', 'STATE → ST_IDLE // standby');
			taskInput = '';
		} catch (err) {
			// Safety net: a thrown error anywhere in the flow must reset the
			// state machine so the bench never wedges on "PROCESSING…".
			console.error('runCommand failed:', err);
			oledState = 'idle';
			speaking = false;
			push('sys', 'STATE → ST_IDLE // ERR fallback');
		} finally {
			busy = false;
			taskInput = '';
		}
	}

	// ---- Web Speech API (VOICE OVERRIDE) -------------------------------
	let recognition: any = null;
	let srSupported = false;

	function setupSpeech() {
		const w = window as any;
		const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
		if (SR) {
			srSupported = true;
			recognition = new SR();
			recognition.lang = 'id-ID';
			recognition.interimResults = false;
			recognition.maxAlternatives = 1;
			recognition.onresult = (e: any) => {
				const text = e.results[0][0].transcript as string;
				void runCommand(text, true);
			};
			recognition.onend = () => (listening = false);
			recognition.onerror = () => (listening = false);
		}
	}

	function toggleVoice() {
		if (!recognition) setupSpeech();
		if (!srSupported || !recognition) {
			push('sys', 'ERR: SpeechRecognition not supported in this browser');
			return;
		}
		if (listening) {
			recognition.stop();
			listening = false;
		} else {
			recognition.start();
			listening = true;
			push('sys', 'MIC OPEN — VOICE OVERRIDE armed (id-ID)');
		}
	}

	// ---- Fake telemetry ---------------------------------------------------
	const telemetry = $state({
		core0: 46,
		core1: 0,
		mem: 2.0,
		cpu: 43,
		wifi: -52,
		batt: 78
	});
	let telemetryTick: any;

	const metro = $state([
		{ label: 'CORE 0', val: '50FPS', bg: 'bg-gold/15', bar: 'bg-gold', w: 'w-3/4' },
		{ label: 'CORE 1', val: 'NET WAIT', bg: 'bg-solder/10', bar: 'bg-solder', w: 'w-1/4' },
		{ label: 'MEM PSRAM', val: '2MB', bg: 'bg-oled/10', bar: 'bg-oled', w: 'w-2/5' }
	]);

	function randomizeTelemetry() {
		telemetry.core0 = oledState === 'busy' ? 94 : 38 + Math.floor(Math.random() * 22);
		telemetry.cpu = oledState === 'busy' ? 98 : 38 + Math.floor(Math.random() * 22);
		telemetry.wifi = -56 + Math.floor(Math.random() * 6);
		telemetry.batt = Math.max(72, telemetry.batt - (Math.random() < 0.2 ? 1 : 0));
	}

	onMount(() => {
		telemetryTick = setInterval(randomizeTelemetry, 1800);
		return () => clearInterval(telemetryTick);
	});
</script>

<section id="testbench" class="relative border-b border-gold/30 bg-char/40">
	<div class="blueprint-grid-dense absolute inset-0 opacity-60"></div>
	<div class="relative mx-auto max-w-7xl px-4 py-16 sm:px-6">
		<!-- Section header -->
		<div class="mb-8 flex flex-wrap items-end justify-between gap-4">
			<div>
				<div class="mb-2 flex items-center gap-2 font-mono text-[11px] tracking-widest text-gold-dim">
					<SquareTerminal size={14} />
					CORE FEATURE // PUBLIC SIMULATOR
				</div>
				<h2 class="font-sans text-2xl font-bold tracking-tight text-steel sm:text-3xl">
					DIGITAL TWIN
					<span class="text-gold">_SIMULATOR</span>
				</h2>
			</div>
			<div class="flex items-center gap-3 font-mono text-[11px] tracking-widest">
				<span
					class="flex items-center gap-2 border border-solder/30 bg-black px-3 py-1.5"
					title="Phase 2 local simulation of the on-device Gemini call"
				>
					<span class="h-1.5 w-1.5 bg-gold"></span>
					{source} · ONLINE
				</span>
			</div>
		</div>

		<div class="grid grid-cols-1 gap-4 lg:grid-cols-3">
			<!-- ===== Left column: OLED visualizer + controls ===== -->
			<div class="flex flex-col gap-4 lg:col-span-2">
				<!-- OLED VISUALIZER -->
				<div class="border border-gold/25 bg-black">
					<div class="flex items-center justify-between border-b border-gold/25 bg-char px-3 py-2">
						<span class="flex items-center gap-2 font-mono text-[10px] tracking-widest text-solder-dim">
							<Cpu size={12} />
							OLED // SSD1306 128x64 @ 0x3C
						</span>
						<div class="flex items-center gap-1.5 font-mono text-[10px] text-solder-dim">
							<span class={speaking ? 'text-oled' : busy ? 'text-gold' : ''}>
								{#if speaking}
									<span class="flex items-center gap-1"><Volume2 size={10} /> SPEAKING</span>
								{:else if busy}
									PROCESSING…
								{:else}
									STANDBY
								{/if}
							</span>
							<span class="flex gap-1">
								<span class="h-1.5 w-1.5 border border-gold-dim"></span>
								<span class="h-1.5 w-1.5 border border-gold-dim"></span>
							</span>
						</div>
					</div>
					<EyeVisualizer mode={oledState} />
					<!-- LCD status strip -->
					<div class="border-t border-gold/25 px-3 py-2 font-mono text-[11px] text-solder-dim">
						<span class="text-oled text-glow-oled">ASTRO&gt;</span>{' '}
						{busy && !lastQA ? '— synchronizing —' : taskInput ? taskInput : '— system idle —'}
					</div>
					<!-- Live Q/A card — mirrors the firmware handleAsk chat output -->
					{#if busy && !lastQA}
						<div class="border-t border-gold/25 bg-black px-3 py-2 font-mono text-[11px] text-solder-dim">
							<span class="flex items-center gap-2 text-gold">
								<Loader2 size={11} class="animate-spin" />
								ASTRO IS THINKING…
							</span>
							<span class="mt-1 block animate-pulse text-[10px] tracking-widest text-solder-dim">
								STATE → ST_BUSY // CORE1 AI handler · squish/breath oled lock
							</span>
						</div>
					{:else if lastQA}
						<div class="border-t border-gold/25 bg-black px-3 py-2 font-mono">
							<p class="text-[10px] tracking-widest text-gold-dim">Q: {lastQA.q}</p>
							<p class="mt-1 text-[12px] leading-snug text-oled text-glow-oled">A: {lastQA.a}</p>
						</div>
					{/if}
				</div>

				<!-- CONTROLS -->
				<div class="border border-gold/25 bg-char">
					<div class="border-b border-gold/25 px-3 py-2 font-mono text-[10px] tracking-widest text-solder-dim">
						COM_CH // CONTROL BUS
					</div>
					<div class="p-3">
						<form class="flex flex-col gap-2 sm:flex-row" onsubmit={(e) => { e.preventDefault(); transmit(); }}>
							<input
								bind:value={input}
								type="text"
								spellcheck="false"
								autocomplete="off"
								placeholder="> input command... "
								disabled={busy}
								class="flex-1 border border-solder/30 bg-black px-3 py-2.5 font-mono text-sm text-gold placeholder:text-solder-dim focus:border-gold focus:outline-none disabled:opacity-50"
							/>
							<button
								type="submit"
								disabled={busy || !input.trim()}
								class="btn-rivet flex items-center justify-center gap-2 border border-gold bg-gold px-5 py-2.5 font-mono text-xs font-bold tracking-widest text-black transition-colors hover:bg-brass disabled:cursor-not-allowed disabled:opacity-40"
							>
								{#if busy}
									<Loader2 size={14} class="animate-spin" />
								{:else}
									<SquareTerminal size={14} />
								{/if}
								TX (TRANSMIT)
							</button>
							<button
								type="button"
								onclick={toggleVoice}
								class:listening={listening}
								class="btn-rivet flex items-center justify-center gap-2 border border-solder bg-transparent px-5 py-2.5 font-mono text-xs font-bold tracking-widest text-solder transition-colors hover:border-gold hover:text-gold"
							>
								<Mic size={14} />
								MIC
							</button>
						</form>
						<p class="mt-2 font-mono text-[10px] tracking-wide text-solder-dim">
							State flow: <span class="text-gold">ST_BUSY</span> →{' '}
							<span class="text-gold">ST_HAPPY</span> →
							<span class="text-oled">ST_TALKING</span> → ST_IDLE ·
							Gemini API (real or simulated) · VOICE uses
							SpeechRecognition (id-ID) + speechSynthesis
						</p>
					</div>
				</div>
			</div>

			<!-- ===== Right rail: telemetry ===== -->
			<div class="flex flex-col gap-4">
				<!-- METRO -->
				<div class="border border-gold/25 bg-char">
					<div class="flex items-center justify-between border-b border-gold/25 px-3 py-2">
						<span class="flex items-center gap-2 font-mono text-[10px] tracking-widest text-solder-dim">
							<Activity size={12} />
							HARDWARE TELEMETRY
						</span>
						<span class="font-mono text-[10px] text-gold">● REC</span>
					</div>
					<div class="grid grid-cols-3 divide-x divide-gold/25">
						{#each metro as m}
							<div class="flex flex-col gap-2 p-3">
								<span class="font-mono text-[9px] tracking-widest text-solder-dim">{m.label}</span>
								<span class="font-mono text-sm font-bold text-gold">{m.val}</span>
								<div class="h-1 w-full bg-black">
									<div class={`h-full ${m.bar} ${m.w}`}></div>
								</div>
							</div>
						{/each}
					</div>
				</div>

				<!-- REGISTERS -->
				<div class="border border-gold/25 bg-char">
					<div class="flex items-center justify-between border-b border-gold/25 px-3 py-2">
						<span class="flex items-center gap-2 font-mono text-[10px] tracking-widest text-solder-dim">
							<Server size={12} />
							REGISTERS // REALTIME
						</span>
						<Power size={12} class="text-gold" />
					</div>
					<div class="space-y-2 p-3 font-mono">
						<div class="flex items-center justify-between text-[11px]">
							<span class="text-solder-dim">CPU0 LOAD</span>
							<span class="text-oled text-glow-oled">{telemetry.core0}%</span>
						</div>
						<div class="h-1 w-full bg-black"><div class="h-full bg-oled/60" style="width:{telemetry.core0}%"></div></div>

						<div class="flex items-center justify-between text-[11px]">
							<span class="text-solder-dim">WIFI RSSI</span>
							<span class="text-gold">{telemetry.wifi} dBm</span>
						</div>
						<div class="h-1 w-full bg-black"><div class="h-full bg-gold/70" style="width:{100 + telemetry.wifi}%"></div></div>

						<div class="flex items-center justify-between text-[11px]">
							<span class="text-solder-dim">CLOCK</span>
							<span class="text-gold">240 MHz</span>
						</div>
						<div class="h-1 w-full bg-black"><div class="h-full w-full bg-gold/70"></div></div>

						<div class="flex items-center justify-between text-[11px]">
							<span class="flex items-center gap-1.5 text-solder-dim"><Battery size={11} /> BATTERY</span>
							<span class="text-gold">{telemetry.batt}%</span>
						</div>
						<div class="h-1 w-full bg-black"><div class="h-full bg-gold" style="width:{telemetry.batt}%"></div></div>
					</div>
				</div>
			</div>
		</div>

		<!-- ===== COMMS LINK ===== -->
		<div class="mt-4 border border-gold/25 bg-black">
			<div class="flex items-center justify-between border-b border-gold/25 bg-char px-3 py-2">
				<span class="flex items-center gap-2 font-mono text-[10px] tracking-widest text-solder-dim">
					<Wifi size={12} />
					COMMS LINK // TACTICAL RADIO LOG
				</span>
				<span class="flex items-center gap-1.5 font-mono text-[10px] text-solder-dim">
					<Circle size={8} class="text-gold" />
					RX/TX ACTIVE
				</span>
			</div>
			<div class="h-64 overflow-y-auto p-3 font-mono text-[12px] leading-relaxed" role="log" aria-live="polite">
				{#each logs as line (line.id)}
					<div class:tx={line.dir === 'tx'} class:rx={line.dir === 'rx'} class:sys={line.dir === 'sys'} class="animate-log-in py-0.5">
						<span class="text-solder-dim">[{line.ts}]</span>{' '}
						{#if line.dir === 'tx'}
							<span class="text-gold">{line.text}</span>
						{:else if line.dir === 'rx'}
							<span class="text-oled text-glow-oled">{line.text}</span>
						{:else}
							<span class="text-solder-dim">{line.text}</span>
						{/if}
					</div>
				{/each}
				{#if busy && !speaking}
					<div class="flex items-center gap-1 py-0.5 font-mono text-[12px] text-solder-dim">
						<Loader2 size={12} class="animate-spin text-gold" /> PROCESSING…
					</div>
				{/if}
			</div>
		</div>
	</div>
</section>

<style>
	.animate-log-in {
		animation: log-in 0.18s steps(3) both;
	}
	@keyframes log-in {
		from {
			opacity: 0;
			transform: translateX(-4px);
		}
		to {
			opacity: 1;
			transform: translateX(0);
		}
	}
</style>