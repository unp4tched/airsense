# AirSense - Air Quality Monitoring Dashboard

A real-time air quality monitoring dashboard that provides detailed insights into environmental conditions, pollutant levels, and health advisories.

## Features

- Real-time AQI monitoring with automatic updates
- Comprehensive pollutant analysis (PM2.5, PM10, NO₂, O₃, CO, SO₂)
- Weather integration (temperature, humidity, wind, pressure)
- Interactive map with location markers
- Historical trends and 12-hour forecasts
- AI-powered chat assistant for air quality queries
- Alert system with browser push notifications
- Location search and geolocation support

## Tech Stack

- HTML5, CSS3, JavaScript (ES6+)
- Chart.js for data visualization
- Leaflet for interactive maps
- Font Awesome icons
- Google Fonts (Inter)

## APIs Used

- World Air Quality Index (WAQI) for AQI data
- OpenWeather API for weather data
- Groq API for AI chat functionality

## Installation

1. Clone the repository
2. Update API keys in `script.js` or use environment variables
3. Open `index.html` in a browser or deploy to a web server

## Configuration

Update the following in `script.js`:

```javascript
const TOKEN = "your-waqi-api-token";
const OPENWEATHER_API_KEY = "your-openweather-api-key";
const AI_API_KEY = "your-groq-api-key";
```

### Getting API Keys

- WAQI: Register at [aqicn.org/api](https://aqicn.org/api/)
- OpenWeather: Register at [openweathermap.org/api](https://openweathermap.org/api)
- Groq: Register at [console.groq.com](https://console.groq.com)

## Deployment

### Deploy to Vercel

1. Push code to GitHub
2. Import repository in Vercel
3. Add environment variables in Vercel dashboard:
   - `WAQI_TOKEN`
   - `OPENWEATHER_API_KEY`
   - `GROQ_API_KEY`
4. Deploy

For secure deployment, use the included serverless functions in the `api/` folder.

## Browser Support

- Chrome 90+
- Firefox 88+
- Edge 90+
- Safari 14+

## AQI Categories

- 0-50: Good
- 51-100: Moderate
- 101-150: Unhealthy for Sensitive Groups
- 151-200: Unhealthy
- 201-300: Very Unhealthy
- 301+: Hazardous

## Project Structure

```
airsense-main/
├── api/              # Serverless functions for Vercel
├── index.html        # Main HTML file
├── style.css         # Stylesheet
├── script.js         # JavaScript functionality
└── README.md         # Documentation
```

## License

This project is provided as-is for educational and personal use.

## Credits

- Air quality data by World Air Quality Index Project
- Weather data by OpenWeather
- Map tiles by OpenStreetMap contributors
- AI powered by Groq