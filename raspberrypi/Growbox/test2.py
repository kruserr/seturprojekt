from gpiozero import LED
import time

led = LED(26)

while(True):
	led.on()
	time.sleep(0.75)
	led.off()
	time.sleep(0.25)
	led.on()
	time.sleep(0.5)
	led.off()
	time.sleep(0.5)

