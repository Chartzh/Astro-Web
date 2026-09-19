/*
 * ============================================================
 *  ASTRO M1 — WEB EDITION (DUAL-CORE ANIMATION + AJAX WEB)
 *  Board  : ESP32-S3 Super Mini
 * ============================================================
 */

#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <HTTPClient.h>
#include "secrets.h"
#include <WebServer.h>
#include <ESPmDNS.h>
#include <ArduinoJson.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <ArduinoOTA.h>

#define OLED_SDA 8
#define OLED_SCL 9
#define BTN_PIN  0        
#define LED_BEACON_PIN 10 

#define SCREEN_W 128
#define SCREEN_H 64

Adafruit_SSD1306 display(SCREEN_W, SCREEN_H, &Wire, -1);
WebServer server(80);

// ============== OTA SUPPORT ==============
bool otaInProgress = false;

void drawOtaScreen(const char* message, int progressPercent = -1) {
  display.clearDisplay();
  if (progressPercent >= 0) {
    int barX = 20, barY = 30, barWidth = 88, barHeight = 10;
    display.drawRect(barX, barY, barWidth, barHeight, SSD1306_WHITE);
    int fillWidth = (barWidth * progressPercent) / 100;
    if (fillWidth > 0) display.fillRect(barX + 1, barY + 1, fillWidth - 2, barHeight - 2, SSD1306_WHITE);
    display.setTextSize(1); display.setTextColor(SSD1306_WHITE);
    display.setCursor(0, 0); display.print("OTA UPDATE...");
  } else {
    display.setTextSize(1); display.setTextColor(SSD1306_WHITE);
    display.setCursor(0, 20); display.println(message);
  }
  display.display();
}

void onOtaStart() { otaInProgress = true; drawOtaScreen("Memulai Update..."); }
void onOtaEnd() { drawOtaScreen("Success! Reboot...", 100); delay(1000); }
void onOtaProgress(unsigned int progress, unsigned int total) {
  unsigned int percent = (progress * 100) / total;
  static int lastPercent = -1;
  if (percent - lastPercent >= 5 || percent == 100) { lastPercent = percent; drawOtaScreen("Uploading...", percent); }
}
void onOtaError(ota_error_t error) { drawOtaScreen("OTA ERROR!"); delay(2000); otaInProgress = false; }

// ============== STATE & ANIMATION SYSTEM ==============
String persona = "Kamu adalah Astro, asisten AI. Jawab maksimal 30 kata, polos tanpa markdown.";

enum OledState { ST_IDLE, ST_BUSY, ST_TALKING, ST_HAPPY };
volatile OledState oledState = ST_IDLE; // Volatile karena diakses lintas Core

unsigned long talkTimer = 0;
unsigned long talkDuration = 0; 
unsigned long happyTimer = 0;
unsigned long blinkTimer = 0;
unsigned long glanceTimer = 0;
bool blinkState = false;
int glanceDirection = 0; 
int eyeGlanceOffset = 0;
int beaconStep = 0;

const unsigned long BLINK_INTERVAL_MIN = 2500;
const unsigned long BLINK_INTERVAL_MAX = 6000;
const unsigned long GLANCE_INTERVAL     = 3500;
const unsigned long GLANCE_DURATION     = 1800;
const unsigned long HAPPY_DURATION      = 1200;

// Proporsi mata
const int EYE_BASE_WIDTH    = 22;       
const int EYE_BASE_HEIGHT   = 28;      
const int EYE_CORNER_RADIUS = 10;    
const int EYE_DISTANCE      = 50;         
const int EYE_Y             = 24;                
const int GLANCE_MAX_OFFSET = 7;     

void updateBeaconLED() {
  unsigned long now = millis();
  
  if (oledState == ST_BUSY) {
    // Efek Napas (Breathing) Mulus pakai Gelombang Sinus
    int brightness = 127 + 127 * sin(now / 250.0);
    analogWrite(LED_BEACON_PIN, brightness);
  } else {
    static unsigned long lastStepTime = 0;
    switch (beaconStep) {
      case 0: analogWrite(LED_BEACON_PIN, 255); if (now - lastStepTime >= 50) { lastStepTime = now; beaconStep = 1; } break;
      case 1: analogWrite(LED_BEACON_PIN, 0);   if (now - lastStepTime >= 80) { lastStepTime = now; beaconStep = 2; } break;
      case 2: analogWrite(LED_BEACON_PIN, 255); if (now - lastStepTime >= 50) { lastStepTime = now; beaconStep = 3; } break;
      case 3: analogWrite(LED_BEACON_PIN, 0);   if (now - lastStepTime >= 1200){ lastStepTime = now; beaconStep = 0; } break;
    }
  }
}

void drawMouth(int centerX, int centerY, int width, int curvature, int thickness) {
  int halfW = width / 2;
  for (int x = -halfW; x <= halfW; x++) {
    int yOffset = -(x * x * curvature) / (halfW * halfW);
    int pixelY = centerY + yOffset;
    for (int t = 0; t < thickness; t++) display.drawPixel(centerX + x, pixelY + t, SSD1306_WHITE);
  }
}

void updateEyeAnimation() {
  unsigned long now = millis();
  static unsigned long nextBlinkTime = 3000;
  if (now - blinkTimer >= nextBlinkTime) {
    blinkTimer = now; blinkState = true; nextBlinkTime = random(BLINK_INTERVAL_MIN, BLINK_INTERVAL_MAX);
  }
  if (blinkState && (now - blinkTimer > 140)) blinkState = false;

  if (now - glanceTimer >= GLANCE_INTERVAL) {
    glanceTimer = now; glanceDirection = random(0, 4); eyeGlanceOffset = GLANCE_MAX_OFFSET;
  }
  if (glanceDirection != 0 && (now - glanceTimer >= GLANCE_DURATION)) {
    glanceDirection = 0; eyeGlanceOffset = 0;
  }
}

void drawEyesBase(int eWidth, int eHeight, int xOff, int yOff, bool showMouth, int mw=14, int mc=3, int mt=4) {
  int gX = 0, gY = 0;
  if (glanceDirection == 1) gX = -eyeGlanceOffset; else if (glanceDirection == 2) gX = eyeGlanceOffset; else if (glanceDirection == 3) gY = eyeGlanceOffset;  
  
  int rX = 64 + (EYE_DISTANCE / 2) - (eWidth / 2) + xOff + gX;
  int lX = 64 - (EYE_DISTANCE / 2) - (eWidth / 2) + xOff + gX;
  int cH = blinkState ? 2 : eHeight;
  int cY = blinkState ? (EYE_Y + yOff + gY) : (EYE_Y - (eHeight / 2) + yOff + gY);
  int rad = blinkState ? 1 : EYE_CORNER_RADIUS;

  display.fillRoundRect(rX, cY, eWidth, cH, rad, SSD1306_WHITE);
  display.fillRoundRect(lX, cY, eWidth, cH, rad, SSD1306_WHITE);

  if (showMouth && !blinkState) drawMouth(64 + xOff + gX, EYE_Y + (eHeight / 2) + 2 + yOff + gY, mw, mc, mt); 
}

void drawIdleState() {
  display.clearDisplay(); updateEyeAnimation();
  int breatheHeight = EYE_BASE_HEIGHT + map(sin(millis() / 400.0) * 100, -100, 100, -2, 2);
  drawEyesBase(EYE_BASE_WIDTH, breatheHeight, 0, 0, true, 14, 3, 4); display.display();
}

void drawBusyState() {
  display.clearDisplay();
  int squishW = EYE_BASE_WIDTH + map(sin(millis() / 150.0) * 100, -100, 100, -3, 3);
  int squishH = 12 + map(cos(millis() / 150.0) * 100, -100, 100, -2, 2);
  drawEyesBase(squishW, max(6, squishH), 0, 0, false); display.display();
}

void drawHappyState() {
  display.clearDisplay();
  int rX = 64 + (EYE_DISTANCE / 2), lX = 64 - (EYE_DISTANCE / 2), y = 22;
  display.drawLine(rX-9, y+6, rX, y-4, SSD1306_WHITE); display.drawLine(rX-9, y+7, rX, y-3, SSD1306_WHITE);
  display.drawLine(rX, y-4, rX+9, y+6, SSD1306_WHITE); display.drawLine(rX, y-3, rX+9, y+7, SSD1306_WHITE);
  display.drawLine(lX-9, y+6, lX, y-4, SSD1306_WHITE); display.drawLine(lX-9, y+7, lX, y-3, SSD1306_WHITE);
  display.drawLine(lX, y-4, lX+9, y+6, SSD1306_WHITE); display.drawLine(lX, y-3, lX+9, y+7, SSD1306_WHITE);
  drawMouth(64, 34, 16, 4, 4); display.display();
}

void drawTalkingState() {
  display.clearDisplay(); updateEyeAnimation();
  int breatheHeight = EYE_BASE_HEIGHT + map(sin(millis() / 300.0) * 100, -100, 100, -2, 2);
  int talkFrame = (millis() / 100) % 4;
  int mw = 14, mc = 3, mt = 4;
  if (talkFrame == 0) { mw = 10; mc = 1; mt = 6; } else if (talkFrame == 1) { mw = 16; mc = 3; mt = 3; } else if (talkFrame == 2) { mw = 12; mc = 5; mt = 5; } else { mw = 18; mc = 2; mt = 2; }
  drawEyesBase(EYE_BASE_WIDTH, breatheHeight, 0, 0, true, mw, mc, mt); display.display();
}

void idleScreen() { oledState = ST_IDLE; blinkState = false; glanceDirection = 0; blinkTimer = millis(); glanceTimer = millis(); }
void busyScreen() { oledState = ST_BUSY; }
void startAnswer(const String& text) { talkDuration = text.length() * 75; talkTimer = millis(); happyTimer = millis(); oledState = ST_HAPPY; }

void updateOled() {
  if (otaInProgress) return; 
  unsigned long now = millis();
  switch (oledState) {
    case ST_IDLE: drawIdleState(); break;
    case ST_BUSY: drawBusyState(); break;
    case ST_HAPPY: if (now - happyTimer >= HAPPY_DURATION) { oledState = ST_TALKING; talkTimer = now; } else drawHappyState(); break;
    case ST_TALKING: if (now - talkTimer >= talkDuration) idleScreen(); else drawTalkingState(); break;
  }
}

// 🚀 TASK RTOS CORE 0: MENGAMANKAN ANIMASI AGAR TIDAK FREEZE
TaskHandle_t animTask;
void animationLoop(void * parameter) {
  for(;;) {
    if (!otaInProgress) { updateOled(); updateBeaconLED(); }
    vTaskDelay(20 / portTICK_PERIOD_MS); // Animasi stabil 50 FPS
  }
}

// ============== GEMINI API ==============
const char* GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=";

String askGemini(const String& question) {
  WiFiClientSecure client; client.setInsecure(); HTTPClient https;
  https.begin(client, String(GEMINI_URL) + GEMINI_API_KEY);
  https.addHeader("Content-Type", "application/json"); https.setTimeout(30000);

  JsonDocument req;
  req["contents"][0]["parts"][0]["text"] = persona + " Pertanyaan: " + question;
  String body; serializeJson(req, body);

  int code = https.POST(body);
  String answer;

  if (code == 200) {
    JsonDocument filter; filter["candidates"][0]["content"]["parts"][0]["text"] = true;
    JsonDocument res; deserializeJson(res, https.getString(), DeserializationOption::Filter(filter));
    answer = res["candidates"][0]["content"]["parts"][0]["text"].as<String>();
    answer.trim();
  } else answer = "Error jaringan, kode: " + String(code);
  https.end(); return answer;
}

// ============== WEB SERVER (AJAX NO-RELOAD) ==============
void handleRoot() {
  String html =
    F("<!DOCTYPE html><html><head><meta name='viewport' content='width=device-width,initial-scale=1'>"
      "<title>ASTRO</title><style>"
      "body{background:#111;color:#eee;font-family:sans-serif;max-width:480px;margin:auto;padding:16px}"
      "input{width:100%;box-sizing:border-box;padding:12px;margin:6px 0;background:#222;color:#eee;border:1px solid #444;border-radius:8px;font-size:16px;}"
      "button{padding:14px;width:100%;background:#4cf;color:#012;border:0;border-radius:8px;font-weight:bold;margin-bottom:8px;font-size:16px;}"
      ".btn-mic{background:#f44;color:#fff}"
      ".card{background:#1b1b1b;padding:12px;border-radius:8px;margin:10px 0}"
      ".q{color:#8cf;margin:0 0 6px}.a{margin:0}small{color:#888}"
      "</style></head><body><h2>&#9889; ASTRO</h2>"
      
      "<input id='qInput' placeholder='Ketik atau bicara...' autocomplete='off'>"
      "<button onclick='sendText()'>KIRIM TEKS</button>"
      "<button class='btn-mic' onclick='startMic()'>&#127897; PAKAI SUARA (MIC)</button>"
      "<div id='chatArea'></div>"

      "<script>"
      "var audioCtx = new (window.AudioContext || window.webkitAudioContext)();"
      
      "function playBeep(f, d, t) {"
      "  setTimeout(() => {"
      "    var osc = audioCtx.createOscillator(); var gain = audioCtx.createGain();"
      "    osc.connect(gain); gain.connect(audioCtx.destination);"
      "    osc.type = 'square'; osc.frequency.value = f;"
      "    gain.gain.setValueAtTime(0.05, audioCtx.currentTime);"
      "    osc.start(); setTimeout(() => osc.stop(), d);"
      "  }, t);"
      "}"
      
      "function playRobotSound() {"
      "  if(audioCtx.state === 'suspended') audioCtx.resume();"
      "  playBeep(900, 100, 0); playBeep(1200, 80, 120); playBeep(700, 150, 220);"
      "}"

      "function speak(text) {"
      "  var msg = new SpeechSynthesisUtterance(text);"
      "  msg.lang = 'id-ID'; msg.rate = 1.0;"
      "  window.speechSynthesis.speak(msg);"
      "}"

      // AJAX Fetch (Tanpa reload halaman)
      "function fetchAnswer(q) {"
      "  document.getElementById('qInput').value = '';"
      "  document.getElementById('qInput').placeholder = 'Astro sedang mikir...';"
      "  fetch('/ask?q=' + encodeURIComponent(q))"
      "    .then(r => r.text())"
      "    .then(ans => {"
      "       document.getElementById('qInput').placeholder = 'Ketik atau bicara...';"
      "       var chat = document.getElementById('chatArea');"
      "       chat.innerHTML = '<div class=\"card\"><p class=\"q\">Q: ' + q + '</p><p class=\"a\">' + ans + '</p></div>' + chat.innerHTML;"
      "       speak(ans);"
      "    });"
      "}"

      "function sendText() {"
      "  var q = document.getElementById('qInput').value;"
      "  if(q) { playRobotSound(); fetchAnswer(q); }"
      "}"

      "function startMic() {"
      "  playRobotSound();"
      "  var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;"
      "  if(!SpeechRecognition) { alert('Browser tidak dukung mic.'); return; }"
      "  var rec = new SpeechRecognition(); rec.lang = 'id-ID';"
      "  rec.onstart = function() { document.getElementById('qInput').placeholder = 'Mendengarkan suara...'; };"
      "  rec.onresult = function(e) { fetchAnswer(e.results[0][0].transcript); };"
      "  rec.start();"
      "}"
      "</script></body></html>"
    );
  server.send(200, "text/html", html);
}

// Endpoint khusus menangani AJAX
void handleAsk() {
  String q = server.arg("q"); q.trim();
  if (q.isEmpty()) { server.send(200, "text/plain", ""); return; }

  busyScreen(); // Animasi mikir + napas (Dijalankan terus oleh Core 0)
  
  String a = askGemini(q);
  
  startAnswer(a); // Animasi ngomong (Dijalankan terus oleh Core 0)
  server.send(200, "text/plain", a);
}

// ============== SETUP & LOOP ==============
void setup() {
  Serial.begin(115200);
  pinMode(BTN_PIN, INPUT_PULLUP);
  pinMode(LED_BEACON_PIN, OUTPUT); digitalWrite(LED_BEACON_PIN, LOW);

  Wire.begin(OLED_SDA, OLED_SCL);
  display.begin(SSD1306_SWITCHCAPVCC, 0x3C);
  
  // Pisahkan Animasi ke Core 0 (Selesai masalah freeze!)
  xTaskCreatePinnedToCore(animationLoop, "AnimTask", 4096, NULL, 1, &animTask, 0);

  display.clearDisplay(); display.setTextSize(1); display.setTextColor(SSD1306_WHITE);
  display.setCursor(0,20); display.println("  Menyambungkan..."); display.display();

  WiFi.mode(WIFI_STA); WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  while (WiFi.status() != WL_CONNECTED) delay(300);

  ArduinoOTA.setHostname("astro-esp32");
  if (strlen(OTA_PASSWORD) > 0) ArduinoOTA.setPassword(OTA_PASSWORD);
  ArduinoOTA.onStart(onOtaStart); ArduinoOTA.onEnd(onOtaEnd);
  ArduinoOTA.onProgress(onOtaProgress); ArduinoOTA.onError(onOtaError);
  ArduinoOTA.begin();
  MDNS.begin("astro");
  
  server.on("/", handleRoot); 
  server.on("/ask", handleAsk); // Endpoint AJAX
  server.begin();
  
  display.clearDisplay();
  display.setCursor(0, 20); display.println("  ASTRO CONNECTED!");
  display.println(); display.print("  IP: "); display.println(WiFi.localIP().toString());
  display.display();
  delay(4000); 

  idleScreen();
}

// Loop Core 1 sekarang murni hanya untuk jaringan, jadi tidak ada lagi macet/freeze
void loop() {
  server.handleClient();
  ArduinoOTA.handle();
  
  if (digitalRead(BTN_PIN) == LOW) {
    idleScreen();
    delay(300);
  }
}