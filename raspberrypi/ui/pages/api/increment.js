let id = 0;
let timestamp = 130000;

export default function increment(req, res)
{
  let temp = Math.floor(Math.random() * (2300 - 2280) + 2280);
  let humid = Math.floor(Math.random() * (5500 - 5480) + 5480);

  res.statusCode = 200;
  res.json({'id': ++id, 'timestamp': ++timestamp, 'temp': temp, 'humid': humid});
}
