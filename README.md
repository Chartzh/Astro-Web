# ASTRO — Digital Twin Web Console

Premium industrial landing page + hardware test bench for **ASTRO**, the
free-form, bare-wire robot built on an ESP32-S3. Hand-soldered. No PCB.

Built with **SvelteKit 5**, **Tailwind CSS v4**, **Lucide** icons.

## Quick start

```sh
npm install
npm run dev
```

Open the printed `localhost` URL. `npm run build` produces a static site in
`build/` (SPA fallback via `@sveltejs/adapter-static`).

## Connecting to the real unit

The Digital Twin talks to the physical ASTRO firmware (`Astro/Astro_M1_Web.ino`),
which serves its UI over your LAN. Run this app reachable from the same network
and point it at the unit:

```sh
cp .env.example .env
# set VITE_ASTRO_URL=http://<astro-ip>
```

If the unit is unreachable, the Test Bench automatically falls back to a local
**SIMULATOR** mode so the demo still works.

## Stack

- **SvelteKit 5** (runes mode) — `src/lib/components`
- **Tailwind CSS v4** — design tokens (gold, brass, copper, solder grey, oled blue)
  defined in `src/app.css` via `@theme`
- **Fonts** — Space Grotesk (display) + JetBrains Mono (data/logs)

## Layout (single page)

1. **Navbar** — ASTRO wordmark, section links, square SYS_ADMIN button
2. **Hero** — "Efficiency Meets Intelligence", blueprint moon-lander ASCII
3. **Digital Twin Test Bench** — OLED eye visualizer, comms log, TX + VOICE
   OVERRIDE (Web Speech API), hardware telemetry panel
4. **Engineering / Build Specs** — three module cards + photo documentation gallery
5. **Footer** — *Built with copper, tin, and C++.*