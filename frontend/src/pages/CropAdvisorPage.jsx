import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useLanguage } from '../context/LanguageContext';
import { addToast } from '../components/ToastContainer';
import Translate from '../components/Translate';

const API = 'http://localhost:5000/api';

const SOIL_TYPES = ['loamy', 'clay', 'sandy', 'black', 'alluvial', 'red'];
const WATER_AVAIL = ['abundant', 'moderate', 'scarce'];
const WATER_SOURCES = ['canal', 'river', 'borewell', 'well', 'rain-fed', 'pond'];
const SEASONS = ['kharif', 'rabi', 'summer', 'annual'];

const suitabilityColors = { Excellent: 'var(--p-green-600)', Good: 'var(--p-gold-deep)', Moderate: 'var(--p-orange)' };

export default function CropAdvisorPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [form, setForm] = useState({ soilType: '', landSize: '', waterAvailability: '', waterSource: '', season: '' });
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectingCrop, setSelectingCrop] = useState(null);
  const [error, setError] = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.soilType || !form.landSize || !form.waterAvailability || !form.waterSource || !form.season) {
      setError('Please fill all fields.'); return;
    }
    setLoading(true); setError(''); setResults(null);
    try {
      const res = await axios.post(`${API}/crop/advise`, form);
      setResults(res.data);
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to get recommendations.');
    } finally { setLoading(false); }
  };

  const handleSelectCrop = async (crop) => {
    setSelectingCrop(crop);
    try {
      await axios.post(`${API}/crop/select`, {
        cropName: crop.crop, soilType: form.soilType,
        landSize: parseFloat(form.landSize), season: form.season, waterSource: form.waterSource
      });
      addToast(`✅ ${crop.crop} selected! Mentorship tasks created.`, 'success');
      navigate('/mentorship');
    } catch (err) {
      addToast('Failed to select crop. Try again.', 'error');
    } finally { setSelectingCrop(null); }
  };

  return (
    <div className="page-wrapper animate-up">
      <div className="page-header-premium">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '2.5rem' }}>🌾</span>
          <div>
            <h1 style={{ fontSize: '2.2rem', fontWeight: 900, background: 'linear-gradient(135deg, var(--p-green-600), var(--p-green-500))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              {t('cropAdvisor')}
            </h1>
            <div style={{ height: '3px', width: '60px', background: 'linear-gradient(90deg, var(--p-green-500), var(--p-gold))', borderRadius: '2px', marginTop: '0.5rem' }}></div>
          </div>
        </div>
        <p style={{ fontSize: '1.1rem', color: 'var(--p-gray-400)', lineHeight: 1.6, maxWidth: '500px' }}>
          {t('cropAdvisorDesc')}
        </p>
      </div>

      <div className="max-container" style={{ padding: '0 1.25rem', marginTop: '-2rem' }}>
        <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem', background: 'linear-gradient(135deg, rgba(255,255,255,0.95), rgba(248,250,249,0.95))', border: '1px solid rgba(255,255,255,0.3)', boxShadow: '0 20px 40px rgba(10, 92, 54, 0.1)' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--p-dark)', marginBottom: '0.5rem' }}>
              🌱 {t('select') || 'Select'} Your Farm Conditions
            </h2>
            <p style={{ color: 'var(--p-gray-400)', fontSize: '0.95rem' }}>
              Provide details about your soil, water, and season for personalized recommendations
            </p>
          </div>
          
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem', fontWeight: 700 }}>
                  <span style={{ fontSize: '1.2rem' }}>🪨</span> {t('soilType')}
                </label>
                <select className="form-select" value={form.soilType} onChange={e => set('soilType', e.target.value)} style={{ padding: '1.2rem', fontSize: '1rem', borderRadius: '12px' }}>
                  <option value="">{t('select') || 'Select'}</option>
                  {SOIL_TYPES.map(s => <option key={s} value={s}>{t(s)}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem', fontWeight: 700 }}>
                  <span style={{ fontSize: '1.2rem' }}>📐</span> {t('landSize')}
                </label>
                <input className="form-input" type="number" min="0.1" step="0.1" placeholder="e.g. 2.5" value={form.landSize} onChange={e => set('landSize', e.target.value)} style={{ padding: '1.2rem', fontSize: '1rem', borderRadius: '12px' }} />
              </div>
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem', fontWeight: 700 }}>
                  <span style={{ fontSize: '1.2rem' }}>💧</span> {t('waterAvailability')}
                </label>
                <select className="form-select" value={form.waterAvailability} onChange={e => set('waterAvailability', e.target.value)} style={{ padding: '1.2rem', fontSize: '1rem', borderRadius: '12px' }}>
                  <option value="">{t('select') || 'Select'}</option>
                  {WATER_AVAIL.map(w => <option key={w} value={w}>{t(w)}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem', fontWeight: 700 }}>
                  <span style={{ fontSize: '1.2rem' }}>🚿</span> {t('waterSource')}
                </label>
                <select className="form-select" value={form.waterSource} onChange={e => set('waterSource', e.target.value)} style={{ padding: '1.2rem', fontSize: '1rem', borderRadius: '12px' }}>
                  <option value="">{t('select') || 'Select'}</option>
                  {WATER_SOURCES.map(w => <option key={w} value={w}>{t(w)}</option>)}
                </select>
              </div>
            </div>
            
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>
                <span style={{ fontSize: '1.2rem' }}>🌦️</span> {t('season')}
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                {SEASONS.map(s => (
                  <button key={s} type="button"
                    onClick={() => set('season', s)}
                    style={{
                      padding: '1.2rem', borderRadius: '16px',
                      fontWeight: 700, fontSize: '1rem', border: '3px solid',
                      borderColor: form.season === s ? 'var(--p-green-500)' : 'var(--p-gray-200)',
                      background: form.season === s ? 'linear-gradient(135deg, var(--p-green-100), var(--p-green-50))' : 'white',
                      color: form.season === s ? 'var(--p-green-600)' : 'var(--p-gray-400)',
                      cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      boxShadow: form.season === s ? '0 8px 25px rgba(18, 138, 84, 0.2)' : '0 2px 8px rgba(0,0,0,0.05)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
                    }}>
                    {s === 'kharif' ? '🌧️' : s === 'rabi' ? '❄️' : s === 'summer' ? '☀️' : '🔄'} {t(s)}
                  </button>
                ))}
              </div>
            </div>

            {error && <div className="alert alert-error" style={{ borderRadius: '12px', padding: '1rem', background: 'linear-gradient(135deg, #fee2e2, #fecaca)', border: '1px solid #fca5a5' }}>{error}</div>}
            
            <button type="submit" className="btn btn-primary" style={{ padding: '1.4rem', fontSize: '1.1rem', borderRadius: '16px', fontWeight: 700, marginTop: '1rem' }} disabled={loading}>
              {loading ? '⏳ ' + t('analyzing') : '🚀 ' + t('getAdvice')}
            </button>
          </form>
        </div>

        {results && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }} className="animate-up">
            <div className="glass-panel" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, rgba(255,255,255,0.95), rgba(248,250,249,0.95))', borderLeft: '5px solid var(--p-blue)', borderRadius: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <span style={{ fontSize: '2rem' }}>📊</span>
                <div>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--p-dark)', marginBottom: '0.25rem' }}>
                    AI Analysis Complete
                  </h3>
                  <p style={{ color: 'var(--p-gray-400)', fontSize: '0.95rem' }}>
                    Based on your farm conditions
                  </p>
                </div>
              </div>
              <Translate text={results.summary} />
            </div>
            
            <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--p-dark)', marginBottom: '0.5rem' }}>
                🎯 Recommended Crops
              </h2>
              <p style={{ color: 'var(--p-gray-400)', fontSize: '1rem' }}>
                Ranked by suitability for your conditions
              </p>
            </div>
            
            {results.recommendations.map((rec, i) => (
              <div key={i} className="glass-panel" style={{ 
                padding: '2rem', 
                borderLeft: `6px solid ${suitabilityColors[rec.suitability] || 'var(--p-green-500)'}`, 
                borderRadius: '20px',
                background: 'linear-gradient(135deg, rgba(255,255,255,0.95), rgba(248,250,249,0.95))',
                boxShadow: '0 10px 30px rgba(10, 92, 54, 0.08)',
                animationDelay: `${0.1 * i}s`,
                position: 'relative',
                overflow: 'hidden'
              }}>
                {i === 0 && (
                  <div style={{ 
                    position: 'absolute', top: '-10px', right: '-10px', 
                    background: 'linear-gradient(135deg, #FFD700, #FFA500)', 
                    color: 'white', padding: '0.5rem 1rem', borderRadius: '20px',
                    fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase',
                    boxShadow: '0 4px 12px rgba(255, 215, 0, 0.3)'
                  }}>
                    🏆 Top Pick
                  </div>
                )}
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '1.8rem' }}>
                        {i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}
                      </span>
                      <h3 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--p-dark)' }}>
                        {t(rec.crop)}
                      </h3>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                       <span style={{ 
                         background: suitabilityColors[rec.suitability], color: 'white', 
                         padding: '0.5rem 1rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 700,
                         display: 'flex', alignItems: 'center', gap: '0.25rem'
                       }}>
                        <span>⭐</span> {t(rec.suitability)}
                       </span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 900, fontSize: '1.5rem', color: 'var(--p-green-600)', marginBottom: '0.25rem' }}>
                      ₹{parseInt(rec.expectedProfitINR).toLocaleString('en-IN')}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--p-gray-400)', fontWeight: 700, textTransform: 'uppercase' }}>
                      {t('expected_profit')}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
                  {[
                    { label: t('expected_yield'), value: `${rec.expectedYieldQuintals} qtl`, icon: '📦', color: 'var(--p-blue)' },
                    { label: t('days_harvest'), value: `${rec.daysToHarvest} days`, icon: '⏳', color: 'var(--p-orange)' },
                    { label: t('accuracy'), value: `${rec.score}/90`, icon: '🎯', color: 'var(--p-green-500)' }
                  ].map(stat => (
                    <div key={stat.label} style={{ 
                      background: 'var(--p-gray-50)', borderRadius: '16px', padding: '1rem 0.75rem', textAlign: 'center',
                      border: '1px solid var(--p-gray-100)', transition: 'all 0.3s ease'
                    }}>
                      <div style={{ fontSize: '1.2rem', fontWeight: 800, color: stat.color, marginBottom: '0.25rem' }}>
                        {stat.icon}
                      </div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--p-dark)' }}>{stat.value}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--p-gray-400)', fontWeight: 700, textTransform: 'uppercase' }}>{stat.label}</div>
                    </div>
                  ))}
                </div>
                
                <div style={{ background: 'linear-gradient(135deg, var(--p-off-white), rgba(255,255,255,0.8))', padding: '1.25rem', borderRadius: '16px', marginBottom: '2rem', fontSize: '1rem', color: 'var(--p-dark)', border: '1px solid var(--p-gray-200)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '1.2rem' }}>💡</span>
                    <span style={{ fontWeight: 700, color: 'var(--p-gray-400)' }}>Farming Tips</span>
                  </div>
                  <Translate text={rec.tips} />
                </div>

                <button
                  className="btn btn-primary w-full"
                  style={{ borderRadius: '16px', padding: '1.2rem', fontSize: '1.1rem', fontWeight: 700 }}
                  onClick={() => handleSelectCrop(rec)}
                  disabled={selectingCrop === rec}
                >
                  {selectingCrop === rec ? '⏳ Processing...' : `🎯 ${t('selectCrop')}`}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
