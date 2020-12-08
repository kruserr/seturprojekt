fetch = require('/usr/local/lib/node_modules/node-fetch')


function test()
{
  fetch(
    'http://localhost:5000/cron/remove',
    {
      'method': 'POST',
      'body': JSON.stringify()
    }
  )
    .then(r => r.json())
    .then(j => {
      if (j.status != 0)
      {
        console.log(j.status);
      }
    });
}

async function main()
{
  test();
}
main();
