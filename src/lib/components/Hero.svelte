<script lang="ts">
	import { Terminal, FileText } from 'lucide-svelte';
</script>

<section id="top" class="relative overflow-hidden border-b border-gold/30">
	<div class="blueprint-grid absolute inset-0"></div>
	<div class="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-void/40 to-void"></div>

	<div class="relative mx-auto grid max-w-7xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:items-center lg:py-28">
		<div>
			<div class="mb-6 inline-flex items-center gap-2 border border-solder/30 bg-char px-3 py-1.5 font-mono text-[11px] tracking-widest text-solder-dim">
				<span class="h-1.5 w-1.5 bg-gold"></span>
				UNIT 001 // FREE-FORM BARE-WIRE PLATFORM
			</div>

			<h1
				class="font-sans text-4xl font-bold leading-none tracking-tight text-gold sm:text-5xl lg:text-6xl"
			>
				EFFICIENCY
				<br />
				MEETS
				<br />
				INTELLIGENCE.
			</h1>

			<p class="mt-6 max-w-md font-mono text-sm leading-relaxed text-solder">
				Bare-wire Edge AI companion. <span class="text-gold">ESP32-S3</span>. FreeRTOS.
				Hand-soldered logic. No PCB. No shortcuts. Just copper, tin, and an on-board
				language model in your pocket.
			</p>

			<div class="mt-8 flex flex-col gap-3 sm:flex-row">
				<a
					href="#testbench"
					class="btn-rivet flex items-center justify-center gap-2 border border-gold bg-gold px-6 py-3 font-mono text-sm font-bold tracking-widest text-black transition-colors hover:bg-brass"
				>
					<Terminal size={16} />
					INITIALIZE DIGITAL TWIN
				</a>
				<a
					href="#engineering"
					class="btn-rivet flex items-center justify-center gap-2 border border-gold px-6 py-3 font-mono text-sm font-bold tracking-widest text-gold transition-colors hover:bg-gold/5"
				>
					<FileText size={16} />
					HARDWARE LOGS
				</a>
			</div>

			<div class="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-[11px] tracking-widest text-solder-dim">
				<span class="flex items-center gap-1.5"><span class="h-1 w-1 bg-copper"></span>FREERTOS MP</span>
				<span class="flex items-center gap-1.5"><span class="h-1 w-1 bg-copper"></span>DUAL CORE</span>
				<span class="flex items-center gap-1.5"><span class="h-1 w-1 bg-copper"></span>128x64 OLED</span>
				<span class="flex items-center gap-1.5"><span class="h-1 w-1 bg-copper"></span>2MB PSRAM</span>
			</div>
		</div>

		<div class="relative flex items-center justify-center">
			<!-- Blueprint targeting rings behind the robot -->
			<div class="absolute h-80 w-80 rounded-full border border-gold/15 sm:h-96 sm:w-96"></div>
			<div class="absolute h-64 w-64 rounded-full border border-dashed border-gold/20 sm:h-80 sm:w-80"></div>
			<div class="absolute h-48 w-48 rounded-full border border-gold/15"></div>
			<div class="absolute inset-0 flex items-center justify-center">
				<span class="mx-auto block h-px w-1/2 bg-gold/15"></span>
			</div>
			<div class="absolute inset-0 flex items-center justify-center">
				<span class="mx-auto block h-px w-1/2 rotate-90 bg-gold/15"></span>
			</div>

			<div class="blueprint-grid absolute inset-0 opacity-40"></div>

			<img
				src="/assets/logos/Front-side-transparent.png"
				alt="ASTRO bare-wire robot chassis"
				class="relative z-10 h-[340px] w-auto object-contain drop-shadow-[0_0_24px_rgba(212,175,55,0.08)] sm:h-[460px]"
			/>

			<!-- spec tags -->
			<div class="absolute top-2 left-0 z-20 border border-gold/30 bg-black/80 px-2 py-1 font-mono text-[9px] tracking-widest text-solder-dim">
				2026-0911 // CHASSIS
			</div>
			<div class="absolute right-0 bottom-6 z-20 border border-gold/30 bg-black/80 px-2 py-1 font-mono text-[9px] tracking-widest text-gold-dim">
				FREE-FORM / NO PCB
			</div>
		</div>
	</div>
</section>