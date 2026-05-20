import express from "express";

const router = express.Router();

const WEATHER_CODE_LABELS = {
  0: "Ciel degage",
  1: "Plutot degage",
  2: "Partiellement nuageux",
  3: "Couvert",
  45: "Brouillard",
  48: "Brouillard givrant",
  51: "Bruine legere",
  53: "Bruine moderee",
  55: "Bruine dense",
  56: "Bruine verglaçante legere",
  57: "Bruine verglaçante forte",
  61: "Pluie legere",
  63: "Pluie moderee",
  65: "Pluie forte",
  66: "Pluie verglaçante legere",
  67: "Pluie verglaçante forte",
  71: "Neige legere",
  73: "Neige moderee",
  75: "Neige forte",
  77: "Grains de neige",
  80: "Averses legeres",
  81: "Averses moderees",
  82: "Averses violentes",
  85: "Averses de neige legeres",
  86: "Averses de neige fortes",
  95: "Orage",
  96: "Orage avec grele legere",
  99: "Orage avec grele forte",
};

function weatherLabel(code) {
  return WEATHER_CODE_LABELS[code] || "Conditions variables";
}

function nearestHourIndex(hourlyTimes = [], currentTimeIso = "") {
  if (!hourlyTimes.length || !currentTimeIso) return 0;
  const currentMs = new Date(currentTimeIso).getTime();
  let bestIdx = 0;
  let bestDelta = Number.POSITIVE_INFINITY;

  hourlyTimes.forEach((value, index) => {
    const delta = Math.abs(new Date(value).getTime() - currentMs);
    if (delta < bestDelta) {
      bestDelta = delta;
      bestIdx = index;
    }
  });

  return bestIdx;
}

router.get("/today", async (req, res) => {
  const city = (req.query.city || "Tunis").toString().trim();

  if (!city) {
    return res.status(400).json({ message: "city query param is required" });
  }

  try {
    const geoUrl = new URL("https://geocoding-api.open-meteo.com/v1/search");
    geoUrl.searchParams.set("name", city);
    geoUrl.searchParams.set("count", "1");
    geoUrl.searchParams.set("language", "fr");
    geoUrl.searchParams.set("format", "json");

    const geoResponse = await fetch(geoUrl);
    if (!geoResponse.ok) {
      return res.status(502).json({ message: "Weather geocoding provider is unavailable" });
    }

    const geoData = await geoResponse.json();
    const place = geoData?.results?.[0];

    if (!place) {
      return res.status(404).json({ message: `Ville introuvable: ${city}` });
    }

    const forecastUrl = new URL("https://api.open-meteo.com/v1/forecast");
    forecastUrl.searchParams.set("latitude", String(place.latitude));
    forecastUrl.searchParams.set("longitude", String(place.longitude));
    forecastUrl.searchParams.set("timezone", "auto");
    forecastUrl.searchParams.set(
      "current",
      "temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m"
    );
    forecastUrl.searchParams.set(
      "hourly",
      "temperature_2m,precipitation_probability,weather_code"
    );
    forecastUrl.searchParams.set("forecast_days", "2");

    const forecastResponse = await fetch(forecastUrl);
    if (!forecastResponse.ok) {
      return res.status(502).json({ message: "Weather forecast provider is unavailable" });
    }

    const forecastData = await forecastResponse.json();
    const current = forecastData.current;
    const hourly = forecastData.hourly;

    if (!current || !hourly?.time) {
      return res.status(502).json({ message: "Incomplete weather data received" });
    }

    const localDate = current.time.split("T")[0];

    const todayIndexes = hourly.time
      .map((value, index) => ({ value, index }))
      .filter(({ value }) => value.startsWith(localDate))
      .map(({ index }) => index);

    const startNearNow = nearestHourIndex(
      todayIndexes.map((idx) => hourly.time[idx]),
      current.time
    );

    const fromTodayIndex = todayIndexes[startNearNow] ?? todayIndexes[0] ?? 0;
    const slicedIndexes = todayIndexes.filter((idx) => idx >= fromTodayIndex).slice(0, 6);

    const nextHours = slicedIndexes.map((idx) => ({
      time: hourly.time[idx],
      temperatureC: hourly.temperature_2m?.[idx] ?? null,
      precipitationProbability: hourly.precipitation_probability?.[idx] ?? null,
      weatherCode: hourly.weather_code?.[idx] ?? null,
      weatherText: weatherLabel(hourly.weather_code?.[idx]),
    }));

    return res.json({
      city: place.name,
      country: place.country,
      timezone: forecastData.timezone,
      coordinates: {
        latitude: place.latitude,
        longitude: place.longitude,
      },
      today: localDate,
      current: {
        time: current.time,
        temperatureC: current.temperature_2m,
        humidity: current.relative_humidity_2m,
        precipitationMm: current.precipitation,
        windKmh: current.wind_speed_10m,
        weatherCode: current.weather_code,
        weatherText: weatherLabel(current.weather_code),
      },
      hourly: nextHours,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    return res.status(500).json({ message: "Could not load weather data", error: error.message });
  }
});

export default router;
