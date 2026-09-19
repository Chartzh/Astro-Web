### Skema Pengkabelan (Wiring Diagram) ASTRO M1

| Komponen Sumber | Pin/Kutub | Warna Kabel Diagram | Tujuan (Destinasi) | Pin/Kutub | Keterangan |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Baterai 16340** | Positif (+) | Merah | **TP4056 Module** | B+ | Suplai daya utama baterai |
| **Baterai 16340** | Negatif (-) | Hitam | **TP4056 Module** | B- | Ground baterai |
| **TP4056 Module** | OUT- | Hitam | **Sistem (Ground)** | Titik Ground (Sasis) | Jalur Ground utama (kawat tembaga) |
| **TP4056 Module** | OUT+ | Hijau Terang | **Saklar (Switch)** | Pin Input | Jalur positif daya dari modul |
| **Saklar (Switch)** | Pin Output | Hijau Terang | **ESP32-S3** | 5V | Menyuplai daya ke ESP32 saat saklar ON |
| **ESP32-S3** | GND | Hitam | **Sistem (Ground)** | Titik Ground (Sasis) | Terhubung ke kawat tembaga (GND) |
| **ESP32-S3** | 3V3 | Kuning/Oranye | **OLED SSD1306** | VCC | Suplai daya 3.3V untuk layar OLED |
| **Sistem (Ground)** | Titik Ground | Hitam | **OLED SSD1306** | GND | Ground layar OLED |
| **ESP32-S3** | PIN 9 | Biru Muda | **OLED SSD1306** | SCL | Jalur I2C Clock |
| **ESP32-S3** | PIN 8 | Ungu | **OLED SSD1306** | SDA | Jalur I2C Data |
| **ESP32-S3** | PIN 10 | Merah | **LED Filament/COB** | Positif (+) | Melalui 2x Resistor |
| **LED Filament/COB** | Negatif (-) | Hitam | **Sistem (Ground)** | Titik Ground (Sasis) | Ground LED |
