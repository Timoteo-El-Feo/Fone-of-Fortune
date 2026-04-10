**Feather M4 Express**      brain — all signals route through 
Feather pin	  direction	  connects to	  wire source	  notes
A0	OUTPUT	PAM8302A A+	left pin col	DAC audio out — the critical short audio run
A2	ANALOG IN	volume slider wiper (ISS4 pads 2+3)	left pin col	0–65535 normalized to 0.0–1.0 in code
SCK	OUTPUT	MicroSD CLK	left pin col	hardware SPI — keep wire short
MOSI	OUTPUT	MicroSD DI	left pin col	hardware SPI
MISO	INPUT	MicroSD DO	left pin col	hardware SPI
D9	OUTPUT	MicroSD CS	right pin col	chip select — locked, do not reassign
D5	INPUT	JST-XH hook switch → ISS3 pad	right pin col	internal pull-up; LOW = handset lifted
D6	INPUT	JST-XH DIAL switch → ISS3 pad	right pin col	internal pull-up; LOW = TT/Advanced mode
D10	INPUT	OLH slider LO (ISS4 pad A)	right pin col	internal pull-up; LOW = LO position
D11	INPUT	OLH slider HI (ISS4 pad C)	right pin col	internal pull-up; LOW = HI position; both HIGH = OFF / sleep
D12	OUTPUT	CD4066BE pin 13 CtrlA	right pin col	HIGH = earpiece channel on
D13	OUTPUT	CD4066BE pin 12 CtrlB	right pin col	HIGH = base speaker channel on
3.3V	POWER	perfboard 3.3V rail	left pin col	short drop to top rail
GND	GND	perfboard GND rail	left pin col	short drop to top rail
JST jack	POWER	3.7V LiPoly battery	underside	no perfboard trace needed — direct plug
D0	DEFERRED	ISS 2.5 receptacle pin 1 (keypad row 1)	left pin col	keypad matrix — Advanced mode only
D1	DEFERRED	ISS 2.5 receptacle pin 2 (keypad row 2)	left pin col	keypad matrix — Advanced mode only
D4	DEFERRED	ISS 2.5 receptacle pin 3 (keypad row 3)	left pin col	keypad matrix — Advanced mode only
SCL / D22	DEFERRED	ISS 2.5 receptacle pin 4 (keypad row 4)	right pin col	keypad matrix — Advanced mode only
SDA / D21	DEFERRED	ISS 2.5 receptacle pin 5 (keypad col 1)	right pin col	keypad matrix — Advanced mode only
A1	DEFERRED	ISS 2.5 receptacle pin 6 (keypad col 2)	left pin col	keypad matrix — Advanced mode only
A3	DEFERRED	ISS 2.5 receptacle pin 7 (keypad col 3)	left pin col	keypad matrix — Advanced mode only
A4	DEFERRED	ISS 2.5 receptacle pin 8 (keypad col 4)	left pin col	keypad matrix — Advanced mode only

**MicroSD breakout+**    8GB FAT32 · WAV files at 22050Hz / 16-bit / mono
Breakout pin	  direction	  connects to	  wire source	  notes
5V	NC	not connected	—	leave unconnected — use 3V pin instead
3V	POWER	3.3V rail	left edge pin	short drop up to rail
GND	GND	GND rail	left edge pin	short drop up to rail
CLK	INPUT	Feather SCK	left edge pin	SPI clock
DO	OUTPUT	Feather MISO	left edge pin	SPI data out from SD
DI	INPUT	Feather MOSI	left edge pin	SPI data in to SD
CS	INPUT	Feather D9	left edge pin	chip select — locked to D9
CD	NC	not connected	—	card detect — not used in code

**PAM8302A amplifier**    2.5W class D · pot trimmer set to max gain permanently
PAM pin	  direction	  connects to	  wire source	  notes
Vin	POWER	3.3V rail	left pin col	0.1µF mylar cap across Vin/GND on component side — not across rails
GND	GND	GND rail	left pin col	other leg of 0.1µF decoupling cap
A+	INPUT	Feather A0 (DAC)	left pin col	critical audio run — keep as short as possible
A−	INPUT	GND rail	left pin col	audio signal ground reference
SD	INPUT	3.3V rail	left pin col	amp enable — tie HIGH permanently
OUT+	OUTPUT	CD4066BE pin 1 (SwA-in) and pin 4 (SwB-in)	screw terminal	amplified audio — both switch inputs fed from OUT+
OUT−	OUTPUT	GND rail (audio return)	screw terminal	speaker ground return path

**CD4066BE quad analog switch**    DIP-14 · switches A and B used · C and D tied LOW
IC pin	direction	connects to	wire source	notes
14 VDD	POWER	3.3V rail	right pin row	0.1µF mylar cap across VDD/GND at this pin
7 VSS	GND	GND rail	left pin row	other leg of 0.1µF decoupling cap
1 SwA-in	INPUT	PAM8302A OUT+	left pin row	audio signal in — earpiece path
2 SwA-out	OUTPUT	handset earpiece (white+green, ~262Ω)	left pin row	earpiece audio out when CtrlA HIGH
4 SwB-in	INPUT	PAM8302A OUT+	left pin row	audio signal in — base speaker path
3 SwB-out	OUTPUT	base speaker 3W/4Ω (+)	left pin row	speaker audio out when CtrlB HIGH
13 CtrlA	INPUT	Feather D12	right pin row	HIGH = switch A closed = earpiece on
12 CtrlB	INPUT	Feather D13	right pin row	HIGH = switch B closed = base speaker on
6 CtrlC	GND	GND rail	left pin row	unused switch — must not float, tie LOW
5 SwC-in	NC	not connected	—	unused switch input
12 CtrlD	GND	GND rail	right pin row	unused switch — must not float, tie LOW
11 SwD-in	NC	not connected	—	unused switch input

**ISS3 PCB — hook switch and DIAL switch**    solder directly to ISS3 pads · wires exit via JST-XH 2-pin connectors
ISS3 signal	direction	connects to	connector	notes
hook sw — signal	INPUT	Feather D5 (via JST-XH)	JST-XH 2-pin #1 pin 1	left pad set — vertically aligned with beige lever
hook sw — GND	GND	perfboard GND rail (via JST-XH)	JST-XH 2-pin #1 pin 2	switch common — both switch grounds are independent JSTs
DIAL sw — signal	INPUT	Feather D6 (via JST-XH)	JST-XH 2-pin #2 pin 1	pin 1 or 3 (throw) of DPDT pole 1
DIAL sw — GND	GND	perfboard GND rail (via JST-XH)	JST-XH 2-pin #2 pin 2	pin 2 (common/center) of DPDT pole 1
DIAL sw — pole 2	NC	not connected	—	reserved — future mode indicator LED option
LED anode E trace	POWER	3.3V rail via 220Ω resistor	ISS3 ribbon connector pin	shared anode for both keypad backlight LEDs
LED1 cathode D trace	OUTPUT	Feather GPIO (TBD)	ISS3 ribbon connector pin	drive LOW to illuminate LED1
LED2 cathode F trace	OUTPUT	Feather GPIO (TBD)	ISS3 ribbon connector pin	drive LOW to illuminate LED2

**ISS4 PCB — OLH slider and volume slider**    solder directly to ISS4 pads · 28AWG stranded hookup wire
ISS4 pad	direction	connects to	wire source	notes
OLH pad A (pad 3)	INPUT	Feather D10	ISS4 direct solder	LO output — LOW when slider in LO position
OLH pad B (pad 2)	GND	GND rail	ISS4 direct solder	common/center of OLH slider
OLH pad C (pad 1)	INPUT	Feather D11	ISS4 direct solder	HI output — LOW when slider in HI position
vol pads 1+4 (fixed end A)	POWER	3.3V rail	ISS4 direct solder	pads 1 and 4 are shorted by PCB trace
vol pads 2+3 (wiper)	ANALOG IN	Feather A2	ISS4 direct solder	pads 2 and 3 are shorted by PCB trace · locked to A2
vol pad 5 (fixed end B)	GND	GND rail	ISS4 direct solder	42kΩ total pot resistance

**ISS 2.5 — keypad matrix receptacle**    8-pin JST-XH · 6mm × 22mm · vertical orientation · deferred — solder receptacle now, wire later
Receptacle pin	direction	connects to	Feather col	notes
Pin 1	DEFERRED	Feather D0 (keypad row 1)	left pin col	matrix scan output
Pin 2	DEFERRED	Feather D1 (keypad row 2)	left pin col	matrix scan output
Pin 3	DEFERRED	Feather D4 (keypad row 3)	left pin col	matrix scan output
Pin 4	DEFERRED	Feather SCL / D22 (keypad row 4)	right pin col	matrix scan output
Pin 5	DEFERRED	Feather SDA / D21 (keypad col 1)	right pin col	matrix read input — pull-up in code
Pin 6	DEFERRED	Feather A1 (keypad col 2)	left pin col	matrix read input — pull-up in code
Pin 7	DEFERRED	Feather A3 (keypad col 3)	left pin col	matrix read input — pull-up in code
Pin 8	DEFERRED	Feather A4 (keypad col 4)	left pin col	matrix read input — pull-up in code

**Power and decoupling summary**    3.3V and GND rails span full board width — rows 2 and 3
Component	3.3V source	GND source	decoupling cap	notes
Feather M4	self-regulates from battery / USB	rail	onboard	powers the 3.3V rail from its 3V pin
MicroSD breakout	3.3V rail → 3V pin	GND rail	onboard	uses 3V pin not 5V pin
PAM8302A	3.3V rail → Vin	GND rail → GND + A−	0.1µF mylar at Vin/GND pins	cap on component side, not across rails
CD4066BE	3.3V rail → pin 14 VDD	GND rail → pin 7 VSS	0.1µF mylar at VDD/GND	CtrlC and CtrlD also tied to GND rail
