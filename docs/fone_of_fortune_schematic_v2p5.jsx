import { useState } from "react";

// ─────────────────────────────────────────────
// COLOR PALETTE — v1.3 style preserved
// ─────────────────────────────────────────────
const COLORS = {
  bg: "#0d0d0f",
  panel: "#141418",
  border: "#2a2a35",
  accent: "#f5c842",
  accentDim: "#a88a1a",
  green: "#4cffb0",
  greenDim: "#1a7a52",
  red: "#ff5c5c",
  redDim: "#7a1a1a",
  blue: "#5cb8ff",
  blueDim: "#1a4a7a",
  purple: "#c084fc",
  purpleDim: "#5a2a7a",
  orange: "#fb923c",
  orangeDim: "#7a3a1a",
  text: "#e8e8f0",
  textDim: "#888899",
  textFaint: "#444455",
  wire: "#f5c842",
  wireDim: "#5a4a10",
};

// ─────────────────────────────────────────────
// SCHEMATIC NODES
// ─────────────────────────────────────────────
const nodes = {
  battery:    { id: "battery",    label: "LiPoly Battery",       sub: "3.7V 600mAh — JST-PH2 connector",              x: 50,  y: 300, color: COLORS.green,  w: 140, h: 60 },
  feather:    { id: "feather",    label: "Feather M4 Express",   sub: "Adafruit — Brain",                              x: 320, y: 260, color: COLORS.accent, w: 180, h: 80 },
  microsd:    { id: "microsd",    label: "MicroSD Breakout+",    sub: "Adafruit — Level-Shifting / SPI",               x: 320, y: 100, color: COLORS.blue,   w: 180, h: 60 },
  pam:        { id: "pam",        label: "PAM8302A Amp",         sub: "Audio Amplifier",                               x: 600, y: 200, color: COLORS.orange, w: 150, h: 60 },
  cd4066:     { id: "cd4066",     label: "CD4066BE",             sub: "Quad Analog Switch — audio router",             x: 600, y: 380, color: COLORS.purple, w: 155, h: 60 },
  cap1:       { id: "cap1",       label: "0.1µF Mylar Cap #1",   sub: "100V — PAM8302A Vin decoupling — add to perfboard",  x: 600, y: 290, color: COLORS.orange, w: 155, h: 50 },
  cap2:       { id: "cap2",       label: "0.1µF Mylar Cap #2",   sub: "100V — CD4066BE VDD decoupling — confirmed ✓",        x: 600, y: 460, color: COLORS.purple, w: 155, h: 50 },
  earpiece:   { id: "earpiece",   label: "Handset Earpiece",     sub: "White + Green (~262Ω)",                         x: 840, y: 330, color: COLORS.green,  w: 160, h: 55 },
  basespk:    { id: "basespk",    label: "Base Speaker",         sub: "3W / 4Ω",                                       x: 840, y: 430, color: COLORS.green,  w: 160, h: 55 },
  hookswitch: { id: "hookswitch", label: "Hook Switch",          sub: "ISS 3 PCB pads",                                x: 50,  y: 160, color: COLORS.red,    w: 140, h: 55 },
  olh:        { id: "olh",        label: "OLH Switch",           sub: "OFF / LO / HI",                                 x: 50,  y: 430, color: COLORS.purple, w: 140, h: 55 },
  keypad:     { id: "keypad",     label: "Keypad ISS 4",         sub: "Matrix: 0–9 + MEM PROG REDIAL MUTE",            x: 50,  y: 540, color: COLORS.blue,   w: 140, h: 65 },
  dialswitch: { id: "dialswitch", label: "DIAL Switch",          sub: "DP=Basic/Shuffle · TT=Advanced/Menu ✓",  x: 50,  y: 630, color: COLORS.red,    w: 140, h: 55 },
  volpot:     { id: "volpot",     label: "VOLUME Switch",        sub: "ISS 4 / analog wiper → A2",                     x: 50,  y: 720, color: COLORS.orange, w: 140, h: 55 },
};

// ─────────────────────────────────────────────
// CONNECTIONS
// ─────────────────────────────────────────────
const connections = [
  { from: "battery",    to: "feather",    label: "3.7V JST-PH → Feather JST jack",        status: "planned" },
  { from: "feather",    to: "microsd",    label: "SPI (MOSI/MISO/SCK/CS=D9)",             status: "confirmed" },
  { from: "feather",    to: "pam",        label: "DAC audio out (A0)",                    status: "confirmed" },
  { from: "feather",    to: "cd4066",     label: "GPIO D12, D13 → control pins",          status: "confirmed" },
  { from: "pam",        to: "cd4066",     label: "Amplified audio → input",               status: "confirmed" },
  { from: "cd4066",     to: "earpiece",   label: "Channel A → earpiece audio",            status: "confirmed" },
  { from: "cd4066",     to: "basespk",    label: "Channel B → base speaker audio",        status: "confirmed" },
  { from: "cap1",       to: "pam",        label: "Vin to GND decoupling",                status: "planned" },
  { from: "cap2",       to: "cd4066",     label: "VDD pin 14 to GND decoupling",          status: "confirmed" },
  { from: "hookswitch", to: "feather",    label: "D5 + GND",                             status: "confirmed" },
  { from: "olh",        to: "feather",    label: "D10 (LO), D11 (HI), GND (common)",     status: "confirmed" },
  { from: "keypad",     to: "feather",    label: "Matrix GPIO rows/cols (deferred)",      status: "planned" },
  { from: "dialswitch", to: "feather",    label: "Pin2→GND, Pin1or3→D6 (pull-up)",       status: "confirmed" },
  { from: "volpot",     to: "feather",    label: "Wiper → A2 (locked)",                  status: "confirmed" },
];

// ─────────────────────────────────────────────
// NOTES — v1.3 originals preserved + new ones
// ─────────────────────────────────────────────
const notes = [
  { id: "n1",  text: "Hook switch: Sansei ML mechanism on ISS3. Contacts cleaned with isopropyl alcohol + printer paper — oxidation removed, shiny contacts confirmed. NOW WORKING: handset UP = continuity beep, handset DOWN = open circuit. Use LEFT pad set (vertically in line with beige lever visible through board cutout). Two wires: one pad → Feather D5, other pad → GND. Solder with 28AWG stranded wire when it arrives.", color: COLORS.red },
  { id: "n2",  text: "Handset wires: White+Green = earpiece (~262Ω). Black+Red = microphone (~1.76kΩ). Future use.", color: COLORS.green },
  { id: "n3",  text: "OLH Switch: OFF→Feather deep sleep (pin alarm wake on either LO or HI pin going LOW). D10=LO pin (ISS4 pad 3/letter A). D11=HI pin (ISS4 pad 1/letter C). Common (ISS4 pad 2/letter B) → GND. OFF = both D10 and D11 HIGH by internal pull-ups. LO = D10 LOW. HI = D11 LOW. Feather reads state on wake, commands CD4066 accordingly. Only 2 GPIO pins needed — OFF is inferred by elimination.", color: COLORS.purple },
  { id: "n4",  text: "Audio format: WAV files, 22050Hz, 16-bit mono. Named fortune_01.wav, fortune_02.wav etc. Files stored in /sd folder on 8GB FAT32 MicroSD card.", color: COLORS.blue },
  { id: "n5",  text: "CD4066BE Quad Analog Switch: Upgraded from DPDT relay. Silent solid-state audio routing — no click, no back-EMF, no transistor/resistor/flyback diode needed. Feather 3.3V GPIO drives control pins directly via D12 (Channel A) and D13 (Channel B). Channel A routes audio to handset earpiece (LO). Channel B routes to base speaker (HI).", color: COLORS.purple },
  { id: "n6",  text: "DIAL Switch (underside): Originally DP/TT (Dial Pulse / Touch Tone). Confirmed functional DPDT (Double Pole Double Throw) via continuity testing — both poles beep cleanly in both positions with zero ambiguity. Physical label on phone underside left in place. DP position = Basic/Shuffle Mode (receiver lift → random WAV after ~3sec delay). TT position = Advanced/Menu Mode (receiver lift → awaits keypad input). Wiring uses ONE pole only: Pin 2 (common, center) → GND. Pin 1 or Pin 3 (throw) → Feather D6 with internal pull-up. D6 LOW = DP/Basic. D6 HIGH (floating pulled up) = TT/Advanced. Second pole available for future use (e.g. LED indicator). 6 pins total in 2 rows of 3; pins 2 and 5 are the commons.", color: COLORS.red },
  { id: "n7",  text: "RETIRED COMPONENTS: DPDT relay (GS-SH-205T), 2N3904 transistor, 1kΩ base resistor, and 1N4148 flyback diode all replaced by single CD4066BE. These kit parts are available for future projects.", color: COLORS.textDim },
  { id: "n8",  text: "0.1µF 100V Mylar Caps (2× from RadioShack kit): Cap #1 across PAM8302A Vin and GND — placed on COMPONENT SIDE at A42 (Vin row) and A43 (GND row). ⚠ CRITICAL: never place this cap across the power rails — shorting +3.3V rail to GND rail through cap loads down all components and causes mysterious CD4066 switching failures. Cap #2 across CD4066BE pin 14 (VDD) and GND rail at row 52 col J — confirmed in place ✓.", color: COLORS.orange },
  { id: "n9",  text: "LiPoly Battery 3.7V 600mAh JST-PH2: Connects directly to Feather M4 JST-PH jack. Feather onboard regulator steps to 3.3V for logic. Onboard charger charges via USB automatically. Estimated runtime ~3hrs continuous active use — much longer with deep sleep between uses.", color: COLORS.green },
  { id: "n10", text: "MicroSD Card: 8GB card in MicroSD Breakout+. FAT32 formatted. CS pin = D9 (LOCKED). CircuitPython SD libraries do not support exFAT reliably. FAT32 on 8GB = ~3000+ minutes of WAV storage at 22050Hz 16-bit mono.", color: COLORS.blue },
  { id: "n11", text: "Breadboard: 1360-point full-size board with two binding posts — Va (red) and Vb (black). Va and Vb allow external power sources to be connected directly to the board's power rails via the posts. Use Va (red) for 3.3V rail and Vb (black) for GND rail during testing.", color: COLORS.textDim },
  { id: "n12", text: "SAFETY — Pull-up resistors on switch GPIO inputs: Hook switch (D5), DIAL switch (D6), OLH switch pins D10 and D11 must not float. Use Feather M4 internal pull-ups enabled in CircuitPython: digitalio.Pull.UP. No physical resistors needed if enabled in code.", color: COLORS.accent },
  { id: "n13", text: "SAFETY — Decoupling cap on PAM8302A: Place ONE 0.1µF mylar cap across PAM8302A Vin and GND pins as close to the chip as possible. Filters power supply noise that gets amplified as static in audio output. Static throughout playback proportional to volume is a symptom of missing this cap. Add to breadboard and confirm improvement before final perfboard build.", color: COLORS.orange },
  { id: "n14", text: "FUTURE IDEA — Ambient LED strip (oracle glow): Small red LED strip inside phone shell shining out through bottom vents or gaps. Active only when OLH switch is in LO or HI position (phone awake) — OFF/deep sleep = no glow. Gives fortune-teller / oracle aesthetic. Implementation: one GPIO pin + current-limiting resistor (~220Ω for standard red LED). Could use a NeoPixel strip for color control from code. OLH OFF state = Feather in deep sleep, so LED would need to be wired so it only gets power when Feather is awake — simplest approach is to drive it from a GPIO pin that goes LOW on sleep entry. GPIO pin budget impact: requires 1 additional pin (e.g. A5, currently reserved).", color: COLORS.red },
  { id: "n19", text: "FUTURE IDEA — Mode indicator LED (DIAL switch status): Small LED (or two) visible through the phone shell so the current DP/TT mode can be read without lifting the phone to inspect the underside switch. Options: (A) Single two-color LED (e.g. green=Basic/DP, amber=Advanced/TT) driven by one GPIO pin — color changes with mode. (B) Two discrete LEDs, one per mode, each on its own GPIO pin. (C) Hardware-only approach using DIAL switch Pole 2 (currently free) — no GPIO pin consumed, no code needed; wire Pole 2 directly to an LED + resistor so flipping the switch physically completes the circuit. Option C is elegant and uses zero firmware resources. All options require a small hole or translucent window in the shell for visibility.", color: COLORS.red },
  { id: "n20", text: "ISS2 FLEX PCB: Flexible printed circuit — fragile, irreplaceable, handle like a photograph negative. No sharp bends or creases. Contains: 4×4 keypad matrix contacts (conductive rubber dome membrane), keypad backlight LEDs (×2), and is the physical substrate connecting ISS4 slider switches to ISS3 via 17-trace ribbon cable. ISS2 plugs into ISS3 connector. Never solder directly to ISS2 ribbon traces — intercept signals at ISS3 connector pins instead.", color: COLORS.blue },
  { id: "n21", text: "KEYPAD BACKLIGHT LEDs: Two LEDs confirmed working — tested at 1.8V forward voltage in diode mode (healthy). Polarity confirmed: E2=anode(+) of LED1, D2=cathode(−) of LED1. F2=anode(+) of LED2, E3=cathode(−) of LED2. E trace = shared anode → 3.3V through 220Ω resistor. D and F traces = cathodes → Feather GPIO pins (drive LOW to illuminate). Signals intercepted at ISS3 ribbon connector pins. Oracle glow effect: LEDs on when phone awake (OLH LO or HI), off during deep sleep.", color: COLORS.accent },
  { id: "n22", text: "WIRING SOURCE MAP — where to solder each signal: (ISS3 pads) Hook switch → D5+GND. DIAL switch → D6+GND. (ISS3 ribbon connector pins) LED anode E → 3.3V+220Ω. LED1 cathode D → Feather GPIO. LED2 cathode F → Feather GPIO. Keypad matrix rows/cols → Feather GPIO (deferred). (ISS4 pads directly) OLH slider pads A/B/C → D11/GND/D10. Volume slider pads 1+4/2+3/5 → 3.3V/A2/GND. All ISS4 wires use 28AWG stranded hookup wire.", color: COLORS.green },
  { id: "n23", text: "AUDIO STATUS: MVP working ✓. WAV files: 22050Hz/16-bit/mono, cleaned with afconvert + SoX on Mac. Mac sidecar files (._filename.wav) automatically filtered in code via not f.startswith('._'). Fortune files: captain.wav, shopping_mall.wav, wapner.wav, what_to_do.wav + others on SD card. Random shuffle with no-repeat logic confirmed working. audiomixer tested but abandoned — SD card streaming causes distortion through mixer. Direct audioio.AudioOut + audiocore.WaveFile is the correct approach. PAM pot at MAX gain permanently — volume balance handled by SoX if needed (vol 0.1 for earpiece versions).", color: COLORS.blue },
  { id: "n15", text: "VOLUME Switch (ISS 4 slider): Total resistance 42kΩ. ISS4 pads 1+4 are shorted (Fixed End A) → 3.3V. Pads 2+3 are shorted (Wiper) → Feather A2 (LOCKED). Pad 5 (Fixed End B) → GND. CircuitPython reads analog value on A2 (0–65535) and normalizes to 0.0–1.0 for volume.", color: COLORS.orange },
  { id: "n16", text: "Keypad Matrix (DEFERRED): Signals exist only within ribbon's 17 traces — ISS4 solder pads fully accounted for by OLH and volume slider signals. Matrix mapping required only for Advanced/Menu mode (DIAL switch TT position). Standard 4×4 matrix needs 8 GPIO pins. Tentative assignments: rows D0,D1,D4,SCL/D22 — cols SDA/D21,A1,A3,A4.", color: COLORS.blue },
  { id: "n17", text: "ISS3 PCB: Structural AND electrical. Hook switch (Sansei ML) and DIAL switch are physically mounted on ISS3 and must remain there mechanically. Solder 28AWG wires directly to their ISS3 pads — do NOT cut or modify ISS3. ISS3 connector pins also used to intercept ISS2 ribbon signals (keypad matrix, LEDs) — solder to connector pins, never directly to ISS2 ribbon traces which are fragile and irreplaceable.", color: COLORS.textDim },
  { id: "n18", text: "CURRENT STATE + NEXT STEPS: MVP COMPLETE ✓ — SD card playback, random fortune shuffle, hook switch detection, CD4066 audio routing to both earpiece and base speaker all confirmed working on breadboard. PAM pot set to max gain permanently. SoX installed on Mac for WAV processing (vol 0.1 for earpiece versions if needed). WAITING FOR: 28AWG stranded hookup wire + better jumper wires (ordered). NEXT SESSION: (1) Solder hook switch pads on ISS3 → Feather D5 + GND. (2) Solder DIAL switch pads on ISS3 → Feather D6 + GND. (3) Solder OLH slider pads on ISS4 → Feather D10, D11, GND. (4) Solder volume slider pads on ISS4 → Feather A2, 3.3V, GND. (5) Solder LED signals from ISS3 connector pins → Feather GPIO + 220Ω resistors. (6) Test all controls in isolation before combining. FINAL BUILD: Perfboard replaces breadboard inside phone shell.", color: COLORS.accent },
];

// ─────────────────────────────────────────────
// PIN ASSIGNMENT DATA — from v1.4
// ─────────────────────────────────────────────
const PIN_DATA = {
  locked: [
    { pin: "A0",      assignment: "PAM8302A audio out (DAC)",    direction: "OUTPUT",        notes: "True DAC — use audioio, not audiopwmio" },
    { pin: "A2",      assignment: "VOLUME switch wiper",          direction: "INPUT analog",  notes: "42kΩ pot — 3.3V on fixed end A, GND on fixed end B" },
    { pin: "SCK",     assignment: "MicroSD SPI clock",            direction: "OUTPUT",        notes: "Hardware SPI" },
    { pin: "MOSI",    assignment: "MicroSD SPI data out",         direction: "OUTPUT",        notes: "Hardware SPI" },
    { pin: "MISO",    assignment: "MicroSD SPI data in",          direction: "INPUT",         notes: "Hardware SPI" },
    { pin: "D9",      assignment: "MicroSD chip select (CS)",     direction: "OUTPUT",        notes: "adafruit_sdcard library" },
    { pin: "D5",      assignment: "Hook switch",                  direction: "INPUT digital", notes: "Common to GND, pull-up enabled in CircuitPython" },
    { pin: "D6",      assignment: "DIAL switch (DP/TT)",          direction: "INPUT digital", notes: "Common to GND, pull-up; LOW = TT/Advanced mode" },
    { pin: "D10",     assignment: "OLH switch — LO pin",          direction: "INPUT digital", notes: "ISS4 pad 3 / letter A. LOW = LO position active" },
    { pin: "D11",     assignment: "OLH switch — HI pin",          direction: "INPUT digital", notes: "ISS4 pad 1 / letter C. LOW = HI active; both HIGH = OFF" },
    { pin: "D12",     assignment: "CD4066 control — Channel A",   direction: "OUTPUT",        notes: "Audio routing — earpiece / LO path" },
    { pin: "D13",     assignment: "CD4066 control — Channel B",   direction: "OUTPUT",        notes: "Audio routing — base speaker / HI path" },
  ],
  tentative: [
    { pin: "D0",      assignment: "Keypad row 1",                 direction: "OUTPUT",        notes: "Matrix scan — Advanced/Menu mode only. DEFERRED." },
    { pin: "D1",      assignment: "Keypad row 2",                 direction: "OUTPUT",        notes: "Matrix scan — Advanced/Menu mode only. DEFERRED." },
    { pin: "D4",      assignment: "Keypad row 3",                 direction: "OUTPUT",        notes: "Matrix scan — Advanced/Menu mode only. DEFERRED." },
    { pin: "SCL/D22", assignment: "Keypad row 4",                 direction: "OUTPUT",        notes: "Matrix scan — Advanced/Menu mode only. DEFERRED." },
    { pin: "SDA/D21", assignment: "Keypad col 1",                 direction: "INPUT",         notes: "Matrix scan — Advanced/Menu mode only. DEFERRED." },
    { pin: "A1",      assignment: "Keypad col 2",                 direction: "INPUT",         notes: "Matrix scan — Advanced/Menu mode only. DEFERRED." },
    { pin: "A3",      assignment: "Keypad col 3",                 direction: "INPUT",         notes: "Matrix scan — Advanced/Menu mode only. DEFERRED." },
    { pin: "A4",      assignment: "Keypad col 4 (if 4×4 matrix)", direction: "INPUT",         notes: "Pending matrix topology confirmation. DEFERRED." },
    { pin: "A5",      assignment: "Keypad LED 1 cathode (D trace)", direction: "OUTPUT",      notes: "Drive LOW to illuminate LED1. 220Ω resistor on shared anode (E trace → 3.3V). Oracle glow effect." },
    { pin: "TBD",     assignment: "Keypad LED 2 cathode (F trace)", direction: "OUTPUT",      notes: "Drive LOW to illuminate LED2. Shares 220Ω anode resistor with LED1." },
  ],
  available: [
    { pin: "A5",      assignment: "RESERVED — unassigned",        direction: "—",             notes: "Available for future use" },
  ],
  power: [
    { pin: "3.3V",    assignment: "Power rail out",               direction: "POWER",         notes: "Vol pot fixed end A; MicroSD VCC; PAM8302A VCC" },
    { pin: "GND",     assignment: "Ground (×2)",                  direction: "POWER",         notes: "Vol pot fixed end B; OLH common; DIAL common; Hook common" },
    { pin: "VBAT",    assignment: "Battery voltage out",          direction: "POWER",         notes: "3.7V LiPoly via JST-PH2" },
    { pin: "VBUS",    assignment: "5V when USB connected",        direction: "POWER",         notes: "USB power monitoring" },
    { pin: "NEOPIXEL",assignment: "Onboard status LED",           direction: "INTERNAL",      notes: "Reserved for future status indication" },
  ],
};

const OLH_LOGIC = [
  { position: "OFF", d10: "HIGH", d11: "HIGH", behavior: "Deep sleep — wake on D10 or D11 going LOW" },
  { position: "LO",  d10: "LOW",  d11: "HIGH", behavior: "Basic / Shuffle mode" },
  { position: "HI",  d10: "HIGH", d11: "LOW",  behavior: "Advanced / Menu mode (future)" },
];

const VOL_MAP = [
  { pads: "1 + 4", role: "Fixed end A (shorted by trace)", connects: "3.3V" },
  { pads: "2 + 3", role: "Wiper (shorted by trace)",       connects: "Feather A2" },
  { pads: "5",     role: "Fixed end B",                    connects: "GND" },
];

const DIAL_SWITCH_MAP = [
  { pin: "Pin 2 (common)", role: "Common — center pin", connects: "GND", notes: "Confirmed DPDT center pin via continuity" },
  { pin: "Pin 1 or 3 (throw)", role: "Throw — one output", connects: "Feather D6", notes: "Internal pull-up enabled in CircuitPython" },
  { pin: "Pins 4–6 (2nd pole)", role: "Second pole — unused", connects: "Not connected", notes: "Available for future use (e.g. LED indicator)" },
];

const DIAL_LOGIC = [
  { position: "DP", d6: "LOW", behavior: "Basic / Shuffle Mode — receiver lift plays random WAV after ~3sec delay" },
  { position: "TT", d6: "HIGH", behavior: "Advanced / Menu Mode — receiver lift awaits keypad input" },
];

const MICROSD_PINS = [
  { breakout: "VCC/5V",    connects: "3.3V rail",    feather: "3.3V" },
  { breakout: "GND",       connects: "Ground rail",   feather: "GND" },
  { breakout: "CLK",       connects: "SPI clock",     feather: "SCK" },
  { breakout: "DO (MISO)", connects: "SPI data in",   feather: "MISO" },
  { breakout: "DI (MOSI)", connects: "SPI data out",  feather: "MOSI" },
  { breakout: "CS",        connects: "Chip select",   feather: "D9" },
  { breakout: "CD",        connects: "Card detect*",  feather: "not connected" },
];

const PAM_PINS = [
  { pam: "Vin",  connects: "3.3V rail",               notes: "Power in (labeled Vin on board)" },
  { pam: "GND",  connects: "Ground rail",              notes: "Ground" },
  { pam: "A+",   connects: "Feather A0",               notes: "Audio signal in from DAC" },
  { pam: "A-",   connects: "Ground rail",              notes: "Audio signal ground" },
  { pam: "OUT+", connects: "CD4066 pin 1 (SwA-in)",    notes: "Amplified audio out +" },
  { pam: "OUT-", connects: "CD4066 pin 4 (SwB-in)",    notes: "Amplified audio out -" },
  { pam: "SD",   connects: "3.3V rail",                notes: "Amp enable — tie HIGH" },
];

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────
function getCenter(node) {
  return { x: node.x + node.w / 2, y: node.y + node.h / 2 };
}

function Arrow({ from, to, label, status }) {
  const f = getCenter(nodes[from]);
  const t = getCenter(nodes[to]);
  const confirmed = status === "confirmed";
  const strokeColor = confirmed ? COLORS.green : COLORS.accentDim;
  const textColor   = confirmed ? COLORS.green : COLORS.wireDim;
  const mx = (f.x + t.x) / 2;
  const my = (f.y + t.y) / 2;
  const dx = t.x - f.x; const dy = t.y - f.y;
  const len = Math.sqrt(dx * dx + dy * dy);
  const nx = -dy / len * 18; const ny = dx / len * 18;
  const path = `M ${f.x} ${f.y} Q ${mx + nx} ${my + ny} ${t.x} ${t.y}`;
  return (
    <g>
      <path d={path} fill="none" stroke={strokeColor} strokeWidth={confirmed ? 2 : 1.5}
        strokeDasharray={confirmed ? "none" : "5,4"} markerEnd="url(#arrow)" opacity={confirmed ? 1 : 0.7} />
      <text x={mx + nx * 1.2} y={my + ny * 1.2} fill={textColor} fontSize="9" textAnchor="middle"
        dominantBaseline="middle" style={{ fontFamily: "monospace", pointerEvents: "none" }}>
        {label}
      </text>
    </g>
  );
}

function ComponentNode({ node, selected, onClick }) {
  const isSelected = selected === node.id;
  return (
    <g onClick={() => onClick(node.id)} style={{ cursor: "pointer" }}>
      <rect x={node.x} y={node.y} width={node.w} height={node.h} rx={6}
        fill={COLORS.panel} stroke={isSelected ? node.color : COLORS.border}
        strokeWidth={isSelected ? 2.5 : 1.5} filter={isSelected ? "url(#glow)" : "none"} />
      <rect x={node.x} y={node.y} width={6} height={node.h} rx={3} fill={node.color} opacity={0.85} />
      <text x={node.x + 16} y={node.y + node.h / 2 - 7} fill={COLORS.text} fontSize="11"
        fontWeight="700" style={{ fontFamily: "monospace" }}>{node.label}</text>
      <text x={node.x + 16} y={node.y + node.h / 2 + 8} fill={COLORS.textDim} fontSize="9"
        style={{ fontFamily: "monospace" }}>{node.sub}</text>
    </g>
  );
}

// Pin table used in PIN ASSIGNMENTS tab
function PinTable({ pins, accentColor }) {
  return (
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11, fontFamily: "monospace" }}>
      <thead>
        <tr style={{ borderBottom: `1px solid ${accentColor}33` }}>
          {["PIN", "ASSIGNMENT", "DIRECTION", "NOTES"].map(h => (
            <th key={h} style={{ padding: "5px 10px", textAlign: "left", color: accentColor,
              opacity: 0.7, fontWeight: 700, letterSpacing: "0.08em", fontSize: 10 }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {pins.map((row, i) => (
          <tr key={i} style={{ borderBottom: `1px solid ${COLORS.border}44`,
            background: i % 2 === 0 ? "#ffffff05" : "transparent" }}>
            <td style={{ padding: "6px 10px", color: accentColor, fontWeight: 700, whiteSpace: "nowrap" }}>{row.pin}</td>
            <td style={{ padding: "6px 10px", color: COLORS.text }}>{row.assignment}</td>
            <td style={{ padding: "6px 10px", color: COLORS.textDim, whiteSpace: "nowrap" }}>{row.direction}</td>
            <td style={{ padding: "6px 10px", color: COLORS.textFaint, fontSize: 10 }}>{row.notes}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function SubTable({ rows, cols, accentColor }) {
  return (
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11, fontFamily: "monospace" }}>
      <thead>
        <tr style={{ borderBottom: `1px solid ${accentColor}33` }}>
          {cols.map(c => (
            <th key={c} style={{ padding: "5px 10px", textAlign: "left", color: accentColor,
              opacity: 0.7, fontWeight: 700, letterSpacing: "0.08em", fontSize: 10 }}>{c}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i} style={{ borderBottom: `1px solid ${COLORS.border}44`,
            background: i % 2 === 0 ? "#ffffff05" : "transparent" }}>
            {Object.values(row).map((val, j) => (
              <td key={j} style={{ padding: "6px 10px",
                color: j === 0 ? accentColor : j === Object.values(row).length - 1 ? COLORS.textDim : COLORS.text,
                fontWeight: j === 0 ? 700 : 400, fontSize: j === Object.values(row).length - 1 ? 10 : 11 }}>
                {val}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────
export default function FoneSchematic() {
  const [selected, setSelected]   = useState(null);
  const [showNotes, setShowNotes] = useState(true);
  const [activeTab, setActiveTab] = useState("schematic");

  const handleClick = (id) => setSelected(selected === id ? null : id);
  const relatedConnections = selected
    ? connections.filter(c => c.from === selected || c.to === selected)
    : [];

  const tabs = [
    { id: "schematic",  label: "📐 SCHEMATIC" },
    { id: "pins",       label: "📌 PIN ASSIGNMENTS" },
    { id: "details",    label: "🔍 WIRING DETAILS" },
    { id: "breadboard", label: "🧩 BREADBOARD LAYOUT" },
  ];

  return (
    <div style={{ background: COLORS.bg, minHeight: "100vh", fontFamily: "monospace", color: COLORS.text }}>

      {/* ── HEADER ── */}
      <div style={{ borderBottom: `1px solid ${COLORS.border}`, padding: "14px 24px",
        display: "flex", justifyContent: "space-between", alignItems: "center", background: COLORS.panel }}>
        <div>
          <div style={{ fontSize: "18px", fontWeight: "900", letterSpacing: "0.08em", color: COLORS.accent }}>
            📞 FONE OF FORTUNE
          </div>
          <div style={{ fontSize: "10px", color: COLORS.textDim, marginTop: "2px", letterSpacing: "0.12em" }}>
            LIVING SCHEMATIC — v2.5 — Updated 3/16/26
          </div>
        </div>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <div style={{ display: "flex", gap: "16px", fontSize: "10px" }}>
            <span style={{ color: COLORS.green }}>● CONFIRMED</span>
            <span style={{ color: COLORS.accentDim }}>- - PLANNED</span>
          </div>
          {activeTab === "schematic" && (
            <button onClick={() => setShowNotes(!showNotes)} style={{
              background: showNotes ? COLORS.accent : COLORS.border,
              color: showNotes ? COLORS.bg : COLORS.textDim,
              border: "none", borderRadius: "4px", padding: "6px 12px",
              fontSize: "10px", cursor: "pointer", fontFamily: "monospace",
              fontWeight: "700", letterSpacing: "0.08em",
            }}>
              {showNotes ? "HIDE NOTES" : "SHOW NOTES"}
            </button>
          )}
        </div>
      </div>

      {/* ── TABS ── */}
      <div style={{ display: "flex", borderBottom: `1px solid ${COLORS.border}`, background: COLORS.panel }}>
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
            padding: "10px 20px", background: "none", border: "none",
            borderBottom: activeTab === tab.id ? `2px solid ${COLORS.accent}` : "2px solid transparent",
            color: activeTab === tab.id ? COLORS.accent : COLORS.textDim,
            fontFamily: "monospace", fontSize: "11px", fontWeight: "700",
            letterSpacing: "0.08em", cursor: "pointer", transition: "color 0.15s",
          }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════
          TAB: SCHEMATIC (v1.3 layout preserved)
      ══════════════════════════════════════ */}
      {activeTab === "schematic" && (
        <div style={{ display: "flex" }}>

          {/* SVG canvas */}
          <div style={{ flex: 1, overflowX: "auto" }}>
            <svg width="1060" height="840" style={{ display: "block", padding: "20px" }}>
              <defs>
                <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                  <path d="M0,0 L0,6 L8,3 z" fill={COLORS.accentDim} />
                </marker>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                  <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
              </defs>

              {/* Section labels */}
              <text x="30"  y="50" fill={COLORS.textFaint} fontSize="9" letterSpacing="0.15em">INPUTS / SWITCHES</text>
              <text x="300" y="50" fill={COLORS.textFaint} fontSize="9" letterSpacing="0.15em">BRAIN</text>
              <text x="580" y="50" fill={COLORS.textFaint} fontSize="9" letterSpacing="0.15em">AUDIO CHAIN</text>
              <text x="820" y="50" fill={COLORS.textFaint} fontSize="9" letterSpacing="0.15em">OUTPUTS</text>

              {/* Section dividers */}
              {[290, 575, 815].map(x => (
                <line key={x} x1={x} y1={40} x2={x} y2={810}
                  stroke={COLORS.border} strokeWidth={1} strokeDasharray="3,6" />
              ))}

              {/* Connections */}
              {connections.map((c, i) => <Arrow key={i} {...c} />)}

              {/* Nodes */}
              {Object.values(nodes).map(node => (
                <ComponentNode key={node.id} node={node} selected={selected} onClick={handleClick} />
              ))}

              {/* GND label */}
              <text x="200" y="380" fill={COLORS.textFaint} fontSize="9">GND bus (common ground)</text>
              <line x1="195" y1="384" x2="310" y2="384"
                stroke={COLORS.textFaint} strokeWidth={1} strokeDasharray="2,4" />
            </svg>
          </div>

          {/* Side panel */}
          <div style={{ width: "300px", borderLeft: `1px solid ${COLORS.border}`,
            display: "flex", flexDirection: "column", maxHeight: "calc(100vh - 105px)", overflowY: "auto" }}>

            {selected ? (
              <div style={{ padding: "16px", borderBottom: `1px solid ${COLORS.border}`, background: "#18181f" }}>
                <div style={{ fontSize: "11px", fontWeight: "900", color: nodes[selected]?.color,
                  letterSpacing: "0.1em", marginBottom: "4px" }}>{nodes[selected]?.label}</div>
                <div style={{ fontSize: "10px", color: COLORS.textDim, marginBottom: "12px" }}>{nodes[selected]?.sub}</div>
                <div style={{ fontSize: "10px", color: COLORS.textFaint, marginBottom: "6px", letterSpacing: "0.1em" }}>CONNECTIONS:</div>
                {relatedConnections.map((c, i) => (
                  <div key={i} style={{ fontSize: "9px",
                    color: c.status === "confirmed" ? COLORS.green : COLORS.textDim,
                    marginBottom: "4px", paddingLeft: "8px",
                    borderLeft: `2px solid ${c.status === "confirmed" ? COLORS.green : COLORS.border}` }}>
                    {c.from === selected ? `→ ${nodes[c.to]?.label}` : `← ${nodes[c.from]?.label}`}
                    <span style={{ color: COLORS.textFaint, marginLeft: "6px" }}>{c.label}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: "16px", borderBottom: `1px solid ${COLORS.border}` }}>
                <div style={{ fontSize: "10px", color: COLORS.textFaint, letterSpacing: "0.1em" }}>
                  CLICK ANY COMPONENT TO INSPECT ITS CONNECTIONS
                </div>
              </div>
            )}

            {/* Notes */}
            {showNotes && (
              <div style={{ padding: "12px" }}>
                <div style={{ fontSize: "10px", color: COLORS.textFaint, letterSpacing: "0.12em", marginBottom: "10px" }}>
                  PROJECT NOTES & DECISIONS:
                </div>
                {notes.map(note => (
                  <div key={note.id} style={{ background: COLORS.panel, border: `1px solid ${COLORS.border}`,
                    borderLeft: `3px solid ${note.color}`, borderRadius: "4px", padding: "10px",
                    marginBottom: "8px", fontSize: "9.5px", color: COLORS.textDim, lineHeight: "1.5" }}>
                    {note.text}
                  </div>
                ))}
              </div>
            )}

            {/* Component inventory */}
            <div style={{ padding: "12px", borderTop: `1px solid ${COLORS.border}` }}>
              <div style={{ fontSize: "10px", color: COLORS.textFaint, letterSpacing: "0.12em", marginBottom: "10px" }}>
                COMPONENT STATUS:
              </div>
              {[
                { name: "Feather M4 Express",              status: "owned" },
                { name: "AT&T 1000 Phone",                 status: "owned" },
                { name: "PAM8302A Amp",                    status: "owned" },
                { name: "PAM8302A — headers soldered ✓",   status: "owned" },
                { name: "PAM8302A — audio terminal (±) needs resoldering (upside down — flux pen pending)", status: "warning" },
                { name: "3W / 4Ω Speaker",                 status: "owned" },
                { name: "MicroSD Breakout+ — headers soldered ✓", status: "owned" },
                { name: "8GB MicroSD (FAT32 ✓)",           status: "owned" },
                { name: "WAV files on SD card",            status: "needed" },
                { name: "1360-pt Breadboard (Va/Vb rails)", status: "owned" },
                { name: "Jumper wires (full set)",         status: "owned" },
                { name: "Volume Potentiometer (ISS 4)",    status: "owned" },
                { name: "RadioShack Parts Kit",            status: "owned" },
                { name: "LiPoly 3.7V 600mAh JST-PH2",     status: "owned" },
                { name: "CD4066BE ×2 (DIP-14)",            status: "owned" },
                { name: "0.1µF 100V Mylar Cap ×2 (kit)",  status: "owned" },
                { name: "Helping hands w/ magnifying glass", status: "owned" },
                { name: "PCB vice/clamp + silicone mat",     status: "owned" },
                { name: "Magnifying visor (4 lens sets, 2 chambers)", status: "owned" },
                { name: "Fume extractor fan",                status: "arriving" },
                { name: "28-30 AWG hookup wire",             status: "needed" },
                { name: "Flux pen (for PAM8302 rework)",     status: "needed" },
                { name: "DPDT Relay — retired to kit",     status: "owned" },
                { name: "2N3904 Transistor — retired",     status: "owned" },
                { name: "1N4148 Diode — retired",          status: "owned" },
                { name: "1kΩ Resistor — retired",          status: "owned" },
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between",
                  fontSize: "9px", marginBottom: "5px",
                  color: item.status === "owned" ? COLORS.text : item.status === "warning" ? COLORS.accent : item.status === "arriving" ? COLORS.blue : COLORS.red }}>
                  <span>{item.name}</span>
                  <span style={{ color: item.status === "owned" ? COLORS.green : item.status === "warning" ? COLORS.accent : item.status === "arriving" ? COLORS.blue : COLORS.red, fontWeight: "700" }}>
                    {item.status === "owned" ? "✓" : item.status === "warning" ? "REWORK" : item.status === "arriving" ? "ARRIVING" : "NEEDED"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════
          TAB: PIN ASSIGNMENTS (from v1.4)
      ══════════════════════════════════════ */}
      {activeTab === "pins" && (
        <div style={{ padding: 20, maxWidth: 1000 }}>

          {[
            { title: "LOCKED — Confirmed Pin Assignments", data: PIN_DATA.locked,    color: COLORS.green  },
            { title: "TENTATIVE — Keypad Matrix (Deferred — Advanced/Menu mode only)", data: PIN_DATA.tentative, color: COLORS.accent },
            { title: "AVAILABLE", data: PIN_DATA.available, color: COLORS.blue   },
            { title: "POWER & INTERNAL", data: PIN_DATA.power, color: COLORS.purple },
          ].map(({ title, data, color }) => (
            <div key={title} style={{ marginBottom: 24, border: `1px solid ${color}33`,
              borderRadius: 6, overflow: "hidden" }}>
              <div style={{ padding: "9px 14px", background: `${color}11`,
                borderBottom: `1px solid ${color}33`, display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: color, flexShrink: 0 }} />
                <span style={{ color, fontWeight: 700, fontSize: 11, letterSpacing: "0.06em" }}>{title}</span>
              </div>
              <PinTable pins={data} accentColor={color} />
            </div>
          ))}

          <div style={{ fontSize: 10, color: COLORS.textFaint, marginTop: 8, letterSpacing: "0.06em" }}>
            Feather M4 Express · CircuitPython 10.1.3 · A5 reserved · Total GPIO used (locked): 12 pins
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════
          TAB: WIRING DETAILS (from v1.4)
      ══════════════════════════════════════ */}
      {activeTab === "details" && (
        <div style={{ padding: 20, maxWidth: 1000 }}>

          {/* OLH Switch */}
          <div style={{ marginBottom: 24, border: `1px solid ${COLORS.purple}33`, borderRadius: 6, overflow: "hidden" }}>
            <div style={{ padding: "9px 14px", background: `${COLORS.purple}11`, borderBottom: `1px solid ${COLORS.purple}33` }}>
              <span style={{ color: COLORS.purple, fontWeight: 700, fontSize: 11, letterSpacing: "0.06em" }}>
                OLH SWITCH — ISS4 PAD MAP & LOGIC
              </span>
            </div>
            <div style={{ padding: "10px 0 4px" }}>
              <div style={{ padding: "0 14px 8px", fontSize: 10, color: COLORS.textFaint }}>PAD MAP:</div>
              <SubTable accentColor={COLORS.purple}
                cols={["ISS4 PAD", "LETTER", "SIGNAL", "FEATHER PIN"]}
                rows={[
                  { pad: "Pad 1", letter: "C", signal: "HI output",  feather: "D11" },
                  { pad: "Pad 2", letter: "B", signal: "Common",     feather: "GND" },
                  { pad: "Pad 3", letter: "A", signal: "LO output",  feather: "D10" },
                  { pad: "Pad 4", letter: "—", signal: "OFF (open)", feather: "—" },
                ]}
              />
              <div style={{ padding: "12px 14px 8px", fontSize: 10, color: COLORS.textFaint }}>LOGIC TABLE:</div>
              <SubTable accentColor={COLORS.purple}
                cols={["POSITION", "D10 (LO pin)", "D11 (HI pin)", "BEHAVIOR"]}
                rows={OLH_LOGIC.map(r => ({ position: r.position, d10: r.d10, d11: r.d11, behavior: r.behavior }))}
              />
              <div style={{ padding: "8px 14px", fontSize: 10, color: COLORS.textFaint }}>
                Common wire (pad 2 / letter B) → Feather GND. Pull-up enabled in CircuitPython on D10 and D11.
              </div>
            </div>
          </div>

          {/* Volume Slider */}
          <div style={{ marginBottom: 24, border: `1px solid ${COLORS.orange}33`, borderRadius: 6, overflow: "hidden" }}>
            <div style={{ padding: "9px 14px", background: `${COLORS.orange}11`, borderBottom: `1px solid ${COLORS.orange}33` }}>
              <span style={{ color: COLORS.orange, fontWeight: 700, fontSize: 11, letterSpacing: "0.06em" }}>
                VOLUME SWITCH — ISS4 PAD MAP
              </span>
            </div>
            <SubTable accentColor={COLORS.orange}
              cols={["ISS4 PADS", "ROLE", "CONNECTS TO"]}
              rows={VOL_MAP.map(r => ({ pads: r.pads, role: r.role, connects: r.connects }))}
            />
            <div style={{ padding: "8px 14px", fontSize: 10, color: COLORS.textFaint }}>
              Total pot resistance: 42kΩ. Pads 1+4 shorted by PCB trace. Pads 2+3 shorted by PCB trace.
              Feather reads 0–65535 on A2; normalize to 0.0–1.0 for volume control in code.
            </div>
          </div>

          {/* DIAL Switch */}
          <div style={{ marginBottom: 24, border: `1px solid ${COLORS.red}33`, borderRadius: 6, overflow: "hidden" }}>
            <div style={{ padding: "9px 14px", background: `${COLORS.red}11`, borderBottom: `1px solid ${COLORS.red}33` }}>
              <span style={{ color: COLORS.red, fontWeight: 700, fontSize: 11, letterSpacing: "0.06em" }}>
                DIAL SWITCH — DPDT PIN MAP & LOGIC ✓ CONTINUITY CONFIRMED
              </span>
            </div>
            <div style={{ padding: "10px 0 4px" }}>
              <div style={{ padding: "0 14px 8px", fontSize: 10, color: COLORS.textFaint }}>PIN MAP (6-pin DPDT, 2 rows of 3):</div>
              <SubTable accentColor={COLORS.red}
                cols={["SWITCH PIN", "ROLE", "CONNECTS TO", "NOTES"]}
                rows={DIAL_SWITCH_MAP.map(r => ({ pin: r.pin, role: r.role, connects: r.connects, notes: r.notes }))}
              />
              <div style={{ padding: "12px 14px 8px", fontSize: 10, color: COLORS.textFaint }}>LOGIC TABLE:</div>
              <SubTable accentColor={COLORS.red}
                cols={["POSITION", "D6 STATE", "BEHAVIOR"]}
                rows={DIAL_LOGIC.map(r => ({ position: r.position, d6: r.d6, behavior: r.behavior }))}
              />
              <div style={{ padding: "8px 14px", fontSize: 10, color: COLORS.textFaint }}>
                Physical label on phone underside (DP/TT) left in place — serves as user-facing mode indicator.
                Only one pole wired; second pole available for future use.
                Pull-up enabled in CircuitPython: digitalio.Pull.UP on D6.
              </div>
            </div>
          </div>

          {/* MicroSD */}
          <div style={{ marginBottom: 24, border: `1px solid ${COLORS.blue}33`, borderRadius: 6, overflow: "hidden" }}>
            <div style={{ padding: "9px 14px", background: `${COLORS.blue}11`, borderBottom: `1px solid ${COLORS.blue}33` }}>
              <span style={{ color: COLORS.blue, fontWeight: 700, fontSize: 11, letterSpacing: "0.06em" }}>
                MICROSD BREAKOUT BOARD+ — PIN ASSIGNMENTS
              </span>
            </div>
            <SubTable accentColor={COLORS.blue}
              cols={["BREAKOUT PIN", "CONNECTS TO", "FEATHER PIN"]}
              rows={MICROSD_PINS.map(r => ({ breakout: r.breakout, connects: r.connects, feather: r.feather }))}
            />
            <div style={{ padding: "8px 14px", fontSize: 10, color: COLORS.textFaint }}>
              8GB FAT32. Audio files in /sd as 22.05kHz / 16-bit / mono .wav. CD pin not connected.
            </div>
          </div>

          {/* PAM8302A */}
          <div style={{ marginBottom: 24, border: `1px solid ${COLORS.orange}33`, borderRadius: 6, overflow: "hidden" }}>
            <div style={{ padding: "9px 14px", background: `${COLORS.orange}11`, borderBottom: `1px solid ${COLORS.orange}33` }}>
              <span style={{ color: COLORS.orange, fontWeight: 700, fontSize: 11, letterSpacing: "0.06em" }}>
                PAM8302A AMPLIFIER — PIN ASSIGNMENTS
              </span>
            </div>
            <SubTable accentColor={COLORS.orange}
              cols={["PAM8302A PIN", "CONNECTS TO", "NOTES"]}
              rows={PAM_PINS.map(r => ({ pam: r.pam, connects: r.connects, notes: r.notes }))}
            />
            <div style={{ padding: "8px 14px", fontSize: 10, color: COLORS.textFaint }}>
              Audio path: Feather A0 (DAC) → PAM8302A → CD4066BE (D12/D13 routing) → earpiece or base speaker.
            </div>
          </div>

        </div>
      )}


      {/* ══════════════════════════════════════
          TAB: BREADBOARD LAYOUT
      ══════════════════════════════════════ */}
      {activeTab === "breadboard" && (() => {

        // ─────────────────────────────────────────────
        // JAMECO VALUEPRO 1360 — CONFIRMED GEOMETRY
        // Full board left→right:
        //  [row#] [a b c d e] [gap] [f g h i j]
        //    [BLUE stripe] [GND hole col] [gap] [PWR hole col] [RED stripe]
        //    [a b c d e] [gap] [f g h i j] [row#]
        //
        // Va (red post) → red stripe (power)
        // Vb (black post) → blue stripe (GND)
        // The two hole columns are BETWEEN the two stripes,
        // flanked: blue stripe | GND holes | gap | PWR holes | red stripe
        // ─────────────────────────────────────────────

        const ROW_H    = 11;
        const NUM_ROWS = 63;
        const TOP_PAD  = 36;
        const COL_W    = 13;
        const CTR_GAP  = 9;   // gap between col e and col f

        // X layout — left half only (what we're populating)
        const ROW_LABEL_X  = 18;
        const COL_A_X      = 30;  // col 'a' center

        // Right edge of col j:
        const COL_J_X = COL_A_X + 9 * COL_W + CTR_GAP;

        // Center rail section (between left and right halves):
        const BLUE_STRIPE_X  = COL_J_X + 20;   // blue stripe LEFT edge
        const STRIPE_W       = 7;
        const STRIPE_GAP     = 3;               // gap between stripe edge and hole col
        const GND_HOLE_X     = BLUE_STRIPE_X + STRIPE_W + STRIPE_GAP;  // GND hole col center
        const INTER_GAP      = 10;              // gap between GND holes and PWR holes
        const PWR_HOLE_X     = GND_HOLE_X + INTER_GAP;
        const RED_STRIPE_X   = PWR_HOLE_X + STRIPE_GAP + STRIPE_W;     // red stripe LEFT edge

        // Right half starts after red stripe (shown grayed out)
        const RIGHT_HALF_X   = RED_STRIPE_X + STRIPE_W + 6;
        const BB_W = RIGHT_HALF_X + 140;
        const BB_H = TOP_PAD + NUM_ROWS * ROW_H + 24;

        function rowY(r) { return TOP_PAD + (r - 1) * ROW_H; }
        function colX(c) {
          const idx = "abcdefghij".indexOf(c);
          return COL_A_X + idx * COL_W + (idx >= 5 ? CTR_GAP : 0);
        }

        const WC = {
          pwr:   "#ff4040",
          gnd:   "#4488ff",
          spi:   "#f5c842",
          audio: "#fb923c",
          gpio:  "#4cffb0",
          nc:    "#444455",
        };

        // ── Feather M4 — left pins col a, right pins col g, rows 2–17 ──
        // USB connector hangs above row 1 — plug in from top edge
        const FR = 2;
        const featherL = [
          {n:"RST", a:false},{n:"3.3V",a:true,wc:WC.pwr},{n:"AREF",a:false},
          {n:"GND", a:true,wc:WC.gnd},{n:"A0",a:true,wc:WC.audio},{n:"A1",a:false},
          {n:"A2",  a:false},{n:"A3",a:false},{n:"A4",a:false},{n:"A5",a:false},
          {n:"SCK", a:true,wc:WC.spi},{n:"MOSI",a:true,wc:WC.spi},{n:"MISO",a:true,wc:WC.spi},
          {n:"D0",  a:false},{n:"D1",a:false},{n:"D4",a:false},
        ];
        const featherR = [
          {n:"VBAT",a:false},{n:"EN",a:false},{n:"VBUS",a:false},
          {n:"GND", a:true,wc:WC.gnd},{n:"D13",a:false},{n:"D12",a:false},
          {n:"D11", a:false},{n:"D10",a:false},{n:"D9",a:true,wc:WC.gpio},
          {n:"D6",  a:false},{n:"D5",a:false},{n:"SCL",a:false},
          {n:"SDA", a:false},{n:"D4",a:false},{n:"D1",a:false},{n:"D0",a:false},
        ];

        // ── MicroSD — col a, rows 20–27 (8 pins) ──
        // Just below Feather — short SPI jumpers run straight down cols b/c/d
        // Confirmed pin order top→bottom (cantilevered left off board edge, pins in col a):
        // 5V(nc), 3V, GND, CLK, DO, DI, CS, CD(nc)
        const SDR = 20;
        const sdPins = [
          {n:"5V(nc)", c:WC.nc},    {n:"3V",    c:WC.pwr},
          {n:"GND",    c:WC.gnd},   {n:"CLK",   c:WC.spi},
          {n:"DO",     c:WC.spi},   {n:"DI",    c:WC.spi},
          {n:"CS",     c:WC.gpio},  {n:"CD(nc)",c:WC.nc},
        ];

        // ── PAM8302A — col a, rows 30–35 ──
        // Below MicroSD — A+ jumper runs short distance up col b to Feather A0
        // Confirmed pin order: A+, A−, SD, VIN, GND, OUT±
        const PR = 30;
        const pamPins = [
          {n:"A+",   c:WC.audio},{n:"A-",   c:WC.gnd},
          {n:"SD",   c:WC.pwr},  {n:"VIN",  c:WC.pwr},
          {n:"GND",  c:WC.gnd},  {n:"OUT±", c:"#4cffb0"},
        ];

        // ── Jumper connection table ──
        const jumpers = [
          {from:`Feather 3.3V  [r${FR+1}, col a]`, to:`PWR rail hole  [r${FR+1}]`,          wire:"RED",    sig:"Power bus — connects to Va post"},
          {from:`Feather GND   [r${FR+3}, col a]`, to:`GND rail hole  [r${FR+3}]`,          wire:"BLACK",  sig:"GND bus — connects to Vb post"},
          {from:`MicroSD 5V    [r${SDR},   col a]`,  to:"— no connection",                     wire:"—",      sig:"Leave unconnected — we use 3V pin instead"},
          {from:`MicroSD 3V    [r${SDR+1}, col a]`,  to:`PWR rail hole  [r${SDR+1}]`,           wire:"RED",    sig:"3.3V power — NOT the 5V pin above it"},
          {from:`MicroSD GND   [r${SDR+2}, col a]`,  to:`GND rail hole  [r${SDR+2}]`,           wire:"BLACK",  sig:"Ground"},
          {from:`MicroSD CLK   [r${SDR+3}, col b]`,  to:`Feather SCK    [r${FR+10}, col b]`,    wire:"YELLOW", sig:"SPI Clock"},
          {from:`MicroSD DO    [r${SDR+4}, col c]`,  to:`Feather MISO   [r${FR+12}, col c]`,    wire:"YELLOW", sig:"SPI Data In"},
          {from:`MicroSD DI    [r${SDR+5}, col d]`,  to:`Feather MOSI   [r${FR+11}, col d]`,    wire:"YELLOW", sig:"SPI Data Out"},
          {from:`MicroSD CS    [r${SDR+6}, col e]`,  to:`Feather D9     [r${FR+8},  col h]`,    wire:"GREEN",  sig:"Chip Select — col g occupied by Feather, use col h"},
          {from:`MicroSD CD    [r${SDR+7}, col a]`,  to:"— no connection",                       wire:"—",      sig:"Leave unconnected"},
          {from:`PAM A+        [r${PR},   col b]`, to:`Feather A0     [r${FR+4},  col b]`,    wire:"ORANGE", sig:"DAC audio signal"},
          {from:`PAM A-        [r${PR+1}, col a]`, to:`GND rail hole  [r${PR+1}]`,            wire:"BLACK",  sig:"Audio reference ground"},
          {from:`PAM SD        [r${PR+2}, col a]`, to:`PWR rail hole  [r${PR+2}]`,            wire:"RED",    sig:"Amp enable — tie HIGH"},
          {from:`PAM Vin       [r${PR+3}, col a]`, to:`PWR rail hole  [r${PR+3}]`,            wire:"RED",    sig:"3.3V power"},
          {from:`PAM GND       [r${PR+4}, col a]`, to:`GND rail hole  [r${PR+4}]`,            wire:"BLACK",  sig:"Ground"},
          {from:"PAM OUT+ (screw terminal)",        to:"Speaker + (Phase 1 direct test)",      wire:"GREEN",  sig:"Audio out + — jumper wire into terminal block"},
          {from:"PAM OUT- (screw terminal)",        to:"Speaker − (Phase 1 direct test)",      wire:"BLACK",  sig:"Audio out − — jumper wire into terminal block"},
          {from:"── PAM CAP ── 0.1µF mylar cap",         to:"A42 (Vin row) → A43 (GND row)",          wire:"—",      sig:"Decoupling cap across PAM Vin/GND on component side. NOT on power rails — shorting rails kills CD4066. Confirmed ✓"},
          {from:"── PHASE 2 ── CD4066BE (ONE chip)",  to:"rows 52–58, straddles e/f gap",       wire:"—",      sig:"Quad switch IC — contains 4 switches; we use 2"},
          {from:"CD4066BE pin 14 VDD [r52, col f]",  to:"PWR rail hole [r52]",                  wire:"RED",    sig:"IC power — 3.3V"},
          {from:"CD4066BE pin 7  VSS [r58, col e]",  to:"GND rail hole [r58]",                  wire:"BLACK",  sig:"IC ground"},
          {from:"CD4066BE pin 1  SwA-in  [r52, col e]", to:"PAM OUT+ terminal (via b52)",        wire:"ORANGE", sig:"Switch A input — earpiece audio in"},
          {from:"CD4066BE pin 2  SwA-out [r53, col e]", to:"Handset earpiece + (via b53)",       wire:"ORANGE", sig:"Switch A output → earpiece speaker"},
          {from:`CD4066BE pin 13 CtrlA   [r53, col f]`, to:`Feather D12 [r11, col i/j]`,        wire:"GREEN",  sig:"Control A — HIGH=earpiece on"},
          {from:"CD4066BE pin 4  SwB-in  [r55, col e]", to:"PAM OUT+ terminal (via d55)",        wire:"ORANGE", sig:"Switch B input — base speaker audio in"},
          {from:"CD4066BE pin 3  SwB-out [r54, col e]", to:"Base speaker + (via free row)",      wire:"ORANGE", sig:"Switch B output → base speaker"},
          {from:`CD4066BE pin 5  CtrlB   [r56, col e]`, to:`Feather D13 [r10, col i/j]`,        wire:"GREEN",  sig:"Control B — HIGH=base speaker on"},
          {from:"CD4066BE pin 6  CtrlC   [r57, col e]", to:"GND rail hole [r57]",               wire:"BLACK",  sig:"Tie LOW — unused switch C must not float"},
          {from:"CD4066BE pin 12 CtrlD   [r54, col f]", to:"GND rail hole [r54]",               wire:"BLACK",  sig:"Tie LOW — unused switch D must not float"},
          {from:"── PHASE 2 ── 0.1µF cap",             to:"GND hole → PWR hole, row 52 col j",  wire:"—",      sig:"Decoupling cap across CD4066BE VDD/VSS — one cap only"},
        ];

        return (
          <div style={{padding:20, display:"flex", gap:24, flexWrap:"wrap"}}>

            {/* ── SVG BREADBOARD ── */}
            <div style={{flexShrink:0}}>
              <div style={{fontSize:11, fontWeight:700, color:COLORS.accent, letterSpacing:"0.08em", marginBottom:6}}>
                JAMECO VALUEPRO 1360 — LEFT HALF — PHASE 1 LAYOUT
              </div>
              <div style={{fontSize:9, color:COLORS.textDim, marginBottom:10}}>
                Left to right: [a–e] gap [f–j] │ BLUE stripe │ GND holes │ gap │ PWR holes │ RED stripe │ right half (Phase 2)
              </div>

              <svg width={BB_W} height={BB_H} style={{background:"#13131a", borderRadius:8, border:`1px solid ${COLORS.border}`, display:"block"}}>

                {/* board bg */}
                <rect x={4} y={4} width={BB_W-8} height={BB_H-8} rx={8} fill="#15151e" stroke={COLORS.border} strokeWidth={1}/>

                {/* ── BLUE GND stripe ── */}
                <rect x={BLUE_STRIPE_X} y={TOP_PAD-8} width={STRIPE_W} height={NUM_ROWS*ROW_H+14} rx={3}
                  fill={WC.gnd} opacity={0.22} stroke={WC.gnd} strokeWidth={1} opacity={0.5}/>
                <text x={BLUE_STRIPE_X+STRIPE_W/2} y={TOP_PAD-12} fill={WC.gnd} fontSize={7} fontFamily="monospace" textAnchor="middle" fontWeight="700">GND</text>

                {/* ── RED PWR stripe ── */}
                <rect x={RED_STRIPE_X} y={TOP_PAD-8} width={STRIPE_W} height={NUM_ROWS*ROW_H+14} rx={3}
                  fill={WC.pwr} opacity={0.22} stroke={WC.pwr} strokeWidth={1} opacity={0.5}/>
                <text x={RED_STRIPE_X+STRIPE_W/2} y={TOP_PAD-12} fill={WC.pwr} fontSize={7} fontFamily="monospace" textAnchor="middle" fontWeight="700">+3.3V</text>

                {/* Va / Vb labels */}
                <text x={RED_STRIPE_X+STRIPE_W/2} y={TOP_PAD-20} fill={WC.pwr} fontSize={8} fontFamily="monospace" textAnchor="middle" fontWeight="700">Va</text>
                <text x={BLUE_STRIPE_X+STRIPE_W/2} y={TOP_PAD-20} fill={WC.gnd} fontSize={8} fontFamily="monospace" textAnchor="middle" fontWeight="700">Vb</text>

                {/* ── GND rail holes (left of inter-gap, right of blue stripe) ── */}
                {Array.from({length:NUM_ROWS},(_,i)=>i+1).map(r=>(
                  <circle key={`gh${r}`} cx={GND_HOLE_X} cy={rowY(r)} r={2.5}
                    fill="#0a0a12" stroke={WC.gnd} strokeWidth={0.8} opacity={0.7}/>
                ))}
                <text x={GND_HOLE_X} y={TOP_PAD-12} fill={WC.gnd} fontSize={6.5} fontFamily="monospace" textAnchor="middle">−</text>

                {/* ── PWR rail holes (right of inter-gap, left of red stripe) ── */}
                {Array.from({length:NUM_ROWS},(_,i)=>i+1).map(r=>(
                  <circle key={`ph${r}`} cx={PWR_HOLE_X} cy={rowY(r)} r={2.5}
                    fill="#0a0a12" stroke={WC.pwr} strokeWidth={0.8} opacity={0.7}/>
                ))}
                <text x={PWR_HOLE_X} y={TOP_PAD-12} fill={WC.pwr} fontSize={6.5} fontFamily="monospace" textAnchor="middle">+</text>

                {/* ── center gap divider between col e and f ── */}
                {(()=>{const gx = colX("e")+COL_W/2+CTR_GAP/2; return(
                  <line x1={gx} y1={TOP_PAD-6} x2={gx} y2={TOP_PAD+NUM_ROWS*ROW_H}
                    stroke={COLORS.border} strokeWidth={1.5} strokeDasharray="2,6" opacity={0.6}/>
                )})()}

                {/* ── right half placeholder ── */}
                <rect x={RIGHT_HALF_X} y={TOP_PAD-8} width={BB_W-RIGHT_HALF_X-6} height={NUM_ROWS*ROW_H+14} rx={4}
                  fill="#0d0d14" stroke={COLORS.border} strokeWidth={1} strokeDasharray="3,6" opacity={0.7}/>
                <text x={RIGHT_HALF_X+(BB_W-RIGHT_HALF_X-6)/2} y={TOP_PAD+NUM_ROWS*ROW_H/2}
                  fill={COLORS.textFaint} fontSize={8} fontFamily="monospace" textAnchor="middle" opacity={0.5}>RIGHT HALF{"\n"}PHASE 2</text>

                {/* ── col headers ── */}
                {"abcdefghij".split("").map(c=>(
                  <text key={c} x={colX(c)} y={TOP_PAD-14} fill={COLORS.textFaint} fontSize={8}
                    fontFamily="monospace" textAnchor="middle">{c}</text>
                ))}

                {/* ── row numbers ── */}
                {[1,5,10,15,20,25,30,35,40,45,50,55,60,63].map(r=>(
                  <text key={r} x={ROW_LABEL_X} y={rowY(r)+4} fill={COLORS.textFaint}
                    fontSize={7} fontFamily="monospace" textAnchor="middle">{r}</text>
                ))}

                {/* ── hole grid cols a–j ── */}
                {Array.from({length:NUM_ROWS},(_,i)=>i+1).map(r=>
                  "abcdefghij".split("").map(c=>(
                    <circle key={`${r}${c}`} cx={colX(c)} cy={rowY(r)} r={2.2}
                      fill="#0a0a12" stroke="#2a2a3a" strokeWidth={0.6}/>
                  ))
                )}

                {/* ══ FEATHER block — pins col a (left) and col g (right), cols b-e and h-j FREE ══ */}
                {(()=>{
                  const x1=colX("a")-7, x2=colX("g")+7;
                  const y1=rowY(FR)-7,  y2=rowY(FR+15)+7;
                  return(<g>
                    <rect x={x1} y={y1} width={x2-x1} height={y2-y1} rx={4}
                      fill={COLORS.accent} opacity={0.06} stroke={COLORS.accent} strokeWidth={1.5}/>
                    <text x={(x1+x2)/2} y={y1-4} fill={COLORS.accent} fontSize={8}
                      fontFamily="monospace" textAnchor="middle" fontWeight="700">FEATHER M4 EXPRESS</text>
                  </g>);
                })()}
                {featherL.map((p,i)=>{const r=FR+i; return(
                  <g key={`fl${i}`}>
                    <circle cx={colX("a")} cy={rowY(r)} r={3} fill={p.a?p.wc:"#222233"} opacity={p.a?0.95:0.5}/>
                    <text x={colX("a")-9} y={rowY(r)+3.5} fill={p.a?p.wc:COLORS.textFaint}
                      fontSize={6.5} fontFamily="monospace" textAnchor="end" fontWeight={p.a?"700":"400"}>{p.n}</text>
                  </g>);})}
                {featherR.map((p,i)=>{const r=FR+i; return(
                  <g key={`fr${i}`}>
                    <circle cx={colX("g")} cy={rowY(r)} r={3} fill={p.a?p.wc:"#222233"} opacity={p.a?0.95:0.5}/>
                    <text x={colX("g")+9} y={rowY(r)+3.5} fill={p.a?p.wc:COLORS.textFaint}
                      fontSize={6.5} fontFamily="monospace" textAnchor="start" fontWeight={p.a?"700":"400"}>{p.n}</text>
                  </g>);})}

                {/* ══ MicroSD block — cantilevered leftward off board edge ══ */}
                {(()=>{
                  const x1=colX("a")-7, x2=colX("e")+7;
                  const y1=rowY(SDR)-6, y2=rowY(SDR+7)+6;
                  return(<g>
                    <rect x={x1} y={y1} width={x2-x1} height={y2-y1} rx={4}
                      fill={COLORS.blue} opacity={0.07} stroke={COLORS.blue} strokeWidth={1.5}/>
                    <text x={(x1+x2)/2} y={y1-4} fill={COLORS.blue} fontSize={8}
                      fontFamily="monospace" textAnchor="middle" fontWeight="700">MicroSD ←cantilever</text>
                  </g>);
                })()}
                {sdPins.map((p,i)=>{const r=SDR+i; return(
                  <g key={`sd${i}`}>
                    <circle cx={colX("a")} cy={rowY(r)} r={3} fill={p.c} opacity={p.n.includes("nc")?0.2:0.85}/>
                    <text x={colX("a")-9} y={rowY(r)+3.5} fill={p.c}
                      fontSize={6.5} fontFamily="monospace" textAnchor="end" opacity={p.n.includes("nc")?0.35:1}>{p.n}</text>
                  </g>);})}
                {/* cantilever arrow — board body extends left off the board */}
                <text x={colX("a")-30} y={rowY(SDR + 3)} fill={COLORS.blue} fontSize={7}
                  fontFamily="monospace" textAnchor="middle" opacity={0.6}>◄ board</text>
                {(()=>{
                  const x1=colX("a")-7, x2=colX("d")+7;
                  const y1=rowY(PR)-6,  y2=rowY(PR+5)+6;
                  return(<g>
                    <rect x={x1} y={y1} width={x2-x1} height={y2-y1} rx={4}
                      fill={COLORS.orange} opacity={0.07} stroke={COLORS.orange} strokeWidth={1.5}/>
                    <text x={(x1+x2)/2} y={y1-4} fill={COLORS.orange} fontSize={8}
                      fontFamily="monospace" textAnchor="middle" fontWeight="700">PAM8302A</text>
                  </g>);
                })()}
                {pamPins.map((p,i)=>{const r=PR+i; return(
                  <g key={`pam${i}`}>
                    <circle cx={colX("a")} cy={rowY(r)} r={3} fill={p.c} opacity={0.85}/>
                    <text x={colX("a")-9} y={rowY(r)+3.5} fill={p.c}
                      fontSize={6.5} fontFamily="monospace" textAnchor="end">{p.n}</text>
                  </g>);})}

                {/* ── horizontal power jumpers → rail holes ── */}
                {[
                  {r:FR+1, x:colX("a"), hx:PWR_HOLE_X, c:WC.pwr},
                  {r:FR+3, x:colX("a"), hx:GND_HOLE_X, c:WC.gnd},
                  {r:SDR+1, x:colX("a"), hx:PWR_HOLE_X, c:WC.pwr},
                  {r:SDR+2, x:colX("a"), hx:GND_HOLE_X, c:WC.gnd},
                  {r:PR+1,  x:colX("a"), hx:GND_HOLE_X, c:WC.gnd},
                  {r:PR+2,  x:colX("a"), hx:PWR_HOLE_X, c:WC.pwr},
                  {r:PR+3,  x:colX("a"), hx:PWR_HOLE_X, c:WC.pwr},
                  {r:PR+4,  x:colX("a"), hx:GND_HOLE_X, c:WC.gnd},
                ].map((w,i)=>(
                  <line key={`hw${i}`} x1={w.x} y1={rowY(w.r)} x2={w.hx} y2={rowY(w.r)}
                    stroke={w.c} strokeWidth={1.8} opacity={0.75} strokeDasharray="3,2"/>
                ))}

                {/* ── vertical SPI jumpers ── */}
                {/* CLK col b: SD row SDR+3 → Feather SCK row FR+10 */}
                <line x1={colX("b")} y1={rowY(SDR+3)} x2={colX("b")} y2={rowY(FR+10)}
                  stroke={WC.spi} strokeWidth={1.8} opacity={0.7} strokeDasharray="4,2"/>
                <text x={colX("b")+4} y={(rowY(SDR+3)+rowY(FR+10))/2} fill={WC.spi} fontSize={6} fontFamily="monospace">CLK</text>

                {/* MISO col c: SD row SDR+4 → Feather MISO row FR+12 */}
                <line x1={colX("c")} y1={rowY(SDR+4)} x2={colX("c")} y2={rowY(FR+12)}
                  stroke={WC.spi} strokeWidth={1.8} opacity={0.7} strokeDasharray="4,2"/>
                <text x={colX("c")+4} y={(rowY(SDR+4)+rowY(FR+12))/2} fill={WC.spi} fontSize={6} fontFamily="monospace">MISO</text>

                {/* MOSI col d: SD row SDR+5 → Feather MOSI row FR+11 */}
                <line x1={colX("d")} y1={rowY(SDR+5)} x2={colX("d")} y2={rowY(FR+11)}
                  stroke={WC.spi} strokeWidth={1.8} opacity={0.7} strokeDasharray="4,2"/>
                <text x={colX("d")+4} y={(rowY(SDR+5)+rowY(FR+11))/2} fill={WC.spi} fontSize={6} fontFamily="monospace">MOSI</text>

                {/* CS col e → col h: SD row SDR+6 → Feather D9 row FR+8
                    (col g is Feather right pin — use col h, same row, same connected group) */}
                <line x1={colX("e")} y1={rowY(SDR+6)} x2={colX("h")} y2={rowY(FR+8)}
                  stroke={WC.gpio} strokeWidth={1.8} opacity={0.7} strokeDasharray="4,2"/>
                <text x={(colX("e")+colX("h"))/2} y={(rowY(SDR+6)+rowY(FR+8))/2-3} fill={WC.gpio} fontSize={6} fontFamily="monospace">CS/D9</text>

                {/* A0 audio col b: PAM A+ row PR+0 → Feather A0 row FR+4 */}
                <line x1={colX("b")} y1={rowY(PR)} x2={colX("b")} y2={rowY(FR+4)}
                  stroke={WC.audio} strokeWidth={1.8} opacity={0.7} strokeDasharray="4,2"/>
                <text x={colX("b")+4} y={(rowY(PR)+rowY(FR+4))/2} fill={WC.audio} fontSize={6} fontFamily="monospace">A0</text>

                {/* ══ CD4066BE — ONE DIP-14, straddles center gap, rows 52–58 ══
                    Datasheet pin layout (top view, pin 1 top-left):
                    Left col e:  pin1=SwA-in, pin2=SwA-out, pin3=SwB-out, pin4=SwB-in,
                                 pin5=CtrlB,  pin6=CtrlC(→GND), pin7=VSS
                    Right col f: pin14=VDD,   pin13=CtrlA, pin12=CtrlD(→GND), pin11=SwD-in(nc),
                                 pin10=SwD-out(nc), pin9=SwC-out(nc), pin8=SwC-in(nc)        */}
                {(()=>{
                  const ICR = 52;
                  const x1=colX("c")-6, x2=colX("i")+6;
                  const y1=rowY(ICR)-6,   y2=rowY(ICR+6)+6;
                  const icPinsL = [
                    {lbl:"1 SwA▶in", c:WC.audio},  {lbl:"2 SwA▶out",c:WC.audio},
                    {lbl:"3 SwB▶out",c:WC.audio},  {lbl:"4 SwB▶in", c:WC.audio},
                    {lbl:"5 CtrlB",  c:WC.gpio},   {lbl:"6 CtrlC↓", c:WC.gnd},
                    {lbl:"7 VSS",    c:WC.gnd},
                  ];
                  const icPinsR = [
                    {lbl:"14 VDD",    c:WC.pwr},   {lbl:"13 CtrlA",  c:WC.gpio},
                    {lbl:"12 CtrlD↓",c:WC.gnd},   {lbl:"11 SwD(nc)",c:WC.nc},
                    {lbl:"10 SwD(nc)",c:WC.nc},    {lbl:"9 SwC(nc)", c:WC.nc},
                    {lbl:"8 SwC(nc)", c:WC.nc},
                  ];
                  return(<g>
                    <rect x={x1} y={y1} width={x2-x1} height={y2-y1} rx={4}
                      fill={COLORS.purple} opacity={0.07} stroke={COLORS.purple} strokeWidth={1.5} strokeDasharray="4,3"/>
                    <text x={(x1+x2)/2} y={y1-4} fill={COLORS.purple} fontSize={8}
                      fontFamily="monospace" textAnchor="middle" fontWeight="700">CD4066BE (Phase 2)</text>
                    {icPinsL.map((p,i)=>(
                      <g key={`u1l${i}`}>
                        <circle cx={colX("e")} cy={rowY(ICR+i)} r={2.5} fill={p.c} opacity={p.c===WC.nc?0.2:0.5}/>
                        <text x={colX("e")-8} y={rowY(ICR+i)+3} fill={p.c} fontSize={5.5}
                          fontFamily="monospace" textAnchor="end" opacity={p.c===WC.nc?0.35:0.9}>{p.lbl}</text>
                      </g>
                    ))}
                    {icPinsR.map((p,i)=>(
                      <g key={`u1r${i}`}>
                        <circle cx={colX("f")} cy={rowY(ICR+i)} r={2.5} fill={p.c} opacity={p.c===WC.nc?0.2:0.5}/>
                        <text x={colX("f")+8} y={rowY(ICR+i)+3} fill={p.c} fontSize={5.5}
                          fontFamily="monospace" textAnchor="start" opacity={p.c===WC.nc?0.35:0.9}>{p.lbl}</text>
                      </g>
                    ))}
                  </g>);
                })()}

                {/* ══ 0.1µF decoupling cap — PAM8302A Vin/GND component side ══
                    One leg A42 (Vin row), other leg A43 (GND row) — NOT on power rails */}
                {(()=>{
                  const r1 = PR+3; // row 42 = PAM Vin
                  const r2 = PR+4; // row 43 = PAM GND
                  const cx = colX("a")-8; // just left of col a
                  return(<g>
                    <line x1={cx} y1={rowY(r1)} x2={cx} y2={rowY(r2)}
                      stroke={COLORS.orange} strokeWidth={2.5} opacity={0.8}/>
                    <circle cx={cx} cy={rowY(r1)} r={2.5} fill={COLORS.orange} opacity={0.9}/>
                    <circle cx={cx} cy={rowY(r2)} r={2.5} fill={COLORS.orange} opacity={0.9}/>
                    <text x={cx-4} y={rowY(r1)+6} fill={COLORS.orange}
                      fontSize={6} fontFamily="monospace" textAnchor="end" opacity={0.9}>0.1µF</text>
                  </g>);
                })()}

                {/* ══ 0.1µF decoupling cap — ONE cap for the single CD4066BE ══
                    Bridges GND hole → PWR hole at row 52, as close to VDD pin as possible */}
                {(()=>{
                  const r = 52;
                  return(<g>
                    <line x1={GND_HOLE_X} y1={rowY(r)} x2={PWR_HOLE_X} y2={rowY(r)}
                      stroke={COLORS.purple} strokeWidth={2.5} opacity={0.5}/>
                    <text x={(GND_HOLE_X+PWR_HOLE_X)/2} y={rowY(r)-3} fill={COLORS.purple}
                      fontSize={6} fontFamily="monospace" textAnchor="middle" opacity={0.8}>0.1µF</text>
                  </g>);
                })()}

              </svg>
            </div>

            {/* ── RIGHT PANEL: table + notes ── */}
            <div style={{flex:1, minWidth:300}}>
              <div style={{fontSize:11, fontWeight:700, color:COLORS.accent, letterSpacing:"0.08em", marginBottom:8}}>
                PHASE 1 (SD verify) + PHASE 2 (audio routing)
              </div>
              <div style={{fontSize:9.5, color:COLORS.textDim, marginBottom:14, lineHeight:1.7}}>
                Feather rows {FR}–{FR+15}: left pins col a, right pins col g — USB connector at top edge. MicroSD rows {SDR}–{SDR+7}: pins col a, cantilevered leftward. PAM8302A rows {PR}–{PR+5}: pins col a. ONE CD4066BE rows 52–58 (dashed outline) — switches A+B used, C+D controls tied LOW. 0.1µF cap at j52 (CD4066 VDD). 0.1µF cap at a42/a43 (PAM Vin/GND component side).
              </div>

              {/* jumper table */}
              <div style={{border:`1px solid ${COLORS.green}33`, borderRadius:6, overflow:"hidden", marginBottom:14}}>
                <div style={{padding:"8px 12px", background:`${COLORS.green}11`, borderBottom:`1px solid ${COLORS.green}33`}}>
                  <span style={{color:COLORS.green, fontWeight:700, fontSize:10, letterSpacing:"0.06em"}}>JUMPER CONNECTIONS — PHASE 1</span>
                </div>
                <table style={{width:"100%", borderCollapse:"collapse", fontSize:9.5, fontFamily:"monospace"}}>
                  <thead>
                    <tr style={{borderBottom:`1px solid ${COLORS.border}44`}}>
                      {["FROM","TO","WIRE","SIGNAL"].map(h=>(
                        <th key={h} style={{padding:"5px 8px", textAlign:"left", color:COLORS.textFaint, fontSize:8.5}}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {jumpers.map((j,i)=>(
                      <tr key={i} style={{borderBottom:`1px solid ${COLORS.border}22`, background:i%2===0?"#ffffff04":"transparent"}}>
                        <td style={{padding:"4px 8px", color:COLORS.text, fontSize:8.5}}>{j.from}</td>
                        <td style={{padding:"4px 8px", color:COLORS.text, fontSize:8.5}}>{j.to}</td>
                        <td style={{padding:"4px 8px", fontWeight:700, fontSize:8.5, color:
                          j.wire==="RED"?"#ff6060":j.wire==="BLACK"?"#6699cc":
                          j.wire==="YELLOW"?WC.spi:j.wire==="ORANGE"?WC.audio:
                          j.wire==="GREEN"?WC.gpio:COLORS.textFaint}}>{j.wire}</td>
                        <td style={{padding:"4px 8px", color:COLORS.textFaint, fontSize:8}}>{j.sig}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div style={{border:`1px solid ${COLORS.accent}44`, borderRadius:6, padding:"10px 12px", fontSize:9.5, color:COLORS.textDim, lineHeight:1.8}}>
                <div style={{color:COLORS.accent, fontWeight:700, marginBottom:4, fontSize:10}}>── PHASE 1: SD CARD VERIFY ──</div>
                <div>① Seat Feather rows {FR}–{FR+15}, left pins col a, right pins col g.</div>
                <div>② Seat MicroSD rows {SDR}–{SDR+7}, pins col a, board cantilevered leftward.</div>
                <div>③ Seat PAM8302A rows {PR}–{PR+5}, pins col a.</div>
                <div>④ Run power jumpers (RED): Feather 3.3V, MicroSD 3V, PAM VIN, PAM SD → PWR rail holes.</div>
                <div>⑤ Run ground jumpers (BLACK): Feather GND, MicroSD GND, PAM GND, PAM A− → GND rail holes.</div>
                <div style={{color:COLORS.orange}}>⑤b ADD PAM DECOUPLING CAP: Insert 0.1µF mylar cap legs into A42 (PAM Vin row) and A43 (PAM GND row) on the component side. ⚠ WARNING: Do NOT place cap across the power rails — shorting +3.3V rail to GND rail through the cap will load down power to all components and cause mysterious failures. Caps are not polarized so either leg orientation is fine.</div>
                <div>⑥ SPI jumpers (YELLOW): CLK col b, MISO col c, MOSI col d.</div>
                <div>⑦ CS jumper (GREEN): MicroSD CS col e → Feather D9 col h (col g is Feather pin).</div>
                <div>⑧ A0 audio jumper (ORANGE): PAM A+ col b → Feather A0 col b.</div>
                <div>⑨ Insert SD card with fortune_01.wav in /sd. Plug USB → Feather.</div>
                <div>⑩ Verify SD in REPL: <span style={{color:COLORS.accent, fontFamily:"monospace"}}>import adafruit_sdcard</span></div>
                <div style={{color:COLORS.purple, fontWeight:700, marginTop:8, marginBottom:4, fontSize:10}}>── PHASE 2: AUDIO ROUTING ──</div>
                <div>⑪ Seat ONE CD4066BE rows 52–58, left pins col e, right pins col f.</div>
                <div>⑫ Bridge 0.1µF cap: GND hole → PWR hole at row 52 (col j, next to VDD pin 14).</div>
                <div>⑬ Tie CtrlC (pin 6, r57 col e) and CtrlD (pin 12, r54 col f) → GND rail. Unused inputs must not float!</div>
                <div>⑭ Wire CtrlA (pin 13, r53 col f/g) → Feather D12 (r11 col i/j). Wire CtrlB (pin 5, r56 col e/d) → Feather D13 (r10 col i/j).</div>
                <div>⑮ Route PAM OUT+ terminal → Switch A input (pin 1, r52 col e, via b52) and Switch B input (pin 4, r55 col e, via d55).</div>
                <div>⑯ Switch A output (pin 2, r53 col e, via b53) → handset earpiece green wire. Earpiece white wire → GND rail.</div>
                <div>⑰ Switch B output (pin 3, r54 col e) → base speaker + (via free row e.g. r46). Base speaker − → PAM OUT−.</div>
                <div>⑱ Test: hardcode D12=True/D13=False for earpiece, then swap values to test base speaker.</div>
              </div>
            </div>

          </div>
        );
      })()}

      {/* Footer */}
      <div style={{ padding: "10px 20px", borderTop: `1px solid ${COLORS.border}`,
        fontSize: 10, color: COLORS.textFaint, letterSpacing: "0.06em" }}>
        FONE OF FORTUNE · LIVING SCHEMATIC v2.5 · FEATHER M4 EXPRESS · CIRCUITPYTHON 10.1.3
      </div>
    </div>
  );
}
