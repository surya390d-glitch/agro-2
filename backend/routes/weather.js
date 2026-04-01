const express = require('express');
const axios = require('axios');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticateToken, async(req, res, next) => {
    try {
        const { lat, lon, location } = req.query;
        if (!lat || !lon) return res.status(400).json({ error: 'Latitude and longitude required' });

        const weatherRes = await axios.get('https://api.open-meteo.com/v1/forecast', {
            params: {
                latitude: lat,
                longitude: lon,
                current_weather: true,
                hourly: 'relativehumidity_2m,uv_index,precipitation',
                daily: 'temperature_2m_max,temperature_2m_min,precipitation_sum,windspeed_10m_max,weathercode,uv_index_max',
                timezone: 'Asia/Kolkata',
                forecast_days: 7
            }
        });

        const currentWeather = weatherRes.data.current_weather || {};
        const daily = weatherRes.data.daily || {};

        const currentHumidity = (weatherRes.data.hourly && weatherRes.data.hourly.relativehumidity_2m && weatherRes.data.hourly.relativehumidity_2m[0] !== undefined) ?
            weatherRes.data.hourly.relativehumidity_2m[0] :
            null;
        const currentUV = (weatherRes.data.hourly && weatherRes.data.hourly.uv_index && weatherRes.data.hourly.uv_index[0] !== undefined) ?
            weatherRes.data.hourly.uv_index[0] :
            null;

        const advice = generateFarmingAdvice({
            precipitation: currentWeather.precipitation || 0,
            wind_speed_10m: currentWeather.windspeed || 0,
            temperature_2m: currentWeather.temperature || 0,
            relative_humidity_2m: currentHumidity || 0,
            uv_index: currentUV || 0
        });

        res.json({
            success: true,
            location: location || 'Your Location',
            current: {
                temperature: currentWeather.temperature,
                humidity: currentHumidity,
                precipitation: currentWeather.precipitation,
                windSpeed: currentWeather.windspeed,
                uvIndex: currentUV,
                condition: getWeatherCondition(currentWeather.weathercode),
                icon: getWeatherIcon(currentWeather.weathercode)
            },
            forecast: (daily.time || []).map((date, i) => ({
                date,
                maxTemp: (daily.temperature_2m_max && daily.temperature_2m_max[i] !== undefined) ? daily.temperature_2m_max[i] : null,
                minTemp: (daily.temperature_2m_min && daily.temperature_2m_min[i] !== undefined) ? daily.temperature_2m_min[i] : null,
                precipitation: (daily.precipitation_sum && daily.precipitation_sum[i] !== undefined) ? daily.precipitation_sum[i] : null,
                windSpeed: (daily.windspeed_10m_max && daily.windspeed_10m_max[i] !== undefined) ? daily.windspeed_10m_max[i] : null,
                uvIndex: (daily.uv_index_max && daily.uv_index_max[i] !== undefined) ? daily.uv_index_max[i] : null,
                condition: getWeatherCondition((daily.weathercode && daily.weathercode[i] !== undefined) ? daily.weathercode[i] : null),
                icon: getWeatherIcon((daily.weathercode && daily.weathercode[i] !== undefined) ? daily.weathercode[i] : null)
            })),

            farmingAdvice: advice
        });
    } catch (err) {
        console.error('Weather fetch failed:', err.message);
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