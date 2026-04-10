# ─────────────────────────────────────────────
# STUB: audio_modes.py
# Fone of Fortune — audio mode state and folder routing
#
# This is the SINGLE SOURCE OF TRUTH for fortune_mode state.
# All other mode stubs (helium_mode.py, reverse_mode.py, lead_mode.py)
# reference the constants defined here. In final code.py, import from
# this file only — do not duplicate mode state elsewhere.
#
# SD card folder structure:
#   /sd/fortunes/   ← normal playback (22050Hz / 16-bit / mono)
#   /sd/reversed/   ← backwards playback (SoX reverse, duration unchanged)
#   /sd/helium/     ← pitch up, duration preserved (SoX pitch 700 rate 22050)
#   /sd/lead/       ← pitch down, duration preserved (SoX pitch -700 rate 22050)
#
# Mac Terminal batch commands to prepare each folder:
#
#   # 0. NORMALIZE all source files first (handles any mixed input format):
#   for f in /path/to/source/*.{wav,aiff,mp3,m4a}; do
#     [ -f "$f" ] || continue
#     name="${$(basename "$f")%.*}"
#     afconvert -f WAVE -d LEI16@22050 -c 1 "$f" "/path/to/fortunes/${name}.wav"
#   done
#
#   # 1. REVERSE copies → /sd/reversed/:
#   for f in /path/to/fortunes/*.wav; do
#     sox "$f" "/path/to/reversed/$(basename $f)" reverse
#   done
#
#   # 2. HELIUM copies → /sd/helium/ (pitch up, duration preserved):
#   for f in /path/to/fortunes/*.wav; do
#     sox "$f" "/path/to/helium/$(basename $f)" pitch 700 rate 22050
#   done
#   # pitch 700 = perfect fifth up, no speed change, duration intact.
#   # If it sounds too phase-y or artificial on voice, try hybrid:
#   #   pitch 500 speed 1.1 rate 22050
#
#   # 3. LEAD copies → /sd/lead/ (pitch down, duration preserved):
#   for f in /path/to/fortunes/*.wav; do
#     sox "$f" "/path/to/lead/$(basename $f)" pitch -700 rate 22050
#   done
#   # pitch -700 = perfect fifth down, no speed change, duration intact.
#   # Voices drop in register — heavy, oracular, authoritative.
#   # Experiment with -500 (fourth down) or -1200 (full octave down).
#
# Easter egg trigger codes (entered via keypad in Advanced/TT mode):
#   2#    → toggle helium mode   (element 2  = Helium — lightest, goes up)
#   82#   → toggle lead mode     (element 82 = Lead   — heaviest, goes down)
#   666#  → toggle reverse mode  (no elemental justification needed)
#
# All three modes are mutually exclusive — activating one deactivates
# whichever of the others was previously active.
#
# Status: DESIGN CONFIRMED — awaiting keypad matrix wiring to test IVR input
# ─────────────────────────────────────────────

# ── Mode constants ──
MODE_NORMAL   = "fortunes"
MODE_REVERSED = "reversed"
MODE_HELIUM   = "helium"
MODE_LEAD     = "lead"

# ── Active mode state ──
# This single variable controls which folder get_fortune_path() routes to.
# Treat this as a global in code.py — read it, don't copy it.
fortune_mode = MODE_NORMAL

# ── Toggle flags (track whether each easter egg is currently active) ──
helium_active  = False
reverse_active = False
lead_active    = False


# ── Path resolver ──
def get_fortune_path(filename):
    """
    Returns full SD path for a fortune WAV filename.
    Routes to the correct subfolder based on active fortune_mode.

    Example:
        get_fortune_path("captain.wav")
        → "/sd/fortunes/captain.wav"   (normal)
        → "/sd/helium/captain.wav"     (helium active)
        → "/sd/reversed/captain.wav"   (reverse active)
        → "/sd/lead/captain.wav"       (lead active)

    Returns None for Mac sidecar files (._filename.wav) — caller must skip.
    """
    if filename.startswith("._"):
        return None  # skip Mac metadata files
    return f"/sd/{fortune_mode}/{filename}"


# ── Internal helper — silently clear all mode state ──
def _clear_all():
    global fortune_mode, helium_active, reverse_active, lead_active
    fortune_mode   = MODE_NORMAL
    helium_active  = False
    reverse_active = False
    lead_active    = False


# ── Mode toggles ──
def toggle_helium():
    """
    Toggle helium mode on/off.
    Triggered by keypad code 2# in Advanced/Menu mode.
    All other modes deactivated on entry (mutually exclusive).
    """
    global fortune_mode, helium_active
    if helium_active:
        _clear_all()
        print("[audio_modes] Helium OFF → normal mode")
    else:
        _clear_all()
        fortune_mode  = MODE_HELIUM
        helium_active = True
        print("[audio_modes] Helium ON → /sd/helium/")


def toggle_lead():
    """
    Toggle lead mode on/off.
    Triggered by keypad code 82# in Advanced/Menu mode.
    All other modes deactivated on entry (mutually exclusive).
    """
    global fortune_mode, lead_active
    if lead_active:
        _clear_all()
        print("[audio_modes] Lead OFF → normal mode")
    else:
        _clear_all()
        fortune_mode = MODE_LEAD
        lead_active  = True
        print("[audio_modes] Lead ON → /sd/lead/")


def toggle_reverse():
    """
    Toggle reverse mode on/off.
    Triggered by keypad code 666# in Advanced/Menu mode.
    All other modes deactivated on entry (mutually exclusive).
    """
    global fortune_mode, reverse_active
    if reverse_active:
        _clear_all()
        print("[audio_modes] Reverse OFF → normal mode")
    else:
        _clear_all()
        fortune_mode   = MODE_REVERSED
        reverse_active = True
        print("[audio_modes] Reverse ON → /sd/reversed/")


def reset_to_normal():
    """
    Force return to normal playback mode.
    Call on startup and whenever OLH cycles through OFF.
    """
    _clear_all()
    print("[audio_modes] Reset → normal mode")


def get_mode_label():
    """Returns a human-readable label for the current mode — useful for debugging."""
    if helium_active:
        return "HELIUM (2#)"
    elif lead_active:
        return "LEAD (82#)"
    elif reverse_active:
        return "REVERSE (666#)"
    else:
        return "NORMAL"
