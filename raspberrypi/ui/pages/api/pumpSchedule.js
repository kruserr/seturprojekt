export default async function pumpSchedule(req, res)
{
  let data = await fetch(
    'http://localhost:5000/api/cron',
    {
      'method': 'POST',
      'body': JSON.stringify({'pumpInterval': 2, 'crontab': JSON.parse(req.body)})
    }
  );
  data = await data.json();
  
  res.statusCode = 200;
  res.json(data);
}
