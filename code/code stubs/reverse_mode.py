# ─────────────────────────────────────────────
# STUB: reverse_mode.py
# Fone of Fortune — Easter egg audio mode
#
# Trigger:   Keypad code 666# in Advanced/Menu mode
#            (no elemental justification needed)
# Toggle:    Enter 666# once to activate, again to deactivate
#
# Depends on:
#   - fortune_mode variable (str) — controls which /sd subfolder is used
#   - get_fortune_path() — assembles full file path from filename + mode
#   - DIAL switch in TT position (D6 HIGH) — Advanced/Menu mode required
#     for keypad input to be active
#
# SD card folder:  /sd/reversed/
# File prep (Mac Terminal — run ONCE on source files):
#
#   # Step 1 — normalize all source files to correct format first:
#   for f in /path/to/source/*.{wav,aiff,mp3,m4a}; do
#     [ -f "$f" ] || continue
#     name="${$(basename "$f")%.*}"
#     afconvert -f WAVE -d LEI16@22050 -c 1 "$f" "/path/to/clean/${name}.wav"
#   done
#
#   # Step 2 — reverse clean files into /sd/reversed/ folder:
#   for f in /path/to/clean/*.wav; do
#     sox "$f" "/path/to/reversed/$(basename $f)" reverse
#   done
#
#   reverse = plays audio backwards, duration and pitch unchanged.
#   No further parameters needed — SoX reverse is clean and artifact-free.
#
# Note: Real-time reverse playback is NOT possible on Feather M4.
#   The SD card cannot be seeked backwards fast enough without dropouts.
#   Pre-reversed files are the only reliable approach.
#   Storage cost is minimal — 8GB FAT32 card has enormous headroom.
#
# Status: UNTESTED — awaiting full code.py assembly + keypad wiring
# ─────────────────────────────────────────────

# ── Mode constants (keep in sync with audio_modes.py) ──
NORMAL   = "fortunes"
REVERSED = "reversed"

# ── State ──
fortune_mode = NORMAL          # global — shared across all mode stubs
reverse_active = False         # tracks toggle state for 666# keypress


def activate_reverse_mode():
    """Switch fortune folder to /sd/reversed/ and set toggle flag."""
    global fortune_mode, reverse_active
    fortune_mode = REVERSED
    reverse_active = True
    print("[reverse_mode] ACTIVATED — fortune folder: /sd/reversed/")


def deactivate_reverse_mode():
    """Return fortune folder to /sd/fortunes/ and clear toggle flag."""
    global fortune_mode, reverse_active
    fortune_mode = NORMAL
    reverse_active = False
    print("[reverse_mode] DEACTIVATED — fortune folder: /sd/fortunes/")


def toggle_reverse_mode():
    """
    Called when keypad code 666# is entered.
    First press activates, second press deactivates.
    Wire this into the keypad IVR handler in code.py.
    """
    if reverse_active:
        deactivate_reverse_mode()
    else:
        activate_reverse_mode()


def get_fortune_path(filename):
    """
    Returns full SD path for a fortune WAV file,
    routing to the correct subfolder based on active mode.
    Call this wherever a fortune filename is resolved in code.py.

    Example:
        path = get_fortune_path("fortune_01.wav")
        # returns "/sd/reversed/fortune_01.wav" if reverse active
        # returns "/sd/fortunes/fortune_01.wav" if normal
    """
    return f"/sd/{fortune_mode}/{filename}"
