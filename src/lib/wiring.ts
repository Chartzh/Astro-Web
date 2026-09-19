// Wiring schematic derived from `diagram.md`.
export interface WiringRow {
	from: string;
	fromPin: string;
	wire: string;
	to: string;
	toPin: string;
	note: string;
}

export const WIRING: WiringRow[] = [
	{
		from: 'Baterai 16340',
		fromPin: 'Positif (+)',
		wire: 'Merah',
		to: 'TP4056 Module',
		toPin: 'B+',
		note: 'Suplai daya utama baterai'
	},
	{
		from: 'Baterai 16340',
		fromPin: 'Negatif (-)',
		wire: 'Hitam',
		to: 'TP4056 Module',
		toPin: 'B-',
		note: 'Ground baterai'
	},
	{
		from: 'TP4056 Module',
		fromPin: 'OUT-',
		wire: 'Hitam',
		to: 'Sistem (Ground)',
		toPin: 'Titik Ground (Sasis)',
		note: 'Jalur Ground utama (kawat tembaga)'
	},
	{
		from: 'TP4056 Module',
		fromPin: 'OUT+',
		wire: 'Hijau Terang',
		to: 'Saklar (Switch)',
		toPin: 'Pin Input',
		note: 'Jalur positif daya dari modul'
	},
	{
		from: 'Saklar (Switch)',
		fromPin: 'Pin Output',
		wire: 'Hijau Terang',
		to: 'ESP32-S3',
		toPin: '5V',
		note: 'Menyuplai daya ke ESP32 saat saklar ON'
	},
	{
		from: 'ESP32-S3',
		fromPin: 'GND',
		wire: 'Hitam',
		to: 'Sistem (Ground)',
		toPin: 'Titik Ground (Sasis)',
		note: 'Terhubung ke kawat tembaga (GND)'
	},
	{
		from: 'ESP32-S3',
		fromPin: '3V3',
		wire: 'Kuning/Oranye',
		to: 'OLED SSD1306',
		toPin: 'VCC',
		note: 'Suplai daya 3.3V untuk layar OLED'
	},
	{
		from: 'Sistem (Ground)',
		fromPin: 'Titik Ground',
		wire: 'Hitam',
		to: 'OLED SSD1306',
		toPin: 'GND',
		note: 'Ground layar OLED'
	},
	{
		from: 'ESP32-S3',
		fromPin: 'PIN 9',
		wire: 'Biru Muda',
		to: 'OLED SSD1306',
		toPin: 'SCL',
		note: 'Jalur I2C Clock'
	},
	{
		from: 'ESP32-S3',
		fromPin: 'PIN 8',
		wire: 'Ungu',
		to: 'OLED SSD1306',
		toPin: 'SDA',
		note: 'Jalur I2C Data'
	},
	{
		from: 'ESP32-S3',
		fromPin: 'PIN 10',
		wire: 'Merah',
		to: 'LED Filament/COB',
		toPin: 'Positif (+)',
		note: 'Melalui 2x Resistor'
	},
	{
		from: 'LED Filament/COB',
		fromPin: 'Negatif (-)',
		wire: 'Hitam',
		to: 'Sistem (Ground)',
		toPin: 'Titik Ground (Sasis)',
		note: 'Ground LED'
	}
];