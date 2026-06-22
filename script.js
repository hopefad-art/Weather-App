/* ===========================================================
   script.js  —  the BRAIN of the app
   It listens for a click, then does the two steps from the brief:
     Step 1: turn a city name into latitude & longitude (geocoding)
     Step 2: use those coordinates to fetch the weather (forecast)
   =========================================================== */

/* ---- 1. Grab the page elements we need to work with ---- */
/* document.getElementById finds an element by its id="" from the HTML */
const cityInput = document.getElementById("cityInput");  // the text box
const searchBtn = document.getElementById("searchBtn");  // the button
const result    = document.getElementById("result");     // the results area


/* ---- 2. Weather codes ----
   Open-Meteo gives weather as a NUMBER (weather_code).
   This object translates each number into readable text.
   (These are the standard WMO codes used by Open-Meteo.) */
const weatherDescriptions = {
  0: "Clear sky",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Foggy",
  48: "Rime fog",
  51: "Light drizzle",
  53: "Moderate drizzle",
  55: "Dense drizzle",
  61: "Slight rain",
  63: "Moderate rain",
  65: "Heavy rain",
  71: "Slight snow",
  73: "Moderate snow",
  75: "Heavy snow",
  80: "Rain showers",
  81: "Rain showers",
  82: "Violent rain showers",
  95: "Thunderstorm",
  96: "Thunderstorm with hail",
  99: "Thunderstorm with heavy hail",
};


/* ---- 3. A small helper to show a message (loading or error) ---- */
function showMessage(text, isError) {
  // If isError is true, add the red error style; otherwise normal style
  const errorClass = isError ? "message--error" : "";
  result.innerHTML = `<p class="message ${errorClass}">${text}</p>`;
}


/* ---- 4. The main function that runs when you search ----
   The word "async" lets us use "await", which means
   "wait for the internet response before moving on". */
async function getWeather() {
  // Read what the user typed, and .trim() removes extra spaces
  const city = cityInput.value.trim();

  // If the box is empty, tell the user and stop here
  if (city === "") {
    showMessage("Please type a city name.", true);
    return; // "return" stops the function early
  }

  // Show a loading message while we wait for the internet
  showMessage("Loading...");

  // "try" runs the risky internet code; if anything fails,
  // the "catch" block at the bottom handles the error gracefully.
  try {

    /* ===== STEP 1: City name  ->  coordinates ===== */
    // We build the geocoding URL and put the city name into it.
    // encodeURIComponent makes city names with spaces (e.g. "New York") safe for a URL.
    const geoUrl =
      "https://geocoding-api.open-meteo.com/v1/search?name=" +
      encodeURIComponent(city) +
      "&count=1&language=en&format=json";

    // fetch() asks the internet for that URL; await waits for the reply
    const geoResponse = await fetch(geoUrl);
    // .json() turns the reply into a JavaScript object we can read
    const geoData = await geoResponse.json();

    // If there is no "results" array, the city was not found
    if (!geoData.results || geoData.results.length === 0) {
      showMessage("City not found. Check the spelling and try again.", true);
      return;
    }

    // Take the first match (results[0]) and pull out the pieces we need
    const place = geoData.results[0];
    const latitude  = place.latitude;
    const longitude = place.longitude;
    const name      = place.name;
    const country   = place.country;


    /* ===== STEP 2: coordinates  ->  weather ===== */
    // Build the forecast URL exactly as the brief describes,
    // inserting the latitude and longitude from Step 1.
    const weatherUrl =
      "https://api.open-meteo.com/v1/forecast?latitude=" + latitude +
      "&longitude=" + longitude +
      "&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code" +
      "&daily=temperature_2m_max,temperature_2m_min,weather_code" +
      "&timezone=auto";

    // Fetch the weather and convert it to a usable object
    const weatherResponse = await fetch(weatherUrl);
    const weatherData = await weatherResponse.json();

    // Pull out the current weather values
    const current     = weatherData.current;
    const temperature = Math.round(current.temperature_2m);     // round to whole number
    const humidity    = current.relative_humidity_2m;
    const wind        = Math.round(current.wind_speed_10m);
    const code        = current.weather_code;

    // Turn the weather code number into readable text.
    // If the code is not in our list, fall back to "Unknown".
    const condition = weatherDescriptions[code] || "Unknown";

    // Pull out today's high and low from the daily forecast.
    // daily values are arrays; [0] means "today".
    const high = Math.round(weatherData.daily.temperature_2m_max[0]);
    const low  = Math.round(weatherData.daily.temperature_2m_min[0]);


    /* ===== Show everything on the page ===== */
    // We build an HTML string and drop it into the result box.
    result.innerHTML = `
      <div class="result__place">${name}, ${country}</div>
      <div class="result__temp">${temperature}&deg;C</div>
      <div class="result__condition">${condition}</div>
      <div class="result__details">
        <div class="detail">
          <div class="detail__label">Humidity</div>
          <div class="detail__value">${humidity}%</div>
        </div>
        <div class="detail">
          <div class="detail__label">Wind</div>
          <div class="detail__value">${wind} km/h</div>
        </div>
        <div class="detail">
          <div class="detail__label">High / Low</div>
          <div class="detail__value">${high}&deg; / ${low}&deg;</div>
        </div>
      </div>
    `;

  } catch (error) {
    // This runs if the internet request failed (e.g. no connection)
    showMessage("Something went wrong. Please try again.", true);
    console.log(error); // prints the technical detail in the browser console
  }
}


/* ---- 5. Make the app respond to the user ---- */

// When the Search button is clicked, run getWeather
searchBtn.addEventListener("click", getWeather);

// Also let the user press the Enter key inside the text box
cityInput.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    getWeather();
  }
});
/* ---- Rain effect: create the falling drops ---- */
const rain = document.querySelector(".rain");
const DROP_COUNT = 120;

for (let i = 0; i < DROP_COUNT; i++) {
  const drop = document.createElement("div");
  drop.className = "drop";
  drop.style.left = Math.random() * 100 + "vw";
  drop.style.animationDuration = 0.5 + Math.random() * 0.6 + "s";
  drop.style.animationDelay = Math.random() * -2 + "s";
  drop.style.height = 60 + Math.random() * 50 + "px";
  drop.style.opacity = 0.4 + Math.random() * 0.5;
  rain.appendChild(drop);
}