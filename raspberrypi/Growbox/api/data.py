import flask
import json
import threading
import serial
import gpiozero

app = flask.Flask(__name__)
pump = gpiozero.LED(26)
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

@app.route('/', methods=['GET'])
def getData():
    return json.dumps(obs)

@app.route('/<int:id>', methods=['GET'])
def getDataId(id):
    result = None

    for item in obs:
        if item['id'] == id:
            result = item

    return json.dumps(result)

@app.route('/<int:idFrom>/<int:idTo>', methods=['GET'])
def getDataFromTo(idFrom, idTo):
    result = []

    for item in obs:
        if (item['id'] >= idFrom) and (item['id'] <= idTo):
            result.append(item)

    return json.dumps(result)

@app.route('/pump', methods=['POST'])
def setPumpState():
    statusCode = 0
    try:
        data = flask.request.get_json(force=True)

        if int(data['state']) == 1:
            pump.on()
        elif int(data['state']) == 0:
            pump.off()
        else:
            raise ValueError

        return json.dumps({'status': f"{data['state']}"})
    except ValueError:
        statusCode = -1
    except:
        statusCode = -2
    return json.dumps({'status': statusCode})

if __name__ == '__main__':
    app.run()
