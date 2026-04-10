# ─────────────────────────────────────────────
# STUB: hook_switch.py
# Fone of Fortune — handset hook switch detection
#
# Hardware:  Sansei ML mechanism on ISS3 PCB
#            Left pad set (aligned with beige lever visible through cutout)
#            Wired via JST-XH 2-pin connector #1
#
# Feather pin:  D5 (INPUT, internal pull-up)
# Wiring:       ISS3 signal pad → D5
#               ISS3 GND pad   → GND rail
#
# Logic:
#   Handset UP   (off hook) → switch closes → D5 pulled LOW  → play fortune
#   Handset DOWN (on hook)  → switch opens  → D5 pulled HIGH → stop / sleep
#
# Status: CONFIRMED WORKING on breadboard ✓
# ─────────────────────────────────────────────

import board
import digitalio

# ── Pin setup ──
hook = digitalio.DigitalInOut(board.D5)
hook.direction = digitalio.Direction.INPUT
hook.pull = digitalio.Pull.UP


def handset_lifted():
    """
    Returns True if the handset is currently off the hook.
    D5 LOW = handset lifted (switch closed, pulled to GND).
    D5 HIGH = handset on hook (switch open, pull-up holds HIGH).
    """
    return not hook.value


def wait_for_hangup():
    """
    Blocking loop — returns only when handset is replaced on hook.
    Use this after fortune playback to wait for the user to hang up
    before returning to idle / sleep state.
    """
    while handset_lifted():
        pass


# ── Minimal test — run this stub directly in Mu to verify wiring ──
# Lift and replace handset — should print state changes to serial console.
if __name__ == "__main__":
    import time
    print("[hook_switch] Test mode — lift and replace handset")
    last_state = None
    while True:
        current = handset_lifted()
        if current != last_state:
            print(f"  Handset: {'LIFTED (off hook)' if current else 'ON HOOK'}")
            last_state = current
        time.sleep(0.05)
