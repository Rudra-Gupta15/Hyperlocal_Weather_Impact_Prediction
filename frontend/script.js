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
let lastWeatherData = null;
let autoRefreshInterval = null;
let map;
let marker;

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
    let currentWeather, forecastData;
    try {
      [currentWeather, forecastData] = await Promise.all([
        fetchCurrentWeather(city),
        fetchForecastData(city).catch(e => {
          console.warn("Forecast fetch failed, using current weather only");
          return null;
        })
      ]);
    } catch (e) {
      throw new Error(`Critical weather data missing: ${e.message}`);
    }

    // Update UI with smooth transitions
    lastWeatherData = { current: currentWeather, forecast: forecastData }; // Store data
    await updateWeatherUISmooth(currentWeather, forecastData);

    if (forecastData) {
      updateHourlyForecast(forecastData.list.slice(0, 6));
      updateWeeklyForecast(forecastData.list);
    }

    console.log('✅ Weather data process finished');
  } catch (error) {
    console.error('❌ Error loading weather:', error);
    showNotification(`Could not load weather for ${city}. Please try another city.`, 'error');
  }
}

async function fetchCurrentWeather(city) {
  // Try with ,IN first for accuracy, then fallback to global search
  try {
    const url = `${WEATHER_API_URL}/weather?q=${city},IN&appid=${WEATHER_API_KEY}&units=metric`;
    const response = await fetch(url);
    if (response.ok) return await response.json();
  } catch (e) {
    console.warn("India-specific search failed, trying global...");
  }

  const globalUrl = `${WEATHER_API_URL}/weather?q=${city}&appid=${WEATHER_API_KEY}&units=metric`;
  const globalResponse = await fetch(globalUrl);
  if (!globalResponse.ok) throw new Error(`City not found: ${city}`);
  return await globalResponse.json();
}

async function fetchForecastData(city) {
  try {
    const url = `${WEATHER_API_URL}/forecast?q=${city},IN&appid=${WEATHER_API_KEY}&units=metric`;
    const response = await fetch(url);
    if (response.ok) return await response.json();
  } catch (e) {
    console.warn("India-specific forecast failed, trying global...");
  }

  const globalUrl = `${WEATHER_API_URL}/forecast?q=${city}&appid=${WEATHER_API_KEY}&units=metric`;
  const globalResponse = await fetch(globalUrl);
  if (!globalResponse.ok) throw new Error(`Forecast data missing for: ${city}`);
  return await globalResponse.json();
}

// ============================================================================
// UI UPDATE FUNCTIONS - Enhanced with Smooth Animations
// ============================================================================

async function updateWeatherUISmooth(data, forecastData = null) {
  // Fade out old content
  const elements = [
    document.getElementById('cityName'),
    document.getElementById('mainTemp'),
    document.querySelector('.weather-visual-container') // Target container instead of icon
  ];

  elements.forEach(el => {
    if (el) {
      el.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      el.style.opacity = '0';
      el.style.transform = 'translateY(-10px)';
    }
  });

  // Wait for fade out
  await new Promise(resolve => setTimeout(resolve, 300));

  // Update content
  updateWeatherUI(data, forecastData);

  // Fade in new content
  setTimeout(() => {
    elements.forEach(el => {
      if (el) {
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      }
    });
  }, 50);
}

// ============================================================================
// STATIC MAP & PINNING LOGIC
// ============================================================================

async function loadWeatherByCoords(lat, lon) {
  if (isLoading) return;
  isLoading = true;
  const content = document.querySelector('.content');
  content.classList.add('loading');

  try {
    const url = `${WEATHER_API_URL}/weather?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Could not find city at this location");
    const data = await response.json();

    // Use existing city name load logic to get forecast too
    await loadWeatherData(data.name);
    showNotification(`📍 Location set to ${data.name}`);
  } catch (error) {
    console.error("Map click error:", error);
    showNotification("No city found at this location. Try another spot.", "error");
  } finally {
    content.classList.remove('loading');
    isLoading = false;
  }
}

// ============================================================================
// INTERACTIVE MAP (LEAFLET)
// ============================================================================

// INTERACTIVE MAP (LEAFLET)
// ============================================================================

function initMap() {
  if (map) return;

  const mapContainer = document.getElementById('weatherMap');
  if (!mapContainer || mapContainer.offsetHeight === 0) {
    console.warn("⚠️ Map container not ready or hidden. Deferring init.");
    return;
  }

  try {
    // Initialize map centered on India
    map = L.map('weatherMap').setView([22.5937, 78.9629], 5);

    // Dark theme tiles (CartoDB Dark Matter)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 20
    }).addTo(map);

    // Map Click Listener
    map.on('click', function (e) {
      const { lat, lng } = e.latlng;
      updateMapMarker(lat, lng, "Selected Location");
      loadWeatherByCoords(lat, lng);
    });

    console.log("✅ Leaflet Map Initialized Successfully");
  } catch (e) {
    console.error("❌ Leaflet Initialization Failed:", e);
  }
}

function updateMapMarker(lat, lon, cityName = "Your Location") {
  if (!map) initMap();

  // ⭐ Bulletproof validation for NaN, null, or undefined coordinates
  const validLat = typeof lat === 'number' ? lat : parseFloat(lat);
  const validLon = typeof lon === 'number' ? lon : parseFloat(lon);

  if (!Number.isFinite(validLat) || !Number.isFinite(validLon)) {
    console.warn("⚠️ Skipping map update: Invalid coordinates detected", { lat, lon });
    console.trace(); // Trace the caller to find source of NaN
    return;
  }

  // Use the validated coordinates from here on
  const coords = [validLat, validLon];

  if (marker) {
    marker.setLatLng(coords);
    marker.bindPopup(`<b>Weather of ${cityName}</b>`).openPopup();
  } else {
    marker = L.marker(coords).addTo(map)
      .bindPopup(`<b>Weather of ${cityName}</b>`).openPopup();
  }

  // Soft flyTo effect for city searches - ONLY if map is visible
  if (map && map.getContainer().offsetParent !== null) {
    try {
      map.flyTo(coords, map.getZoom() > 7 ? map.getZoom() : 7, {
        duration: 1.5
      });
    } catch (e) {
      console.warn("flyTo failed:", e);
    }
  }

  // Ensure map tiles are loaded if container was hidden
  setTimeout(() => {
    map.invalidateSize();
  }, 400);
}

// 🚀 Robust Modal Triggers for Map and Dashboard
document.addEventListener('click', (e) => {
  const navBtn = e.target.closest('.nav-btn');
  if (navBtn && navBtn.dataset.view === 'map') {
    const modal = document.getElementById('mapModal');
    if (modal) {
      modal.classList.remove('hidden');
      setTimeout(() => {
        initMap();
        if (map) map.invalidateSize();
      }, 300); // Wait for modal transition
    }
  }
});



function updateWeatherUI(data, forecastData = null) {
  try {
    if (!data || !data.main) throw new Error("Invalid weather data");

    // City Name & Timestamp
    if (document.getElementById('cityName')) document.getElementById('cityName').textContent = data.name || "Unknown Location";

    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateString = now.toLocaleDateString([], { month: 'short', day: 'numeric' });
    if (document.getElementById('lastUpdated')) {
      document.getElementById('lastUpdated').textContent = `${timeString}, ${dateString}`;
    }

    // Temperature
    const tempVal = getTemperature(data.main.temp);
    const tempSym = getTempUnitSymbol();
    try {
      if (document.getElementById('mainTemp')) {
        animateValue('mainTemp', parseFloat(document.getElementById('mainTemp').textContent) || 0,
          tempVal, 800, tempSym);
      }
    } catch (e) {
      if (document.getElementById('mainTemp')) document.getElementById('mainTemp').textContent = `${tempVal}${tempSym}`;
    }

    // ⭐ Map Marker (Safe)
    try {
      if (data.coord && typeof L !== 'undefined') {
        // Double check internal coordinates
        const lat = parseFloat(data.coord.lat);
        const lon = parseFloat(data.coord.lon);
        if (Number.isFinite(lat) && Number.isFinite(lon)) {
          updateMapMarker(lat, lon, data.name);
        }
      }
    } catch (e) { console.warn("Map update failed", e); }

    // ⭐ Celestial Body
    try {
      const isDaytime = now.getHours() >= 6 && now.getHours() < 18;
      const celestialBody = document.getElementById('celestialBody');
      if (celestialBody) {
        celestialBody.classList.toggle('sun', isDaytime);
        celestialBody.classList.toggle('moon', !isDaytime);
      }
    } catch (e) { console.warn("Celestial update failed", e); }

    // Details Grid
    const details = [
      { id: 'feelsLike', value: `${getTemperature(data.main.feels_like)}${getTempUnitSymbol()}` },
      { id: 'windSpeed', value: getWindSpeed(data.wind?.speed || 0) },
      { id: 'humidity', value: `${data.main.humidity}%` },
      { id: 'clouds', value: `${data.clouds?.all || 0}%` },
      { id: 'pressure', value: `${data.main.pressure} hPa` },
      { id: 'visibility', value: data.visibility !== undefined ? `${(data.visibility / 1000).toFixed(1)} km` : '-- km' },
      { id: 'sunrise', value: data.sys?.sunrise ? formatTime(data.sys.sunrise) : '--:--' },
      { id: 'sunset', value: data.sys?.sunset ? formatTime(data.sys.sunset) : '--:--' }
    ];

    details.forEach((detail, index) => {
      const el = document.getElementById(detail.id);
      if (el) {
        setTimeout(() => { el.textContent = detail.value; }, index * 50);
      }
    });

    // Update Weather Tip
    if (typeof updateWeatherTip === 'function') updateWeatherTip(data);

    // Rain Chance
    try {
      let pop = 0;
      if (forecastData && forecastData.list && forecastData.list.length > 0) {
        pop = Math.round(forecastData.list[0].pop * 100);
        if (typeof updateHourlyForecast === 'function') updateHourlyForecast(forecastData.list.slice(0, 6));
        if (typeof updateWeeklyForecast === 'function') updateWeeklyForecast(forecastData.list);
      }
      const rainEl = document.getElementById('rainChance');
      if (rainEl) setTimeout(() => { rainEl.textContent = `${pop}%`; }, 250);
    } catch (e) { console.warn("Forecast UI failed", e); }

  } catch (error) {
    console.error("Fatal UI update error:", error);
    throw error; // Let loadWeatherData handle it
  }
}

function formatTime(unix) {
  const date = new Date(unix * 1000);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function updateWeatherTip(data) {
  const tipEl = document.getElementById('weatherTip');
  if (!tipEl) return;

  const temp = data.main.temp;
  const clouds = data.clouds?.all || 0;
  let tip = "Enjoy the day! The weather looks fine.";

  if (temp > 30) tip = "Stay hydrated! It's getting hot outside. 🥤";
  else if (temp < 15) tip = "Keep warm! It's a bit chilly. 🧣";
  else if (clouds > 70) tip = "Don't forget your umbrella, it's cloudy! ☂️";
  else if (data.wind.speed > 5) tip = "Hold onto your hat! It's windy. 🌬️";

  tipEl.textContent = tip;
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

// Global state managed at top of file

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
  if (lastWeatherData && lastWeatherData.current && lastWeatherData.forecast) {
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