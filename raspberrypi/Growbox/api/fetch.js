fetch = require('/usr/local/lib/node_modules/node-fetch')


let state = 0
if (process.argv[2])
  state = process.argv[2]

fetch(
  'http://localhost:5000/pump',
  {
    'method': 'POST',
    'body': JSON.stringify({'state': state})
  }
)
  .then(r => r.json())
  .then(j => console.log(j))
