fetch = require('/usr/local/lib/node_modules/node-fetch')


let url = 'http://localhost:5000/api'
if (process.argv[2])
  url = process.argv[2]

function get_url(url)
{
  fetch(url)
    .then(r => r.json())
    .then(j => console.log(j));
}

get_url(url);
