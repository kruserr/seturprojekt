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

obs = []

def runPump(pumpInterval):
    pump.on()
    print(f"{datetime.datetime.utcnow()} - pump on")
    
    time.sleep(pumpInterval)
    
    pump.off()
    print(f"{datetime.datetime.utcnow()} - pump off")

class Job:
    def __init__(self):
        self.obs = []
        self.jobId = 0
        self.scheduler = BackgroundScheduler(daemon=True)
        self.scheduler.add_jobstore('sqlalchemy', url='sqlite:///scheduler.db')
        self.scheduler.start()
        atexit.register(lambda: self.scheduler.shutdown())

    def addJob(self, pumpInterval, crontab):
        if pumpInterval > 0:
            try:
                self.scheduler.remove_job(str(self.jobId))
                print(f"{datetime.datetime.utcnow()} - job {self.jobId} stopped")
            except JobLookupError:
                pass
            
            self.jobId += 1

            self.scheduler.add_job(
                func = runPump,
                args = [pumpInterval],
                trigger = CronTrigger.from_crontab(crontab),
                id = str(self.jobId)
            )
            print(f"{datetime.datetime.utcnow()} - job {self.jobId} started")
        else:
            raise ValueError

job = Job()

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

try:
    ReadSerialThread('/dev/ttyACM0').start()
except serial.serialutil.SerialException:
    pass

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

@app.route('/cron/add', methods=['POST'])
def addJob():
    statusCode = 0
    # try:
    data = flask.request.get_json(force=True)
    pumpInterval = int(data['pumpInterval'])
    crontab = str(data['crontab'])

    print(f"{datetime.datetime.utcnow()} - job request {pumpInterval} {crontab}")
    
    job.addJob(pumpInterval, crontab)

    return json.dumps({'status': 0})
    # except ValueError:
    #     statusCode = -1
    # except:
    #     statusCode = -2
    # return json.dumps({'status': statusCode})

if __name__ == '__main__':
    app.run()
