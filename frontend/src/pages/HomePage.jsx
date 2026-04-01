import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useLocation } from '../context/LocationContext';
import LanguageSwitcher from '../components/LanguageSwitcher';

const modules = [
  { path: '/crop-advisor', icon: '🌾', key: 'cropAdvisor',      accent: '#10b981', bg: 'rgba(16,185,129,0.12)'  },
  { path: '/disease',      icon: '🔬', key: 'diseaseDetection', accent: '#f59e0b', bg: 'rgba(245,158,11,0.12)'  },
  { path: '/chatbot',      icon: '🤖', key: 'chatbot',          accent: '#3b82f6', bg: 'rgba(59,130,246,0.12)'  },
  { path: '/weather',      icon: '🌤️', key: 'weather',          accent: '#06b6d4', bg: 'rgba(6,182,212,0.12)'   },
  { path: '/pest-alerts',  icon: '🐛', key: 'pestAlerts',       accent: '#ef4444', bg: 'rgba(239,68,68,0.12)'   },
  { path: '/market',       icon: '📈', key: 'marketPrice',      accent: '#22c55e', bg: 'rgba(34,197,94,0.12)'   },
  { path: '/fertilizer',   icon: '🧪', key: 'fertilizer',       accent: '#a855f7', bg: 'rgba(168,85,247,0.12)'  },
  { path: '/mentorship',   icon: '🎯', key: 'myMentorship',     accent: '#fb923c', bg: 'rgba(251,146,60,0.12)'  },
];

function getGreeting(t) {
  const h = new Date().getHours();
  if (h < 12) return t('goodMorning');
  if (h < 17) return t('goodAfternoon');
  return t('goodEvening');
}

export default function HomePage() {
  const { user, logout } = useAuth();
  const { t, language } = useLanguage();
  const { location, locationName, requestLocation } = useLocation();
  const navigate = useNavigate();
  const [showLocModal, setShowLocModal] = useState(false);

  useEffect(() => {
    const init = async () => {
      const loc = await requestLocation();
      if (!loc) setShowLocModal(true);
    };
    init();
  }, []);

  const firstName = user?.name?.split(' ')[0] || t('farmer') || 'Farmer';

  return (
    <div className="page-wrapper animate-up" style={{ paddingBottom: 'calc(var(--nav-h) + 28px)' }}>

      {/* ── TOP BAR ── */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '1rem 1.25rem',
        background: 'rgba(3,7,16,0.6)',
        borderBottom: '1px solid var(--border)',
        backdropFilter: 'blur(16px)',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
          <div style={{
            width: 38, height: 38, borderRadius: 12,
            background: 'rgba(16,185,129,0.15)',
            border: '1.5px solid rgba(16,185,129,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.3rem',
          }}>🌱</div>
          <span style={{
            fontFamily: "'Sora', sans-serif",
            fontWeight: 800, fontSize: '1.05rem',
            color: 'var(--text-white)',
            letterSpacing: '-0.01em',
          }}>
            {t('appName')}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <LanguageSwitcher />
          <button
            id="logout-btn"
            onClick={logout}
            style={{
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.2)',
              color: '#f87171',
              padding: '0.45rem 0.9rem',
              borderRadius: 'var(--r-full)',
              fontSize: '0.78rem',
              fontWeight: 700,
              fontFamily: 'inherit',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.target.style.background = 'rgba(239,68,68,0.2)'; }}
            onMouseLeave={e => { e.target.style.background = 'rgba(239,68,68,0.1)'; }}
          >
            {t('logout')}
          </button>
        </div>
      </div>

      {/* ── HERO BANNER ── */}
      <div style={{ padding: '2rem 1.5rem 1.5rem', position: 'relative' }}>
        {/* subtle grid decoration */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.025,
          backgroundImage: 'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
          pointerEvents: 'none',
        }} />

        <div className="animate-up" style={{ position: 'relative' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            background: 'rgba(16,185,129,0.1)',
            border: '1px solid rgba(16,185,129,0.25)',
            padding: '0.3rem 0.85rem',
            borderRadius: 'var(--r-full)',
            fontSize: '0.82rem',
            fontWeight: 700,
            color: 'var(--green-main)',
            marginBottom: '0.85rem',
          }}>
            👋 {getGreeting(t)}
          </div>

          <h1 style={{
            fontFamily: "'Sora', sans-serif",
            fontSize: 'clamp(2.2rem, 8vw, 3rem)',
            fontWeight: 800,
            marginBottom: '1rem',
            background: 'linear-gradient(135deg, #fff 40%, rgba(148,163,184,0.8) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            lineHeight: 1.15,
            letterSpacing: '-0.03em',
          }}>
            {firstName}! 🌿
          </h1>

          {/* Location pill */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '7px',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid var(--border-light)',
            padding: '0.5rem 1rem',
            borderRadius: 'var(--r-full)',
            fontSize: '0.85rem',
            fontWeight: 600,
            color: 'var(--text-secondary)',
            marginBottom: '1.75rem',
          }}>
            <span style={{ fontSize: '1rem' }}>📍</span>
            {locationName || t('detectingLocation')}
          </div>

          {/* Stats row */}
          <div className="hero-stats">
            {[
              { b: '8+',                    s: t('modules')  },
              { b: language.toUpperCase(), s: t('language') },
              { b: '99%',                   s: t('accuracy') },
            ].map((st, i) => (
              <div key={i} className="hero-stat" style={{
                flex: 1,
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--r-md)',
              }}>
                <b style={{ color: 'var(--green-main)', fontSize: '1.5rem', fontFamily: "'Sora', sans-serif", fontWeight: 800 }}>{st.b}</b>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{st.s}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── LOCATION PERMISSION MODAL ── */}
      {showLocModal && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(2,6,14,0.88)',
          backdropFilter: 'blur(12px)',
          zIndex: 2000,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '1.5rem',
        }}>
          <div className="glass-panel animate-up" style={{
            padding: '2.5rem 2rem', maxWidth: '380px', width: '100%',
            textAlign: 'center', border: '1px solid var(--green-border)',
          }}>
            <div style={{ fontSize: '4.5rem', marginBottom: '1.25rem' }}>📍</div>
            <h2 style={{
              fontFamily: "'Sora', sans-serif",
              fontSize: '1.6rem', fontWeight: 800,
              color: 'white', marginBottom: '0.75rem',
            }}>
              {t('locationAccess')}
            </h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', lineHeight: 1.65, fontSize: '0.9rem' }}>
              {t('locationMsg')}
            </p>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                className="btn btn-ghost btn-full"
                onClick={() => setShowLocModal(false)}
              >
                {t('skip')}
              </button>
              <button
                id="allow-location-btn"
                className="btn btn-primary btn-full"
                onClick={async () => { await requestLocation(); setShowLocModal(false); }}
              >
                📍 {t('allow')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODULE GRID ── */}
      <div style={{ padding: '0 1.25rem', marginBottom: '2rem' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          marginBottom: '1.25rem',
        }}>
          <div style={{ width: '4px', height: '22px', background: 'var(--green-main)', borderRadius: '10px' }} />
          <h2 style={{
            fontFamily: "'Sora', sans-serif",
            fontSize: '1.2rem', fontWeight: 800,
            color: 'var(--text-white)',
          }}>
            {t('farmIntelligence')}
          </h2>
        </div>

        <div className="module-grid">
          {modules.map((mod, i) => (
            <div
              key={mod.path}
              id={`module-${mod.key}`}
              className="module-card animate-up"
              onClick={() => navigate(mod.path)}
              style={{ animationDelay: `${i * 0.07}s` }}
            >
              {/* Glow corner */}
              <div style={{
                position: 'absolute', top: 0, right: 0,
                width: '70px', height: '70px',
                borderRadius: '50%',
                background: mod.accent,
                opacity: 0.07,
                transform: 'translate(30%, -30%)',
                transition: 'opacity 0.3s',
              }} />

              <div className="icon-wrap" style={{
                background: mod.bg,
                color: mod.accent,
                width: '54px', height: '54px',
                borderRadius: '18px',
                fontSize: '1.65rem',
                border: `1px solid ${mod.accent}30`,
              }}>
                {mod.icon}
              </div>

              <div>
                <div className="module-name">{t(mod.key)}</div>
                <div className="module-desc">{t(mod.key + 'Desc')}</div>
              </div>

              <div style={{
                marginTop: 'auto',
                fontSize: '0.7rem',
                fontWeight: 700,
                color: mod.accent,
                opacity: 0.8,
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}>
                {t('openModule') || 'Open'} →
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── QUICK ACTIONS ── */}
      <div style={{ padding: '0 1.25rem 1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.25rem' }}>
          <div style={{ width: '4px', height: '22px', background: 'var(--orange)', borderRadius: '10px' }} />
          <h2 style={{
            fontFamily: "'Sora', sans-serif",
            fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-white)',
          }}>
            {t('quickActions')}
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
          {[
            { icon: '📸', label: t('scanDisease'), path: '/disease', style: { background: 'linear-gradient(135deg, var(--green-main), var(--green-mid))' } },
            { icon: '📊', label: t('checkPrice'),  path: '/market',  style: { background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-light)', color: 'var(--text-primary)' } },
            { icon: '🎙️', label: t('askAgrobot'), path: '/chatbot',  style: { background: 'linear-gradient(135deg, #7c3aed, #5b21b6)' } },
            { icon: '🎯', label: t('myGoals'),     path: '/mentorship',style:{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-light)', color: 'var(--text-primary)' } },
          ].map((a, i) => (
            <button
              key={i}
              id={`quick-action-${i}`}
              onClick={() => navigate(a.path)}
              style={{
                height: '72px',
                borderRadius: '20px',
                border: 'none',
                color: 'white',
                fontFamily: 'inherit',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'transform 0.25s, box-shadow 0.25s',
                ...a.style,
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              {a.icon} {a.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── DAILY TIP BANNER ── */}
      <div style={{ padding: '0 1.25rem 1rem' }}>
        <div style={{
          background: 'linear-gradient(135deg, rgba(16,185,129,0.08), rgba(6,182,212,0.06))',
          border: '1px solid rgba(16,185,129,0.18)',
          borderRadius: '20px',
          padding: '1.25rem 1.5rem',
          display: 'flex',
          gap: '12px',
          alignItems: 'flex-start',
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: 'rgba(16,185,129,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.2rem', flexShrink: 0,
          }}>💡</div>
          <div>
            <div style={{
              fontSize: '0.72rem', fontWeight: 800,
              color: 'var(--green-main)',
              textTransform: 'uppercase', letterSpacing: '0.08em',
              marginBottom: '0.3rem',
            }}>{t('dailyTip')}</div>
            <p style={{ fontSize: '0.87rem', color: 'var(--text-secondary)', lineHeight: 1.55, fontWeight: 500 }}>
              {t('tipContent')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
