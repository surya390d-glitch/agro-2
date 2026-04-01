import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useLocation } from '../context/LocationContext';
import { addToast } from '../components/ToastContainer';

const WMO_CODES = {
  0:  { key: 'clearSky',      icon: '☀️'  },
  1:  { key: 'partlyCloudy',  icon: '🌤️' },
  2:  { key: 'partlyCloudy',  icon: '⛅'  },
  3:  { key: 'partlyCloudy',  icon: '🌥️' },
  45: { key: 'foggy',         icon: '🌫️' },
  48: { key: 'foggy',         icon: '🌫️' },
  51: { key: 'drizzle',       icon: '🌦️' },
  61: { key: 'rainy',         icon: '🌧️' },
  63: { key: 'rainy',         icon: '🌧️' },
  71: { key: 'snowy',         icon: '🌨️' },
  80: { key: 'rainShowers',   icon: '🌧️' },
  95: { key: 'thunderstorm',  icon: '⛈️' },
  99: { key: 'thunderstorm',  icon: '⛈️' },
};

function getWMO(code) {
  if (code === 0) return WMO_CODES[0];
  if (code <= 3)  return WMO_CODES[1];
  if (code <= 48) return WMO_CODES[45];
  if (code <= 67) return WMO_CODES[51];
  if (code <= 77) return WMO_CODES[71];
  if (code <= 82) return WMO_CODES[80];
  if (code <= 99) return WMO_CODES[95];
  return { key: 'unknown', icon: '🛰️' };
}

function getDayLabel(dateStr, index, t, language) {
  if (index === 0) return t('today') || 'Today';
  const date = new Date(dateStr);
  return date.toLocaleDateString(
    language === 'ta' ? 'ta-IN' :
    language === 'hi' ? 'hi-IN' :
    language === 'mr' ? 'mr-IN' :
    language === 'te' ? 'te-IN' :
    language === 'kn' ? 'kn-IN' :
    language === 'ml' ? 'ml-IN' :
    language === 'gu' ? 'gu-IN' :
    'en-US',
    { weekday: 'short' }
  );
}

export default function WeatherPage() {
  const { t, language } = useLanguage();
  const { location, locationName, requestLocation } = useLocation();
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const fetchWeather = async () => {
    setLoading(true);
    setError(false);

    // Always request fresh location
    let loc = location;
    if (!loc) {
      loc = await requestLocation();
    }

    if (!loc) {
      setLoading(false);
      setError(true);
      return;
    }

    try {
      const url = [
        `https://api.open-meteo.com/v1/forecast`,
        `?latitude=${loc.lat}&longitude=${loc.lon}`,
        `&current=temperature_2m,relative_humidity_2m,is_day,precipitation,weather_code,wind_speed_10m,apparent_temperature`,
        `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,uv_index_max`,
        `&timezone=auto`,
        `&forecast_days=7`,
      ].join('');

      const res = await fetch(url);
      if (!res.ok) throw new Error('API Error');
      const data = await res.json();
      setWeather(data);
    } catch (err) {
      console.error(err);
      setError(true);
      addToast(t('satelliteFailed') || 'Weather fetch failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
  }, []);

  // ── LOADING ──
  if (loading) {
    return (
      <div className="page-wrapper" style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: '80vh',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div className="animate-float" style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>🌤️</div>
          <div className="spinner" style={{ borderTopColor: '#06b6d4', width: '48px', height: '48px', marginBottom: '1.25rem' }} />
          <p style={{ color: 'var(--text-muted)', fontWeight: 700, fontSize: '0.95rem' }}>
            {t('loadingWeather')}
          </p>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.82rem', marginTop: '0.4rem' }}>
            📍 {locationName || t('detectingLocation')}
          </p>
        </div>
      </div>
    );
  }

  // ── ERROR ──
  if (error || !weather) {
    return (
      <div className="page-wrapper" style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '2rem', minHeight: '80vh',
      }}>
        <div className="glass-panel animate-up" style={{
          padding: '3rem 2rem', textAlign: 'center', maxWidth: '380px', width: '100%',
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🛰️</div>
          <h2 style={{ fontFamily: "'Sora',sans-serif", marginBottom: '0.75rem', fontWeight: 800 }}>
            {t('satelliteFailed') || 'Could Not Connect'}
          </h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', lineHeight: 1.6, fontSize: '0.9rem' }}>
            {t('weatherErrorMsg') || 'Please enable GPS and try again.'}
          </p>
          <button id="weather-retry-btn" className="btn btn-primary btn-full" onClick={fetchWeather}>
            🔄 {t('retry') || 'Retry'}
          </button>
        </div>
      </div>
    );
  }

  const cur = weather.current;
  const wmo = getWMO(cur.weather_code);
  const feelsLike = Math.round(cur.apparent_temperature ?? cur.temperature_2m);

  const getAdvisory = () => {
    if (cur.precipitation > 5) return t('advice_heavyRain');
    if (cur.wind_speed_10m > 25) return t('advice_highWind');
    if (cur.temperature_2m > 37) return t('advice_extremeHeat');
    if (cur.relative_humidity_2m > 85) return t('advice_highHumidity');
    if (cur.temperature_2m < 10) return t('advice_cold');
    return t('advice_goodConditions');
  };

  return (
    <div className="page-wrapper animate-up">

      {/* ── BIG WEATHER CARD ── */}
      <div style={{
        margin: '1.25rem 1.25rem 0',
        borderRadius: '28px',
        background: cur.is_day
          ? 'linear-gradient(160deg, #1e3a5f 0%, #0369a1 50%, #0ea5e9 100%)'
          : 'linear-gradient(160deg, #0c0c2a 0%, #1a1060 50%, #312e81 100%)',
        padding: '2.25rem 1.75rem',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
      }}>
        {/* Big emoji background */}
        <div style={{
          position: 'absolute', top: '-10%', right: '-5%',
          fontSize: '11rem', opacity: 0.12, zIndex: 0,
          lineHeight: 1, pointerEvents: 'none',
        }}>
          {wmo.icon}
        </div>

        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* Location badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            background: 'rgba(255,255,255,0.15)',
            border: '1px solid rgba(255,255,255,0.2)',
            backdropFilter: 'blur(8px)',
            padding: '0.35rem 0.9rem',
            borderRadius: 'var(--r-full)',
            fontSize: '0.82rem',
            fontWeight: 700,
            color: 'rgba(255,255,255,0.95)',
            marginBottom: '1.5rem',
          }}>
            📍 {locationName || t('detectingLocation')}
          </div>

          {/* Temperature */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0' }}>
            <span style={{
              fontFamily: "'Sora', sans-serif",
              fontSize: 'clamp(4rem, 15vw, 6rem)',
              fontWeight: 800,
              color: 'white',
              lineHeight: 1,
              textShadow: '0 4px 20px rgba(0,0,0,0.3)',
            }}>
              {Math.round(cur.temperature_2m)}
            </span>
            <span style={{ fontSize: '2.5rem', color: 'rgba(255,255,255,0.7)', marginTop: '0.5rem', fontWeight: 300 }}>°C</span>
          </div>

          <div style={{
            fontSize: '1.1rem', fontWeight: 700,
            color: 'rgba(255,255,255,0.85)',
            margin: '0.4rem 0 0.25rem',
          }}>
            {wmo.icon} {t(wmo.key) || wmo.key}
          </div>
          <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.55)', fontWeight: 500 }}>
            {t('feelsLike') || 'Feels like'} {feelsLike}°
          </div>
        </div>

        {/* ── STATS ROW ── */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '0.75rem', marginTop: '2rem',
          position: 'relative', zIndex: 1,
        }}>
          {[
            { icon: '💧', value: `${cur.relative_humidity_2m}%`, label: t('humidity') },
            { icon: '💨', value: `${Math.round(cur.wind_speed_10m)} km/h`, label: t('wind') },
            { icon: '🌧️', value: `${cur.precipitation} mm`, label: t('rain') },
          ].map((s, i) => (
            <div key={i} style={{
              padding: '0.85rem 0.5rem',
              background: 'rgba(0,0,0,0.22)',
              borderRadius: '16px',
              textAlign: 'center',
              backdropFilter: 'blur(8px)',
            }}>
              <div style={{ fontSize: '1.35rem', marginBottom: '4px' }}>{s.icon}</div>
              <div style={{ fontWeight: 800, color: 'white', fontSize: '0.95rem' }}>{s.value}</div>
              <div style={{ fontSize: '0.62rem', fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: '2px' }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 7-DAY FORECAST ── */}
      <div style={{ padding: '1.75rem 1.25rem 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{
            fontFamily: "'Sora',sans-serif",
            fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-white)',
            display: 'flex', alignItems: 'center', gap: '8px',
          }}>
            <span style={{ width: '4px', height: '20px', background: '#06b6d4', borderRadius: '10px', display: 'inline-block' }} />
            📅 {t('forecast')}
          </h2>
          <button
            id="weather-refresh-btn"
            className="btn btn-ghost btn-sm"
            onClick={fetchWeather}
            style={{ fontSize: '0.78rem', padding: '0.4rem 0.85rem' }}
          >
            🔄 {t('refresh') || 'Refresh'}
          </button>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '1rem', scrollbarWidth: 'none' }}>
          {weather.daily.time.map((time, i) => {
            const isToday = i === 0;
            const dayWmo = getWMO(weather.daily.weather_code[i]);
            return (
              <div key={i} className="glass-panel" style={{
                minWidth: '100px',
                padding: '1.25rem 0.75rem',
                textAlign: 'center',
                background: isToday
                  ? 'linear-gradient(160deg, rgba(6,182,212,0.15), rgba(59,130,246,0.12))'
                  : 'var(--bg-card)',
                borderColor: isToday ? '#06b6d4' : 'var(--border)',
                flexShrink: 0,
                transition: 'transform 0.2s',
                cursor: 'default',
              }}>
                <div style={{
                  fontSize: '0.7rem', fontWeight: 800,
                  color: isToday ? '#22d3ee' : 'var(--text-muted)',
                  marginBottom: '0.65rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}>
                  {getDayLabel(time, i, t, language)}
                </div>
                <div style={{ fontSize: '1.65rem', marginBottom: '0.5rem' }}>{dayWmo.icon}</div>
                <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'white' }}>
                  {Math.round(weather.daily.temperature_2m_max[i])}°
                </div>
                <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-dim)', marginTop: '2px' }}>
                  {Math.round(weather.daily.temperature_2m_min[i])}°
                </div>
                {weather.daily.precipitation_sum[i] > 0 && (
                  <div style={{
                    fontSize: '0.65rem', color: '#60a5fa',
                    fontWeight: 700, marginTop: '4px',
                  }}>
                    💧 {weather.daily.precipitation_sum[i]}mm
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── FARMING ADVISORY ── */}
      <div style={{ padding: '0 1.25rem 1.5rem' }}>
        <div style={{
          background: 'linear-gradient(135deg, rgba(16,185,129,0.09), rgba(6,182,212,0.06))',
          border: '1px solid rgba(16,185,129,0.22)',
          borderRadius: '22px',
          padding: '1.5rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.85rem' }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12,
              background: 'rgba(16,185,129,0.15)',
              border: '1px solid rgba(16,185,129,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.1rem', flexShrink: 0,
            }}>💡</div>
            <h3 style={{
              fontFamily: "'Sora',sans-serif",
              fontSize: '1rem',
              color: 'var(--green-main)',
              fontWeight: 800,
            }}>
              {t('advisory') || t('farmingAdvice')}
            </h3>
          </div>
          <p style={{
            fontSize: '0.95rem',
            lineHeight: 1.65,
            fontWeight: 600,
            color: 'rgba(255,255,255,0.9)',
          }}>
            {getAdvisory()}
          </p>
        </div>
      </div>
    </div>
  );
}
