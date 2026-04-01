const express = require('express');
const axios = require('axios');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const { lat, lon, location } = req.query;
    if (!lat || !lon) return res.status(400).json({ error: 'Latitude and longitude required' });

    const weatherRes = await axios.get(`https://api.open-meteo.com/v1/forecast`, {
      params: {
        latitude: lat,
        longitude: lon,
        current: 'temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,weather_code,uv_index',
        daily: 'temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max,weather_code,uv_index_max',
        timezone: 'Asia/Kolkata',
        forecast_days: 7
      }
    });

    const current = weatherRes.data.current;
    const daily = weatherRes.data.daily;

    // Farming advice based on weather
    const advice = generateFarmingAdvice(current);

    res.json({
      success: true,
      location: location || 'Your Location',
      current: {
        temperature: current.temperature_2m,
        humidity: current.relative_humidity_2m,
        precipitation: current.precipitation,
        windSpeed: current.wind_speed_10m,
        uvIndex: current.uv_index,
        condition: getWeatherCondition(current.weather_code),
        icon: getWeatherIcon(current.weather_code)
      },
      forecast: daily.time.map((date, i) => ({
        date,
        maxTemp: daily.temperature_2m_max[i],
        minTemp: daily.temperature_2m_min[i],
        precipitation: daily.precipitation_sum[i],
        windSpeed: daily.wind_speed_10m_max[i],
        uvIndex: daily.uv_index_max[i],
        condition: getWeatherCondition(daily.weather_code[i]),
        icon: getWeatherIcon(daily.weather_code[i])
      })),
      farmingAdvice: advice
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Weather fetch failed', details: err.message });
  }
});

function getWeatherCondition(code) {
  if (code === 0) return 'clearSky';
  if (code <= 3) return 'partlyCloudy';
  if (code <= 49) return 'foggy';
  if (code <= 59) return 'drizzle';
  if (code <= 69) return 'rainy';
  if (code <= 79) return 'snowy';
  if (code <= 84) return 'rainShowers';
  if (code <= 99) return 'thunderstorm';
  return 'unknown';
}

function getWeatherIcon(code) {
  if (code === 0) return '☀️';
  if (code <= 3) return '⛅';
  if (code <= 49) return '🌫️';
  if (code <= 69) return '🌧️';
  if (code <= 79) return '❄️';
  if (code <= 84) return '🌦️';
  if (code <= 99) return '⛈️';
  return '🌤️';
}

function generateFarmingAdvice(current) {
  const advice = [];
  if (current.precipitation > 5) advice.push('advice_heavyRain');
  if (current.wind_speed_10m > 20) advice.push('advice_highWind');
  if (current.temperature_2m > 38) advice.push('advice_extremeHeat');
  if (current.temperature_2m < 15) advice.push('advice_cold');
  if (current.relative_humidity_2m > 85) advice.push('advice_highHumidity');
  if (current.uv_index > 7) advice.push('advice_highUV');
  if (advice.length === 0) advice.push('advice_goodConditions');
  return advice;
}

module.exports = router;
