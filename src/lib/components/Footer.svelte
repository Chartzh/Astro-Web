<script lang="ts">
	import { GitBranch, Wrench, Terminal } from 'lucide-svelte';
</script>

<footer class="border-t border-gold/30 bg-black">
	<div class="mx-auto max-w-7xl px-4 py-8 sm:px-6">
		<div class="flex flex-col gap-6 border-b border-gold/15 pb-6 font-mono text-[11px] text-solder-dim sm:flex-row sm:items-start sm:justify-between">
			<div>
				<div class="mb-2 flex items-center gap-2">
					<span class="flex h-6 w-6 items-center justify-center border border-gold font-mono text-xs font-bold text-gold">A</span>
					<span class="font-mono text-sm font-bold tracking-[0.25em] text-gold">ASTRO</span>
				</div>
				<p class="max-w-xs leading-relaxed">
					Free-form bare-wire robot dan platform perangkat lunaknya. Edge AI di atas
					perangkat yang disolder tangan, bukan diproduksi masal.
				</p>
			</div>

			<div class="grid grid-cols-2 gap-8 sm:grid-cols-3">
				<div>
					<p class="mb-2 font-mono text-[10px] tracking-widest text-gold-dim">NAVIGATION</p>
					<ul class="space-y-1.5">
						<li><a href="#top" class="transition-colors hover:text-gold">TOP</a></li>
						<li><a href="#testbench" class="transition-colors hover:text-gold">TEST BENCH</a></li>
						<li><a href="#engineering" class="transition-colors hover:text-gold">BUILD LOG</a></li>
					</ul>
				</div>
				<div>
					<p class="mb-2 font-mono text-[10px] tracking-widest text-gold-dim">UNITS</p>
					<ul class="space-y-1.5">
						<li><span class="text-solder">ASTRO M1</span></li>
						<li><span class="text-solder-dim">ESP32-S3 CORE</span></li>
						<li><span class="text-solder-dim">SSD1306 @ 0x3C</span></li>
					</ul>
				</div>
				<div>
					<p class="mb-2 font-mono text-[10px] tracking-widest text-gold-dim">LINK</p>
					<ul class="space-y-1.5">
						<li><a href="#gallery" class="flex items-center gap-1.5 transition-colors hover:text-gold"><GitBranch size={12} /> SOURCE</a></li>
						<li><a href="#testbench" class="flex items-center gap-1.5 transition-colors hover:text-gold"><Terminal size={12} /> FIRMWARE</a></li>
					</ul>
				</div>
			</div>
		</div>

		<div class="flex flex-col items-center justify-between gap-3 pt-6 font-mono text-[11px] tracking-widest text-solder-dim sm:flex-row">
			<span class="flex items-center gap-2">
				<Wrench size={13} class="text-copper" />
				BUILT WITH COPPER, TIN, AND C++.
			</span>
			<span>© {new Date().getFullYear()} ASTRO SYSTEMS · UNIT 001</span>
		</div>
	</div>
</footer>