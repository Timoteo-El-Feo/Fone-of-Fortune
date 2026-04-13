# Write your code here :-)
import os
import busio
import board
import digitalio
import storage
import adafruit_sdcard
import audioio
import audiocore
import time
import random

# ── CD4066 control pins ──
ctrlA = digitalio.DigitalInOut(board.D12)
ctrlA.direction = digitalio.Direction.OUTPUT
ctrlA.value = False  # earpiece OFF

ctrlB = digitalio.DigitalInOut(board.D13)
ctrlB.direction = digitalio.Direction.OUTPUT
ctrlB.value = False  # base speaker OFF

# ── Hook switch ──
hook = digitalio.DigitalInOut(board.D5)
hook.direction = digitalio.Direction.INPUT
hook.pull = digitalio.Pull.UP

# ── Mount SD card ──
spi = busio.SPI(board.SCK, board.MOSI, board.MISO)
cs = digitalio.DigitalInOut(board.D9)
sdcard = adafruit_sdcard.SDCard(spi, cs)
vfs = storage.VfsFat(sdcard)
storage.mount(vfs, "/sd")

# ── Build fortune playlist ──
files = [f for f in os.listdir("/sd")
         if f.endswith(".wav") and not f.startswith("._")]
files.sort()
print("Fortunes loaded:", files)

# ── Audio ──
audio = audioio.AudioOut(board.A0)
last_played = None

# ── Main loop ──
print("Fone of Fortune ready — lift handset to play")
while True:
    if hook.value == False:  # handset lifted
        choices = [f for f in files if f != last_played]
        chosen = random.choice(choices)
        last_played = chosen
        print("Playing:", chosen)
        ctrlB.value = True   # base speaker ON
        time.sleep(0.5)
        with open("/sd/" + chosen, "rb") as f:
            wav = audiocore.WaveFile(f)
            audio.play(wav)
            while audio.playing:
                pass
        ctrlB.value = False  # base speaker OFF
        while hook.value == False:
            time.sleep(0.1)
    time.sleep(0.1)
