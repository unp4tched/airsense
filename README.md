# AirSense - Premium Air Quality Monitoring Dashboard

AirSense is a comprehensive, real-time air quality monitoring dashboard that provides detailed insights into environmental air quality conditions. Built with modern web technologies, it offers an intuitive interface for tracking air quality index (AQI), pollutant levels, weather conditions, and health advisories.

## Overview

AirSense delivers accurate air quality information through a sophisticated dashboard interface, helping users make informed decisions about outdoor activities and health precautions. The application integrates multiple data sources to provide comprehensive environmental monitoring capabilities.

## Key Features

### Real-Time Air Quality Monitoring
- Live AQI tracking with automatic updates every 60 seconds
- Color-coded visual indicators based on air quality categories
- Animated radial gauge displaying current AQI levels
- Historical trend analysis with customizable time ranges (7-day, 30-day, 90-day)
- 12-hour forecast predictions for planning ahead

### Comprehensive Pollutant Analysis
- Detailed breakdown of six key pollutants:
  - PM2.5 (Fine Particulate Matter)
  - PM10 (Coarse Particulate Matter)
  - NO₂ (Nitrogen Dioxide)
  - O₃ (Ozone)
  - CO (Carbon Monoxide)
  - SO₂ (Sulfur Dioxide)
- Individual pollutant tracking with visual indicators
- Real-time concentration values with appropriate units

### Weather Integration
- Current temperature with location-specific readings
- Relative humidity percentage
- Wind speed and direction indicators
- Atmospheric pressure measurements
- Weather condition descriptions

### Interactive Mapping
- Leaflet-based interactive map integration
- Location markers with AQI-coded popups
- Zoom and pan capabilities for detailed exploration
- OpenStreetMap tile layers for accurate geographic representation

### Intelligent Location Services
- City search functionality with autocomplete suggestions
- Geolocation support for automatic position detection
- Support for worldwide locations
- Persistent location preferences

### Health Advisory System
- Context-aware health recommendations based on current AQI
- Category-specific advice (Good, Moderate, Unhealthy, Hazardous)
- Activity recommendations for outdoor exercise
- Mask-wearing guidelines
- Sensitive group advisories

### Alert and Notification System
- Configurable alert thresholds
- Browser push notifications for air quality warnings
- Visual banner alerts with severity indicators
- Persistent alert preferences using local storage
- Three-tier severity system (Advisory, Warning, Severe)

### AI-Powered Assistant
- Conversational AI interface for air quality queries
- Context-aware responses based on current conditions
- Natural language understanding for user questions
- Historical conversation memory
- Personalized health and activity recommendations
- Powered by Groq API for fast response times

### Visual Design
- Premium glassmorphism aesthetic
- Animated particle background for visual appeal
- Smooth transitions and animations
- Responsive layout supporting multiple screen sizes
- Dark theme optimized for extended viewing
- Consistent color-coded severity indicators

## Technical Architecture

### Frontend Technologies
- Pure HTML5, CSS3, and JavaScript (ES6+)
- No framework dependencies for optimal performance
- Modular code structure for maintainability
- Asynchronous API handling with modern fetch API

### External Libraries
- **Chart.js** - Dynamic chart rendering for historical and forecast data
- **Leaflet** - Interactive mapping functionality
- **Font Awesome** - Professional icon set
- **Google Fonts (Inter)** - Clean, modern typography

### API Integration
- **World Air Quality Index (WAQI)** - Primary AQI data source
- **OpenWeather API** - Weather data and geocoding services
- **Groq API** - AI conversation capabilities

### Data Management
- Smart fallback system with simulated data
- Local storage for user preferences
- Automatic retry logic for failed requests
- Time-based data variation for realistic simulations

## Installation and Setup

### Prerequisites
- Modern web browser (Chrome 90+, Firefox 88+, Edge 90+, Safari 14+)
- Internet connection for API access
- HTTPS hosting for production deployment (required for push notifications)

### Configuration

1. Clone or download the repository to your local machine or web server.

2. Update API keys in `script.js`:
   ```javascript
   const TOKEN = "your-waqi-api-token";
   const OPENWEATHER_API_KEY = "your-openweather-api-key";
   const AI_API_KEY = "your-groq-api-key";
   ```

3. Deploy files to a web server or open `index.html` in a browser for local testing.

### API Key Registration

- **WAQI API**: Register at [aqicn.org/api](https://aqicn.org/api/)
- **OpenWeather API**: Register at [openweathermap.org/api](https://openweathermap.org/api)
- **Groq API**: Register at [console.groq.com](https://console.groq.com)

## Usage Guide

### Initial Setup
1. Open the application in your web browser
2. Allow location permissions when prompted for automatic positioning
3. Alternatively, use the search bar to find your city manually

### Navigating the Dashboard
- **Dashboard View**: Overview with AQI gauge, map, and weather metrics
- **Pollutants View**: Detailed breakdown of individual pollutant levels
- **Graphs View**: Historical trends and future forecasts with time range selection

### Configuring Alerts
1. Locate the Alert Settings card in the right sidebar
2. Toggle "Enable Alerts" to activate visual banner notifications
3. Toggle "Push Notifications" to enable browser notifications
4. Grant browser permission when prompted

### Using the AI Assistant
1. Find the AI Assistant card in the left sidebar
2. Type questions about air quality, health effects, or recommendations
3. Receive contextual responses based on current conditions
4. Clear conversation history using the trash icon when needed

### Interpreting AQI Values
- **0-50 (Good)**: Air quality is satisfactory, normal activities recommended
- **51-100 (Moderate)**: Acceptable quality, sensitive individuals should consider precautions
- **101-150 (Unhealthy for Sensitive Groups)**: Sensitive groups should reduce prolonged outdoor exertion
- **151-200 (Unhealthy)**: Everyone may experience health effects, limit outdoor activities
- **201-300 (Very Unhealthy)**: Health alert, avoid outdoor activities
- **301+ (Hazardous)**: Health warning, remain indoors

## Project Structure

```
airsense-main/
├── index.html              # Main HTML structure
├── style.css               # Stylesheet with glassmorphism design
├── script.js               # Core JavaScript functionality
├── README.md               # Project documentation
├── PRODUCTION_READY.md     # Deployment guide
├── FIXES_APPLIED.md        # Development history
└── favicon.png             # Application icon
```

## Browser Compatibility

### Desktop Browsers
- Google Chrome 90 and above
- Mozilla Firefox 88 and above
- Microsoft Edge 90 and above
- Safari 14 and above

### Mobile Browsers
- Chrome for Android
- Safari for iOS 14.4 and above
- Samsung Internet

### Feature Support
- Geolocation API support required for location detection
- Notification API support required for push notifications
- Canvas API support required for particle background
- Local Storage API required for preference persistence

## Performance Considerations

### Optimization Features
- Efficient API call throttling with 60-second intervals
- Lazy loading of map tiles
- Hardware-accelerated CSS animations
- Minimal DOM manipulation for smooth performance
- CDN-hosted external libraries for faster loading

### Resource Usage
- Low bandwidth consumption with optimized API requests
- Minimal memory footprint with efficient data structures
- Battery-efficient with optimized refresh intervals

## Security and Privacy

### Data Handling
- No personal data collection or storage
- Location data used only for air quality queries
- API keys transmitted securely over HTTPS
- No third-party tracking or analytics

### Best Practices
- All API communications use secure HTTPS protocols
- User preferences stored locally (no server-side storage)
- Geolocation requests require explicit user consent
- Push notifications require user permission

## Troubleshooting

### Common Issues

**AQI Data Not Loading**
- Verify internet connection
- Check API key validity
- Confirm API rate limits not exceeded
- Application falls back to simulated data automatically

**Geolocation Not Working**
- Ensure browser permissions are granted
- Verify HTTPS connection in production
- Check device location services are enabled
- Use manual city search as alternative

**Push Notifications Not Appearing**
- Confirm browser supports Notification API
- Grant notification permissions when prompted
- Verify HTTPS connection for production deployment
- Check browser notification settings

**Map Not Displaying**
- Verify internet connection for tile loading
- Check browser console for errors
- Ensure Leaflet library loaded correctly
- Refresh page to reinitialize map

## Development and Customization

### Modifying Default Location
Edit the `fetchCityByName` parameter in `script.js`:
```javascript
fetchCityByName('YourCity');
```

### Adjusting Auto-Refresh Interval
Modify the interval in `startAutoRefresh` function (value in milliseconds):
```javascript
autoRefreshInterval = setInterval(() => {
  // function body
}, 60000); // 60000ms = 1 minute
```

### Customizing Alert Thresholds
Update conditions in `checkAQIAlert` function:
```javascript
if (aqi > 100) { // Modify threshold value
  showAQIAlert(aqi, false, sendPushNotification);
}
```

### Styling Modifications
All visual styles are contained in `style.css`. Key variables:
- Color scheme definitions
- Glassmorphism effects
- Responsive breakpoints
- Animation timings

## Known Limitations

- Real-time data availability depends on monitoring station coverage
- Some remote locations may not have nearby monitoring stations
- API rate limits may affect high-frequency requests
- Push notifications require HTTPS in production environments
- Offline functionality not supported (requires internet connection)

## Future Enhancements

Potential features for future development:
- Progressive Web App (PWA) capabilities
- Offline data caching
- Multi-language support
- Customizable dashboard widgets
- Data export functionality
- Extended forecast ranges
- Social sharing capabilities
- Historical comparison tools

## Credits and Attribution

### Data Sources
- Air Quality Index data provided by World Air Quality Index Project
- Weather data provided by OpenWeather
- Map tiles provided by OpenStreetMap contributors
- AI capabilities powered by Groq

### Third-Party Libraries
- Chart.js by Chart.js Contributors
- Leaflet by Vladimir Agafonkin
- Font Awesome by Fonticons, Inc.
- Inter typeface by Rasmus Andersson

## License

This project is provided as-is for educational and personal use. Please ensure compliance with API provider terms of service when deploying.

## Support and Contact

For issues, questions, or contributions, please refer to the project repository or contact the development team.

## Acknowledgments

Special thanks to the open-source community and API providers who make projects like AirSense possible. This dashboard was developed to promote environmental awareness and help users make informed health decisions based on air quality conditions.

---

**Version**: 1.0.0  
**Last Updated**: October 2026  
**Status**: Production Ready