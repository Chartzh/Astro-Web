//
// MontexCodeEditor.svelte — Monaco (VS Code engine) C++ editor for the
// ASTRO firmware bench.
//
// Strategy:
//  - `monaco-editor` is imported dynamically on mount (client-only; keeps the
//    heavy engine out of the SSR graph).
//  - Monaco 0.56 bundles its own editor web worker as an inline data URL
//    (`esmModuleLocationBundler`), so no MonacoEnvironment setup is required —
//    the worker boots automatically and the C++ tokenizer runs off-thread.
//  - The latest editor text is mirrored onto `window.__astroLatestSketch` so
//    the test bench panel can hand it to a Wokwi rig on COMPILE & RUN.
//

<script lang="ts">
	import { onMount, onDestroy } from 'svelte';

	type EditorProps = {
		defaultValue?: string;
		language?: string;
		theme?: string;
		options?: Record<string, unknown>;
		onReady?: () => void;
	};

	let { defaultValue = '', language = 'cpp', theme = 'astro-dark', options = {}, onReady }: EditorProps = $props();

	let hostEl: HTMLDivElement;
	let editor = $state<{
		dispose: () => void;
		getValue: () => string;
		layout: () => void;
		onDidChangeModelContent: (cb: () => void) => void;
	} | null>(null);

	onMount(async () => {
		const mod = await import('monaco-editor');
		const mon = mod.default ?? mod;

		mon.editor.defineTheme('astro-dark', {
			base: 'vs-dark',
			inherit: true,
			rules: [
				{ token: 'comment', foreground: '6b7280' },
				{ token: 'keyword', foreground: 'd4af37' },
				{ token: 'number', foreground: '2eb0ff' },
				{ token: 'string', foreground: 'a0aab5' },
				{ token: 'type', foreground: 'd4af37' }
			],
			colors: {
				'editor.background': '#0d0d0d',
				'editor.foreground': '#e5e7eb',
				'editor.lineHighlightBackground': '#1a1a1a',
				'editorWidget.background': '#121212',
				'editorWidget.border': '#262626',
				'editorLineNumber.foreground': '#6b7280',
				'editorGutter.background': '#0d0d0d',
				'editorCursor.foreground': '#d4af37'
			}
		});

		const inst = mon.editor.create(hostEl, {
			value: defaultValue,
			language,
			theme,
			fontFamily: "'JetBrains Mono', 'SF Mono', monospace",
			fontSize: 14,
			lineHeight: 21,
			letterSpacing: 0,
			minimap: { enabled: false },
			scrollBeyondLastLine: true,
			fixedOverflowWidgets: true,
			automaticLayout: true,
			tabSize: 4,
			insertSpaces: true,
			wordWrap: 'on',
			padding: { top: 14, bottom: 14 },
			renderLineHighlight: 'line',
			hideCursorInOverviewRuler: true,
			links: true,
			...options
		});

		// Mirror value changes up to the bench so the test bench reads source.
		inst.onDidChangeModelContent(() => {
			(self as any).__astroLatestSketch = inst.getValue();
		});
		(self as any).__astroLatestSketch = inst.getValue();

		editor = inst;
		onReady?.();
	});

	onDestroy(() => {
		try {
			editor?.dispose();
		} catch {
			/* noop */
		}
		editor = null;
	});
</script>

<svelte:window
	onresize={() => {
		editor?.layout();
	}}
/>

<div
	bind:this={hostEl}
	class="relative h-full w-full overflow-hidden bg-black"
	aria-label="C++ firmware IDE"
></div>

<style>
	:global(.monaco-editor .margin) {
		background: #0d0d0d !important;
	}
	:global(.monaco-editor .monaco-scrollable-element) {
		background: #0d0d0d;
	}
</style>