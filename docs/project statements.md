FoF Statements
(4/9/26)

🎨 Artist's Statement

Fone of Fortune
Project Statement — Revision 1.1

We live surrounded by objects that once held meaning and have since been discarded — not because they stopped working, but because the world around them changed. The Fone of Fortune begins with one such object: a vintage AT&T touchtone telephone, the kind that used to anchor a kitchen wall or a nightstand, that asked you to be present, to stop moving, to listen.

I was sitting at a restaurant with a friend when they cracked open a fortune cookie and read it aloud. Something about that moment — the randomness, the ritual, the small hopeful absurdity of it — lodged itself in me. What if that voice, that moment, could be kept? Replayed? Collected, like records in a crate?

Fone of Fortune is an interactive audio sculpture that resurrects the telephone as an oracle. Lift the receiver, and a the oracle speaks — a real voice, in a real moment, reading a fortune that found them. The fortunes, over 300 in number, were gathered from shared meals, from the small ceremonies we enact around tables, collected over the last 30 years. The phone's exterior is entombed in epoxy over a collage of those very same fortune cookie fortunes: the archive made visible, made permanent, made decorative. Beware, hidden among the secret numbers, deep menus, and various easter eggs lie audio booby traps.

The telephone was once a technology of connection across distance. Here it becomes a technology of connection across time — a record player that plays people instead of vinyl, a voicemail from the universe, a reminder that wisdom sometimes arrives wrapped in a cookie.

Pick up. Listen. You already know what it means.



⚙️ Engineer's Project Abstract

Fone of Fortune: An Embedded Audio Playback System Integrated into a Vintage Telephonic Form Factor
Project Abstract — Revision 1.1

This document describes the design and implementation of Fone of Fortune, a standalone embedded audio player housed within a restored AT&T Traditional 1000 touchtone telephone. The system is intended for private residential installation and serves as a functional art piece combining tactile user interaction with curated audio content delivery.
System Overview: The device is built around an Adafruit Feather M4 Express microcontroller running CircuitPython 10.1.3. Audio files are stored on a MicroSD card in WAV format (22,050 Hz / 16-bit PCM / mono) and decoded natively via the audioio.AudioOut module using the onboard DAC. Amplification is handled by a PAM8302A Class-D amplifier module driving a 3W / 4Ω base speaker. A CD4066BE quad analog switch enables silent, relay-free routing of audio signal between the handset earpiece and the base speaker.

User Interface: The original hook switch (Sansei ML / ISS3) serves as the primary trigger input as the handset is lifted off of its cradle in the phone base, detected via a digital GPIO pin with pull-up resistor. A three-position OLH (RINGER OFF/LO/HI) slider switch controls operational mode and power state, including deep sleep functionality (set to OFF position) via the CircuitPython alarm library. A VOLUME control slider (42kΩ potentiometer) provides continuous analog gain adjustment read via ADC on pin A2.

Operating Modes: A hidden DIAL switch in the underbelly of the phone originally wired to toggle dial pulse (DP) and touch tone (TT) is now configured to toggle between Basic Shuffle mode and Advanced Menu mode. In shuffle mode (DIAL in DP position), lifting the receiver triggers randomized, non-repeating WAV playback. An advanced DTMF-based menu mode (DIAL in TT position, software tone decoding) makes use of the 4x4 keypad matrix to dial certain numbers to play specific fortunes. The MEM button recalls programmed fortunes; the PROG button saves the last played fortune to a MEM slot; the RE DIAL button plays back the last played fortune; the MUTE button toggles sound output on and off.

Audio Routing: The OLH switch controls two independent CD4066BE switch channels, controlled via GPIO pins D12 and D13, direct amplified audio to either the earpiece (set to LO position) or the base speaker (set to HI position) based on receiver state, eliminating audible switching artifacts present in relay-based solutions.
Physical Integration: Internal wiring terminates at ISS3 and ISS4 ribbon connector pads per the established wire/pad legend. Final assembly targets a perfboard build sized for installation within the original telephone housing. The exterior shell will receive a decorative resin encapsulation with embedded fortune cookie slips as a final finishing step.

Sound Design: the power up sound was designed by myself. The audio samples of dial tone (number 5 crossbar/5XB), ringback sound (number 1 crossbar/1XB), busy signal, and vintage recordings of the late and instantly recognizable Jane Barbe from the 70s and 80s phone systems were found in various sound libraries and tone plants.

Current Status: Core subsystems (SD playback, hook switch detection, CD4066BE routing, OLH mode switching, DIAL switch mode position) confirmed functional on breadboard prototype. Deep sleep integration and perfboard migration are in progress.
