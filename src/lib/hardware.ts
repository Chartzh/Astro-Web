// Live link to the physical ASTRO unit.
// The firmware (Astro_M1_Web.ino) exposes:
//   GET /ask?q=<question>&persona=<persona>  -> returns a full HTML page
// This client first probes for the ESP32 at the configured base URL. If the
// device is offline we fall back to a local simulation so the Digital Twin
// still works as a demo bench.

export const HARDWARE_BASE = import.meta.env.VITE_ASTRO_URL as string | undefined;
export const HARDWARE_ENABLED = Boolean(HARDWARE_BASE);

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

export const SIM_PERSONA =
	'Kamu adalah Astro, asisten AI kecil di meja pemilikmu. Jawab santai dalam Bahasa Indonesia, maksimal 40 kata, polos tanpa markdown.';