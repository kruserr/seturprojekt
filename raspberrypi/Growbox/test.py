from gpiozero import LED
import time

led = LED(26)

while(True):
	led.off()
	time.sleep(0.5)
	led.on()
	time.sleep(0.2)
	led.off()
	time.sleep(0.30)
	led.on()
	time.sleep(0.25)
	
