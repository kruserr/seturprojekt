export default async function newest(req, res)
{
  let data = await fetch('http://localhost:5000/api/obs/lastDay');
  data = await data.json();
  
  res.statusCode = 200;
  res.json(data);
}
