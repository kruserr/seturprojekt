fetch = require('/usr/local/lib/node_modules/node-fetch')


let pumpInterval = 5;
if (process.argv[2])
  pumpInterval = process.argv[2];

let crontab = '0 16 */14 * *';
if (process.argv[3])
  crontab = process.argv[3];

function test(pumpInterval, crontab)
{
  fetch(
    'http://localhost:5000/api/cron',
    {
      'method': 'POST',
      'body': JSON.stringify({'pumpInterval': pumpInterval, 'crontab': crontab})
    }
  )
    .then(r => r.json())
    .then(j => {
      if (j.status != 0)
      {
        console.log(pumpInterval, crontab, j.status);
      }
    });
}
test(pumpInterval, crontab)
