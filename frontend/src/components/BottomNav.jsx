import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const navItems = [
  { path: '/',            icon: '🏠', key: 'home'            },
  { path: '/crop-advisor',icon: '🌾', key: 'cropAdvisor'     },
  { path: '/disease',     icon: '🔬', key: 'diseaseDetection' },
  { path: '/chatbot',     icon: '🤖', key: 'chatbot'         },
  { path: '/weather',     icon: '🌤️', key: 'weather'         },
  { path: '/market',      icon: '📈', key: 'marketPrice'     },
  { path: '/fertilizer',  icon: '🧪', key: 'fertilizer'      },
  { path: '/mentorship',  icon: '🎯', key: 'myMentorship'    },
];

export default function BottomNav() {
  const navigate = useNavigate();
  const loc = useLocation();
  const { t } = useLanguage();

  // Show only 5 primary items in nav to avoid overcrowding
  const primary = navItems.slice(0, 5);

  return (
    <nav className="bottom-nav" role="navigation" aria-label="Main navigation">
      {primary.map(item => {
        const isActive = loc.pathname === item.path;
        return (
          <button
            key={item.path}
            id={`nav-${item.key}`}
            className={`bottom-nav-item ${isActive ? 'active' : ''}`}
            onClick={() => navigate(item.path)}
            aria-current={isActive ? 'page' : undefined}
          >
            <span
              className="nav-icon"
              style={{
                filter: isActive ? 'drop-shadow(0 0 6px rgba(16,185,129,0.6))' : 'none',
              }}
            >
              {item.icon}
            </span>
            <span style={{
              fontWeight: 700,
              fontSize: '0.6rem',
              letterSpacing: '0.02em',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '48px',
              textAlign: 'center',
            }}>
              {t(item.key)}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
