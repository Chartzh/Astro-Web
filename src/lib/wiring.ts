// Wiring schematic derived from `diagram.md` (all fields kept in English).
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
		from: '16340 Battery',
		fromPin: 'Positive (+)',
		wire: 'Red',
		to: 'TP4056 Module',
		toPin: 'B+',
		note: 'Main battery power feed'
	},
	{
		from: '16340 Battery',
		fromPin: 'Negative (-)',
		wire: 'Black',
		to: 'TP4056 Module',
		toPin: 'B-',
		note: 'Battery ground'
	},
	{
		from: 'TP4056 Module',
		fromPin: 'OUT-',
		wire: 'Black',
		to: 'System (Ground)',
		toPin: 'Chassis Ground Point',
		note: 'Main ground rail (copper wire)'
	},
	{
		from: 'TP4056 Module',
		fromPin: 'OUT+',
		wire: 'Bright Green',
		to: 'Switch',
		toPin: 'Input Pin',
		note: 'Positive rail from module'
	},
	{
		from: 'Switch',
		fromPin: 'Output Pin',
		wire: 'Bright Green',
		to: 'ESP32-S3',
		toPin: '5V',
		note: 'Feeds power to ESP32 when switch is ON'
	},
	{
		from: 'ESP32-S3',
		fromPin: 'GND',
		wire: 'Black',
		to: 'System (Ground)',
		toPin: 'Chassis Ground Point',
		note: 'Connected to copper wire (GND)'
	},
	{
		from: 'ESP32-S3',
		fromPin: '3V3',
		wire: 'Yellow/Orange',
		to: 'OLED SSD1306',
		toPin: 'VCC',
		note: '3.3V supply for OLED screen'
	},
	{
		from: 'System (Ground)',
		fromPin: 'Ground Point',
		wire: 'Black',
		to: 'OLED SSD1306',
		toPin: 'GND',
		note: 'OLED screen ground'
	},
	{
		from: 'ESP32-S3',
		fromPin: 'PIN 9',
		wire: 'Light Blue',
		to: 'OLED SSD1306',
		toPin: 'SCL',
		note: 'I2C Clock line'
	},
	{
		from: 'ESP32-S3',
		fromPin: 'PIN 8',
		wire: 'Purple',
		to: 'OLED SSD1306',
		toPin: 'SDA',
		note: 'I2C Data line'
	},
	{
		from: 'ESP32-S3',
		fromPin: 'PIN 10',
		wire: 'Red',
		to: 'LED Filament/COB',
		toPin: 'Positive (+)',
		note: 'Through 2x Resistors'
	},
	{
		from: 'LED Filament/COB',
		fromPin: 'Negative (-)',
		wire: 'Black',
		to: 'System (Ground)',
		toPin: 'Chassis Ground Point',
		note: 'LED ground'
	}
];