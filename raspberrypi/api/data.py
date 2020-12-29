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

# class Observations:
#     instance = None

#     def __init__(self):
#         self.obs = []

#     @staticmethod
#     def getInstance():
#         if Observations.instance is None:
#             Observations.instance = Observations()
#         return Observations.instance

obs = []

class Scheduler:
    def __init__(self, pin):
        try:
            self.pin = gpiozero.LED(pin)
        except gpiozero.exc.BadPinFactory:
            class MochPin():
                def on(self):
                    pass

                def off(self):
                    pass
            self.pin = MochPin()

        self.jobId = 0
        self.crontab = ''
        self.interval = 0

        self.scheduler = BackgroundScheduler(daemon=True)
        self.scheduler.start()
        atexit.register(lambda: self.scheduler.shutdown())

    def setInterval(self, interval):
        if interval < 0.001:
            raise ValueError
        self.interval = interval

        print(f"{datetime.datetime.utcnow()} - job set interval {self.interval}")

    def setCrontab(self, crontab):
        self.crontab = crontab

    def runPinInterval(self, pin, interval):
        if interval < 0.001:
            return
        
        pin.on()
        print(f"{datetime.datetime.utcnow()} - pin on")
        
        time.sleep(interval)
        
        pin.off()
        print(f"{datetime.datetime.utcnow()} - pin off")

    def addJob(self):
        try:
            self.scheduler.remove_job(str(self.jobId))
            print(f"{datetime.datetime.utcnow()} - job {self.jobId} stopped")
        except JobLookupError:
            pass
        
        self.jobId += 1

        self.scheduler.add_job(
            func = self.runPinInterval,
            args = [self.pin, self.interval],
            trigger = CronTrigger.from_crontab(self.crontab),
            id = str(self.jobId)
        )
        print(f"{datetime.datetime.utcnow()} - job {self.jobId} started")

pumpScheduler = Scheduler(26)
lightScheduler = Scheduler(19)

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

    try:
        result = obs[-1]
    except IndexError:
        pass

    return json.dumps(result, indent = 2, default = str)

@app.route('/api/pump/schedule', methods=['POST'])
def addPumpSchedule():
    statusCode = 0

    try:
        data = str(flask.request.get_json(force=True)['data'])
        
        pumpScheduler.setCrontab(data)
        pumpScheduler.addJob()
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

        pumpScheduler.setInterval(data)
        pumpScheduler.addJob()
    except ValueError:
        statusCode = -1
    except:
        statusCode = -2

    return json.dumps({'status': statusCode}, indent = 2, default = str)

@app.route('/api/light/schedule', methods=['POST'])
def addLightSchedule():
    statusCode = 0

    try:
        data = str(flask.request.get_json(force=True)['data'])
        
        lightScheduler.setCrontab(data)
        lightScheduler.addJob()
    except ValueError:
        statusCode = -1
    except:
        statusCode = -2

    return json.dumps({'status': statusCode}, indent = 2, default = str)

@app.route('/api/light/interval', methods=['POST'])
def setLightInterval():
    statusCode = 0

    try:
        data = float(flask.request.get_json(force=True)['data'])

        lightScheduler.setInterval(data)
        lightScheduler.addJob()
    except ValueError:
        statusCode = -1
    except:
        statusCode = -2

    return json.dumps({'status': statusCode}, indent = 2, default = str)

if __name__ == '__main__':
    app.run()
