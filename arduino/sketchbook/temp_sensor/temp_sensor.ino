#include <dht.h>

//#include <unistd.h>
//#include <vector>

dht DHT;

#define DHT11_PIN 7

// constants
const int pResistor = A0;

int value;

void setup()
{
  Serial.begin(9600);
  pinMode(pResistor, INPUT);
}

void loop()
{
  // temp and humidity
  int chk = DHT.read11(DHT11_PIN);
  Serial.print(DHT.temperature);
  Serial.print(",");
  Serial.print(DHT.humidity);
  Serial.print(",");
  
  // light sensor
  value = analogRead(pResistor);
  Serial.print(value);
  
  // End of csv
  Serial.print("\n");
  
  delay(2000);
}
