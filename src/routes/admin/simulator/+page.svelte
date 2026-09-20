<script lang="ts">
	//
	// /admin/simulator — the firmware testbench.
	// Split-screen: Monaco C++ IDE (left) + Wokwi digital twin rig (right),
	// with a hardware deployment control panel below.
	//

	import { onMount, onDestroy } from 'svelte';
	import { ToggleLeft, TerminalSquare, Cpu, Disc3 } from 'lucide-svelte';
	import MontexCodeEditor from '$lib/components/simulator/MontexCodeEditor.svelte';
	import WokwiTestBench from '$lib/components/simulator/WokwiTestBench.svelte';
	import { DEFAULT_IDE_CODE } from '$lib/components/simulator/store';

	interface LogLine {
		ts: string;
		text: string;
		kind: 'tx' | 'rx' | 'sys';
	}

	const logs: LogLine[] = $state([]);

	function stamp(): string {
		const d = new Date();
		return [d.getHours(), d.getMinutes(), d.getSeconds()].map((n) => String(n).padStart(2, '0')).join(':');
	}

	function pushLog(kind: LogLine['kind'], text: string) {
		if (logs.length > 200) logs.splice(0, logs.length - 200);
		logs.push({ ts: stamp(), text, kind });
	}

	function clearConsole() {
		logs.length = 0;
	}

	onMount(() => {
		pushLog('sys', 'ADMIN SESSION ESTABLISHED // /admin/simulator');
		statsTimer = setInterval(() => {
			const v = (window as any).__astroLatestSketch as string | undefined;
			if (typeof v === 'string') {
				sketchStats = { chars: v.length, lines: v.split('\n').length };
			}
		}, 800);
	});

	// IDE lifecycle
	let sketchStats = $state({ chars: DEFAULT_IDE_CODE.length, lines: DEFAULT_IDE_CODE.split('\n').length });

	let statsTimer: ReturnType<typeof setInterval> | undefined;

	onDestroy(() => {
		clearInterval(statsTimer);
	});

	function handleEditorReady() {
		const v = (window as any).__astroLatestSketch as string | undefined;
		if (typeof v === 'string') sketchStats = { chars: v.length, lines: v.split('\n').length };
	}

	// Hardware control panel toggles (future OTA routing)
	let targetDigital = $state(true);
	let targetPhysical = $state(false);

	const deployTargets = [
		{
			key: 'digital',
			label: 'DIGITAL TWIN',
			desc: 'WOKWI SIM / LOCAL RIG',
			get on() {
				return targetDigital;
			},
			toggle: () => (targetDigital = !targetDigital)
		},
		{
			key: 'physical',
			label: 'PHYSICAL HARDWARE',
			desc: 'OTA / ESP32-S3 LAN PUSH',
			get on() {
				return targetPhysical;
			},
			toggle: () => (targetPhysical = !targetPhysical)
		}
	];
</script>

<svelte:head>
	<title>ASTRO — FIRMWARE SIMULATOR</title>
</svelte:head>

<section class="flex h-[calc(100vh-3.5rem)] flex-col overflow-hidden bg-void">
	<!-- Workspace header -->
	<div class="flex shrink-0 items-center justify-between border-b border-gold/40 bg-char px-4 py-2">
		<div class="flex items-center gap-3">
			<TerminalSquare size={15} class="text-gold" />
			<span class="font-mono text-xs font-bold tracking-widest text-gold">SIMULATOR // BENCH</span>
			<span class="hidden font-mono text-[10px] tracking-widest text-solder-dim sm:block">
				sketch {sketchStats.chars}B · {sketchStats.lines}L
			</span>
		</div>
		<span class="font-mono text-[10px] tracking-widest text-oled">WOKWI-ESP32-S3 · DIGITAL TWIN</span>
	</div>

	<!-- Split screen: IDE | RIG -->
	<div class="grid min-h-0 flex-1 grid-cols-1 overflow-hidden lg:grid-cols-2">
		<!-- LEFT: IDE -->
		<div class="flex min-h-0 flex-col border-b border-gold/40 lg:border-r lg:border-b-0">
			<div class="flex shrink-0 items-center justify-between border-b border-gold/30 bg-char px-3 py-2">
				<span class="flex items-center gap-2 font-mono text-[10px] tracking-widest text-solder-dim">
					<Cpu size={11} />
					IDE // SKETCH.INO <span class="text-gold-dim">(C++)</span>
				</span>
				<span class="font-mono text-[9px] tracking-widest text-gold-dim">MONACO ENGINE</span>
			</div>
			<div class="relative min-h-0 flex-1 bg-black">
				<MontexCodeEditor
					defaultValue={DEFAULT_IDE_CODE}
					language="cpp"
					theme="astro-dark"
					options={{ fontLigatures: false, cursorBlinking: 'smooth' }}
					onReady={handleEditorReady}
				/>
			</div>
		</div>

		<!-- RIGHT: RIG -->
		<div class="flex min-h-0 flex-col">
			<WokwiTestBench {logs} {pushLog} />
		</div>
	</div>

	<!-- Hardware control panel -->
	<div class="flex shrink-0 flex-wrap items-center gap-x-6 gap-y-3 border-t border-gold/40 bg-char px-4 py-3">
		<div class="flex min-w-[16rem] items-center gap-2">
			<ToggleLeft size={16} class="text-gold" />
			<span class="font-mono text-[10px] tracking-widest text-solder-dim">OTA DEPLOYMENT</span>
			<span class="font-mono text-[10px] tracking-widest text-gold-dim">[PHASE-4 FUTURE]</span>
		</div>

		<div class="flex flex-wrap gap-4">
			{#each deployTargets as t (t.key)}
				<button
					class="flex items-center gap-2 border px-3 py-2 font-mono text-[10px] tracking-widest transition-colors {t.on
						? 'border-gold bg-gold/10 text-gold'
						: 'border-solder/30 text-solder-dim hover:border-gold/50'}"
					onclick={t.toggle}
				>
					<span class={t.on ? 'text-gold' : 'text-solder-dim'}>{t.on ? '[x]' : '[ ]'}</span>
					<div class="flex flex-col items-start leading-none">
						<span>{t.label}</span>
						<span class="pt-0.5 text-[8px] tracking-wider text-solder-dim/70">{t.desc}</span>
					</div>
				</button>
			{/each}
		</div>

		<div class="ml-auto flex items-center gap-3">
			<button
				class="flex items-center gap-1.5 border border-solder/40 px-3 py-2 font-mono text-[10px] tracking-widest text-solder transition-colors hover:border-gold hover:text-gold"
				onclick={clearConsole}
			>
				<Disc3 size={12} />
				CLEAR LOG
			</button>
			<span class="hidden font-mono text-[9px] tracking-widest text-solder-dim/60 lg:block">
				UPLOAD TIMER 00:00
			</span>
		</div>
	</div>
</section>