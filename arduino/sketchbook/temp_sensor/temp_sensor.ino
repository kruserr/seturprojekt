#include <dht.h>

//#include <unistd.h>
//#include <vector>

dht DHT;

#define DHT11_PIN 7

// constants
const int pResistor = A0;

int value;

char trans[3] = {'0', ',', '0'};

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
  if (value > 25)
  {
    Serial.print("1");
  } else {
    Serial.print("0");
  }
  
  Serial.print(",");
  
  char temp[3];
  Serial.readBytes(temp, 3);
  
  if (temp[0] == '0' || temp[0] == '1')
    trans[0] = temp[0];
    
  if (temp[2] == '0' || temp[2] == '1')
    trans[2] = temp[2];
  
  Serial.print(trans[0]);
  Serial.print(trans[2]);
  
  if (trans[0] == '1')
    digitalWrite(13, HIGH);
  else
    digitalWrite(13, LOW);
    
  if (trans[2] == '1')
    digitalWrite(12, HIGH);
  else
    digitalWrite(12, LOW);
  
  //Serial.print(Serial.read());
  
  Serial.print("\n");
  
  delay(2000);
}

