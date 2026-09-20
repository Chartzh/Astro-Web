<script lang="ts">
	import { Lock, KeyRound, ShieldAlert, Eye, EyeOff } from 'lucide-svelte';
	import { ADMIN_PASSCODE, grantSession } from '$lib/auth';

	let { onUnlock }: { onUnlock?: () => void } = $props();

	let passcode = $state('');
	let error = $state('');
	let show = $state(false);
	let attempts = $state(0);

	function submit() {
		if (passcode === ADMIN_PASSCODE) {
			grantSession();
			onUnlock?.();
			return;
		}
		attempts += 1;
		error = `ACCESS DENIED — invalid passcode (ATTEMPT 0${attempts})`;
		passcode = '';
	}
</script>

<div class="blueprint-grid flex min-h-screen flex-col items-center justify-center bg-void px-4">
	<div class="hazard-stripes h-1.5 w-full max-w-md opacity-80"></div>

	<div class="w-full max-w-md border border-gold/50 bg-char shadow-[8px_8px_0_0_rgba(212,175,55,0.25)]">
		<!-- Header -->
		<div class="flex items-center justify-between border-b border-gold/50 bg-char-2 px-4 py-3">
			<div class="flex items-center gap-2 font-mono text-xs tracking-widest text-gold">
				<Lock size={14} />
				SYS_ADMIN // ACCESS GATE
			</div>
			<div class="flex items-center gap-2 font-mono text-[10px] tracking-widest text-solder-dim">
				<ShieldAlert size={12} />
				RESTRICTED
			</div>
		</div>

		<!-- Body -->
		<div class="flex flex-col gap-4 px-6 py-8">
			<div class="flex flex-col items-center gap-2 text-center">
				<KeyRound size={28} class="text-gold" />
				<h1 class="font-sans text-lg font-bold tracking-tight text-steel">ASTRO CONTROL TOWER</h1>
				<p class="font-mono text-[11px] leading-relaxed text-solder-dim">
					Enter the engineering passcode to arm the firmware testbench.
				</p>
			</div>

			<form
				onsubmit={(e) => {
					e.preventDefault();
					submit();
				}}
			>
				<label for="passcode" class="mb-1 block font-mono text-[10px] tracking-widest text-solder-dim">
					PASSCODE
				</label>
				<div class="flex items-stretch border border-gold/50 bg-black focus-within:border-gold">
					<input
						id="passcode"
						type={show ? 'text' : 'password'}
						bind:value={passcode}
						placeholder="••••••••"
						autocomplete="current-password"
						class="w-full bg-transparent px-3 py-2.5 font-mono text-sm tracking-widest text-gold placeholder:text-solder-dim/60 focus:outline-none"
					/>
					<button
						type="button"
						class="border-l border-gold/50 px-3 text-solder-dim transition-colors hover:text-gold"
						onclick={() => (show = !show)}
						aria-label="Toggle passcode visibility"
					>
						{#if show}
							<EyeOff size={15} />
						{:else}
							<Eye size={15} />
						{/if}
					</button>
				</div>

				{#if error}
					<div class="mt-2 border border-red-500/50 bg-red-500/10 px-3 py-2 font-mono text-[10px] tracking-widest text-red-400">
						{error}
					</div>
				{/if}

				<button
					type="submit"
					class="btn-rivet mt-4 flex w-full items-center justify-center gap-2 border border-gold bg-gold px-4 py-3 font-mono text-xs font-bold tracking-widest text-black transition-colors hover:bg-brass"
				>
					<KeyRound size={14} />
					AUTHENTICATE
				</button>
			</form>

			<div class="flex items-center justify-between font-mono text-[10px] tracking-widest text-solder-dim/70">
				<span>SANCTIONED USE ONLY</span>
				<span class="text-gold-dim">REV.M1 · ESP32-S3</span>
			</div>
		</div>
	</div>
</div>