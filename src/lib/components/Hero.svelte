<script lang="ts">
	import { Terminal, FileText } from 'lucide-svelte';

	const moonland = String.raw`
              .                        *
           ."   ",
          :       :
   _.._   :       :   _.._
 .'    '. ':     :' .'    '.
 |      | '·,#####,·' |      |
 |      |   :'    ':   |      |
 |      |   :  uu  :   |      |
 |  <>  |   :  ww  :   |  <>  |
 |      |   '.     .'   |      |
 |      |     """       |      |
 '.____."     | |       '.____.'
   |    |  |   | |   |  |    |
   |    |  |===|=|===|  |    |
   '----'  |_____|_____|  '----'
           |  '.   '  |
       [REACTOR]        [FUEL]
      '"""""""'       '"""""""'
        [STATE:  ]
       '"""""""'
  ._________________________________.
  |  ASTRO  // LUNAR CHASSIS M1      |
  |  COPPER WIRE  //  ESP32-S3       |
  '_________________________________'
`;
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

		<pre
			class="hidden select-none overflow-hidden border border-gold/20 bg-black/70 p-4 font-mono text-[11px] leading-tight text-solder-dim lg:block"
			aria-label="Blueprint of a moon lander"
		><code>{moonland}
</code></pre>
	</div>
</section>