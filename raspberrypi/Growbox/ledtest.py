from gpiozero import LED
from datetime import datetime
import time

# setup
#pump = LED(16)

time.sleep(1)

led = LED(26)

led.on()
