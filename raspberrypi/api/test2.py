from flask import Flask, request
from apscheduler.schedulers.background import BackgroundScheduler
from datetime import datetime
import atexit
import time
app = Flask(__name__)

# initialize scheduler with your preferred timezone
scheduler = BackgroundScheduler(daemon = True)
# add a custom jobstore to persist jobs across sessions (default is in-memory)
scheduler.add_jobstore('sqlalchemy', url='sqlite:////tmp/schedule.db')
scheduler.start()



@app.route('/schedulePrint', methods=['POST'])
def schedule_to_print():
    data = request.get_json(force=True)
    #get time to schedule and text to print from the json
    time = data.get('time')
    text = data.get('text')
    #convert to datetime
    date_time = datetime.strptime(str(time), '%Y-%m-%dT%H:%M:%S')
    #schedule the method 'printing_something' to run the the given 'date_time' with the args 'text'
    job = scheduler.add_job(printing_something, trigger='date', next_run_time=str(date_time),
                            args=[text])
    return "job details: %s" % job


def printing_something(text):
    print(f"printing {text} at {datetime.now()}")
    time.sleep(5)
    print(f"printing after 5s {text} at {datetime.now()}")


if __name__ == '__main__':
    atexit.register(lambda: scheduler.shutdown())
    app.run()
