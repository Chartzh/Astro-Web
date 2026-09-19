# ASTRO — Digital Twin Web Console

Premium industrial landing page + functional **Digital Twin simulator** for
**ASTRO**, the free-form, bare-wire robot built on an ESP32-S3. Hand-soldered.
No PCB.

Built with **SvelteKit 5**, **Tailwind CSS v4**, **Lucide** icons.

## Quick start

```sh
npm install
npm run dev
```

Open the printed `localhost` URL. `npm run build` produces a static site in
`build/` (SPA fallback via `@sveltejs/adapter-static`).

## Phase 2 — Digital Twin simulator

The Test Bench replicates the firmware's OLED state machine **one-to-one** from
`Astro/Astro_M1_Web.ino` (`OledState` enum) inside a 128x64 SVG "OLED":

- **ST_IDLE** — eyes breathe (±2 px, ~400 ms period), blink every 2.5–6 s,
  pupils glance left/right/down, curved mouth
- **ST_BUSY** — eyes squish (width ±3, height ~12±2), **no mouth**
- **ST_HAPPY** — `^ ^` arc eyes + smile (HAPPY_DURATION 1200 ms)
- **ST_TALKING** — eyes breathe (~300 ms) + 4-frame animated mouth (~100 ms/frame)

Flow on any command: `ST_BUSY` → `mockGemini()` → `ST_HAPPY` → `ST_TALKING`
(`speechSynthesis` reads the answer aloud) → `ST_IDLE`.

- Comms link (chat log) with **TX (TRANSMIT)** and a **MIC** button using the
  Web Speech API (`SpeechRecognition`, `id-ID`)
- The Gemini call is **mocked** in `src/lib/hardware.ts` (`mockGemini`) with
  simulated latency — swap in a real call there to go live.

## Wiring schematic

`src/lib/components/Engineering.svelte` renders `static/assets/logos/diagram.jpeg`
alongside a wiring table generated from `diagram.md` (all 12 connections, with
wire-color indicators).

## Connecting to the real unit

The Digital Twin can talk to the physical ASTRO firmware
(`Astro/Astro_M1_Web.ino`), which serves its UI over your LAN. Run this app
reachable from the same network and point it at the unit:

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

1. **Navbar** — ASTRO logo image, section links, square SYS_ADMIN button
2. **Hero** — "Efficiency Meets Intelligence" + transparent robot chassis image
3. **Digital Twin Simulator** — OLED visualizer (state machine), comms log,
   TX + MIC (Web Speech API + speechSynthesis), hardware telemetry panel
4. **Engineering / Build Specs** — module cards, **wiring schematic** (image +
   table), photo documentation gallery
5. **Footer** — *Built with copper, tin, and C++.*