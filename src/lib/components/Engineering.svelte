<script lang="ts">
	import { Terminal, Cpu, Server, Wrench, Circle } from 'lucide-svelte';

	const modules = [
		{
			id: 'MODULE_01',
			icon: Wrench,
			title: 'FREE-FORM COPPER ARCHITECTURE',
			desc: 'Bare 2mm tinned-copper wire hand-bent into a structural chassis. No PCB mask, no solder mask. Every trace is a deliberate, visible circuit.',
			specs: [
				['CONDUCTOR', 'TINNED COPPER'],
				['JOINTS', 'LEAD-FREE SOLDER'],
				['STRUCTURE', 'REINFORCED BARE-WIRE'],
				['DIELECTRIC', 'AIR + TAPE']
			]
		},
		{
			id: 'MODULE_02',
			icon: Cpu,
			title: 'DUAL-CORE TASK PINNING · FREERTOS',
			desc: 'ESP32-S3 dual Xtensa cores. Sensor polling pinned to Core 0, AI + comms on Core 1 — deterministic and preemptive with zero-copy queues.',
			specs: [
				['SOC', 'ESP32-S3'],
				['CORES', 'DUAL XTENSA 240MHz'],
				['RTOS', 'FREERTOS SMP'],
				['MEM', '2MB QSPI PSRAM']
			]
		},
		{
			id: 'MODULE_03',
			icon: Server,
			title: 'LOCAL AJAX WEB SERVER & EDGE AI',
			desc: 'A thin HTTP server on-chip serves a live control page. Queries hit an on-device Gemini endpoint; answers render to OLED and browser simultaneously.',
			specs: [
				['SERVER', 'WEBSERVER+V1 80'],
				['DISPLAY', 'OLED 128x64 @ 0x3C'],
				['SCHEME', 'AJAX /ask?q=[…]'],
				['PERSONA', 'HOT-SWAP INT']
			]
		}
	];

	const photos = [
		{ src: '/assets/logos/Front-transparent.png', caption: 'FACING VIEW // PIN-OUT' },
		{ src: '/assets/photos/Front-side.jpg', caption: 'FRONT SIDE // CHASSIS' },
		{ src: '/assets/photos/back-side.jpg', caption: 'REAR // REINFORCEMENT' },
		{ src: '/assets/photos/detail-esp32.jpg', caption: 'SOC MOUNT // ESP32-S3' },
		{ src: '/assets/photos/detail-charger.jpg', caption: 'CHARGE RAIL // SWITCHING' },
		{ src: '/assets/photos/workbench.jpg', caption: 'BENCH // FABRICATION' },
		{ src: '/assets/photos/soldering1.jpg', caption: 'SOLDER 01 // FREE-FORM' },
		{ src: '/assets/photos/soldering3.jpg', caption: 'SOLDER 02 // JOINT WORK' }
	];
</script>

<section id="engineering" class="relative border-b border-gold/30 bg-void">
	<div class="mx-auto max-w-7xl px-4 py-16 sm:px-6">
		<div class="mb-10">
			<div class="mb-2 flex items-center gap-2 font-mono text-[11px] tracking-widest text-gold-dim">
				<Terminal size={14} />
				ENGINEERING // BUILD LOG
			</div>
			<h2 class="font-sans text-2xl font-bold tracking-tight text-steel sm:text-3xl">
				BUILD_<span class="text-gold">SPECIFICATIONS</span>
			</h2>
			<p class="mt-2 max-w-2xl font-mono text-sm text-solder-dim">
				Hand-owned, hand-soldered. No commercial PCB — the circuit board is the sculpture.
				All interconnects are structural and conductive.
			</p>
		</div>

		<div class="grid gap-4 md:grid-cols-3">
			{#each modules as mod, i}
				<article class="group relative border border-gold/25 bg-char transition-colors hover:border-gold">
					<!-- corner tag -->
					<div class="absolute top-0 right-0 border-b border-l border-gold/25 px-2 py-1 font-mono text-[9px] tracking-widest text-gold-dim">
						{String(i + 1).padStart(2, '0')}
					</div>
					<div class="flex items-center gap-3 border-b border-gold/25 bg-black px-5 py-4">
						<mod.icon size={18} class="text-gold" />
						<h3 class="font-mono text-sm font-bold tracking-widest text-gold">{mod.id}</h3>
					</div>
					<div class="flex flex-col gap-4 p-5">
						<p class="font-mono text-[13px] font-semibold leading-snug text-steel">{mod.title}</p>
						<p class="font-mono text-[12px] leading-relaxed text-solder-dim">{mod.desc}</p>
						<div class="mt-auto">
							{#each mod.specs as [k, v]}
								<div class="flex items-center justify-between border-t border-gold/15 py-1.5 font-mono text-[11px]">
									<span class="text-solder-dim">{k}</span>
									<span class="text-gold">{v}</span>
								</div>
							{/each}
						</div>
					</div>
				</article>
			{/each}
		</div>

		<!-- build log strip -->
		<div class="mt-6 flex flex-col gap-3 border border-gold/25 bg-black p-4 font-mono text-[12px] sm:flex-row sm:items-center sm:justify-between">
			<div class="flex items-center gap-3 text-solder-dim">
				<Circle size={9} class="text-gold" />
				<span>LAST BUILD LOG:</span>
				<span class="text-solder">LAT '37' // FAB-R1 // BURNED 1H, FLASHED CLEAN</span>
			</div>
			<a
				href="#testbench"
				class="btn-rivet inline-flex items-center gap-2 border border-gold px-4 py-2 text-xs font-bold tracking-widest text-gold transition-colors hover:bg-gold hover:text-black"
			>
				OPEN TEST BENCH
			</a>
		</div>

		<!-- PHOTO DOCUMENTATION -->
		<div id="gallery" class="mt-14">
			<div class="mb-6 flex items-end justify-between">
				<div>
					<div class="mb-1 flex items-center gap-2 font-mono text-[11px] tracking-widest text-gold-dim">
						<Wrench size={14} />
						FIELD DOCUMENTATION
					</div>
					<h3 class="font-sans text-xl font-bold tracking-tight text-steel">CHASSIS_GALLERY</h3>
				</div>
				<span class="font-mono text-[10px] tracking-widest text-solder-dim">
					{String(photos.length).padStart(2, '0')} CAPTURES
				</span>
			</div>
			<div class="grid grid-cols-2 gap-3 md:grid-cols-4">
				{#each photos as p}
					<figure class="group overflow-hidden border border-gold/25 bg-char">
						<div class="overflow-hidden">
							<img
								src={p.src}
								alt={p.caption}
								loading="lazy"
								class="aspect-square w-full object-cover grayscale-[0.3] transition duration-300 group-hover:scale-105 group-hover:grayscale-0"
							/>
						</div>
						<figcaption class="flex items-center justify-between border-t border-gold/25 px-2 py-1.5 font-mono text-[9px] tracking-widest text-solder-dim">
							<span class="truncate">{p.caption}</span>
							<span class="shrink-0 text-gold-dim">[IMG]</span>
						</figcaption>
					</figure>
				{/each}
			</div>
		</div>
	</div>
</section>