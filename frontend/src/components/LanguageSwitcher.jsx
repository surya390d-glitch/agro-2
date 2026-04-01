import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';

const LANGS = [
  { code: 'en', label: 'English',  flag: '🇬🇧', native: 'English'  },
  { code: 'ta', label: 'Tamil',    flag: '🇮🇳', native: 'தமிழ்'    },
  { code: 'hi', label: 'Hindi',    flag: '🇮🇳', native: 'हिंदी'    },
  { code: 'mr', label: 'Marathi',  flag: '🇮🇳', native: 'मराठी'    },
  { code: 'te', label: 'Telugu',   flag: '🇮🇳', native: 'తెలుగు'   },
  { code: 'kn', label: 'Kannada',  flag: '🇮🇳', native: 'ಕನ್ನಡ'   },
  { code: 'ml', label: 'Malayalam',flag: '🇮🇳', native: 'മലയാളം'   },
  { code: 'gu', label: 'Gujarati', flag: '🇮🇳', native: 'ગુજરાતી'  },
];

export default function LanguageSwitcher() {
  const { language, changeLanguage, t } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const current = LANGS.find(l => l.code === language) || LANGS[0];

  return (
    <div style={{ position: 'relative' }} ref={ref}>
      <button
        className="lang-btn"
        onClick={() => setOpen(o => !o)}
        aria-label="Select language"
        id="lang-switcher-btn"
      >
        <span style={{ fontSize: '1rem' }}>{current.flag}</span>
        <span style={{ fontWeight: 700, letterSpacing: '0.01em' }}>{current.native}</span>
        <span style={{
          fontSize: '0.6rem',
          color: 'var(--text-dim)',
          transition: 'transform 0.25s',
          display: 'inline-block',
          transform: open ? 'rotate(180deg)' : 'rotate(0deg)'
        }}>▼</span>
      </button>

      {open && (
        <div className="lang-dropdown animate-in" role="listbox" aria-label="Language options">
          <div style={{
            padding: '0.5rem 1rem 0.4rem',
            fontSize: '0.68rem',
            fontWeight: 800,
            color: 'var(--text-dim)',
            letterSpacing: '0.09em',
            textTransform: 'uppercase',
            borderBottom: '1px solid var(--border)',
            marginBottom: '0.3rem'
          }}>
            {t('selectLanguage') || 'SELECT LANGUAGE'}
          </div>
          {LANGS.map(l => (
            <div
              key={l.code}
              role="option"
              aria-selected={language === l.code}
              className={`lang-option ${language === l.code ? 'active' : ''}`}
              onClick={() => { changeLanguage(l.code); setOpen(false); }}
            >
              <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>{l.flag}</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', flex: 1 }}>
                <span style={{ fontSize: '0.92rem', fontWeight: 700 }}>{l.native}</span>
                <span style={{ fontSize: '0.7rem', fontWeight: 500, opacity: 0.55 }}>{l.label}</span>
              </div>
              {language === l.code && (
                <span style={{ color: 'var(--green-main)', fontSize: '1rem', fontWeight: 900 }}>✓</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
