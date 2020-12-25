export default async function getNewestObs(req, res)
{
  let data = await fetch('http://localhost:5000/1');
  data = await data.json();
  
  res.statusCode = 200;
  res.json(data);
}
