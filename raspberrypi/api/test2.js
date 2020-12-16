fetch = require('/usr/local/lib/node_modules/node-fetch')
const sleep = ms => new Promise(res => setTimeout(res, ms));

let text = 'hello'
let time = '2020-12-16T12:39:50'
if (process.argv[2])
  text = process.argv[2]
if (process.argv[3])
  time = process.argv[3]

function test(text, time)
{
  fetch(
    'http://localhost:5000/schedulePrint',
    {
      'method': 'POST',
      'body': JSON.stringify({'time': time, 'text': text})
    }
  )
    .then(r => r.json())
    .then(j => {
        console.log(param, j.status);
    })
}

// async function main()
// {
//   test(text);

//   if (time)
//   {
//     await sleep(time);

//     if (text == 0)
//       test(1);
//     else
//       test(0);
//   }
// }
// main()

test(text, time)
