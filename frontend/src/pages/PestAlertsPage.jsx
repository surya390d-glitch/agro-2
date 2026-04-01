import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useLocation } from '../context/LocationContext';
import { addToast } from '../components/ToastContainer';

const API = 'http://localhost:5000/api';

export default function PestAlertsPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { userState, locationName, requestLocation } = useLocation();
  const [alerts, setAlerts] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      await requestLocation();
      try {
        const stateToUse = userState || user?.state || '';
        const res = await axios.get(`${API}/pest/alerts`, { params: { state: stateToUse } });
        setAlerts(res.data);
        if (res.data.currentAlerts?.length > 0) {
          setTimeout(() => addToast(`🐛 ${res.data.currentAlerts.length} ${t('pestAlerts')} - ${res.data.month}`, 'warning'), 1000);
        }
      } catch { addToast(t('satelliteFailed') || 'Load failed', 'error'); }
      finally { setLoading(false); }
    };
    fetch();
  }, [userState]);

  const STYLES = {
    'Very High': { c: '#ef4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.3)' },
    'High':      { c: '#f97316', bg: 'rgba(249,115,22,0.1)', border: 'rgba(249,115,22,0.3)' },
    'Moderate':  { c: '#facc15', bg: 'rgba(250,204,21,0.1)', border: 'rgba(250,204,21,0.3)' },
    'Low':       { c: '#22c55e', bg: 'rgba(34,197,94,0.1)',  border: 'rgba(34,197,94,0.3)' },
  };

  return (
    <div className="page-wrapper animate-up">
      {/* ── HEADER ── */}
      <div style={{
        padding:'1.5rem 1.5rem 1.75rem',
        background:'linear-gradient(180deg, rgba(239,68,68,0.08) 0%, transparent 100%)',
        borderBottom:'1px solid var(--border)',
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'1rem' }}>
          <div style={{
            width:48, height:48, borderRadius:16,
            background:'rgba(239,68,68,0.12)', border:'1.5px solid rgba(239,68,68,0.3)',
            display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.6rem',
          }}>🐛</div>
          <div>
            <h1 style={{
              fontFamily:"'Sora',sans-serif", fontSize:'1.65rem', fontWeight:800,
              background:'linear-gradient(135deg,#fff 30%,#ef4444 100%)',
              WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text',
            }}>{t('pestAlerts')}</h1>
            <p style={{ fontSize:'0.82rem', color:'var(--text-muted)', marginTop:'2px' }}>
              {t('pestAlertsDesc') || 'AI predictive pest and disease warnings.'}
            </p>
          </div>
        </div>

        {/* Location pill */}
        <div style={{
          display:'inline-flex', alignItems:'center', gap:'6px',
          background:'rgba(255,255,255,0.05)', border:'1px solid var(--border-light)',
          padding:'0.35rem 0.85rem', borderRadius:'var(--r-full)',
          fontSize:'0.75rem', fontWeight:700, color:'var(--text-secondary)',
        }}>
          📍 {locationName || alerts?.state || t('detectingLocation')} • {alerts?.month?.toUpperCase()}
        </div>
      </div>

      <div style={{ padding:'1.5rem 1.25rem' }}>
        {loading && <div style={{ textAlign:'center', padding:'3rem' }}><div className="spinner" style={{ borderTopColor:'#ef4444', width:40,height:40 }} /></div>}

        {alerts && (
          <div style={{ display:'flex', flexDirection:'column', gap:'1.75rem' }}>
            
            {/* ── Current Alerts ── */}
            <div>
              <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'1.25rem' }}>
                <div style={{ width:4, height:20, background:'#ef4444', borderRadius:10 }} />
                <h3 style={{ fontFamily:"'Sora',sans-serif", fontSize:'1.1rem', fontWeight:800, color:'white' }}>
                  🚨 {t('currentAlerts') || 'Active Threats'} ({alerts.currentAlerts.length})
                </h3>
              </div>

              {alerts.currentAlerts.length === 0 ? (
                <div className="card card-p" style={{ textAlign:'center', borderLeft:'4px solid var(--green-main)' }}>
                  ✅ {t('noAlerts') || 'No major active threats.'}
                </div>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
                  {alerts.currentAlerts.map((p, i) => {
                    const st = STYLES[p.severity] || STYLES.Low;
                    return (
                      <div key={i} className="card card-p" style={{ borderLeft:`4px solid ${st.c}` }}>
                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'1rem' }}>
                          <h4 style={{ fontSize:'1.1rem', fontWeight:800, color:'white', fontFamily:"'Sora',sans-serif" }}>
                            {t(p.pest)}
                          </h4>
                          <span style={{
                            background:st.bg, border:`1px solid ${st.border}`, color:st.c,
                            padding:'0.25rem 0.6rem', borderRadius:'var(--r-full)',
                            fontSize:'0.65rem', fontWeight:800, textTransform:'uppercase', letterSpacing:'0.05em'
                          }}>
                            {t(p.severity)}
                          </span>
                        </div>
                        
                        <p style={{ fontSize:'0.85rem', color:'var(--text-secondary)', lineHeight:1.6, marginBottom:'1rem' }}>
                          {p.description}
                        </p>
                        
                        <div style={{ display:'flex', flexWrap:'wrap', gap:'6px', marginBottom:'1.25rem' }}>
                          {p.crops.map(c => (
                            <span key={c} style={{
                              background:'var(--bg-elevated)', border:'1px solid var(--border-light)',
                              color:'var(--text-dim)', padding:'0.2rem 0.6rem', borderRadius:'var(--r-md)',
                              fontSize:'0.7rem', fontWeight:700
                            }}>🌾 {t(c)}</span>
                          ))}
                        </div>

                        <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
                          <div style={{ background:'rgba(59,130,246,0.06)', border:'1px solid rgba(59,130,246,0.15)', borderRadius:'var(--r-md)', padding:'0.85rem' }}>
                            <div style={{ color:'var(--blue-light)', fontSize:'0.7rem', fontWeight:800, marginBottom:'4px', textTransform:'uppercase' }}>🎯 Control</div>
                            <div style={{ fontSize:'0.85rem', color:'var(--text-secondary)', lineHeight:1.5 }}>{p.management}</div>
                          </div>
                          <div style={{ background:'rgba(16,185,129,0.06)', border:'1px solid rgba(16,185,129,0.15)', borderRadius:'var(--r-md)', padding:'0.85rem' }}>
                            <div style={{ color:'var(--green-main)', fontSize:'0.7rem', fontWeight:800, marginBottom:'4px', textTransform:'uppercase' }}>🌿 Organic</div>
                            <div style={{ fontSize:'0.85rem', color:'var(--text-secondary)', lineHeight:1.5 }}>{p.organic}</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ── Upcoming Alerts ── */}
            {alerts.upcomingAlerts.length > 0 && (
              <div>
                 <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'1.25rem' }}>
                  <div style={{ width:4, height:20, background:'#facc15', borderRadius:10 }} />
                  <h3 style={{ fontFamily:"'Sora',sans-serif", fontSize:'1.1rem', fontWeight:800, color:'white' }}>
                    📅 {t('upcomingAlerts') || 'Upcoming Warnings'}
                  </h3>
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
                  {alerts.upcomingAlerts.map((p, i) => (
                    <div key={i} className="card card-p" style={{ background:'rgba(250,204,21,0.04)', borderLeft:'4px solid #facc15' }}>
                      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'0.5rem' }}>
                        <h4 style={{ fontWeight:800, fontSize:'1rem', color:'white', fontFamily:"'Sora',sans-serif" }}>{t(p.pest)}</h4>
                        <span style={{ fontSize:'0.7rem', fontWeight:800, color:'#facc15', textTransform:'uppercase' }}>Soon</span>
                      </div>
                      <p style={{ fontSize:'0.85rem', color:'var(--text-secondary)', lineHeight:1.5 }}>{p.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── General Tips ── */}
            <div className="card card-p">
              <h4 style={{ fontSize:'0.95rem', fontWeight:800, color:'white', marginBottom:'1rem', display:'flex', alignItems:'center', gap:'8px' }}>💡 Integrated Pest Management</h4>
              <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
                {alerts.generalTips.map((tip, i) => (
                  <div key={i} style={{ display:'flex', gap:'10px', alignItems:'flex-start' }}>
                    <span style={{ color:'var(--text-muted)' }}>•</span>
                    <span style={{ fontSize:'0.85rem', color:'var(--text-secondary)', lineHeight:1.5 }}>{tip}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
