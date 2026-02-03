/**
 * WEATHER ML DASHBOARD - ENHANCED VERSION
 * Premium Fluid Experience with Smooth Animations
 * Created by: Rudra Kumar Gupta
 * Portfolio: https://rudraportfolio-five.vercel.app/
 * UPDATED: Time-based sun/moon logic added
 * FIXED: Linear Regression correctly shown as best model
 */

// ============================================================================
// CONFIGURATION
// ============================================================================

const WEATHER_API_KEY = '3274be077bd856c353d108804ce44f32';
const WEATHER_API_URL = 'https://api.openweathermap.org/data/2.5';

// Major Indian Cities - Comprehensive List
const INDIAN_CITIES = [
  // Metro Cities
  { name: 'Mumbai', state: 'Maharashtra', category: 'Metro' },
  { name: 'Delhi', state: 'Delhi', category: 'Metro' },
  { name: 'Bangalore', state: 'Karnataka', category: 'Metro' },
  { name: 'Hyderabad', state: 'Telangana', category: 'Metro' },
  { name: 'Chennai', state: 'Tamil Nadu', category: 'Metro' },
  { name: 'Kolkata', state: 'West Bengal', category: 'Metro' },

  // Tier 1 Cities
  { name: 'Pune', state: 'Maharashtra', category: 'Tier 1' },
  { name: 'Ahmedabad', state: 'Gujarat', category: 'Tier 1' },
  { name: 'Jaipur', state: 'Rajasthan', category: 'Tier 1' },
  { name: 'Surat', state: 'Gujarat', category: 'Tier 1' },
  { name: 'Lucknow', state: 'Uttar Pradesh', category: 'Tier 1' },
  { name: 'Kanpur', state: 'Uttar Pradesh', category: 'Tier 1' },
  { name: 'Nagpur', state: 'Maharashtra', category: 'Tier 1' },
  { name: 'Indore', state: 'Madhya Pradesh', category: 'Tier 1' },
  { name: 'Thane', state: 'Maharashtra', category: 'Tier 1' },
  { name: 'Bhopal', state: 'Madhya Pradesh', category: 'Tier 1' },
  { name: 'Visakhapatnam', state: 'Andhra Pradesh', category: 'Tier 1' },
  { name: 'Patna', state: 'Bihar', category: 'Tier 1' },
  { name: 'Vadodara', state: 'Gujarat', category: 'Tier 1' },
  { name: 'Ghaziabad', state: 'Uttar Pradesh', category: 'Tier 1' },

  // Tier 2 Cities
  { name: 'Ludhiana', state: 'Punjab', category: 'Tier 2' },
  { name: 'Agra', state: 'Uttar Pradesh', category: 'Tier 2' },
  { name: 'Nashik', state: 'Maharashtra', category: 'Tier 2' },
  { name: 'Faridabad', state: 'Haryana', category: 'Tier 2' },
  { name: 'Meerut', state: 'Uttar Pradesh', category: 'Tier 2' },
  { name: 'Rajkot', state: 'Gujarat', category: 'Tier 2' },
  { name: 'Varanasi', state: 'Uttar Pradesh', category: 'Tier 2' },
  { name: 'Srinagar', state: 'Jammu and Kashmir', category: 'Tier 2' },
  { name: 'Amritsar', state: 'Punjab', category: 'Tier 2' },
  { name: 'Allahabad', state: 'Uttar Pradesh', category: 'Tier 2' },
  { name: 'Ranchi', state: 'Jharkhand', category: 'Tier 2' },
  { name: 'Howrah', state: 'West Bengal', category: 'Tier 2' },
  { name: 'Coimbatore', state: 'Tamil Nadu', category: 'Tier 2' },
  { name: 'Jabalpur', state: 'Madhya Pradesh', category: 'Tier 2' },
  { name: 'Gwalior', state: 'Madhya Pradesh', category: 'Tier 2' },
  { name: 'Vijayawada', state: 'Andhra Pradesh', category: 'Tier 2' },
  { name: 'Jodhpur', state: 'Rajasthan', category: 'Tier 2' },
  { name: 'Madurai', state: 'Tamil Nadu', category: 'Tier 2' },
  { name: 'Raipur', state: 'Chhattisgarh', category: 'Tier 2' },
  { name: 'Kota', state: 'Rajasthan', category: 'Tier 2' },
  { name: 'Chandigarh', state: 'Chandigarh', category: 'Tier 2' },
  { name: 'Guwahati', state: 'Assam', category: 'Tier 2' },
  { name: 'Solapur', state: 'Maharashtra', category: 'Tier 2' },
  { name: 'Hubli', state: 'Karnataka', category: 'Tier 2' },
  { name: 'Mysore', state: 'Karnataka', category: 'Tier 2' }
];

let currentCity = 'Nagpur';
let isLoading = false;

// ============================================================================
// TIME-BASED WEATHER ICON FUNCTION (NEW!)
// ============================================================================

/**
 * Get weather icon based on weather condition AND time of day
 * Shows sun emoji during day (6 AM - 6 PM), moon at night
 */
function getWeatherIconByTime(iconCode) {
  const now = new Date();
  const hour = now.getHours();
  const isDaytime = hour >= 6 && hour < 18; // 6 AM to 6 PM is day

  // Map of weather conditions
  const weatherIcons = {
    // Clear sky
    '01d': isDaytime ? '☀️' : '🌙',
    '01n': '🌙',

    // Few clouds
    '02d': isDaytime ? '⛅' : '☁️',
    '02n': '☁️',

    // Scattered clouds
    '03d': '☁️',
    '03n': '☁️',

    // Broken clouds
    '04d': '☁️',
    '04n': '☁️',

    // Shower rain
    '09d': '🌧️',
    '09n': '🌧️',

    // Rain
    '10d': isDaytime ? '🌦️' : '🌧️',
    '10n': '🌧️',

    // Thunderstorm
    '11d': '⛈️',
    '11n': '⛈️',

    // Snow
    '13d': '❄️',
    '13n': '❄️',

    // Mist/Fog
    '50d': '🌫️',
    '50n': '🌫️'
  };

  return weatherIcons[iconCode] || (isDaytime ? '☀️' : '🌙');
}

// ============================================================================
// INITIALIZATION
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
  console.log('%c🌤️ Weather ML Dashboard Initializing...', 'font-size: 16px; font-weight: bold; color: #60a5fa;');
  console.log('%c📍 Created by: Rudra Kumar Gupta', 'font-size: 14px; color: #22c55e;');
  console.log('%c🔗 Portfolio: https://rudraportfolio-five.vercel.app/', 'font-size: 12px; color: #FFD700;');

  initializeApp();
});

async function initializeApp() {
  // Add smooth fade-in effect
  document.body.style.opacity = '0';
  setTimeout(() => {
    document.body.style.transition = 'opacity 0.6s ease';
    document.body.style.opacity = '1';
  }, 100);

  // Setup navigation
  setupNavigation();

  // Setup city search
  setupCitySearch();

  // Setup modal close handlers
  setupModalHandlers();

  // Load weather for Nagpur with smooth transition
  await loadWeatherData(currentCity);

  // Load ML model data
  loadMLModelData();

  // Add keyboard navigation
  setupKeyboardNavigation();
}

// ============================================================================
// KEYBOARD NAVIGATION
// ============================================================================

function setupKeyboardNavigation() {
  document.addEventListener('keydown', (e) => {
    // ESC to close modals
    if (e.key === 'Escape') {
      closeAllModals();
    }

    // Ctrl/Cmd + K to focus search
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      document.getElementById('citySearch').focus();
    }
  });
}

// ============================================================================
// NAVIGATION SETUP
// ============================================================================

// ============================================================================
// MAP FUNCTIONALITY (LEAFLET.JS)
// ============================================================================

let map;
let marker;

function initMap() {
  const mapEl = document.getElementById('mapCity');
  if (!mapEl) return;

  // Visual Debugging: Clear previous content if it was an error
  // mapEl.innerHTML = ''; 

  if (map) {
    try { map.invalidateSize(); } catch (e) {/* ignore */ }
    return;
  }

  // 1. Check Library
  if (typeof L === 'undefined') {
    mapEl.innerHTML = `<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;color:#333;text-align:center;padding:10px;">
      <h3 style="color:#d9534f">Map Library Error</h3>
      <p>Leaflet.js could not be loaded.</p>
      <p style="font-size:12px;opacity:0.8">Check 'frontend/lib/leaflet.js' exists.</p>
    </div>`;
    return;
  }

  try {
    // 2. Initialize Map
    // Ensure container is empty before initializing to prevent "Map container is already initialized" error
    if (mapEl._leaflet_id) {
      mapEl.innerHTML = ''; // Hard reset if needed, though hazardous
      // better to just try getting the map instance if we could.
      // For now, let's assume if map variable is null, we can init.
    }

    map = L.map('mapCity', {
      zoomControl: true, // Explicitly enable controls
      attributionControl: false // Cleaner look
    }).setView([20.5937, 78.9629], 5);

    // 3. Add Tile Layer (OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap'
    }).addTo(map);

    // 4. Force Resize via ResizeObserver (Robust for Modals)
    const resizeObserver = new ResizeObserver(() => {
      if (map) map.invalidateSize();
    });
    resizeObserver.observe(mapEl);

    // Initial resize attempts
    setTimeout(() => { map.invalidateSize(); }, 100);
    setTimeout(() => { map.invalidateSize(); }, 500);

  } catch (e) {
    console.error("Map Logic Error:", e);
    mapEl.style.background = '#ffe6e6';
    mapEl.innerHTML = `<div style="padding:20px;color:#cc0000;text-align:center;">
      <strong>Map Error:</strong><br>${e.message}
    </div>`;
  }
}

function updateMapMarker(lat, lon, cityName) {
  if (!map) {
    initMap();
    if (!map) return; // Still failed
  }

  try {
    // Update marker
    if (marker) {
      marker.setLatLng([lat, lon]);
    } else {
      marker = L.marker([lat, lon]).addTo(map);
    }

    // Explicitly open popup
    marker.bindPopup(`<b>${cityName}</b>`).openPopup();

    // Pan and refresh
    map.setView([lat, lon], 6);
    map.invalidateSize();
  } catch (e) {
    console.warn("Marker update skipped:", e);
  }
}

// ============================================================================
// NAVIGATION SETUP
// ============================================================================

function setupNavigation() {
  const navButtons = document.querySelectorAll('.nav-btn:not(.nav-portfolio)');

  navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const view = btn.dataset.view;

      // Update active button with smooth transition
      navButtons.forEach(b => {
        b.classList.remove('active');
      });

      // Add slight delay for smooth animation
      setTimeout(() => {
        btn.classList.add('active');
      }, 50);

      // Handle view
      switch (view) {
        case 'weather':
          closeAllModals();
          break;
        case 'cities':
          openModal('citiesModal');
          loadCitiesList();
          break;
        case 'map':
          openModal('mapModal');
          document.getElementById('mapCity').textContent = ''; // Clear fallback text

          // Force multiple resize checks to catch transition end
          initMap();
          if (map) map.invalidateSize();

          setTimeout(() => { if (map) map.invalidateSize(); }, 100);
          setTimeout(() => { if (map) map.invalidateSize(); }, 300); // Typical transition time
          setTimeout(() => { if (map) map.invalidateSize(); }, 500);
          break;
        case 'analytics':
          openModal('analyticsModal');
          break;
        case 'settings':
          openModal('settingsModal');
          break;
      }
    });
  });
}

// ============================================================================
// MODAL FUNCTIONS - Enhanced with Animations
// ============================================================================

function openModal(modalId) {
  closeAllModals();
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('hidden');
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';

    // Focus management for accessibility
    const firstFocusable = modal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (firstFocusable) {
      setTimeout(() => firstFocusable.focus(), 100);
    }
  }
}

function closeAllModals() {
  document.querySelectorAll('.modal').forEach(m => {
    m.classList.add('hidden');
  });
  // Restore body scroll
  document.body.style.overflow = '';
}

function setupModalHandlers() {
  // Close on X button
  document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', closeAllModals);
  });

  // Close on outside click
  document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeAllModals();
      }
    });
  });
}

// ============================================================================
// CITY SEARCH FUNCTIONALITY - Enhanced
// ============================================================================

function setupCitySearch() {
  const searchInput = document.getElementById('citySearch');
  const dropdown = document.getElementById('cityDropdown');
  let searchTimeout;

  searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);

    // Debounce search for better performance
    searchTimeout = setTimeout(() => {
      const query = e.target.value.toLowerCase();

      if (query.length === 0) {
        dropdown.classList.add('hidden');
        return;
      }

      const filtered = INDIAN_CITIES.filter(city =>
        city.name.toLowerCase().includes(query) ||
        city.state.toLowerCase().includes(query)
      );

      displayCityDropdown(filtered, dropdown);
    }, 150); // Smooth debounce delay
  });

  // Enhanced focus/blur effects
  searchInput.addEventListener('focus', () => {
    searchInput.parentElement.style.transform = 'scale(1.01)';
  });

  searchInput.addEventListener('blur', () => {
    searchInput.parentElement.style.transform = 'scale(1)';
  });

  // Close dropdown on outside click
  document.addEventListener('click', (e) => {
    if (!searchInput.contains(e.target) && !dropdown.contains(e.target)) {
      dropdown.classList.add('hidden');
    }
  });
}

function displayCityDropdown(cities, dropdown) {
  if (cities.length === 0) {
    dropdown.innerHTML = '<div class="city-item" style="text-align: center; color: var(--text-secondary);">No cities found</div>';
    dropdown.classList.remove('hidden');
    return;
  }

  dropdown.innerHTML = cities.map((city, index) => `
    <div class="city-item" data-city="${city.name}" style="animation-delay: ${index * 0.03}s">
      <strong>${city.name}</strong>, ${city.state}
    </div>
  `).join('');

  dropdown.classList.remove('hidden');

  dropdown.querySelectorAll('.city-item').forEach(item => {
    item.addEventListener('click', async () => {
      const cityName = item.dataset.city;
      if (cityName) {
        currentCity = cityName;
        document.getElementById('citySearch').value = '';
        dropdown.classList.add('hidden');
        await loadWeatherDataWithTransition(cityName);
      }
    });
  });
}

// ============================================================================
// CITIES LIST MODAL - Enhanced
// ============================================================================

function loadCitiesList() {
  const container = document.getElementById('citiesList');
  container.innerHTML = INDIAN_CITIES.map((city, index) => `
    <button class="city-btn" data-city="${city.name}" 
            style="animation: dayItemSlide 0.4s ease ${index * 0.03}s both;">
      📍 ${city.name}
    </button>
  `).join('');

  // Add click event listeners
  container.querySelectorAll('.city-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const cityName = btn.dataset.city;
      currentCity = cityName;
      closeAllModals();
      await loadWeatherDataWithTransition(cityName);
    });
  });
}

// ============================================================================
// WEATHER DATA FUNCTIONS - Enhanced with Loading States
// ============================================================================

async function loadWeatherDataWithTransition(city) {
  if (isLoading) return;

  // Add loading state
  isLoading = true;
  const content = document.querySelector('.content');
  content.classList.add('loading');

  try {
    await loadWeatherData(city);
  } finally {
    // Remove loading state with smooth transition
    setTimeout(() => {
      content.classList.remove('loading');
      isLoading = false;
    }, 300);
  }
}

async function loadWeatherData(city) {
  try {
    console.log(`🔄 Loading weather for ${city}...`);

    // Get both Current and Forecast for complete data
    const [currentWeather, forecastData] = await Promise.all([
      fetchCurrentWeather(city),
      fetchForecastData(city)
    ]);

    // Update UI with smooth transitions
    lastWeatherData = { current: currentWeather, forecast: forecastData }; // Store data
    await updateWeatherUISmooth(currentWeather, forecastData);
    updateHourlyForecast(forecastData.list.slice(0, 6));
    updateWeeklyForecast(forecastData.list);

    console.log('✅ Weather data loaded successfully!');
  } catch (error) {
    console.error('❌ Error loading weather:', error);
    showNotification(`Could not load weather for ${city}. Please try another city.`, 'error');
  }
}

async function fetchCurrentWeather(city) {
  const url = `${WEATHER_API_URL}/weather?q=${city},IN&appid=${WEATHER_API_KEY}&units=metric`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Weather API error: ${response.status}`);
  return await response.json();
}

async function fetchForecastData(city) {
  const url = `${WEATHER_API_URL}/forecast?q=${city},IN&appid=${WEATHER_API_KEY}&units=metric`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Forecast API error: ${response.status}`);
  return await response.json();
}

// ============================================================================
// UI UPDATE FUNCTIONS - Enhanced with Smooth Animations
// ============================================================================

async function updateWeatherUISmooth(data, forecastData = null) {
  // Fade out old content
  const elements = [
    document.getElementById('cityName'),
    document.getElementById('mainTemp'),
    document.getElementById('mainWeatherIcon')
  ];

  elements.forEach(el => {
    el.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    el.style.opacity = '0';
    el.style.transform = 'translateY(-10px)';
  });

  // Wait for fade out
  await new Promise(resolve => setTimeout(resolve, 300));

  // Update content
  updateWeatherUI(data, forecastData);

  // Fade in new content
  setTimeout(() => {
    elements.forEach(el => {
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    });
  }, 50);
}

function updateWeatherUI(data, forecastData = null) {
  document.getElementById('cityName').textContent = data.name;

  // Set Timestamp with smooth formatting
  const now = new Date();
  const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dateString = now.toLocaleDateString([], { month: 'short', day: 'numeric' });
  document.getElementById('lastUpdated').textContent = `${timeString}, ${dateString}`;

  // Animated temperature update
  const tempVal = getTemperature(data.main.temp);
  const tempSym = getTempUnitSymbol();
  animateValue('mainTemp', parseFloat(document.getElementById('mainTemp').textContent) || 0,
    tempVal, 800, tempSym);

  // Update Map Marker
  if (data.coord) {
    updateMapMarker(data.coord.lat, data.coord.lon, data.name);
  }

  const iconCode = data.weather[0]?.icon || '01d';

  // ⭐ USE TIME-BASED ICON FUNCTION
  const newIcon = getWeatherIconByTime(iconCode);

  // Smooth icon transition
  const iconElement = document.getElementById('mainWeatherIcon');
  iconElement.style.transform = 'scale(0.8) rotate(-10deg)';
  setTimeout(() => {
    iconElement.textContent = newIcon;
    iconElement.style.transform = 'scale(1) rotate(0deg)';
  }, 200);

  // Details Grid with staggered animation
  const details = [
    { id: 'feelsLike', value: `${getTemperature(data.main.feels_like)}${getTempUnitSymbol()}` },
    { id: 'windSpeed', value: getWindSpeed(data.wind.speed) },
    { id: 'humidity', value: `${data.main.humidity}%` },
    { id: 'clouds', value: `${data.clouds?.all || 0}%` },
    { id: 'pressure', value: `${data.main.pressure} hPa` }
  ];

  details.forEach((detail, index) => {
    setTimeout(() => {
      document.getElementById(detail.id).textContent = detail.value;
    }, index * 50);
  });

  // Rain Chance (from forecast data if available)
  let pop = 0;
  if (forecastData && forecastData.list && forecastData.list.length > 0) {
    pop = Math.round(forecastData.list[0].pop * 100);
  }
  setTimeout(() => {
    document.getElementById('rainChance').textContent = `${pop}%`;
  }, 250);
}

// Smooth number animation
function animateValue(id, start, end, duration, suffix = '') {
  const element = document.getElementById(id);
  const range = end - start;
  const increment = range / (duration / 16);
  let current = start;

  const timer = setInterval(() => {
    current += increment;
    if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
      current = end;
      clearInterval(timer);
    }
    element.textContent = Math.round(current) + suffix;
  }, 16);
}

function updateHourlyForecast(forecastList) {
  const container = document.getElementById('hourlyForecast');

  container.innerHTML = forecastList.map((item, index) => {
    const time = new Date(item.dt * 1000);
    const hours = time.getHours();
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHour = hours % 12 || 12;

    const iconCode = item.weather[0]?.icon || '01d';

    // ⭐ USE TIME-BASED ICON FUNCTION
    const icon = getWeatherIconByTime(iconCode);

    return `
      <div class="hour-item" style="animation-delay: ${index * 0.1}s">
        <div class="hour-time">${displayHour} ${period}</div>
        <div class="hour-icon">${icon}</div>
        <div class="hour-temp">${getTemperature(item.main.temp)}°</div>
      </div>
    `;
  }).join('');
}

function updateWeeklyForecast(forecastList) {
  const container = document.getElementById('weeklyForecast');

  const dailyForecasts = [];
  const seenDates = new Set();

  forecastList.forEach(item => {
    const date = new Date(item.dt * 1000);
    const dateStr = date.toDateString();

    if (!seenDates.has(dateStr)) {
      seenDates.add(dateStr);
      dailyForecasts.push({ date, data: item });
    }
  });

  const weekData = dailyForecasts.slice(0, 7);

  container.innerHTML = weekData.map((item, index) => {
    const date = item.date;
    const data = item.data;

    const dayName = index === 0 ? 'Today' :
      date.toLocaleDateString('en-US', { weekday: 'short' });

    const iconCode = data.weather[0]?.icon || '01d';

    // ⭐ USE TIME-BASED ICON FUNCTION
    const icon = getWeatherIconByTime(iconCode);
    const condition = data.weather[0]?.main || 'Clear';

    const tempHigh = getTemperature(data.main.temp_max);
    const tempLow = getTemperature(data.main.temp_min);

    return `
      <div class="day-item" style="animation-delay: ${index * 0.1}s">
        <div class="day-name">${dayName}</div>
        <div class="day-icon">${icon}</div>
        <div class="day-condition">${condition}</div>
        <div class="day-temp">${tempHigh}°/${tempLow}°</div>
      </div>
    `;
  }).join('');
}

// ============================================================================
// ML MODEL DATA - Enhanced Display
// ============================================================================

function loadMLModelData() {
  fetch('../results/dashboard_data.json')
    .then(res => res.json())
    .then(data => {
      console.log('📊 ML model data loaded');
      displayMLModels(data);
    })
    .catch(error => {
      console.log('ℹ️ Using demo ML data');
      displayDemoMLModels();
    });
}

function displayMLModels(data) {
  const container = document.getElementById('modelCards');

  container.innerHTML = Object.entries(data.models).map(([name, metrics], index) => {
    const isBest = name === data.best_model;

    return `
      <div class="model ${isBest ? 'best' : ''}" style="animation: modelGlow 0.6s ease ${index * 0.1}s both;">
        <h4>${name.replace(/_/g, ' ').toUpperCase()}${isBest ? ' 🏆' : ''}</h4>
        <p>MAE: <strong>${metrics.MAE.toFixed(3)}°C</strong></p>
        <p>RMSE: <strong>${metrics.RMSE.toFixed(3)}°C</strong></p>
        <p>R²: <strong>${metrics.R2.toFixed(4)}</strong></p>
        ${isBest ? '<p style="color: #22c55e; margin-top: 12px; font-weight: 600;">✓ Best Model</p>' : ''}
      </div>
    `;
  }).join('');
}

function displayDemoMLModels() {
  // ✅ FIXED: Linear Regression is now correctly marked as best model
  const demoData = {
    best_model: 'linear',  // 🏆 Linear Regression has the best metrics
    models: {
      linear: { MAE: 0.280, RMSE: 0.340, R2: 0.9981 },  // ⭐ Best performer
      random_forest: { MAE: 1.233, RMSE: 1.639, R2: 0.9556 },
      gradient_boosting: { MAE: 0.780, RMSE: 0.990, R2: 0.9345 }
    }
  };

  displayMLModels(demoData);
}

// ============================================================================
// NOTIFICATION SYSTEM
// ============================================================================

function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 30px;
    right: 30px;
    background: ${type === 'error' ? '#ef4444' : '#60a5fa'};
    color: white;
    padding: 16px 24px;
    border-radius: 12px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
    z-index: 3000;
    animation: slideInRight 0.4s ease, fadeOut 0.4s ease 2.6s;
    font-weight: 600;
    max-width: 400px;
  `;
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.remove();
  }, 3000);
}

// Add CSS animation
const style = document.createElement('style');
style.textContent = `
  @keyframes slideInRight {
    from {
      transform: translateX(400px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  @keyframes fadeOut {
    from { opacity: 1; }
    to { opacity: 0; }
  }
`;
document.head.appendChild(style);

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function formatDate(timestamp) {
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
}

// ============================================================================
// PERFORMANCE MONITORING
// ============================================================================

if ('performance' in window) {
  window.addEventListener('load', () => {
    const perfData = performance.getEntriesByType('navigation')[0];
    console.log(`⚡ Page loaded in ${(perfData.loadEventEnd - perfData.fetchStart).toFixed(2)}ms`);
  });
}

// ============================================================================
// SETTINGS FUNCTIONS
// ============================================================================

// ============================================================================
// SETTINGS & STATE MANAGEMENT
// ============================================================================

let lastWeatherData = { current: null, forecast: null };
let autoRefreshInterval = null;

function saveSettings() {
  const settings = {
    darkMode: document.getElementById('darkMode').checked,
    animations: document.getElementById('animations').checked,
    tempUnit: document.getElementById('tempUnit').value,
    windUnit: document.getElementById('windUnit').value,
    weatherAlerts: document.getElementById('weatherAlerts').checked,
    autoRefresh: document.getElementById('autoRefresh').checked
  };

  localStorage.setItem('weatherDashboardSettings', JSON.stringify(settings));

  // Apply settings
  applySettings(settings);

  showNotification('✅ Settings saved successfully!', 'success');

  // Close modal after a short delay
  setTimeout(() => {
    closeAllModals();
  }, 1000);
}

function resetSettings() {
  if (confirm('Are you sure you want to reset all settings to default?')) {
    const defaultSettings = {
      darkMode: true,
      animations: true,
      tempUnit: 'metric',
      windUnit: 'kmh',
      weatherAlerts: false,
      autoRefresh: true
    };

    localStorage.setItem('weatherDashboardSettings', JSON.stringify(defaultSettings));
    loadSettingsUI();
    applySettings(defaultSettings);
    showNotification('🔄 Settings reset to default!', 'info');
  }
}

function loadSettingsUI() {
  const saved = localStorage.getItem('weatherDashboardSettings');
  let settings = {
    darkMode: true,
    animations: true,
    tempUnit: 'metric',
    windUnit: 'kmh',
    weatherAlerts: false,
    autoRefresh: true
  };

  if (saved) {
    settings = { ...settings, ...JSON.parse(saved) };
  }

  // Update UI Elements
  document.getElementById('darkMode').checked = settings.darkMode;
  document.getElementById('animations').checked = settings.animations;
  document.getElementById('tempUnit').value = settings.tempUnit;
  document.getElementById('windUnit').value = settings.windUnit;
  document.getElementById('weatherAlerts').checked = settings.weatherAlerts;
  document.getElementById('autoRefresh').checked = settings.autoRefresh;

  applySettings(settings);
}

function applySettings(settings) {
  window.weatherSettings = settings;

  // Apply dark mode
  if (!settings.darkMode) {
    document.body.classList.add('light-mode');
  } else {
    document.body.classList.remove('light-mode');
  }

  // Apply animations
  if (!settings.animations) {
    document.body.classList.add('reduced-motion');
  } else {
    document.body.classList.remove('reduced-motion');
  }

  // Handle Auto Refresh
  if (settings.autoRefresh) {
    startAutoRefresh();
  } else {
    stopAutoRefresh();
  }

  // Re-render UI if data exists to reflect Unit changes
  if (lastWeatherData.current && lastWeatherData.forecast) {
    updateWeatherUI(lastWeatherData.current, lastWeatherData.forecast);
    updateHourlyForecast(lastWeatherData.forecast.list.slice(0, 6));
    updateWeeklyForecast(lastWeatherData.forecast.list);
  }
}

function startAutoRefresh() {
  stopAutoRefresh(); // Clear existing to avoid duplicates
  // Refresh every 5 minutes (300000 ms)
  autoRefreshInterval = setInterval(() => {
    if (currentCity) {
      console.log('🔄 Auto-refreshing weather data...');
      loadWeatherData(currentCity);
    }
  }, 300000);
}

function stopAutoRefresh() {
  if (autoRefreshInterval) {
    clearInterval(autoRefreshInterval);
    autoRefreshInterval = null;
  }
}

// ============================================================================
// UNIT CONVERSION HELPERS
// ============================================================================

function getTemperature(celsius) {
  const unit = window.weatherSettings?.tempUnit || 'metric';
  if (unit === 'imperial') {
    return Math.round((celsius * 9 / 5) + 32);
  }
  return Math.round(celsius);
}

function getTempUnitSymbol() {
  return window.weatherSettings?.tempUnit === 'imperial' ? '°F' : '°';
}

function getWindSpeed(speedMs) {
  const unit = window.weatherSettings?.windUnit || 'kmh';
  switch (unit) {
    case 'imperial': // mph
      return (speedMs * 2.237).toFixed(1) + ' mph';
    case 'ms': // m/s
      return speedMs.toFixed(1) + ' m/s';
    case 'kmh': // km/h (default)
    default:
      return (speedMs * 3.6).toFixed(1) + ' km/h';
  }
}

// Make functions globally available
window.saveSettings = saveSettings;
window.resetSettings = resetSettings;

// Load settings on startup
setTimeout(() => {
  loadSettingsUI();
}, 500);

// ============================================================================
// CONSOLE BRANDING - Enhanced
// ============================================================================

console.log('%c🌤️ Weather ML Dashboard', 'font-size: 24px; font-weight: bold; color: #60a5fa; text-shadow: 0 0 10px rgba(96, 165, 250, 0.5);');
console.log('%c Created by: Rudra Kumar Gupta', 'font-size: 16px; color: #22c55e; font-weight: 600;');
console.log('%c Portfolio: https://rudraportfolio-five.vercel.app/', 'font-size: 14px; color: #FFD700;');
console.log('%c GitHub | LinkedIn | Twitter', 'font-size: 12px; color: #64748b;');
console.log('%c✨ Enjoy the experience!', 'font-size: 13px; color: #60a5fa; font-style: italic;');
console.log('');