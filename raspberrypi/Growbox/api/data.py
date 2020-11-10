from flask import Flask
import json
import threading
import serial

app = Flask(__name__)
obs = []


class ReadSerialThread(threading.Thread):
    def __init__(self, path):
        threading.Thread.__init__(self)

        self.ser = serial.Serial(path, 9600, timeout=1)
        self.ser.flush()

        self.header = ['temp', 'humid', 'light']
        self.id = 1

    def run(self):
        while True:
            if self.ser.in_waiting > 0:
                item = {}
                row = self.ser.readline().decode('utf-8').rstrip().split(',')

                item['id'] = self.id
                self.id += 1

                for i in range(len(self.header)):
                    item[self.header[i]] = row[i]

                obs.append(item)

ReadSerialThread('/dev/ttyACM0').start()

@app.route('/')
def getData():
    return json.dumps(obs)

@app.route('/<int:id>')
def getDataId(id):
    result = None

    for item in obs:
        if item['id'] == id:
            result = item

    return json.dumps(result)

@app.route('/<int:idFrom>/<int:idTo>')
def getDataFromTo(idFrom, idTo):
    result = []

    for item in obs:
        if (item['id'] >= idFrom) and (item['id'] <= idTo):
            result.append(item)

    return json.dumps(result)

if __name__ == '__main__':
    app.run()
