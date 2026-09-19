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
		Circle
	} from 'lucide-svelte';
	import EyeVisualizer, { type EyeState } from './EyeVisualizer.svelte';
	import { askHardware, simulateAnswer, HARDWARE_ENABLED } from '$lib/hardware';
	import type { LogLine } from '$lib/types';

	const eye: EyeState = $state({ blink: false, shift: 'center' });

	const logs: LogLine[] = $state([]);
	let input = $state('');
	let busy = $state(false);
	let listening = $state(false);
	let taskInput = $state('');
	let source = $state(HARDWARE_ENABLED ? 'LIVE_LINK' : 'SIM');

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
	function fmtTh(t: number): string {
		return t < 1000 ? `${t}ms` : `${(t / 1000).toFixed(1)}s`;
	}

	function sleep(ms: number) {
		return new Promise((r) => setTimeout(r, ms));
	}

	onMount(() => {
		push('sys', 'ASTRO.UPLINK v1.0 // channel 0x3C established');
		push('sys', `${source} MODE — hand-soldered unit, copper chassis`);
		push('sys', 'READY. Awaiting command sequence.');

		const blinkInt = setInterval(() => {
			eye.blink = true;
			setTimeout(() => (eye.blink = false), 200);
		}, 3800);
		const shiftInt = setInterval(() => {
			const seq = ['left', 'center', 'right', 'center'] as const;
			eye.shift = seq[Math.floor(Math.random() * seq.length)];
		}, 5200);

		return () => {
			clearInterval(blinkInt);
			clearInterval(shiftInt);
		};
	});

	async function transmit() {
		const q = input.trim();
		if (!q || busy) return;
		input = '';
		await runCommand(q, { synth: false });
	}

	async function runCommand(q: string, opts: { synth?: boolean } = {}) {
		busy = true;
		taskInput = q;
		push('tx', `> ${q}`);
		if (opts.synth) push('sys', 'VOICE_OVERRIDE: SpeechRecognition input');

		eye.blink = true;
		await sleep(120);
		eye.blink = false;

		const t0 = performance.now();

		let answer: string;
		let latency = 320;

		if (source === 'LIVE_LINK') {
			const res = await askHardware(q);
			if (res.ok && res.answer) {
				answer = res.answer;
				latency = Math.round(performance.now() - t0);
			} else {
				source = 'SIM';
				push('sys', 'LINK LOST — unit unreachable, dropping to local SIMULATOR');
				answer = simulateAnswer(q);
			}
		} else {
			await sleep(500 + Math.random() * 700);
			answer = simulateAnswer(q);
		}

		latency = Math.max(latency, Math.round(performance.now() - t0));

		await sleep(200);
		eye.blink = true;
		await sleep(140);
		eye.blink = false;

		push('rx', `< ${answer}  (${latency})`);
		push('sys', 'ACK. handler done.');

		taskInput = '';
		busy = false;
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
				runCommand(text, { synth: true });
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
		core0: 50,
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
		telemetry.cpu = 38 + Math.floor(Math.random() * 22);
		telemetry.core0 = 46 + Math.floor(Math.random() * 10);
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
					CORE FEATURE // LIVE UNIT
				</div>
				<h2 class="font-sans text-2xl font-bold tracking-tight text-steel sm:text-3xl">
					DIGITAL TWIN
					<span class="text-gold">_TEST_BENCH</span>
				</h2>
			</div>
			<div class="flex items-center gap-3 font-mono text-[11px] tracking-widest">
				<span
					class="flex items-center gap-2 border border-solder/30 bg-black px-3 py-1.5"
					title={source === 'LIVE_LINK' ? 'Physical unit connected' : 'Simulation mode'}
				>
					<span class:hazard={source === 'LIVE_LINK'} class="h-1.5 w-1.5 bg-solder"></span>
					{source === 'LIVE_LINK' ? 'LIVE · LINKED' : 'SIM · OFFLINE'}
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
							<span class={busy ? 'text-gold' : ''}>{busy ? 'PROCESSING…' : 'STANDBY'}</span>
							<span class="flex gap-1">
								<span class="h-1.5 w-1.5 border border-gold-dim"></span>
								<span class="h-1.5 w-1.5 border border-gold-dim"></span>
							</span>
						</div>
					</div>
					<EyeVisualizer state={eye} />
					<!-- LCD status strip -->
					<div class="border-t border-gold/25 px-3 py-2 font-mono text-[11px] text-solder-dim">
						<span class="text-oled text-glow-oled">ASTRO&gt;</span> {taskInput && busy
						? taskInput
						: '— system idle —'}
					</div>
				</div>

				<!-- CONTROLS -->
				<div class="border border-gold/25 bg-char">
					<div class="border-b border-gold/25 px-3 py-2 font-mono text-[10px] tracking-widest text-solder-dim">
						COM_CH // CONTROL BUS
					</div>
					<div class="p-3">
						<form
							class="flex flex-col gap-2 sm:flex-row"
							onsubmit={(e) => {
								e.preventDefault();
								transmit();
							}}
						>
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
								VOICE OVERRIDE
							</button>
						</form>
						<p class="mt-2 font-mono text-[10px] tracking-wide text-solder-dim">
							TX bus POST > GET <span class="text-gold">/ask?q=[…]</span> · latency
							reported per message · VOICE uses SpeechRecognition (id-ID)
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
					<div
						class:tx={line.dir === 'tx'}
						class:rx={line.dir === 'rx'}
						class:sys={line.dir === 'sys'}
						class="animate-log-in py-0.5"
					>
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
				{#if busy}
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