import flask
import json

import threading
import serial

import gpiozero

import time
import datetime

import atexit
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from apscheduler.jobstores.base import JobLookupError


app = flask.Flask(__name__)

try:
    pump = gpiozero.LED(26)
except gpiozero.exc.BadPinFactory:
    class Pump():
        def on(self):
            pass

        def off(self):
            pass

    pump = Pump()

obs = [
    {
        'id': 1,
        'timestamp': (datetime.datetime.utcnow() - datetime.timedelta(hours=25)).isoformat(),
        'temp': 23.0,
        'humid': 55.0,
        'light': 1
    },
    {
        'id': 2,
        'timestamp': (datetime.datetime.utcnow() - datetime.timedelta(hours=24)).isoformat(),
        'temp': 23.1,
        'humid': 55.0,
        'light': 1
    },
    {
        'id': 3,
        'timestamp': (datetime.datetime.utcnow() - datetime.timedelta(hours=23, minutes=55)).isoformat(),
        'temp': 23.5,
        'humid': 55.0,
        'light': 1
    },
    {
        'id': 4,
        'timestamp': (datetime.datetime.utcnow() - datetime.timedelta(hours=23, minutes=50)).isoformat(),
        'temp': 23.4,
        'humid': 55.0,
        'light': 1
    },
    {
        'id': 5,
        'timestamp': (datetime.datetime.utcnow() - datetime.timedelta(hours=23, minutes=45)).isoformat(),
        'temp': 23.6,
        'humid': 55.0,
        'light': 1
    }
]

pumpInterval = 2
lightInterval = 21600

def runPump(interval):
    if interval < 0.001:
        return
    
    pump.on()
    print(f"{datetime.datetime.utcnow()} - pump on")
    
    time.sleep(interval)
    
    pump.off()
    print(f"{datetime.datetime.utcnow()} - pump off")

class Job:
    def __init__(self, id = 'scheduler'):
        self.id = id
        self.obs = []
        self.interval = 0

        self.jobId = 0
        try:
            with open(f"{self.id}_jobId.dat", 'r') as f:
                self.jobId = int(f.read())
        except FileNotFoundError:
            pass

        self.scheduler = BackgroundScheduler(daemon=True)
        self.scheduler.add_jobstore('sqlalchemy', url=f"sqlite:///{self.id}.db")
        self.scheduler.start()
        atexit.register(lambda: self.scheduler.shutdown())

    def setInterval(self, interval):
        if interval < 0.001:
            raise ValueError
        self.interval = interval

    def setJobId(self):
        self.jobId += 1

        with open(f"{self.id}_jobId.dat", 'w') as f:
            f.write(str(self.jobId))

    def addJob(self, crontab):
        try:
            self.scheduler.remove_job(str(self.jobId))
            print(f"{datetime.datetime.utcnow()} - job {self.jobId} stopped")
        except JobLookupError:
            pass
        
        self.setJobId()

        self.scheduler.add_job(
            func = runPump,
            args = [pumpInterval],
            trigger = CronTrigger.from_crontab(crontab),
            id = str(self.jobId)
        )
        print(f"{datetime.datetime.utcnow()} - job {self.jobId} started")

#job = Job()
pumpScheduler = Job('pumpScheduler')
lightScheduler = Job('lightScheduler')

class ReadSerialThread(threading.Thread):
    def __init__(self, path):
        threading.Thread.__init__(self)

        self.path = path
        self.ser = None

        self.loadSerial()

        self.header = ['temp', 'humid', 'light']
        self.id = 1

    def loadSerial(self):
        try:
            self.ser = serial.Serial(self.path, 9600, timeout = 1)
            self.ser.flush()
        except serial.serialutil.SerialException:
            pass

    def innerLoop(self):
        if self.ser is None:
            self.loadSerial()
            return
        
        if not self.ser.is_open:
            try:
                self.ser.open()
            except serial.serialutil.SerialException:
                pass
        
        try:
            if (self.ser.is_open) and (self.ser.in_waiting > 0):
                item = {}
                row = self.ser.readline().decode('utf-8').rstrip().split(',')

                item['id'] = self.id
                self.id += 1

                item['timestamp'] = datetime.datetime.utcnow().isoformat()

                for i in range(len(self.header)):
                    item[self.header[i]] = row[i]

                obs.append(item)
        except OSError:
            self.ser.close()

    def run(self):
        while True:
            self.innerLoop()
            time.sleep(0.1)

ReadSerialThread('/dev/ttyACM0').start()

@app.route('/api/obs', methods=['GET'])
def getData():
    return json.dumps(obs, indent = 2, default = str)

@app.route('/api/obs/<int:itemId>', methods=['GET'])
def getDataId(itemId):
    result = None

    for item in obs:
        if item['id'] == itemId:
            result = item

    return json.dumps(result, indent = 2, default = str)

@app.route('/api/obs/<int:idFrom>/<int:idTo>', methods=['GET'])
def getDataFromTo(idFrom, idTo):
    result = []

    for item in obs:
        if (item['id'] >= idFrom) and (item['id'] <= idTo):
            result.append(item)

    return json.dumps(result, indent = 2, default = str)

@app.route('/api/obs/lastDay')
def getObsLastDay():
    result = []

    lastDay = datetime.datetime.utcnow() - datetime.timedelta(hours=24)

    for item in obs:
        if datetime.datetime.fromisoformat(item['timestamp']) > lastDay:
            result.append(item)

    return json.dumps(result, indent = 2, default = str)

@app.route('/api/obs/newest')
def getObsNewest():
    result = None

    # TEST
    obs.append(
        {
            'id': 6,
            'timestamp': datetime.datetime.utcnow().isoformat(),
            'temp': 23.7,
            'humid': 55.0,
            'light': 1
        }
    )

    try:
        result = obs[-1]
    except IndexError:
        pass

    return json.dumps(result, indent = 2, default = str)

@app.route('/api/pump/manual', methods=['POST'])
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

        statusCode = f"{data['state']}"
    except ValueError:
        statusCode = -1
    except:
        statusCode = -2

    return json.dumps({'status': statusCode}, indent = 2, default = str)

@app.route('/api/pump/schedule', methods=['POST'])
def addJob():
    statusCode = 0

    try:
        data = str(flask.request.get_json(force=True)['data'])
        
        job.addJob(data)
    except ValueError:
        statusCode = -1
    except:
        statusCode = -2

    return json.dumps({'status': statusCode}, indent = 2, default = str)

@app.route('/api/pump/interval', methods=['POST'])
def setPumpInterval():
    statusCode = 0

    try:
        data = float(flask.request.get_json(force=True)['data'])

        global pumpInterval
        pumpInterval = data
    except ValueError:
        statusCode = -1
    except:
        statusCode = -2

    return json.dumps({'status': statusCode}, indent = 2, default = str)

@app.route('/api/light/schedule', methods=['POST'])
def addJob():
    statusCode = 0

    try:
        data = str(flask.request.get_json(force=True)['data'])
        
        job.addJob(data)
    except ValueError:
        statusCode = -1
    except:
        statusCode = -2

    return json.dumps({'status': statusCode}, indent = 2, default = str)

@app.route('/api/light/interval', methods=['POST'])
def setPumpInterval():
    statusCode = 0

    try:
        data = float(flask.request.get_json(force=True)['data'])

        global lightInterval
        lightInterval = data
    except ValueError:
        statusCode = -1
    except:
        statusCode = -2

    return json.dumps({'status': statusCode}, indent = 2, default = str)

if __name__ == '__main__':
    app.run()
