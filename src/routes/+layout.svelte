<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import Navbar from '$lib/components/Navbar.svelte';
	import Footer from '$lib/components/Footer.svelte';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<meta name="description" content="ASTRO — Bare-wire Edge AI companion. ESP32-S3. FreeRTOS. Hand-soldered logic." />
	<meta name="theme-color" content="#000000" />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	<title>ASTRO — Efficiency Meets Intelligence</title>
</svelte:head>

<div class="flex min-h-screen flex-col">
	<Navbar />
	<main class="flex-1">
		{@render children()}
	</main>
	<Footer />
</div>