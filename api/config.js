export default function handler(req, res) {
  res.status(200).json({
    WAQI_TOKEN: process.env.WAQI_TOKEN || '',
    OPENWEATHER_API_KEY: process.env.OPENWEATHER_API_KEY || '',
    GROQ_API_KEY: process.env.GROQ_API_KEY || ''
  });
}
