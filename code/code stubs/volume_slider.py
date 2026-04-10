# ─────────────────────────────────────────────
# STUB: volume_slider.py
# Fone of Fortune — volume slider (ISS4 potentiometer)
#
# Hardware:  Slider potentiometer on ISS4 PCB
#            Total resistance: 42kΩ
#            ISS4 pads 1+4 (shorted by PCB trace) = fixed end A → 3.3V
#            ISS4 pads 2+3 (shorted by PCB trace) = wiper       → A2
#            ISS4 pad  5                           = fixed end B → GND
#            Wired directly to ISS4 pads with 28AWG stranded hookup wire
#
# Feather pin:  A2 (ANALOG INPUT) — LOCKED, do not reassign
#
# Reads:  0 to 65535 (16-bit ADC range in CircuitPython)
# Output: normalized 0.0 to 1.0 float for use as audio volume multiplier
#
# Usage in code.py:
#   vol = read_volume()
#   # pass vol to whatever controls output gain
#   # (direct audioio does not have a volume property —
#   #  use SoX to pre-normalize WAV levels instead,
#   #  or implement software gain via sample math if needed)
#
# Note: audiomixer was abandoned — SD card streaming through mixer
#   causes distortion. Direct audioio.AudioOut is the confirmed approach.
#   Volume slider currently controls FUTURE software gain implementation.
#   For now, PAM pot is at max gain permanently — slider is read but
#   not yet wired into playback gain in code.
#
# Status: CONFIRMED WIRING PLAN ✓ — awaiting physical solder to ISS4
# ─────────────────────────────────────────────

import board
import analogio

# ── Pin setup ──
vol_pin = analogio.AnalogIn(board.A2)


def read_volume():
    """
    Reads the volume slider wiper on A2.
    Returns a float between 0.0 (minimum) and 1.0 (maximum).
    Slider fully left  (fixed end B / GND) → 0.0
    Slider fully right (fixed end A / 3.3V) → 1.0
    """
    raw = vol_pin.value          # 0–65535
    return raw / 65535.0


def read_volume_smoothed(samples=5):
    """
    Returns an averaged volume reading over multiple samples.
    Reduces jitter from ADC noise on the analog wiper.
    Default 5 samples is a reasonable balance of speed vs. stability.
    """
    import time
    total = 0
    for _ in range(samples):
        total += vol_pin.value
        time.sleep(0.005)
    return (total / samples) / 65535.0


# ── Minimal test — run this stub directly in Mu to verify wiring ──
# Slide the volume slider — should print changing values to serial console.
if __name__ == "__main__":
    import time
    print("[volume_slider] Test mode — slide the volume control")
    while True:
        vol = read_volume()
        bar = "█" * int(vol * 20)
        print(f"  Volume: {vol:.3f}  |{bar:<20}|")
        time.sleep(0.2)
