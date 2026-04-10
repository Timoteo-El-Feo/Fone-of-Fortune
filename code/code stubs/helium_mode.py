# ─────────────────────────────────────────────
# STUB: helium_mode.py
# Fone of Fortune — Easter egg audio mode
#
# Trigger:   Keypad code 2# in Advanced/Menu mode
#            (2 = atomic number of Helium — intentional)
# Toggle:    Enter 2# once to activate, again to deactivate
#
# Depends on:
#   - fortune_mode variable (str) — controls which /sd subfolder is used
#   - get_fortune_path() — assembles full file path from filename + mode
#   - DIAL switch in TT position (D6 HIGH) — Advanced/Menu mode required
#     for keypad input to be active
#
# SD card folder:  /sd/helium/
# File prep (Mac Terminal — run ONCE on source files):
#
#   # Step 1 — normalize all source files to correct format first:
#   for f in /path/to/source/*.{wav,aiff,mp3,m4a}; do
#     [ -f "$f" ] || continue
#     name="${$(basename "$f")%.*}"
#     afconvert -f WAVE -d LEI16@22050 -c 1 "$f" "/path/to/clean/${name}.wav"
#   done
#
#   # Step 2 — pitch shift clean files into /sd/helium/ folder:
#   for f in /path/to/clean/*.wav; do
#     sox "$f" "/path/to/helium/$(basename $f)" pitch 700 rate 22050
#   done
#
#   pitch 700 = perfect fifth up, duration fully preserved, NO speed change.
#   SoX pitch effect shifts pitch only — tempo is unchanged.
#   Start with 700 cents and adjust by ear if needed:
#     pitch 500  = perfect fourth up  (subtler)
#     pitch 700  = perfect fifth up   (recommended starting point)
#     pitch 1200 = full octave up     (full chipmunk territory)
#   Do NOT use the 'speed' effect — that changes tempo AND pitch together,
#   which shortens the fortune duration. pitch only, always.
#
# Status: UNTESTED — awaiting full code.py assembly + keypad wiring
# ─────────────────────────────────────────────

# ── Mode constants (keep in sync with audio_modes.py) ──
NORMAL  = "fortunes"
HELIUM  = "helium"

# ── State ──
fortune_mode = NORMAL          # global — shared across all mode stubs
helium_active = False          # tracks toggle state for 2# keypress


def activate_helium_mode():
    """Switch fortune folder to /sd/helium/ and set toggle flag."""
    global fortune_mode, helium_active
    fortune_mode = HELIUM
    helium_active = True
    print("[helium_mode] ACTIVATED — fortune folder: /sd/helium/")


def deactivate_helium_mode():
    """Return fortune folder to /sd/fortunes/ and clear toggle flag."""
    global fortune_mode, helium_active
    fortune_mode = NORMAL
    helium_active = False
    print("[helium_mode] DEACTIVATED — fortune folder: /sd/fortunes/")


def toggle_helium_mode():
    """
    Called when keypad code 2# is entered.
    First press activates, second press deactivates.
    Wire this into the keypad IVR handler in code.py.
    """
    if helium_active:
        deactivate_helium_mode()
    else:
        activate_helium_mode()


def get_fortune_path(filename):
    """
    Returns full SD path for a fortune WAV file,
    routing to the correct subfolder based on active mode.
    Call this wherever a fortune filename is resolved in code.py.

    Example:
        path = get_fortune_path("fortune_01.wav")
        # returns "/sd/helium/fortune_01.wav" if helium active
        # returns "/sd/fortunes/fortune_01.wav" if normal
    """
    return f"/sd/{fortune_mode}/{filename}"
