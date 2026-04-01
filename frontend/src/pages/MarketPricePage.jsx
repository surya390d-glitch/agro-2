import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useLocation } from '../context/LocationContext';

const API = 'http://localhost:5000/api';

const TRENDS = {
  up:     { icon:'📈', color:'#34d399', bg:'rgba(16,185,129,0.1)' },
  down:   { icon:'📉', color:'#ef4444', bg:'rgba(239,68,68,0.1)' },
  stable: { icon:'➡️', color:'var(--text-muted)', bg:'var(--bg-elevated)' },
};

export default function MarketPricePage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { userState, locationName, requestLocation } = useLocation();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchPrices = async () => {
      setLoading(true);
      await requestLocation();
      try {
        const stateToUse = userState || user?.state || '';
        const res = await axios.get(`${API}/market/prices`, { params: { state: stateToUse } });
        setData(res.data);
      } catch {}
      finally { setLoading(false); }
    };
    fetchPrices();
  }, [userState]);

  const filtered = data?.prices?.filter(p => {
    if (filter === 'up') return p.trend === 'up';
    if (filter === 'down') return p.trend === 'down';
    return true;
  });

  return (
    <div className="page-wrapper animate-up">
      {/* ── HEADER ── */}
      <div style={{
        padding:'1.5rem 1.5rem 1.75rem',
        background:'linear-gradient(180deg, rgba(34,197,94,0.08) 0%, transparent 100%)',
        borderBottom:'1px solid var(--border)',
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'1rem' }}>
          <div style={{
            width:48, height:48, borderRadius:16,
            background:'rgba(34,197,94,0.12)', border:'1.5px solid rgba(34,197,94,0.3)',
            display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.6rem',
          }}>📈</div>
          <div>
            <h1 style={{
              fontFamily:"'Sora',sans-serif", fontSize:'1.65rem', fontWeight:800,
              background:'linear-gradient(135deg,#fff 30%,#22c55e 100%)',
              WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text',
            }}>{t('marketPrice')}</h1>
            <p style={{ fontSize:'0.82rem', color:'var(--text-muted)', marginTop:'2px' }}>
              Real-time Mandi rates & trends.
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
          📍 {locationName || data?.state || t('detectingLocation')} • {data?.lastUpdated ? new Date(data.lastUpdated).toLocaleDateString('en-IN') : ''}
        </div>
      </div>

      <div style={{ padding:'1.5rem 1.25rem' }}>
        {loading && <div style={{ textAlign:'center', padding:'3rem' }}><div className="spinner" style={{ borderTopColor:'#22c55e', width:40,height:40 }} /></div>}

        {data && (
          <div style={{ display:'flex', flexDirection:'column', gap:'2rem' }}>
            
            {/* ── Top Profitable ── */}
            <div>
              <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'1.25rem' }}>
                <div style={{ width:4, height:20, background:'#22c55e', borderRadius:10 }} />
                <h3 style={{ fontFamily:"'Sora',sans-serif", fontSize:'1.1rem', fontWeight:800, color:'white' }}>
                  🏆 {t('topProfitable')}
                </h3>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'0.75rem' }}>
                {data.topProfitable.map((c, i) => (
                  <div key={c.name} className="card" style={{
                    background: i===0 ? 'linear-gradient(135deg,#f59e0b,#d97706)' : 'var(--bg-elevated)',
                    border: i===0 ? 'none' : '1px solid var(--border-light)',
                    padding:'1rem 0.5rem', textAlign:'center',
                  }}>
                    <div style={{ fontSize:'1.4rem', marginBottom:'0.25rem' }}>{i===0?'🥇':i===1?'🥈':'🥉'}</div>
                    <div style={{ fontWeight:800, fontSize:'0.8rem', color: i===0?'rgba(255,255,255,0.9)':'var(--text-secondary)', marginBottom:'0.25rem' }}>
                      {t(c.name)}
                    </div>
                    <div style={{ fontWeight:900, fontSize:'1.1rem', color: i===0?'white':'var(--text-white)', fontFamily:"'Sora',sans-serif" }}>
                      ₹{c.price}
                    </div>
                    <div style={{ fontSize:'0.65rem', fontWeight:700, color: i===0?'rgba(255,255,255,0.7)':'var(--text-dim)' }}>/{c.unit}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Filters ── */}
            <div>
              <div style={{ display:'flex', gap:'0.6rem', marginBottom:'1.25rem', overflowX:'auto', paddingBottom:'0.25rem', scrollbarWidth:'none' }}>
                {[
                  { id:'all', l:'📜 All', c:'var(--blue-light)', b:'rgba(59,130,246,0.1)' },
                  { id:'up', l:'📈 Rising', c:'#34d399', b:'rgba(16,185,129,0.1)' },
                  { id:'down', l:'📉 Falling', c:'#ef4444', b:'rgba(239,68,68,0.1)' }
                ].map(f => (
                  <button key={f.id} onClick={()=>setFilter(f.id)} style={{
                    padding:'0.5rem 1rem', borderRadius:'var(--r-full)',
                    border: filter===f.id ? `1.5px solid ${f.c}` : '1.5px solid var(--border-light)',
                    background: filter===f.id ? f.b : 'var(--bg-elevated)',
                    color: filter===f.id ? f.c : 'var(--text-secondary)',
                    fontWeight:700, fontSize:'0.8rem', cursor:'pointer', transition:'all 0.2s', flexShrink:0,
                    fontFamily:'inherit',
                  }}>
                    {f.l}
                  </button>
                ))}
              </div>

              {/* ── Price List ── */}
              <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
                {filtered?.map((crop, i) => {
                  const tr = TRENDS[crop.trend] || TRENDS.stable;
                  return (
                    <div key={i} className="card card-p" style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                      <div>
                        <div style={{ fontWeight:800, fontSize:'1.1rem', color:'var(--text-white)', fontFamily:"'Sora',sans-serif" }}>
                          {t(crop.name)}
                        </div>
                        <div style={{ fontSize:'0.75rem', color:'var(--text-dim)', marginTop:'2px', fontWeight:600 }}>
                          📍 {crop.market}
                        </div>
                      </div>
                      <div style={{ textAlign:'right' }}>
                        <div style={{ fontWeight:900, fontSize:'1.15rem', color:'var(--text-white)', fontFamily:"'Sora',sans-serif" }}>
                          ₹{crop.price.toLocaleString('en-IN')}
                        </div>
                        <div style={{
                          display:'inline-flex', alignItems:'center', gap:'4px',
                          fontSize:'0.7rem', color:tr.color, fontWeight:800, marginTop:'4px',
                          background:tr.bg, padding:'0.15rem 0.5rem', borderRadius:'var(--r-full)'
                        }}>
                          {tr.icon} {crop.change}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Disclaimer */}
            <div style={{ background:'rgba(59,130,246,0.06)', border:'1px solid rgba(59,130,246,0.15)', borderRadius:'var(--r-md)', padding:'1rem', fontSize:'0.75rem', color:'var(--text-dim)', textAlign:'center', lineHeight:1.5 }}>
              ℹ️ {data.disclaimer}
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
