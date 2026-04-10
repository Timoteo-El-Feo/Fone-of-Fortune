# ─────────────────────────────────────────────
# STUB: olh_switch.py
# Fone of Fortune — OLH (OFF / LO / HI) slider switch
#
# Hardware:  3-position slider on ISS4 PCB
#            ISS4 pad A (pad 3) = LO output
#            ISS4 pad B (pad 2) = common → GND
#            ISS4 pad C (pad 1) = HI output
#            Wired directly to ISS4 pads with 28AWG stranded hookup wire
#
# Feather pins:
#   D10 (INPUT, internal pull-up) ← ISS4 pad A — LO pin
#   D11 (INPUT, internal pull-up) ← ISS4 pad C — HI pin
#
# Logic (both pins use pull-up — LOW = active):
#   OFF position → D10 HIGH, D11 HIGH → deep sleep
#   LO  position → D10 LOW,  D11 HIGH → earpiece / basic mode
#   HI  position → D10 HIGH, D11 LOW  → base speaker / advanced mode
#
# OFF is inferred by elimination — no third GPIO pin needed.
#
# Deep sleep wake:  pin alarm on D10 OR D11 going LOW
#   On wake, read both pins to determine LO vs HI before proceeding.
#
# CD4066BE routing commanded by this switch:
#   LO  → D12 HIGH (CtrlA) + D13 LOW  (CtrlB) → earpiece on
#   HI  → D12 LOW  (CtrlA) + D13 HIGH (CtrlB) → base speaker on
#   OFF → D12 LOW  + D13 LOW → both channels off before sleep
#
# Status: CONFIRMED WIRING PLAN ✓ — awaiting physical solder to ISS4
# ─────────────────────────────────────────────

import board
import digitalio

# ── Pin setup ──
olh_lo = digitalio.DigitalInOut(board.D10)
olh_lo.direction = digitalio.Direction.INPUT
olh_lo.pull = digitalio.Pull.UP

olh_hi = digitalio.DigitalInOut(board.D11)
olh_hi.direction = digitalio.Direction.INPUT
olh_hi.pull = digitalio.Pull.UP

# ── CD4066BE audio routing control pins ──
ctrl_a = digitalio.DigitalInOut(board.D12)  # HIGH = earpiece on
ctrl_a.direction = digitalio.Direction.OUTPUT
ctrl_a.value = False

ctrl_b = digitalio.DigitalInOut(board.D13)  # HIGH = base speaker on
ctrl_b.direction = digitalio.Direction.OUTPUT
ctrl_b.value = False

# ── OLH position constants ──
OLH_OFF = "off"
OLH_LO  = "lo"
OLH_HI  = "hi"


def get_olh_position():
    """
    Reads D10 and D11 and returns current OLH slider position.
    Both HIGH = OFF. D10 LOW = LO. D11 LOW = HI.
    """
    lo_active = not olh_lo.value
    hi_active = not olh_hi.value

    if lo_active:
        return OLH_LO
    elif hi_active:
        return OLH_HI
    else:
        return OLH_OFF


def route_audio(position):
    """
    Commands CD4066BE control pins based on OLH position.
    Call this on startup and on wake from deep sleep.

    LO  → CtrlA HIGH (D12), CtrlB LOW  (D13) → earpiece channel
    HI  → CtrlA LOW  (D12), CtrlB HIGH (D13) → base speaker channel
    OFF → both LOW → silence before entering deep sleep
    """
    if position == OLH_LO:
        ctrl_a.value = True
        ctrl_b.value = False
        print("[olh_switch] LO — earpiece channel active (D12 HIGH)")
    elif position == OLH_HI:
        ctrl_a.value = False
        ctrl_b.value = True
        print("[olh_switch] HI — base speaker channel active (D13 HIGH)")
    else:
        ctrl_a.value = False
        ctrl_b.value = False
        print("[olh_switch] OFF — all audio channels off")


def setup_audio_routing():
    """
    Convenience wrapper — read OLH position and route audio accordingly.
    Call once on startup and once on wake from deep sleep.
    """
    position = get_olh_position()
    route_audio(position)
    return position


# ── Minimal test — run this stub directly in Mu to verify wiring ──
# Slide the OLH switch through OFF / LO / HI — should print state changes
# and you should hear audio routing change if PAM and CD4066 are connected.
if __name__ == "__main__":
    import time
    print("[olh_switch] Test mode — slide OLH switch through positions")
    last_pos = None
    while True:
        pos = get_olh_position()
        if pos != last_pos:
            route_audio(pos)
            last_pos = pos
        time.sleep(0.1)
