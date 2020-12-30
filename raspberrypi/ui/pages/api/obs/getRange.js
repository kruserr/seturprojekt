export default async function APIForward(req, res)
{
  if (req.method === 'POST')
  {
    let body = JSON.parse(req.body);

    let data = await fetch(`http://localhost:5000/api/obs/${body.start}/${body.end}`);
    data = await data.json();

    res.status(200)
      .json(data);
  }

  res.status(405)
    .end();
}
