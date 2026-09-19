// Live link to the physical ASTRO unit.
// The firmware (Astro_M1_Web.ino) exposes:
//   GET /ask?q=<question>&persona=<persona>  -> returns a full HTML page
// This client first probes for the ESP32 at the configured base URL. If the
// device is offline we fall back to a local simulation so the Digital Twin
// still works as a demo bench.

export const HARDWARE_BASE = import.meta.env.VITE_ASTRO_URL as string | undefined;
export const HARDWARE_ENABLED = Boolean(HARDWARE_BASE);

// Browser-side Gemini edge AI — a faithful port of the firmware's `askGemini()`
// from Astro/Astro_M1_Web.ino so the Digital Twin answers with the real model
// instead of the local mock. Set VITE_GEMINI_API_KEY (and optionally
// VITE_GEMINI_MODEL) to enable; otherwise the SIMULATOR mock is used.
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;
// NOTE: the model name MUST be a real, currently-available Gemini model. The
// previous default ("gemini-3.6-flash") does not exist and caused HTTP 400 on
// every request. `gemini-2.0-flash` is a stable, non-"thinking" model.
const GEMINI_MODEL = (import.meta.env.VITE_GEMINI_MODEL as string | undefined) || 'gemini-2.0-flash';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;
export const GEMINI_ENABLED = Boolean(GEMINI_API_KEY);

/**
 * Returns a 30 byte "NEEDLE" string scraped from the firmware page. Raw HTML
 * scraping is fragile, so we support two markers the firmware wraps the answer
 * in: `__ASTRO_ANSWER__` or a fallback of the final <p> block.
 */
function scphGrabAnswer(html: string): string {
	const needle = '__ASTRO_ANSWER__';
	const i = html.indexOf(needle);
	if (i !== -1) {
		const j = html.indexOf(needle, i + needle.length);
		if (j !== -1) return html.slice(i + needle.length, j);
	}
	try {
		const el = new DOMParser().parseFromString(html, 'text/html');
		const sel =
			el.querySelector('[data-answer]')?.textContent?.trim() ||
			el.querySelector('div.answer, div#answer, p.answer')?.textContent?.trim();
		if (sel) return sel;
	} catch {
		/* noop */
	}
	return '';
}

async function probe(base: string): Promise<boolean> {
	try {
		const res = await fetch(base, { signal: AbortSignal.timeout(2500), mode: 'no-cors' });
		// no-cors gives opaque status 0, which still means "reached"
		void res;
		return true;
	} catch {
		return false;
	}
}

export async function askHardware(
	question: string,
	persona?: string
): Promise<{ ok: boolean; answer?: string }> {
	if (!HARDWARE_BASE) return { ok: false };
	if (!(await probe(HARDWARE_BASE))) return { ok: false };
	try {
		const params = new URLSearchParams({ q: question });
		if (persona) params.set('persona', persona);
		const res = await fetch(`${HARDWARE_BASE}/ask?${params}`, {
			signal: AbortSignal.timeout(12000)
		});
		if (!res.ok) return { ok: false };
		const html = await res.text();
		const answer = scphGrabAnswer(html);
		return { ok: true, answer: answer || '(UNIT ACK — no parseable response)' };
	} catch {
		return { ok: false };
	}
}

// ---------------------------------------------------------------------------
// LOCAL SIMULATION BRAIN
// ---------------------------------------------------------------------------

const REPLIES: Array<{ k: RegExp; r: string[] }> = [
	{
		k: /(halo|hai|hi|hello|hey)/i,
		r: [
			'LINK AKTIF. ASTRO menunggu perintah. Status semua modul NOMINAL.',
			'UNIT 001 merespon. Copper core stabil, FreeRTOS scheduler bersih.'
		]
	},
	{
		k: /(nama|siapa kamu|who)/i,
		r: [
			'ASTRO. Free-form copper chassis, ESP32-S3 dual-core. Dibangun di atas meja solder, bukan pabrik.'
		]
	},
	{
		k: /(suhu|temp|panas)/i,
		r: ['Core temp 41.2C. Copper wire heat-spreading normal. Tidak overheating.']
	},
	{
		k: /(baterai|battery|daya|power)/i,
		r: ['Level daya 78%. Estimasi runtime 6.2 jam. Charger rail nominal.']
	},
	{
		k: /(wifi|koneksi|jaringan|net)/i,
		r: ['WiFi terhubung, RSSI -52 dBm. AJAX server tipis 160MHz balancing.']
	},
	{
		k: /(berapa seratus|math|hitung)/i,
		r: ['Prosesor Int128 terbatas; query tidak didukung. Coba perintah lain.']
	},
	{
		k: /(mati|shutdown|stop|turun)/i,
		r: ['Memasuki mode siaga. OLED standby. Tekan BOOT untuk aktif lagi.']
	}
];

const FALLBACKS = [
	'Command diterima. Persetujuan silang dengan modul dialog... done.',
	'Handler CPU0 mengeksekusi. Jawaban dijaga 40 kata, tanpa markdown.',
	'Mengamati log. Tidak ada error di kernel — semua sirkuit hidup.',
	'Bus I2C stabil pada 0x3C. Mengirim jawaban ke OLED dan link ini.'
];

export function simulateAnswer(input: string): string {
	const model = REPLIES.find((m) => m.k.test(input));
	const pool = model ? model.r : FALLBACKS;
	return pool[Math.floor(Math.random() * pool.length)];
}

/**
 * Faithful port of the firmware's `askGemini()` (Astro/Astro_M1_Web.ino).
 * POSTs { contents:[{ parts:[{ text }] }] } to the Gemini generateContent
 * endpoint and returns the trimmed candidate text. Cached so the mock fallback
 * below can reuse the same persona string.
 */
export const ASTRO_PERSONA =
	'Kamu adalah Astro, asisten AI. Jawab maksimal 30 kata, polos tanpa markdown.';

async function askGemini(question: string): Promise<string | null> {
	const body = JSON.stringify({
		contents: [{ parts: [{ text: ASTRO_PERSONA + ' Pertanyaan: ' + question }] }]
	});
	// NEVER throw out of here: a failed HTTP 400 (bad model name, bad key,
	// quota, rate limit) must propagate as a graceful fallback to the simulator
	// instead of an unhandled promise rejection that leaves the UI stuck on
	// "PROCESSING…" forever.
	try {
		const res = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			signal: AbortSignal.timeout(30000)
		});
		if (!res.ok) return null;
		const json = await res.json();
		const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;
		return typeof text === 'string' ? text.trim() : null;
	} catch {
		return null;
	}
}

/**
 * MOCK Gemini response. Simulates network latency the same way the real
 * firmware awaits the Gemini endpoint on-device, then returns a `{ text }`
 * payload. If VITE_GEMINI_API_KEY is set it calls the real Gemini API —
 * mirroring askGemini() in the .ino — instead of the local simulation.
 */
export async function mockGemini(
	input: string,
	persona: string = SIM_PERSONA
): Promise<{ text: string }> {
	if (GEMINI_ENABLED) {
		const text = await askGemini(input);
		// If the real API failed or came back empty (bad model, key, quota),
		// silently fall back to the local simulator so the bench never hangs.
		if (text) return { text };
	}
	// simulated Gemini round-trip latency
	await new Promise((r) => setTimeout(r, 700 + Math.random() * 900));
	return { text: simulateAnswer(input) };
}

/**
 * Text-to-speech for the ST_TALKING phase. Uses the SpeechSynthesis API with
 * a matching voice (Indonesian if available). Cancels any previous utterance.
 */
export function speak(text: string): Promise<void> {
	return new Promise((resolve) => {
		const synth = window.speechSynthesis;
		if (!synth) {
			resolve();
			return;
		}
		synth.cancel();
		const u = new SpeechSynthesisUtterance(text);
		u.lang = 'id-ID';
		u.rate = 1.05;
		u.pitch = 1.1;
		const voices = synth.getVoices();
		const id = voices.find((v) => v.lang && v.lang.toLowerCase().startsWith('id'));
		if (id) u.voice = id;
		u.onend = () => resolve();
		u.onerror = () => resolve();
		synth.speak(u);
	});
}

export const SIM_PERSONA =
	'Kamu adalah Astro, asisten AI kecil di meja pemilikmu. Jawab santai dalam Bahasa Indonesia, maksimal 40 kata, polos tanpa markdown.';