from gpiozero import LED
import time

led = LED(26)

while(True):
	led.off()
	time.sleep(3)
	led.on()
	time.sleep(3)
