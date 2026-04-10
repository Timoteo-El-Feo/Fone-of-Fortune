# ─────────────────────────────────────────────
# STUB: lead_mode.py
# Fone of Fortune — Easter egg audio mode
#
# Trigger:   Keypad code 82# in Advanced/Menu mode
#            (82 = atomic number of Lead — heaviest stable element.
#             Helium = lightest, floats up = 2#.
#             Lead   = heaviest, sinks down = 82#.
#             Nobody in the gallery will ever know. You will.)
# Toggle:    Enter 82# once to activate, again to deactivate
#
# Depends on:
#   - fortune_mode variable (str) — controls which /sd subfolder is used
#   - get_fortune_path() — assembles full file path from filename + mode
#   - DIAL switch in TT position (D6 HIGH) — Advanced/Menu mode required
#     for keypad input to be active
#
# SD card folder:  /sd/lead/
# File prep (Mac Terminal — run ONCE on source files):
#
#   # Step 1 — normalize all source files to correct format first:
#   for f in /path/to/source/*.{wav,aiff,mp3,m4a}; do
#     [ -f "$f" ] || continue
#     name="${$(basename "$f")%.*}"
#     afconvert -f WAVE -d LEI16@22050 -c 1 "$f" "/path/to/clean/${name}.wav"
#   done
#
#   # Step 2 — pitch shift DOWN into /sd/lead/ folder:
#   for f in /path/to/clean/*.wav; do
#     sox "$f" "/path/to/lead/$(basename $f)" pitch -700 rate 22050
#   done
#
#   pitch -700 = perfect fifth DOWN, duration fully preserved, NO speed change.
#   SoX pitch effect shifts pitch only — tempo is completely unchanged.
#   Negative cents value = downward shift. Experiment by ear:
#     pitch -500  = perfect fourth down  (subtler — slightly gravelly)
#     pitch -700  = perfect fifth down   (recommended starting point)
#     pitch -1200 = full octave down     (very deep, almost subsonic on some voices)
#   Do NOT use the 'speed' effect — that changes tempo AND pitch together,
#   which lengthens the fortune duration. pitch only, always.
#
#   Aesthetic note: pitch-down on voice tends to sound more oracular and
#   authoritative than pitch-up. This mode makes every fortune sound like
#   it is being delivered by a very serious ancient entity. Which is correct.
#
# Status: UNTESTED — awaiting full code.py assembly + keypad wiring
# ─────────────────────────────────────────────

# ── Mode constants (keep in sync with audio_modes.py) ──
NORMAL = "fortunes"
LEAD   = "lead"

# ── State ──
fortune_mode = NORMAL       # global — shared across all mode stubs
lead_active  = False        # tracks toggle state for 82# keypress


def activate_lead_mode():
    """Switch fortune folder to /sd/lead/ and set toggle flag."""
    global fortune_mode, lead_active
    fortune_mode = LEAD
    lead_active  = True
    print("[lead_mode] ACTIVATED — fortune folder: /sd/lead/")


def deactivate_lead_mode():
    """Return fortune folder to /sd/fortunes/ and clear toggle flag."""
    global fortune_mode, lead_active
    fortune_mode = NORMAL
    lead_active  = False
    print("[lead_mode] DEACTIVATED — fortune folder: /sd/fortunes/")


def toggle_lead_mode():
    """
    Called when keypad code 82# is entered.
    First press activates, second press deactivates.
    Wire this into the keypad IVR handler in code.py.
    """
    if lead_active:
        deactivate_lead_mode()
    else:
        activate_lead_mode()


def get_fortune_path(filename):
    """
    Returns full SD path for a fortune WAV file,
    routing to the correct subfolder based on active mode.
    Call this wherever a fortune filename is resolved in code.py.

    Example:
        path = get_fortune_path("fortune_01.wav")
        # returns "/sd/lead/fortune_01.wav"     if lead active
        # returns "/sd/fortunes/fortune_01.wav" if normal
    """
    if filename.startswith("._"):
        return None  # skip Mac sidecar metadata files
    return f"/sd/{fortune_mode}/{filename}"
