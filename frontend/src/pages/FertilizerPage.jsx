import { useState } from 'react';
import axios from 'axios';
import { useLanguage } from '../context/LanguageContext';
import Translate from '../components/Translate';

const API = 'http://localhost:5000/api';
const SOIL_TYPES = ['loamy', 'clay', 'sandy', 'black', 'alluvial', 'red'];
const CROPS = ['wheat', 'rice', 'cotton', 'maize', 'sugarcane', 'groundnut', 'onion', 'soybean'];

export default function FertilizerPage() {
  const { t } = useLanguage();
  const [form, setForm] = useState({ soilType:'', cropName:'', nitrogen:'', phosphorus:'', potassium:'', landSize:'' });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.soilType || !form.cropName || !form.nitrogen || !form.phosphorus || !form.potassium || !form.landSize) {
      setError(t('fillAll') || 'Please fill all fields.'); return;
    }
    setLoading(true); setError(''); setResult(null);
    try {
      const res = await axios.post(`${API}/fertilizer/calculate`, {
        ...form,
        nitrogen: parseFloat(form.nitrogen),
        phosphorus: parseFloat(form.phosphorus),
        potassium: parseFloat(form.potassium),
        landSize: parseFloat(form.landSize)
      });
      setResult(res.data);
    } catch (err) {
      setError(err?.response?.data?.error || t('wrongCredentials') || 'Failed to calculate.');
    } finally { setLoading(false); }
  };

  return (
    <div className="page-wrapper animate-up">

      {/* ── HEADER ── */}
      <div style={{
        padding:'1.5rem 1.5rem 1.75rem',
        background:'linear-gradient(180deg, rgba(168,85,247,0.08) 0%, transparent 100%)',
        borderBottom:'1px solid var(--border)',
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
          <div style={{
            width:48, height:48, borderRadius:16,
            background:'rgba(168,85,247,0.12)', border:'1.5px solid rgba(168,85,247,0.3)',
            display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.6rem',
          }}>🧪</div>
          <div>
            <h1 style={{
              fontFamily:"'Sora',sans-serif", fontSize:'1.65rem', fontWeight:800,
              background:'linear-gradient(135deg,#fff 30%,#c084fc 100%)',
              WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text',
            }}>{t('fertilizer')}</h1>
            <p style={{ fontSize:'0.82rem', color:'var(--text-muted)', marginTop:'2px' }}>
              {t('fertilizerDesc') || 'Precision nutrient recommendations.'}
            </p>
          </div>
        </div>
      </div>

      <div style={{ padding:'1.5rem 1.25rem' }}>

        {/* ── FORM CARD ── */}
        <div className="card card-p-lg" style={{ marginBottom:'1.5rem' }}>
          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>
            
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
              <div className="form-group">
                <label className="form-label">🪨 {t('soilType')}</label>
                <select className="form-select" value={form.soilType} onChange={e=>set('soilType',e.target.value)}>
                  <option value="">{t('select')}</option>
                  {SOIL_TYPES.map(s=><option key={s} value={s}>{t(s)}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">🌾 {t('cropName')}</label>
                <select className="form-select" value={form.cropName} onChange={e=>set('cropName',e.target.value)}>
                  <option value="">{t('select')}</option>
                  {CROPS.map(c=><option key={c} value={c}>{t(c)}</option>)}
                </select>
              </div>
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:'1rem' }}>
              <div className="form-group">
                <label className="form-label">N (Nitrogen)</label>
                <input className="form-input" type="number" placeholder="PPM" value={form.nitrogen} onChange={e=>set('nitrogen',e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">P (Phos.)</label>
                <input className="form-input" type="number" placeholder="PPM" value={form.phosphorus} onChange={e=>set('phosphorus',e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">K (Potas.)</label>
                <input className="form-input" type="number" placeholder="PPM" value={form.potassium} onChange={e=>set('potassium',e.target.value)} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">📐 {t('landSize')} (Acres)</label>
              <input className="form-input" type="number" step="0.1" placeholder="e.g. 5" value={form.landSize} onChange={e=>set('landSize',e.target.value)} />
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            <button type="submit" className="btn btn-full btn-lg" style={{ background:'linear-gradient(135deg,rgba(168,85,247,0.9),rgba(147,51,234,0.9))', color:'white', border:'none' }} disabled={loading}>
              {loading ? <><span className="spinner" style={{borderWidth:2,width:20,height:20}}/> {t('analyzing')}</> : `🧪 ${t('calculate') || 'Calculate'}`}
            </button>
          </form>
        </div>

        {/* ── RESULTS ── */}
        {result && (
          <div className="animate-up" style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>
            
            {/* Macro Nutrients */}
            <div style={{
              background:'linear-gradient(135deg, rgba(168,85,247,0.12), rgba(126,34,206,0.08))',
              border:'1px solid rgba(168,85,247,0.3)',
              borderRadius:'var(--r-lg)', padding:'1.5rem',
            }}>
              <h2 style={{ fontFamily:"'Sora',sans-serif", fontSize:'1.1rem', fontWeight:800, color:'var(--text-white)', marginBottom:'1rem', textAlign:'center' }}>
                🎯 Nutrient Plan (Total)
              </h2>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'0.75rem' }}>
                {[
                  { k:'nitrogen', l:'NITROGEN (N)', c:'#a855f7' },
                  { k:'phosphorus', l:'PHOSPHORUS (P)', c:'#d946ef' },
                  { k:'potassium', l:'POTASSIUM (K)', c:'#ec4899' },
                ].map(n=>(
                  <div key={n.k} style={{
                    background:'rgba(255,255,255,0.04)', border:'1px solid var(--border-light)',
                    borderRadius:'var(--r-md)', padding:'1rem 0.5rem', textAlign:'center',
                  }}>
                    <div style={{ fontSize:'1.4rem', fontWeight:900, color:n.c, fontFamily:"'Sora',sans-serif" }}>
                      {result.recommendation[n.k]}<span style={{ fontSize:'0.8rem', fontWeight:700 }}>kg</span>
                    </div>
                    <div style={{ fontSize:'0.62rem', fontWeight:800, color:'var(--text-dim)', marginTop:'4px', textTransform:'uppercase' }}>
                      {n.l}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Application Guide */}
            <div className="card card-p" style={{ padding:'1.25rem' }}>
              <h3 style={{ fontSize:'0.9rem', fontWeight:800, color:'white', marginBottom:'1.25rem', display:'flex', alignItems:'center', gap:'8px' }}>
                📜 Expert Application Guide
              </h3>
              
              <div style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>
                <div style={{ background:'rgba(16,185,129,0.06)', border:'1px solid rgba(16,185,129,0.15)', borderRadius:'var(--r-md)', padding:'1rem' }}>
                  <h4 style={{ color:'var(--green-main)', fontSize:'0.75rem', fontWeight:800, marginBottom:'0.5rem', textTransform:'uppercase', letterSpacing:'0.05em' }}>
                    🌱 Organic Boosters
                  </h4>
                  <p style={{ fontSize:'0.87rem', color:'var(--text-secondary)', lineHeight:1.65 }}>
                    <Translate text={result.recommendation.organic} />
                  </p>
                </div>
                
                <div style={{ background:'rgba(59,130,246,0.06)', border:'1px solid rgba(59,130,246,0.15)', borderRadius:'var(--r-md)', padding:'1rem' }}>
                  <h4 style={{ color:'var(--blue-light)', fontSize:'0.75rem', fontWeight:800, marginBottom:'0.5rem', textTransform:'uppercase', letterSpacing:'0.05em' }}>
                    🧪 Micronutrient Plan
                  </h4>
                  <p style={{ fontSize:'0.87rem', color:'var(--text-secondary)', lineHeight:1.65 }}>
                    <Translate text={result.recommendation.micronutrients} />
                  </p>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
