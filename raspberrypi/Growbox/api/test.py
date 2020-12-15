import asyncio
import os
from datetime import datetime

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger


async def runPump(pumpInterval):
    print(f"{datetime.now()} - On")
    await asyncio.sleep(pumpInterval)
    print(f"{datetime.now()} - Off")


if __name__ == '__main__':
    scheduler = AsyncIOScheduler()
    
    scheduler.add_job(lambda : runPump(pumpInterval), 'interval', seconds=10)

    pumpInterval = 5
    crontab = "* * * * *"

    # scheduler.add_job(
    #     lambda : runPump(pumpInterval),
    #     CronTrigger.from_crontab(crontab),
    #     id = '1'
    # )

    scheduler.start()
    print('Press Ctrl+{0} to exit'.format('Break' if os.name == 'nt' else 'C'))

    # Execution will block here until Ctrl+C (Ctrl+Break on Windows) is pressed.
    try:
        asyncio.get_event_loop().run_forever()
    except (KeyboardInterrupt, SystemExit):
        pass
