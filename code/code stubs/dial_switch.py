# ─────────────────────────────────────────────
# STUB: dial_switch.py
# Fone of Fortune — DIAL switch mode detection
#
# Hardware:  DPDT switch on ISS3 PCB underside
#            Physical label: DP / TT (Dial Pulse / Touch Tone)
#            Confirmed DPDT via continuity testing ✓
#            Only Pole 1 wired — Pole 2 reserved for future use
#            Wired via JST-XH 2-pin connector #2
#
# Feather pin:  D6 (INPUT, internal pull-up)
# Wiring:       ISS3 throw pad (pin 1 or 3) → D6
#               ISS3 common pad (pin 2)      → GND rail
#
# Logic:
#   DP position → D6 LOW  → Basic / Shuffle mode
#                           (handset lift → random WAV after ~3sec delay)
#   TT position → D6 HIGH → Advanced / Menu mode
#                           (handset lift → awaits keypad IVR input)
#
# Note: switch is READ ONCE on startup and on wake from deep sleep.
#   Mode cannot change mid-session without a reset — this is intentional.
#   The physical DP/TT label on the phone underside serves as the
#   user-facing mode indicator. No in-shell LED needed for this switch.
#
# Status: CONFIRMED WORKING on breadboard ✓
# ─────────────────────────────────────────────

import board
import digitalio

# ── Pin setup ──
dial_sw = digitalio.DigitalInOut(board.D6)
dial_sw.direction = digitalio.Direction.INPUT
dial_sw.pull = digitalio.Pull.UP

# ── Mode constants ──
MODE_BASIC    = "basic"     # DP position — shuffle playback
MODE_ADVANCED = "advanced"  # TT position — IVR menu


def get_mode():
    """
    Reads DIAL switch and returns current mode string.
    Call once on startup and once on wake from deep sleep.
    D6 LOW  = DP position = Basic/Shuffle mode
    D6 HIGH = TT position = Advanced/Menu mode
    """
    if not dial_sw.value:
        return MODE_BASIC
    else:
        return MODE_ADVANCED


def is_basic_mode():
    """Convenience wrapper — True if DP/Basic mode selected."""
    return get_mode() == MODE_BASIC


def is_advanced_mode():
    """Convenience wrapper — True if TT/Advanced mode selected."""
    return get_mode() == MODE_ADVANCED


# ── Minimal test — run this stub directly in Mu to verify wiring ──
# Flip the DP/TT switch on the phone underside — should print mode changes.
if __name__ == "__main__":
    import time
    print("[dial_switch] Test mode — flip the DP/TT switch")
    last_mode = None
    while True:
        mode = get_mode()
        if mode != last_mode:
            print(f"  Mode: {mode.upper()}")
            last_mode = mode
        time.sleep(0.1)
