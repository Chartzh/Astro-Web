<script lang="ts">
	import { onMount } from 'svelte';

	// Public OLED state machine type — mirrors the firmware `OledState` enum.
	export type OledState = 'idle' | 'busy' | 'happy' | 'talking';

	let { mode }: { mode: OledState } = $props();

	// --- C++ constants faithfully reproduced --------------------------------
	const EYE_BASE_WIDTH = 22;
	const EYE_CORNER_RADIUS = 10;
	const EYE_DISTANCE = 50; // between eye centers on a 128px OLED
	const EYE_Y = 24; // vertical centre of the eye band
	const GLANCE_MAX_OFFSET = 7;
	const BLINK_INTERVAL_MIN = 2500;
	const BLINK_INTERVAL_MAX = 6000;

	// --- Live-simulated low-level animation values --------------------------
	let now = 0; // rAF clock (ms)
	let blink = false;
	let nextBlink = 3000;
	let lastBlink = 0;
	let lastGlance = 0;
	let glanceDir = 0; // 0 none, 1 left, 2 right, 3 down

	// final geometry
	let eyeW = $state(EYE_BASE_WIDTH);
	let eyeH = 28;
	let mouthW = 0;
	let mouthCurve = 3;
	let mouthTh = 4;
	let happyArcs = $state(false);
	let gX = 0;
	let gY = 0;

	function rand(min: number, max: number) {
		return min + Math.floor(Math.random() * (max - min));
	}

	function recompute(t: number) {
		// --- shape parameters per state -------------------------------------
		switch (mode) {
			case 'busy': {
				// squish: width ±3, height ~12±2 (clamped >= 6), no mouth
				eyeW = EYE_BASE_WIDTH + Math.round(Math.cos(t / 150.0) * 3);
				eyeH = Math.max(6, 12 + Math.round(Math.cos(t / 150.0) * 2));
				mouthW = 0;
				happyArcs = false;
				break;
			}
			case 'happy': {
				// ^ ^ eyes + smile for HAPPY_DURATION
				eyeH = 28;
				eyeW = EYE_BASE_WIDTH;
				mouthW = 16;
				mouthCurve = 4;
				mouthTh = 4;
				happyArcs = true;
				break;
			}
			case 'talking': {
				// breathe (period ~300ms) + 4-frame mouth (~100ms/frame)
				eyeW = EYE_BASE_WIDTH;
				eyeH = 28 + Math.round(Math.sin((t / 1000) * Math.PI * 2 * (1000 / 300)) * 2);
				const frame = Math.floor(t / 100) % 4;
				if (frame === 0) {
					mouthW = 10;
					mouthCurve = 1;
					mouthTh = 6;
				} else if (frame === 1) {
					mouthW = 16;
					mouthCurve = 3;
					mouthTh = 3;
				} else if (frame === 2) {
					mouthW = 12;
					mouthCurve = 5;
					mouthTh = 5;
				} else {
					mouthW = 18;
					mouthCurve = 2;
					mouthTh = 2;
				}
				happyArcs = false;
				break;
			}
			default: {
				// idle: breathe (period ~400ms) with mouth
				eyeW = EYE_BASE_WIDTH;
				eyeH = 28 + Math.round(Math.sin(t / 400.0) * 2);
				mouthW = 14;
				mouthCurve = 3;
				mouthTh = 4;
				happyArcs = false;
				break;
			}
		}

		// --- blink (not during happy) ---------------------------------------
		if (mode !== 'happy' && t - lastBlink >= nextBlink) {
			lastBlink = t;
			blink = true;
			nextBlink = rand(BLINK_INTERVAL_MIN, BLINK_INTERVAL_MAX);
		}
		if (blink && t - lastBlink > 140) blink = false;

		// --- glance (idle/talking only) -------------------------------------
		if (mode === 'busy' || mode === 'happy') {
			glanceDir = 0;
		} else if (t - lastGlance >= 3500) {
			lastGlance = t;
			glanceDir = rand(0, 4);
		} else if (t - lastGlance >= 1800) {
			glanceDir = 0;
		}
		if (glanceDir === 1) gX = -GLANCE_MAX_OFFSET;
		else if (glanceDir === 2) gX = GLANCE_MAX_OFFSET;
		else gX = 0;
		gY = glanceDir === 3 ? GLANCE_MAX_OFFSET : 0;
	}

	// --- derived SVG geometry ----------------------------------------------
	let leftX = $state<number>(0);
	let rightX = $state<number>(0);
	let eyeTop = $state<number>(0);
	let eyeHpx = $state<number>(0);
	let eyeRX = $state<number>(EYE_CORNER_RADIUS);
	let happyPaths = $state<string[]>([]);
	let mouthD = $state<string>('');

	function render(t: number) {
		leftX = 64 - EYE_DISTANCE / 2 - eyeW / 2 + gX;
		rightX = 64 + EYE_DISTANCE / 2 - eyeW / 2 + gX;
		const cH = blink ? 2 : eyeH;
		eyeTop = blink ? EYE_Y : EYE_Y - cH / 2 + gY;
		eyeHpx = cH;
		eyeRX = blink ? 1 : EYE_CORNER_RADIUS;

		// happy arcs: "^ ^"
		happyPaths = [];
		if (happyArcs) {
			const L = 64 - EYE_DISTANCE / 2;
			const R = 64 + EYE_DISTANCE / 2;
			const y = 22;
			happyPaths = [
				`M ${L - 9} ${y + 6} L ${L} ${y - 4}`,
				`M ${L - 9} ${y + 7} L ${L} ${y - 3}`,
				`M ${L} ${y - 4} L ${L + 9} ${y + 6}`,
				`M ${L} ${y - 3} L ${L + 9} ${y + 7}`,
				`M ${R - 9} ${y + 6} L ${R} ${y - 4}`,
				`M ${R - 9} ${y + 7} L ${R} ${y - 3}`,
				`M ${R} ${y - 4} L ${R + 9} ${y + 6}`,
				`M ${R} ${y - 3} L ${R + 9} ${y + 7}`
			];
		}

		// mouth parabola: yOffset = -(x*x*curvature)/halfW^2, thickness below
		mouthD = '';
		if (mouthW > 0 && !blink) {
			const centerY = EYE_Y + eyeH / 2 + 2 + gY;
			const halfW = mouthW / 2;
			const pixels: string[] = [];
			for (let x = -halfW; x <= halfW; x++) {
				const yOff = -((x * x * mouthCurve) / (halfW * halfW));
				for (let tI = 0; tI < mouthTh; tI++) {
					pixels.push(`M ${64 + x} ${centerY + yOff + tI} h 1`);
				}
			}
			mouthD = pixels.join(' ');
		}
	}

	function tick(t: number) {
		now = t;
		recompute(t);
		render(t);
		requestAnimationFrame(tick);
	}

	onMount(() => {
		requestAnimationFrame(tick);
	});
</script>

<!-- ===== Visualizer ===== -->
<div class="relative flex h-48 items-center justify-center overflow-hidden border border-gold/20 bg-black sm:h-56">
	<div class="oled-scanlines pointer-events-none absolute inset-0 z-10"></div>

	<svg
		viewBox="0 0 128 64"
		class="relative z-[5] h-full w-auto max-w-full"
		preserveAspectRatio="xMidYMid meet"
		role="img"
		aria-label="ASTRO simulated OLED face ({mode.toUpperCase()})"
	>
		<rect x="0" y="0" width="128" height="64" fill="#000" />

		{#if happyArcs}
			{#each happyPaths as d}
				<path d={d} stroke="#fff" stroke-width="1" fill="none" />
			{/each}
		{:else}
			<rect x={leftX} y={eyeTop} width={eyeW} height={eyeHpx} rx={eyeRX} fill="#fff" />
			<rect x={rightX} y={eyeTop} width={eyeW} height={eyeHpx} rx={eyeRX} fill="#fff" />
		{/if}

		{#if mouthD}
			<path d={mouthD} stroke="#fff" stroke-width="1" fill="none" />
		{/if}
	</svg>

	<!-- state chip -->
	<div class="absolute right-2 bottom-2 z-20 flex items-center gap-1.5 border border-gold/30 bg-black/80 px-2 py-0.5 font-mono text-[9px] tracking-widest">
		<span
			class="h-1.5 w-1.5 rounded-full"
			class:bg-gold={mode !== 'busy'}
			class:animate-pulse={mode === 'busy'}
		></span>
		{mode === 'busy'
			? 'ST_BUSY'
			: mode === 'happy'
				? 'ST_HAPPY'
				: mode === 'talking'
					? 'ST_TALKING'
					: 'ST_IDLE'}
	</div>
</div>

<style>
	.oled-scanlines {
		pointer-events: none;
	}
</style>