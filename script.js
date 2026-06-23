// Grab the elements we need from the page
const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const currentEl = document.getElementById("current");
const detailsEl = document.getElementById("details");
const forecastEl = document.getElementById("forecast");

// Turn a WMO weather code into a simple emoji icon
function getIcon(code) {
  if (code === 0) return "☀️";              // clear
  if (code <= 3) return "⛅";               // partly cloudy
  if (code <= 48) return "☁️";              // fog/cloud
  if (code <= 67) return "🌧️";             // rain
  if (code <= 77) return "❄️";              // snow
  if (code <= 82) return "🌦️";             // showers
  return "⛈️";                              // thunderstorm
}

// Turn a date string into a short weekday name (e.g. "Mon")
function getDayName(dateStr) {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return days[new Date(dateStr).getDay()];
}

// Step 1: convert a city name into coordinates (geocoding)
async function getCoordinates(city) {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1`;
  const res = await fetch(url);
  const data = await res.json();
  // If no city is found, the results array is missing
  if (!data.results) {
    throw new Error("City not found");
  }
  return data.results[0]; // contains name, country, latitude, longitude
}

// Step 2: get the weather for those coordinates
async function getWeather(lat, lon) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=auto`;
  const res = await fetch(url);
  return await res.json();
}

// Display the current weather card
function showCurrent(place, weather) {
  const c = weather.current;
  currentEl.innerHTML = `
    <div>${getIcon(weather.daily.weather_code[0])}</div>
    <h2>${place.name}, ${place.country}</h2>
    <div class="temp">${Math.round(c.temperature_2m)}°C</div>
  `;
}

// Display the humidity / wind / UV details row
function showDetails(weather) {
  const c = weather.current;
  detailsEl.innerHTML = `
    <div><p>Humidity</p><strong>${c.relative_humidity_2m}%</strong></div>
    <div><p>Wind</p><strong>${c.wind_speed_10m} km/h</strong></div>
    <div><p>UV Index</p><strong>—</strong></div>
  `;
}

// Display the 5-day forecast list
function showForecast(weather) {
  const daily = weather.daily;
  let rows = "";
  // Loop through 5 days and build a row for each
  for (let i = 0; i < 5; i++) {
    rows += `
      <div class="forecast-row">
        <span>${getDayName(daily.time[i])}</span>
        <span>${getIcon(daily.weather_code[i])}</span>
        <span>${Math.round(daily.temperature_2m_max[i])}° / ${Math.round(daily.temperature_2m_min[i])}°</span>
      </div>
    `;
  }
  forecastEl.innerHTML = rows;
}

// Main function: runs when the user searches
async function searchWeather() {
  const city = cityInput.value.trim();
  if (!city) return; // do nothing if the box is empty

  try {
    currentEl.innerHTML = `<p class="loading">Loading...</p>`;  
    const place = await getCoordinates(city);  
    const weather = await getWeather(place.latitude, place.longitude); // step 2
    showCurrent(place, weather);                        // update the page
    showDetails(weather);
    showForecast(weather);
  } catch (error) {
    // Show a friendly message if something goes wrong
    currentEl.innerHTML = `<p>${error.message}</p>`;
    detailsEl.innerHTML = "";
    forecastEl.innerHTML = "";
  }
}

// Run search when the button is clicked
searchBtn.addEventListener("click", searchWeather);

// Also run search when the user presses Enter in the input
cityInput.addEventListener("keydown", function (e) {
  if (e.key === "Enter") searchWeather();
});

// Load a default city when the page first opens
cityInput.value = "Lagos";
searchWeather();