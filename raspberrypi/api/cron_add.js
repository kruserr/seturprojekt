fetch = require('/usr/local/lib/node_modules/node-fetch')
const sleep = ms => new Promise(res => setTimeout(res, ms));

let pumpInterval = 5;
if (process.argv[2])
  pumpInterval = process.argv[2];

//let crontab = '0 2 * * 2';
let crontab = '* * * * *';
if (process.argv[3])
  crontab = process.argv[3];

function test(pumpInterval, crontab)
{
  fetch(
    'http://localhost:5000/cron/add',
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

async function main()
{
  test(pumpInterval, crontab);
}
main();
