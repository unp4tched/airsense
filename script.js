const TOKEN = "your-waqi-api-token";
const OPENWEATHER_API_KEY = "your-openweather-api-key";
const AI_API_KEY = "your-groq-api-key";

let currentAQI = null;
let currentLocation = {
  lat: null,
  lon: null,
  name: "Unknown"
};
let map = null;
let historicalChart = null;
let forecastChart = null;
let chatHistory = [];
let alertsEnabled = false;
let pushNotificationsEnabled = false;
let autoRefreshInterval = null;

function initParticleFlowField() {
  const canvas = document.getElementById('particleFlowField');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  
  const particles = [];
  const particleCount = 60;
  
  class Particle {
    constructor() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.size = Math.random() * 2 + 0.5;
      this.speedX = Math.random() * 0.5 + 0.2;
      this.speedY = (Math.random() - 0.5) * 0.2;
      this.opacity = Math.random() * 0.3 + 0.1;
    }
    
    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      
      if (this.x > canvas.width) {
        this.x = -10;
        this.y = Math.random() * canvas.height;
      }
    }
    
    draw() {
      ctx.fillStyle = `rgba(148, 163, 184, ${this.opacity})`;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  
  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }
  
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    particles.forEach(particle => {
      particle.update();
      particle.draw();
    });
    
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 150) {
          ctx.strokeStyle = `rgba(148, 163, 184, ${0.05 * (1 - distance / 150)})`;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
    
    requestAnimationFrame(animate);
  }
  
  animate();
  
  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });
}

function animateAQIGauge(targetValue, duration = 1500) {
  const gaugeProgress = document.getElementById('gaugeProgress');
  const aqiValueElement = document.getElementById('aqiValue');
  const aqiStatusElement = document.getElementById('aqiStatus');
  
  if (!gaugeProgress || !aqiValueElement) return;
  
  const maxValue = 500;
  const circumference = 2 * Math.PI * 85;
  const targetPercentage = Math.min(targetValue / maxValue, 1);
  const targetOffset = circumference - (targetPercentage * circumference);
  
  const category = getAQICategory(targetValue);
  updateGaugeGradient(category.color);
  
  const startTime = performance.now();
  const startValue = 0;
  
  function animate(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easeOut = 1 - Math.pow(1 - progress, 3);
    
    const currentValue = Math.round(startValue + (targetValue - startValue) * easeOut);
    aqiValueElement.textContent = currentValue;
    aqiValueElement.style.color = category.color;
    
    const currentOffset = circumference - (easeOut * targetPercentage * circumference);
    gaugeProgress.style.strokeDashoffset = currentOffset;
    
    aqiStatusElement.textContent = category.label;
    aqiStatusElement.style.color = category.color;
    
    if (progress < 1) {
      requestAnimationFrame(animate);
    }
  }
  
  requestAnimationFrame(animate);
}

function updateGaugeGradient(color) {
  const gradientStart = document.querySelector('.gauge-gradient-start');
  const gradientEnd = document.querySelector('.gauge-gradient-end');
  
  if (gradientStart && gradientEnd) {
    gradientStart.style.stopColor = color;
    gradientEnd.style.stopColor = adjustColorBrightness(color, -20);
  }
}

function adjustColorBrightness(hex, percent) {
  const num = parseInt(hex.replace("#", ""), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = (num >> 8 & 0x00FF) + amt;
  const B = (num & 0x0000FF) + amt;
  
  return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
    (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
    (B < 255 ? B < 1 ? 0 : B : 255))
    .toString(16).slice(1);
}

function getAQICategory(aqi) {
  if (aqi <= 50) {
    return { label: 'Good', color: '#10B981', advice: 'Air quality is excellent. Perfect for outdoor activities.' };
  } else if (aqi <= 100) {
    return { label: 'Moderate', color: '#F59E0B', advice: 'Air quality is acceptable. Sensitive individuals should consider reducing prolonged outdoor exertion.' };
  } else if (aqi <= 150) {
    return { label: 'Unhealthy for Sensitive Groups', color: '#F97316', advice: 'Members of sensitive groups may experience health effects.' };
  } else if (aqi <= 200) {
    return { label: 'Unhealthy', color: '#EF4444', advice: 'Everyone may begin to experience health effects.' };
  } else if (aqi <= 300) {
    return { label: 'Very Unhealthy', color: '#DC2626', advice: 'Health alert: avoid outdoor activities.' };
  } else {
    return { label: 'Hazardous', color: '#991B1B', advice: 'Health warning: stay indoors.' };
  }
}

function animatePollutantSlider(pollutantId, value, maxValue) {
  const fillElement = document.getElementById(`${pollutantId}Fill`);
  const thumbElement = document.getElementById(`${pollutantId}Thumb`);
  const valueElement = document.getElementById(`${pollutantId}Value`);
  
  if (!fillElement || !thumbElement || !valueElement) return;
  
  const percentage = Math.min((value / maxValue) * 100, 100);
  
  let color = '#10B981';
  if (percentage > 75) color = '#EF4444';
  else if (percentage > 50) color = '#F97316';
  else if (percentage > 25) color = '#F59E0B';
  
  setTimeout(() => {
    fillElement.style.width = `${percentage}%`;
    fillElement.style.background = color;
    thumbElement.style.left = `${percentage}%`;
    thumbElement.style.borderColor = color;
  }, 100);
  
  animateNumber(valueElement, 0, value, 1000);
}

function animateNumber(element, start, end, duration) {
  const startTime = performance.now();
  
  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easeOut = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(start + (end - start) * easeOut);
    
    element.textContent = current;
    
    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }
  
  requestAnimationFrame(update);
}

function initTabNavigation() {
  const tabButtons = document.querySelectorAll('.tab-btn');
  const viewSections = document.querySelectorAll('.view-section');
  
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const targetPage = button.getAttribute('data-page');
      
      tabButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      
      viewSections.forEach(section => {
        section.classList.remove('active');
        if (section.id === `${targetPage}View`) {
          section.classList.add('active');
          
          if (targetPage === 'dashboard') {
            setTimeout(() => {
              if (map) {
                map.invalidateSize();
                if (currentLocation.lat && currentLocation.lon) {
                  map.setView([currentLocation.lat, currentLocation.lon], 11);
                }
              } else if (currentLocation.lat && currentLocation.lon) {
                initMap(currentLocation.lat, currentLocation.lon);
              }
            }, 200);
          }
        }
      });
    });
  });
}

function initLocationSearch() {
  const cityInput = document.getElementById('cityInput');
  const citySuggestions = document.getElementById('citySuggestions');
  const locateBtn = document.getElementById('locateBtn');
  
  let searchTimeout;
  
  cityInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    const query = e.target.value.trim();
    
    if (query.length < 2) {
      citySuggestions.classList.remove('active');
      return;
    }
    
    searchTimeout = setTimeout(async () => {
      try {
        const response = await fetch(
          `https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${OPENWEATHER_API_KEY}`
        );
        const cities = await response.json();
        
        if (cities.length > 0) {
          citySuggestions.innerHTML = cities.map(city => `
            <div class="suggestion-item" data-lat="${city.lat}" data-lon="${city.lon}" data-name="${city.name}, ${city.country}">
              ${city.name}, ${city.state || ''} ${city.country}
            </div>
          `).join('');
          citySuggestions.classList.add('active');
          
          document.querySelectorAll('.suggestion-item').forEach(item => {
            item.addEventListener('click', () => {
              const lat = parseFloat(item.getAttribute('data-lat'));
              const lon = parseFloat(item.getAttribute('data-lon'));
              const name = item.getAttribute('data-name');
              
              currentLocation = { lat, lon, name };
              cityInput.value = name;
              citySuggestions.classList.remove('active');
              
              document.getElementById('locationName').textContent = name;
              document.getElementById('stationName').textContent = name;
              
              fetchAQIData(lat, lon);
            });
          });
        } else {
          citySuggestions.classList.remove('active');
        }
      } catch (error) {
        citySuggestions.classList.remove('active');
      }
    }, 300);
  });
  
  locateBtn.addEventListener('click', () => {
    if (navigator.geolocation) {
      locateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Locating...</span>';
      locateBtn.disabled = true;
      
      const timeout = setTimeout(() => {
        locateBtn.innerHTML = '<i class="fas fa-location-crosshairs"></i><span>Use My Location</span>';
        locateBtn.disabled = false;
        showToast('Location request timed out. Please try again or search manually.', 'error');
      }, 10000);
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          clearTimeout(timeout);
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          
          currentLocation = { lat, lon, name: 'Your Location' };
          
          document.getElementById('locationName').textContent = 'Your Location';
          document.getElementById('stationName').textContent = 'Your Location';
          
          fetchAQIData(lat, lon);
          
          locateBtn.innerHTML = '<i class="fas fa-location-crosshairs"></i><span>Use My Location</span>';
          locateBtn.disabled = false;
          showToast('Location found successfully!', 'success');
        },
        (error) => {
          clearTimeout(timeout);
          
          let errorMessage = 'Unable to get your location';
          if (error.code === 1) {
            errorMessage = 'Location permission denied. Please enable location access in browser settings.';
          } else if (error.code === 2) {
            errorMessage = 'Location unavailable. Check your device settings.';
          } else if (error.code === 3) {
            errorMessage = 'Location request timed out. Please try again.';
          }
          
          showToast(errorMessage, 'error');
          locateBtn.innerHTML = '<i class="fas fa-location-crosshairs"></i><span>Use My Location</span>';
          locateBtn.disabled = false;
        },
        {
          enableHighAccuracy: false,
          timeout: 8000,
          maximumAge: 0
        }
      );
    } else {
      showToast('Geolocation is not supported by your browser', 'error');
    }
  });
  
  document.addEventListener('click', (e) => {
    if (!cityInput.contains(e.target) && !citySuggestions.contains(e.target)) {
      citySuggestions.classList.remove('active');
    }
  });
}

async function fetchAQIData(lat, lon, isAutoRefresh = false) {
  try {
    const aqiUrl = `https://api.waqi.info/feed/geo:${lat};${lon}/?token=${TOKEN}`;
    const aqiResponse = await fetch(aqiUrl);
    const aqiData = await aqiResponse.json();
    
    if (aqiData.status !== 'ok' || !aqiData.data || !aqiData.data.aqi) {
      throw new Error('Invalid API response');
    }
    
    const data = aqiData.data;
    currentAQI = parseInt(data.aqi);
    
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${OPENWEATHER_API_KEY}`;
    const weatherResponse = await fetch(weatherUrl);
    const weatherData = await weatherResponse.json();
    
    updateDashboard(data);
    updateWeatherData(weatherData);
    
    const displayName = currentLocation.name || data.city.name;
    document.getElementById('locationName').textContent = displayName;
    document.getElementById('stationName').textContent = displayName;
    
    initMap(lat, lon);
    
    checkAQIAlert(currentAQI, isAutoRefresh);
    
    if (!isAutoRefresh) {
      showToast('Real-time data loaded', 'success');
    }
    
  } catch (error) {
    loadMockData(lat, lon, isAutoRefresh);
    if (!isAutoRefresh) {
      showToast('API unavailable - Using simulated data', 'info');
    }
  }
}

function loadMockData(lat, lon, isAutoRefresh = false) {
  const locationSeed = Math.abs(Math.floor((lat + lon) * 100)) % 100 + 50;
  const timeVariation = Math.floor(Date.now() / 60000) % 20 - 10;
  const mockAQI = Math.max(20, Math.min(200, locationSeed + timeVariation));
  currentAQI = mockAQI;
  
  const seed = Math.abs(Math.floor((lat + lon) * 100));
  
  const mockData = {
    aqi: mockAQI,
    city: {
      name: currentLocation.name || 'Sample Location'
    },
    time: {
      s: new Date().toISOString()
    },
    iaqi: {
      pm25: { v: (seed % 80) + 20 },
      pm10: { v: (seed % 120) + 30 },
      no2: { v: (seed % 70) + 10 },
      o3: { v: (seed % 80) + 20 },
      co: { v: ((seed % 40) / 10 + 0.5).toFixed(1) },
      so2: { v: (seed % 40) + 5 }
    },
    forecast: null
  };
  
  const weatherSeed = Math.abs(Math.floor((lat * lon) * 100));
  const mockWeather = {
    main: {
      temp: (weatherSeed % 15) + 15,
      humidity: (weatherSeed % 40) + 40,
      pressure: (weatherSeed % 30) + 1000
    },
    wind: {
      speed: parseFloat(((weatherSeed % 100) / 10 + 2).toFixed(1)),
      deg: weatherSeed % 360
    },
    weather: [
      { description: 'partly cloudy' }
    ]
  };
  
  updateDashboard(mockData);
  updateWeatherData(mockWeather);
  
  const displayName = currentLocation.name || 'Sample Location';
  document.getElementById('locationName').textContent = displayName;
  document.getElementById('stationName').textContent = displayName;
  
  initMap(lat, lon);
  
  checkAQIAlert(currentAQI, isAutoRefresh);
}

function updateDashboard(data) {
  const aqi = parseInt(data.aqi);
  const category = getAQICategory(aqi);
  
  animateAQIGauge(aqi);
  
  if (data.time && data.time.s) {
    const updateTime = new Date(data.time.s);
    document.getElementById('lastUpdate').textContent = updateTime.toLocaleTimeString();
  }
  
  updateHealthAdvisory(aqi, category);
  
  if (data.iaqi) {
    updatePollutantSliders(data.iaqi);
  }
  
  updateHistoricalChart(data.forecast);
  updateForecastChart(aqi);
  
  checkAQIAlert(aqi);
}

function updateWeatherData(data) {
  if (data.main) {
    document.getElementById('temperature').textContent = `${Math.round(data.main.temp)}°C`;
    document.getElementById('humidity').textContent = `${data.main.humidity}%`;
    document.getElementById('pressure').textContent = `${data.main.pressure} hPa`;
  }
  
  if (data.wind) {
    document.getElementById('windSpeed').textContent = `${data.wind.speed.toFixed(1)} m/s`;
    const direction = getWindDirection(data.wind.deg || 0);
    document.getElementById('windDirection').textContent = direction;
  }
  
  if (data.weather && data.weather[0]) {
    document.getElementById('weatherDesc').textContent = data.weather[0].description;
  }
}

function getWindDirection(degrees) {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(degrees / 45) % 8;
  return directions[index];
}

function updateHealthAdvisory(aqi, category) {
  const severityLabel = document.getElementById('severityLabel');
  const advisoryMessage = document.querySelector('.advisory-message');
  const severityDot = document.querySelector('.severity-dot');
  
  severityLabel.textContent = category.label.toUpperCase();
  severityLabel.style.color = category.color;
  severityDot.style.background = category.color;
  
  advisoryMessage.textContent = category.advice;
  advisoryMessage.style.borderLeftColor = category.color;
  
  const recommendationsContainer = document.querySelector('.advisory-recommendations');
  let recommendations = [];
  
  if (aqi <= 50) {
    recommendations = [
      { icon: 'fa-circle-check', text: 'Safe for outdoor exercise', color: category.color },
      { icon: 'fa-circle-check', text: 'No mask required', color: category.color },
      { icon: 'fa-circle-check', text: 'Open windows freely', color: category.color }
    ];
  } else if (aqi <= 100) {
    recommendations = [
      { icon: 'fa-circle-info', text: 'Sensitive groups: reduce prolonged exertion', color: category.color },
      { icon: 'fa-circle-check', text: 'Generally safe for most people', color: category.color },
      { icon: 'fa-circle-check', text: 'Normal outdoor activities OK', color: category.color }
    ];
  } else if (aqi <= 150) {
    recommendations = [
      { icon: 'fa-triangle-exclamation', text: 'Sensitive groups: avoid prolonged exertion', color: category.color },
      { icon: 'fa-circle-info', text: 'Consider wearing a mask outdoors', color: category.color },
      { icon: 'fa-circle-info', text: 'Limit outdoor time', color: category.color }
    ];
  } else {
    recommendations = [
      { icon: 'fa-circle-xmark', text: 'Everyone: avoid outdoor activities', color: category.color },
      { icon: 'fa-head-side-mask', text: 'Wear N95 mask if going outside', color: category.color },
      { icon: 'fa-house', text: 'Stay indoors, close windows', color: category.color }
    ];
  }
  
  recommendationsContainer.innerHTML = recommendations.map(rec => `
    <div class="recommendation-item">
      <i class="fas ${rec.icon}" style="color: ${rec.color}"></i>
      <span>${rec.text}</span>
    </div>
  `).join('');
}

function updatePollutantSliders(iaqi) {
  if (iaqi.pm25) animatePollutantSlider('pm25', iaqi.pm25.v, 250);
  if (iaqi.pm10) animatePollutantSlider('pm10', iaqi.pm10.v, 350);
  if (iaqi.no2) animatePollutantSlider('no2', iaqi.no2.v, 200);
  if (iaqi.o3) animatePollutantSlider('o3', iaqi.o3.v, 200);
  if (iaqi.co) animatePollutantSlider('co', iaqi.co.v, 15);
  if (iaqi.so2) animatePollutantSlider('so2', iaqi.so2.v, 100);
}

function updateHistoricalChart(forecastData, daysBack = 7) {
  const canvas = document.getElementById('historicalChart');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  
  if (historicalChart) {
    historicalChart.destroy();
  }
  
  const labels = [];
  const data = [];
  
  for (let i = daysBack - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    let label;
    if (daysBack <= 7) {
      label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } else if (daysBack <= 30) {
      label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } else {
      label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
    
    labels.push(label);
    
    const baseAQI = currentAQI || 50;
    const variation = (Math.random() - 0.5) * 40;
    data.push(Math.max(0, Math.round(baseAQI + variation)));
  }
  
  historicalChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'AQI',
        data: data,
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderWidth: 3,
        tension: 0.4,
        fill: true,
        pointRadius: daysBack > 30 ? 2 : 4,
        pointHoverRadius: daysBack > 30 ? 4 : 6,
        pointBackgroundColor: '#10B981',
        pointBorderColor: '#0B0F19',
        pointBorderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(11, 15, 25, 0.9)',
          titleColor: '#F8FAFC',
          bodyColor: '#94A3B8',
          borderColor: '#242C3D',
          borderWidth: 1,
          padding: 12,
          displayColors: false
        }
      },
      scales: {
        x: {
          grid: { color: 'rgba(255, 255, 255, 0.05)', drawBorder: false },
          ticks: { 
            color: '#64748B', 
            font: { size: 11, weight: '500' },
            maxRotation: 45,
            minRotation: 0
          }
        },
        y: {
          beginAtZero: true,
          grid: { color: 'rgba(255, 255, 255, 0.05)', drawBorder: false },
          ticks: { color: '#64748B', font: { size: 11, weight: '500' } }
        }
      }
    }
  });
}

function initChartControls() {
  const chartButtons = document.querySelectorAll('.chart-control-btn');
  
  if (chartButtons.length === 0) return;
  
  chartButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const range = button.getAttribute('data-range');
      let days = 7;
      
      if (range === '30d') days = 30;
      else if (range === '90d') days = 90;
      
      chartButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      
      updateHistoricalChart(null, days);
    });
  });
}

function updateForecastChart(currentAQI) {
  const canvas = document.getElementById('forecastChart');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  
  if (forecastChart) {
    forecastChart.destroy();
  }
  
  const hours = 12;
  const labels = [];
  const data = [];
  
  for (let i = 0; i < hours; i++) {
    const hour = (new Date().getHours() + i) % 24;
    labels.push(`${hour}:00`);
    
    let forecast = currentAQI || 50;
    if (hour >= 7 && hour <= 9) forecast += 20;
    if (hour >= 17 && hour <= 19) forecast += 25;
    if (hour >= 22 || hour <= 5) forecast -= 15;
    
    data.push(Math.max(0, forecast + (Math.random() - 0.5) * 10));
  }
  
  forecastChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Forecast AQI',
        data: data,
        borderColor: '#F59E0B',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        borderWidth: 3,
        tension: 0.4,
        fill: true,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: '#F59E0B',
        pointBorderColor: '#0B0F19',
        pointBorderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(11, 15, 25, 0.9)',
          titleColor: '#F8FAFC',
          bodyColor: '#94A3B8',
          borderColor: '#242C3D',
          borderWidth: 1,
          padding: 12,
          displayColors: false
        }
      },
      scales: {
        x: {
          grid: { color: 'rgba(255, 255, 255, 0.05)', drawBorder: false },
          ticks: { color: '#64748B', font: { size: 11, weight: '500' } }
        },
        y: {
          beginAtZero: true,
          grid: { color: 'rgba(255, 255, 255, 0.05)', drawBorder: false },
          ticks: { color: '#64748B', font: { size: 11, weight: '500' } }
        }
      }
    }
  });
}

function initMap(lat, lon) {
  const mapContainer = document.getElementById('map');
  const mapLoading = document.getElementById('mapLoading');
  
  if (!mapContainer) return;
  
  try {
    if (mapLoading) {
      mapLoading.classList.remove('hidden');
    }
    
    if (map) {
      map.remove();
      map = null;
    }
    
    setTimeout(() => {
      try {
        map = L.map('map', {
          center: [lat, lon],
          zoom: 11,
          zoomControl: true,
          attributionControl: true
        });
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 18
        }).addTo(map);
        
        const aqiCategory = getAQICategory(currentAQI || 50);
        const marker = L.marker([lat, lon]).addTo(map);
        marker.bindPopup(`
          <div style="font-family: Inter, sans-serif; padding: 0.5rem;">
            <strong style="font-size: 14px; color: ${aqiCategory.color};">${currentLocation.name}</strong><br>
            <span style="font-size: 13px; margin-top: 0.25rem; display: block;">AQI: <strong style="color: ${aqiCategory.color};">${currentAQI || 'N/A'}</strong></span>
            <span style="font-size: 11px; color: #94A3B8; display: block; margin-top: 0.25rem;">${aqiCategory.label}</span>
          </div>
        `).openPopup();
        
        map.whenReady(() => {
          setTimeout(() => {
            if (mapLoading) {
              mapLoading.classList.add('hidden');
            }
          }, 500);
        });
        
        setTimeout(() => {
          if (map) {
            map.invalidateSize();
          }
        }, 300);
        
      } catch (error) {
        if (mapLoading) {
          mapLoading.innerHTML = `
            <i class="fas fa-exclamation-triangle" style="font-size: 2rem; color: var(--color-unhealthy);"></i>
            <p style="margin-top: 1rem; color: var(--color-text-secondary);">Failed to load map</p>
          `;
        }
      }
    }, 300);
    
  } catch (error) {
    if (mapLoading) {
      mapLoading.innerHTML = `
        <i class="fas fa-exclamation-triangle" style="font-size: 2rem; color: var(--color-unhealthy);"></i>
        <p style="margin-top: 1rem; color: var(--color-text-secondary);">Failed to load map</p>
      `;
    }
  }
}

function initAIChat() {
  const chatInput = document.getElementById('chatInput');
  const sendBtn = document.getElementById('sendMessageBtn');
  const chatMessages = document.getElementById('chatMessages');
  const clearBtn = document.getElementById('clearChatBtn');
  
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      chatHistory = [];
      const welcomeMsg = `
        <div class="chat-welcome-compact">
          <i class="fas fa-robot" style="font-size: 2rem; color: #10B981; margin-bottom: 0.5rem;"></i>
          <p style="color: var(--color-text-secondary); font-size: 0.75rem; text-align: center;">Ask me about air quality!</p>
        </div>
      `;
      chatMessages.innerHTML = welcomeMsg;
      showToast('Conversation cleared', 'info');
    });
  }
  
  async function sendMessage() {
    const message = chatInput.value.trim();
    if (!message) return;
    
    addChatMessage('user', message);
    chatInput.value = '';
    
    const thinkingMsg = addChatMessage('ai', 'Thinking...', true);
    
    const aqiContext = `Current Air Quality Data:
- Location: ${currentLocation.name}
- AQI: ${currentAQI || 'N/A'}
- Temperature: ${document.getElementById('temperature').textContent}
- Humidity: ${document.getElementById('humidity').textContent}
- Wind Speed: ${document.getElementById('windSpeed').textContent}`;
    
    chatHistory.push({
      role: 'user',
      content: message
    });
    
    let conversationContext = '';
    if (chatHistory.length > 1) {
      conversationContext = '\n\nPrevious conversation:\n' + 
        chatHistory.slice(-6).map(msg => 
          `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`
        ).join('\n');
    }
    
    const systemPrompt = `You are a friendly and knowledgeable air quality expert assistant. You help people understand air quality and make healthy decisions.

${aqiContext}${conversationContext}

Based on this context, provide a natural, conversational, and helpful response to the user's question. Be friendly, concise (2-4 sentences), and give specific advice when relevant. Remember previous messages in this conversation.`;
    
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${AI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'openai/gpt-oss-120b',
          messages: [
            {
              role: 'system',
              content: systemPrompt
            },
            {
              role: 'user',
              content: message
            }
          ],
          temperature: 0.8,
          max_tokens: 300,
          top_p: 0.9
        })
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      thinkingMsg.remove();
      
      if (data.choices && data.choices[0] && data.choices[0].message) {
        const aiResponse = data.choices[0].message.content.trim();
        addChatMessage('ai', aiResponse);
        
        chatHistory.push({
          role: 'assistant',
          content: aiResponse
        });
      } else {
        throw new Error('Invalid response format from API');
      }
      
    } catch (error) {
      thinkingMsg.remove();
      
      const fallbackResponse = getContextualResponse(message, currentAQI);
      addChatMessage('ai', fallbackResponse);
      
      chatHistory.push({
        role: 'assistant',
        content: fallbackResponse
      });
    }
  }
  
  function getContextualResponse(message, aqi) {
    const msgLower = message.toLowerCase();
    const category = getAQICategory(aqi || 50);
    
    if (msgLower.includes('how') && (msgLower.includes('you') || msgLower.includes('doing'))) {
      return `I'm doing great, thanks for asking! I'm here to help you understand the air quality. Currently, it's ${category.label.toLowerCase()} with an AQI of ${aqi || 'N/A'}. What would you like to know?`;
    }
    
    if (msgLower.includes('hello') || msgLower.includes('hi') || msgLower.includes('hey')) {
      return `Hey there! 👋 The air quality right now is ${category.label.toLowerCase()} (AQI: ${aqi || 'N/A'}). ${category.advice} What can I help you with?`;
    }
    
    if (msgLower.includes('thanks') || msgLower.includes('thank')) {
      return `You're welcome! Feel free to ask me anything else about the air quality or health recommendations. I'm here to help! 😊`;
    }
    
    if (msgLower.includes('safe') || msgLower.includes('okay') || msgLower.includes('outside')) {
      if (aqi <= 50) {
        return `Yes! With an AQI of ${aqi}, it's perfectly safe to go outside. The air quality is excellent - great for any outdoor activities! 🌟`;
      } else if (aqi <= 100) {
        return `It's generally okay to go outside with an AQI of ${aqi}. Most people are fine, though sensitive individuals should be cautious with prolonged outdoor activities.`;
      } else if (aqi <= 150) {
        return `With an AQI of ${aqi}, sensitive groups should limit outdoor time. If you have asthma or heart conditions, it's best to stay indoors or wear a mask outside.`;
      } else {
        return `I'd recommend limiting outdoor time with an AQI of ${aqi}. The air quality is unhealthy - stay indoors when possible and wear an N95 mask if you must go out.`;
      }
    }
    
    if (msgLower.includes('mask') || msgLower.includes('wear')) {
      if (aqi <= 50) {
        return `No need for a mask! The air is clean with an AQI of ${aqi}. Breathe easy! 😊`;
      } else if (aqi <= 100) {
        return `Most people don't need a mask at AQI ${aqi}, but if you're sensitive to air pollution or planning prolonged outdoor activity, it wouldn't hurt to wear one.`;
      } else {
        return `Yes, definitely wear a mask! At AQI ${aqi}, an N95 mask will help protect your lungs from harmful pollutants. Better safe than sorry!`;
      }
    }
    
    if (msgLower.includes('exercise') || msgLower.includes('run') || msgLower.includes('workout') || msgLower.includes('jog')) {
      if (aqi <= 50) {
        return `Perfect day for exercise! AQI is ${aqi}, so go ahead and enjoy that workout. Your lungs will thank you! 💪`;
      } else if (aqi <= 100) {
        return `You can exercise, but maybe keep it moderate. At AQI ${aqi}, light to moderate exercise is fine, but listen to your body and reduce intensity if you feel any discomfort.`;
      } else {
        return `I'd skip outdoor exercise today. With AQI at ${aqi}, stick to indoor workouts to protect your respiratory system. Hit the gym instead! 🏋️`;
      }
    }
    
    if (msgLower.includes('why') || msgLower.includes('cause') || msgLower.includes('reason')) {
      return `Air quality is affected by various pollutants like PM2.5, PM10, NO₂, and O₃. These come from vehicle emissions, industrial activity, wildfires, and weather conditions. At AQI ${aqi}, ${category.advice.toLowerCase()}`;
    }
    
    if (msgLower.includes('better') || msgLower.includes('improve') || msgLower.includes('when')) {
      return `Air quality typically improves when wind disperses pollutants, after rain, or when emission sources decrease. Check the forecast tab for trends! Currently at AQI ${aqi}, which is ${category.label.toLowerCase()}.`;
    }
    
    if (msgLower.includes('what') && (msgLower.includes('do') || msgLower.includes('should'))) {
      if (aqi <= 50) {
        return `With excellent air quality (AQI ${aqi}), enjoy outdoor activities! It's a great day for exercise, walking, or any outdoor fun. No precautions needed! 🌞`;
      } else if (aqi <= 100) {
        return `At AQI ${aqi}, most activities are fine. Just be mindful if you're sensitive to air pollution. Reduce intense outdoor activities if you notice any discomfort.`;
      } else {
        return `With AQI at ${aqi}, limit outdoor exposure. Stay indoors when possible, keep windows closed, use an air purifier if available, and wear an N95 mask if you go outside.`;
      }
    }
    
    return `Based on the current AQI of ${aqi} (${category.label}), ${category.advice.toLowerCase()} Feel free to ask me about masks, outdoor activities, exercise, or health effects! 🌍`;
  }
  
  function addChatMessage(sender, text, isThinking = false) {
    const welcomeMsg = chatMessages.querySelector('.chat-welcome-compact');
    if (welcomeMsg) welcomeMsg.remove();
    
    const msgDiv = document.createElement('div');
    msgDiv.className = `chat-message ${sender}`;
    msgDiv.textContent = text;
    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    return msgDiv;
  }
  
  if (sendBtn) {
    sendBtn.addEventListener('click', sendMessage);
  }
  
  if (chatInput) {
    chatInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        sendMessage();
      }
    });
  }
}

function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  
  if (type === 'error') {
    toast.style.borderLeftColor = '#EF4444';
  } else if (type === 'success') {
    toast.style.borderLeftColor = '#10B981';
  }
  
  container.appendChild(toast);
  
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100px)';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

function initAlerts() {
  const alertsToggle = document.getElementById('alertsToggle');
  const pushToggle = document.getElementById('pushToggle');
  
  alertsEnabled = localStorage.getItem('alertsEnabled') === 'true';
  pushNotificationsEnabled = localStorage.getItem('pushNotificationsEnabled') === 'true';
  
  if (alertsToggle) {
    alertsToggle.checked = alertsEnabled;
    alertsToggle.addEventListener('change', (e) => {
      alertsEnabled = e.target.checked;
      localStorage.setItem('alertsEnabled', alertsEnabled);
      
      if (alertsEnabled) {
        showToast('Air quality alerts enabled', 'success');
        checkAQIAlert(currentAQI);
      } else {
        showToast('Air quality alerts disabled', 'info');
        hideAlertBanner();
      }
    });
  }
  
  if (pushToggle) {
    pushToggle.checked = pushNotificationsEnabled;
    pushToggle.addEventListener('change', async (e) => {
      if (e.target.checked) {
        if ('Notification' in window) {
          const permission = await Notification.requestPermission();
          if (permission === 'granted') {
            pushNotificationsEnabled = true;
            localStorage.setItem('pushNotificationsEnabled', 'true');
            showToast('Push notifications enabled', 'success');
          } else {
            e.target.checked = false;
            showToast('Notification permission denied', 'error');
          }
        } else {
          e.target.checked = false;
          showToast('Notifications not supported by browser', 'error');
        }
      } else {
        pushNotificationsEnabled = false;
        localStorage.setItem('pushNotificationsEnabled', 'false');
        showToast('Push notifications disabled', 'info');
      }
    });
  }
}

function checkAQIAlert(aqi, sendPushNotification = false) {
  if (!alertsEnabled || !aqi) return;
  
  if (aqi > 100) {
    showAQIAlert(aqi, false, sendPushNotification);
  } else {
    hideAlertBanner();
  }
}

function showAQIAlert(aqi, isTest = false, sendPushNotification = false) {
  const alertBanner = document.getElementById('alertBanner');
  const alertTitle = document.getElementById('alertTitle');
  const alertMessage = document.getElementById('alertMessage');
  
  if (!alertBanner) return;
  
  const category = getAQICategory(aqi);
  let title = 'Air Quality Alert';
  let message = `AQI is ${aqi} (${category.label})`;
  
  if (isTest) {
    title = 'Test Alert';
    message = `This is a test alert. Current AQI: ${aqi}`;
    sendPushNotification = true;
  } else {
    if (aqi > 200) {
      title = '⚠️ Severe Air Quality Alert';
      message = `AQI is ${aqi} - Very Unhealthy! Stay indoors and keep windows closed.`;
    } else if (aqi > 150) {
      title = '⚠️ Air Quality Warning';
      message = `AQI is ${aqi} - Unhealthy! Avoid outdoor activities and wear a mask.`;
    } else if (aqi > 100) {
      title = '⚠️ Air Quality Advisory';
      message = `AQI is ${aqi} - Unhealthy for sensitive groups. Limit outdoor exposure.`;
    }
  }
  
  alertTitle.textContent = title;
  alertMessage.textContent = message;
  alertBanner.classList.add('active');
  
  if (sendPushNotification && pushNotificationsEnabled && 'Notification' in window && Notification.permission === 'granted') {
    new Notification(title, {
      body: message,
      icon: 'favicon.png',
      badge: 'favicon.png',
      tag: 'aqi-alert',
      requireInteraction: true
    });
  }
}

function hideAlertBanner() {
  const alertBanner = document.getElementById('alertBanner');
  if (alertBanner) {
    alertBanner.classList.remove('active');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const dismissBtn = document.getElementById('dismissAlert');
  if (dismissBtn) {
    dismissBtn.addEventListener('click', hideAlertBanner);
  }
});

function startAutoRefresh() {
  if (autoRefreshInterval) {
    clearInterval(autoRefreshInterval);
  }
  
  autoRefreshInterval = setInterval(() => {
    if (currentLocation.lat && currentLocation.lon) {
      fetchAQIData(currentLocation.lat, currentLocation.lon, true);
    }
  }, 60000);
}

function stopAutoRefresh() {
  if (autoRefreshInterval) {
    clearInterval(autoRefreshInterval);
    autoRefreshInterval = null;
  }
}

function initApp() {
  try {
    initParticleFlowField();
    initTabNavigation();
    initLocationSearch();
    initChartControls();
    initAIChat();
    initAlerts();
    
    fetchCityByName('Lucknow');
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          currentLocation = {
            lat: position.coords.latitude,
            lon: position.coords.longitude,
            name: 'Your Location'
          };
          fetchAQIData(currentLocation.lat, currentLocation.lon);
        },
        (error) => {
          
        }
      );
    }
    
    startAutoRefresh();
    
  } catch (error) {
    
  }
}

async function fetchCityByName(cityName) {
  try {
    const response = await fetch(`https://api.waqi.info/feed/${cityName}/?token=${TOKEN}`);
    const data = await response.json();
    
    if (data.status === 'ok' && data.data && data.data.city && data.data.city.geo) {
      const lat = data.data.city.geo[0];
      const lon = data.data.city.geo[1];
      currentLocation = { lat, lon, name: cityName + ', India' };
      
      document.getElementById('locationName').textContent = currentLocation.name;
      document.getElementById('stationName').textContent = currentLocation.name;
      
      currentAQI = parseInt(data.data.aqi);
      updateDashboard(data.data);
      
      const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${OPENWEATHER_API_KEY}`;
      const weatherResponse = await fetch(weatherUrl);
      const weatherData = await weatherResponse.json();
      updateWeatherData(weatherData);
      
      setTimeout(() => {
        try {
          initMap(lat, lon);
        } catch (error) {
          
        }
      }, 500);
      
      checkAQIAlert(currentAQI);
      
    } else {
      throw new Error('City not found');
    }
  } catch (error) {
    currentLocation = { lat: 26.8467, lon: 80.9462, name: 'Lucknow, India' };
    loadMockData(currentLocation.lat, currentLocation.lon);
    
    setTimeout(() => {
      try {
        initMap(currentLocation.lat, currentLocation.lon);
      } catch (error) {
        
      }
    }, 500);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
