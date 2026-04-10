# ─────────────────────────────────────────────
# STUB: keypad_leds.py
# Fone of Fortune — keypad backlight LEDs (oracle glow)
#
# Hardware:  Two orange LEDs physically on ISS4 PCB
#            Light shines through ISS2.5 contact window (not wired to ISS2.5)
#            Forward voltage confirmed: ~1.8V in diode test mode ???
#            Polarity confirmed:
#              E2 = anode (+) of LED1
#              D2 = cathode (−) of LED1
#              E3 = anode (+) of LED2  (E trace = shared anode bus)
#              F2 = cathode (−) of LED2
#
# Wiring:
#   ISS4 E trace (shared anode) → 220Ω resistor inline → 3.3V rail ???
#     Resistor spliced on the JST-SM anode wire before perfboard connection.
#     Single resistor serves both LEDs — confirmed correct for parallel wiring
#     (combined current doubles, so resistor value halved vs. single LED calc).
#   ISS4 D2 (LED1 cathode) → Feather GPIO (TBD) via JST-SM
#   ISS4 F2 (LED2 cathode) → Feather GPIO (TBD) via JST-SM
#
# Connector: JST-SM quick-connect from ISS4 to perfboard
#   (matches JST-XH 2.54mm pitch used for hook switch and DIAL switch —
#    JST-SM for LEDs due to easier quick disconnect from ISS4)
#
# Feather pins:  TBD — assign once ISS4 is soldered and GPIO budget confirmed
#   Candidates:  A5 (currently reserved), or any remaining available pin
#
# Behavior (oracle glow):
#   OLH in LO or HI → LEDs ON  (phone awake, ready to dispense wisdom)
#   OLH in OFF      → LEDs OFF (Feather in deep sleep, GPIO floating low)
#
# Note: Both LEDs are driven together — same on/off state at all times.
#   Individual cathode pins allow independent control if desired later,
#   but for now treat them as a single unit.
#
# ⚠ PLACEHOLDER PIN NUMBERS BELOW — update LED_1_PIN and LED_2_PIN
#   once GPIO assignment is finalized after ISS4 physical solder session.
#
# Status: HARDWARE CONFIRMED ✓ — GPIO pins TBD — awaiting ISS4 solder
# ─────────────────────────────────────────────

import board
import digitalio

# ── ⚠ UPDATE THESE when GPIO pins are finalized ──
LED_1_PIN = board.A5   # PLACEHOLDER — LED1 cathode D trace (D2)
LED_2_PIN = None       # PLACEHOLDER — LED2 cathode F trace (F2) — assign TBD pin

# ── Pin setup ──
led1 = digitalio.DigitalInOut(LED_1_PIN)
led1.direction = digitalio.Direction.OUTPUT
led1.value = False  # start OFF (cathode HIGH = LED off in common-anode config)

# Uncomment when LED_2_PIN is assigned:
# led2 = digitalio.DigitalInOut(LED_2_PIN)
# led2.direction = digitalio.Direction.OUTPUT
# led2.value = False


def leds_on():
    """
    Illuminate both keypad backlight LEDs.
    Cathode driven LOW = current flows = LED on.
    Call when OLH moves to LO or HI (phone awake).
    """
    led1.value = False   # LOW = on (common anode, cathode to GPIO)
    # led2.value = False
    print("[keypad_leds] LEDs ON")


def leds_off():
    """
    Extinguish both keypad backlight LEDs.
    Cathode driven HIGH = no current = LED off.
    Call before entering deep sleep (OLH → OFF).
    """
    led1.value = True    # HIGH = off
    # led2.value = True
    print("[keypad_leds] LEDs OFF")


def set_leds(state: bool):
    """
    Convenience wrapper — True = on, False = off.
    Mirrors OLH awake/sleep state directly.
    """
    if state:
        leds_on()
    else:
        leds_off()


# ── Minimal test — run this stub directly in Mu to verify wiring ──
# LEDs should blink on and off once per second.
if __name__ == "__main__":
    import time
    print("[keypad_leds] Test mode — LEDs should blink 1 second on / 1 second off")
    print("  ⚠ Confirm LED_1_PIN and LED_2_PIN are set correctly before running")
    while True:
        leds_on()
        time.sleep(1.0)
        leds_off()
        time.sleep(1.0)
