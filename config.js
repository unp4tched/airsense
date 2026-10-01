const config = {
  WAQI_TOKEN: import.meta.env.VITE_WAQI_TOKEN || '',
  OPENWEATHER_API_KEY: import.meta.env.VITE_OPENWEATHER_API_KEY || '',
  GROQ_API_KEY: import.meta.env.VITE_GROQ_API_KEY || ''
};

export default config;
