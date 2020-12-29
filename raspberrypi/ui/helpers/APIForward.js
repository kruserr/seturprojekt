export default async function APIForward(req, res)
{
  let url = `http://localhost:5000${req.url}`;

  if (req.method === 'GET')
  {
    let data = await fetch(url);
    data = await data.json();

    res.status(200)
      .json(data);
  }

  if (req.method === 'POST')
  {
    let data = await fetch(
      url,
      {
        'method': 'POST',
        'body': req.body
      }
    );
    data = await data.json();

    res.status(200)
      .json(data);
  }

  res.status(405)
    .end();
}
