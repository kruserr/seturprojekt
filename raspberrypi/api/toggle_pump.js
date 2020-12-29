fetch = require('/usr/local/lib/node_modules/node-fetch')
const sleep = ms => new Promise(res => setTimeout(res, ms));

let state = 1
let time = 2000
if (process.argv[2])
  state = process.argv[2]
if (process.argv[3])
  time = process.argv[3]

function test(param)
{
  fetch(
    'http://localhost:5000/api/pump',
    {
      'method': 'POST',
      'body': JSON.stringify({'state': param})
    }
  )
    .then(r => r.json())
    .then(j => {
      if (j.status != param)
      {
        console.log(param, j.status);
      }
    })
}

async function main()
{
  test(state);

  if (time)
  {
    await sleep(time);

    if (state == 0)
      test(1);
    else
      test(0);
  }
}
main()
