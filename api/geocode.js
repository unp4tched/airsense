export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  const { q, limit } = req.query;
  
  if (!q) {
    return res.status(400).json({ error: 'Missing query parameter' });
  }
  
  if (!process.env.OPENWEATHER_API_KEY) {
    return res.status(500).json({ error: 'API key not configured' });
  }
  
  try {
    const response = await fetch(
      `https://api.openweathermap.org/geo/1.0/direct?q=${q}&limit=${limit || 5}&appid=${process.env.OPENWEATHER_API_KEY}`
    );
    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch geocode data' });
  }
}
