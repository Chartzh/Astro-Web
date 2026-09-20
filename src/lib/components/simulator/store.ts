export const EDITOR_SKETCH_KEY = '__astroLatestSketch';

export function readSketchFromEditor(): string {
	if (typeof window === 'undefined') return '';
	const v = (window as any)[EDITOR_SKETCH_KEY];
	return typeof v === 'string' ? v : '';
}

export const DEFAULT_IDE_CODE = `#include <Arduino.h>

// ASTRO — ESP32-S3 TESTBENCH SKETCH
// Loaded into the Wokwi digital twin on COMPILE & RUN.
#define LED_BUILTIN 2

void setup() {
  Serial.begin(115200);
  pinMode(LED_BUILTIN, OUTPUT);
  Serial.println("[ASTRO] bench boot OK");
}

void loop() {
  digitalWrite(LED_BUILTIN, HIGH);
  delay(500);
  digitalWrite(LED_BUILTIN, LOW);
  delay(500);
}
`;