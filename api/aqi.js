export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  const { lat, lon, city } = req.query;
  
  if (!process.env.WAQI_TOKEN) {
    return res.status(500).json({ error: 'API token not configured' });
  }
  
  try {
    let url;
    if (city) {
      url = `https://api.waqi.info/feed/${city}/?token=${process.env.WAQI_TOKEN}`;
    } else if (lat && lon) {
      url = `https://api.waqi.info/feed/geo:${lat};${lon}/?token=${process.env.WAQI_TOKEN}`;
    } else {
      return res.status(400).json({ error: 'Missing coordinates or city name' });
    }
    
    const response = await fetch(url);
    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch AQI data' });
  }
}
