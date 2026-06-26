/*
  Pitview sensor sketch  -  Arduino Uno
  ------------------------------------------------------------
  Reads all three sensor types and sends ONE comma-separated
  line per loop over USB serial, in the order the Python
  generator expects:

        steering , throttle , brake

  Each value is 0-1023 so the Python divide-by-1023 keeps
  working unchanged. (Clutch is included but commented out -
  see the CLUTCH notes below.)

  ASSUMPTIONS (change these if your rig is different):
    - Board:    Arduino Uno
    - steering = AS5600 magnetic encoder (I2C: SDA=A4, SCL=A5, DIR=GND)
    - throttle = hall sensor on A0 (analog)
    - brake    = load cell via HX711 amp (DT=D2, SCK=D3)
    - clutch   = (optional) second hall sensor on A2

  LIBRARIES TO INSTALL (Arduino IDE -> Library Manager):
    - AS5600 by Rob Tillaart
    - HX711  by Bogdan Necula  (a.k.a. HX711 Arduino Library)
  ------------------------------------------------------------
*/

#include <Wire.h>
#include "AS5600.h"
#include "HX711.h"

// ---------- PIN CONFIG ----------
const int THROTTLE_PIN = A0;     // hall sensor (analog)
const int CLUTCH_PIN   = A2;     // 2nd hall sensor (clutch)
const int HX711_DT  = 2;         // load cell amp data pin
const int HX711_SCK = 3;         // load cell amp clock pin
// AS5600 is I2C and uses A4 (SDA) and A5 (SCL) automatically on the Uno.

// ---------- CALIBRATION ----------
// These decide what counts as 0% and 100% for each axis.
// Replace with the REAL numbers you read during calibration.
int  throttleMin = 0,    throttleMax = 1023;   // hall raw at rest / full press
int  clutchMin   = 0,    clutchMax   = 1023;   // clutch hall raw at rest / full press
int  encMin      = 0,    encMax      = 4095;   // encoder raw at the ends of travel
long brakeMax    = 50000;                      // HX711 get_value() at full brake press
// (brake 0 is set automatically by tare() at startup)

// ---------- OBJECTS ----------
AS5600 encoder;
HX711  scale;

void setup() {
  Serial.begin(250000);          // must match baud in settings.json
  Wire.begin();
  encoder.begin();
  scale.begin(HX711_DT, HX711_SCK);
  scale.tare();                  // auto-zero the brake while pedal is at rest
}

void loop() {
  // ---- THROTTLE (hall, native 0-1023) ----
  int tRaw = analogRead(THROTTLE_PIN);
  int throttle = constrain(map(tRaw, throttleMin, throttleMax, 0, 1023), 0, 1023);

  // ---- STEERING (AS5600 encoder, native 0-4095) ----
  int eRaw = encoder.rawAngle();
  int steering = constrain(map(eRaw, encMin, encMax, 0, 1023), 0, 1023);

  // ---- BRAKE (load cell via HX711, 24-bit) ----
  // HX711 is not always ready; keep the last good reading so the
  // brake does not flicker to 0 while we wait for the next sample.
  static long bRaw = 0;
  if (scale.is_ready()) bRaw = scale.get_value();  // get_value = raw MINUS tare offset
  int brake = constrain(map(bRaw, 0, brakeMax, 0, 1023), 0, 1023);

  // ---- (optional) CLUTCH - currently unused ----
  // int cRaw = analogRead(CLUTCH_PIN);
  // int clutch = constrain(map(cRaw, clutchMin, clutchMax, 0, 1023), 0, 1023);

  // ---- SEND ONE CSV LINE (order MUST match the Python) ----
  Serial.print(steering); Serial.print(",");
  Serial.print(throttle); Serial.print(",");
  Serial.println(brake);          // println adds the newline that readline needs

  delay(1);                        // small pace; lower = higher throughput
}

/*
  ------------------------------------------------------------
  HOW TO CALIBRATE (do this once, then paste the numbers above)
  ------------------------------------------------------------
  Temporarily replace the body of loop() with raw prints:

      Serial.print(analogRead(A0));        // throttle
      Serial.print("  ");
      Serial.print(encoder.rawAngle());    // steering
      Serial.print("  ");
      if (scale.is_ready()) Serial.println(scale.get_value());  // brake

  Open Serial Monitor (250000) and:
    - Throttle: note the value pedal-up (throttleMin) and pedal-down (throttleMax).
    - Encoder:  note the value at each end of travel (encMin / encMax).
    - Brake:    press as hard as you ever would; that number is brakeMax.
  Put those numbers in the CALIBRATION section, then restore loop().

  NOTE on the encoder: if the raw value jumps 4095 -> 0 partway through
  your travel, the magnet is sitting on the wrap point. Rotate the magnet
  so your usable range stays within 0..4095 without crossing the seam.
  ------------------------------------------------------------
*/
