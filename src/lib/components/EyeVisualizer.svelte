<script lang="ts">
	export interface EyeState {
		blink: boolean;
		shift: 'left' | 'center' | 'right';
	}

	let { state }: { state: EyeState } = $props();
</script>

<div
	class="relative flex h-24 items-center justify-center overflow-hidden border border-gold/20 bg-black sm:h-32"
>
	<div class="oled-scanlines pointer-events-none absolute inset-0 z-10"></div>

	<div class="relative flex w-40 items-center justify-around">
		{#each [0, 1] as idx}
			<div
				class="relative h-16 w-12 overflow-hidden border border-oled/40"
				class:blink={state.blink}
				role="button"
				tabindex="0"
				title="Shift eye focus"
				onclick={() => (state.shift = state.shift === 'right' ? 'left' : 'right')}
				onkeydown={(e) => {
					if (e.key === 'Enter' || e.key === ' ') {
						e.preventDefault();
						state.shift = state.shift === 'right' ? 'left' : 'right';
					}
				}}
			>
				<div class="eye-track absolute inset-0" class:left={state.shift === 'left'} class:right={state.shift === 'right'}>
					<div class="eye-ball relative h-full w-full">
						<div class="eye-pupil absolute inset-0 bg-oled"></div>
						<div class="eye-light absolute top-2 left-2 h-1.5 w-4 bg-oled/60"></div>
					</div>
				</div>
			</div>
		{/each}
	</div>
</div>

<style>
	.blink .eye-ball {
		animation: mechano-blink 0.18s steps(4) 1;
	}
	@keyframes mechano-blink {
		0% {
			transform: scaleY(1);
		}
		40% {
			transform: scaleY(0.05);
		}
		100% {
			transform: scaleY(1);
		}
	}

	.eye-track.left {
		animation: shift-left 0.24s steps(4, end) forwards;
	}
	.eye-track.right {
		animation: shift-right 0.24s steps(4, end) forwards;
	}
	@keyframes shift-left {
		0% {
			transform: translateX(0);
		}
		100% {
			transform: translateX(-10px);
		}
	}
	@keyframes shift-right {
		0% {
			transform: translateX(0);
		}
		100% {
			transform: translateX(10px);
		}
	}
</style>