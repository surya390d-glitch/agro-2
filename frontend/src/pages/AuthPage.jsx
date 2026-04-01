import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import LanguageSwitcher from '../components/LanguageSwitcher';
import axios from 'axios';

const STATE_DISTRICTS = {
  'Andhra Pradesh': ['Anantapur', 'Chittoor', 'East Godavari', 'Guntur', 'Krishna', 'Kurnool', 'Prakasam', 'Srikakulam', 'Visakhapatnam', 'Vizianagaram', 'West Godavari', 'YSR Kadapa'],
  'Assam': ['Guwahati', 'Silchar', 'Dibrugarh', 'Jorhat', 'Nagaon', 'Tinsukia', 'Tezpur', 'Bongaigaon', 'Diphu', 'Dhubri'],
  'Bihar': ['Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur', 'Purnia', 'Darbhanga', 'Bihar Sharif', 'Arrah', 'Begusarai', 'Katihar'],
  'Chhattisgarh': ['Raipur', 'Bhilai', 'Bilaspur', 'Korba', 'Rajnandgaon', 'Raigarh', 'Jagdalpur', 'Ambikapur', 'Chirmiri', 'Dhamtari'],
  'Gujarat': ['Ahmedabad', 'Amreli', 'Anand', 'Aravalli', 'Banaskantha', 'Bharuch', 'Bhavnagar', 'Botad', 'Chhota Udaipur', 'Dahod', 'Dang', 'Devbhoomi Dwarka', 'Gandhinagar', 'Gir Somnath', 'Jamnagar', 'Junagadh', 'Kheda', 'Kutch', 'Mahisagar', 'Mehsana', 'Morbi', 'Narmada', 'Navsari', 'Panchmahal', 'Patan', 'Porbandar', 'Rajkot', 'Sabarkantha', 'Surat', 'Surendranagar', 'Tapi', 'Vadodara', 'Valsad'],
  'Haryana': ['Faridabad', 'Gurugram', 'Panipat', 'Ambala', 'Yamunanagar', 'Rohtak', 'Hisar', 'Karnal', 'Sonipat', 'Panchkula'],
  'Himachal Pradesh': ['Shimla', 'Mandi', 'Dharamshala', 'Solan', 'Palampur', 'Baddi', 'Nahan', 'Paonta Sahib', 'Sundarnagar', 'Chamba'],
  'Jharkhand': ['Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro', 'Deoghar', 'Hazaribagh', 'Giridih', 'Ramgarh', 'Medininagar', 'Chirkunda'],
  'Karnataka': ['Bagalkot', 'Ballari', 'Belagavi', 'Bengaluru', 'Bidar', 'Chamarajanagar', 'Chikkaballapur', 'Chikkamagaluru', 'Chitradurga', 'Dakshina Kannada', 'Davanagere', 'Dharwad', 'Gadag', 'Hassan', 'Haveri', 'Kalaburagi', 'Kodagu', 'Kolar', 'Koppal', 'Mandya', 'Mysuru', 'Raichur', 'Ramanagara', 'Shivamogga', 'Tumakuru', 'Udupi', 'Uttara Kannada', 'Vijayapura', 'Yadgir'],
  'Kerala': ['Alappuzha', 'Ernakulam', 'Idukki', 'Kannur', 'Kasaragod', 'Kollam', 'Kottayam', 'Kozhikode', 'Malappuram', 'Palakkad', 'Pathanamthitta', 'Thiruvananthapuram', 'Thrissur', 'Wayanad'],
  'Madhya Pradesh': ['Bhopal', 'Indore', 'Jabalpur', 'Gwalior', 'Ujjain', 'Sagar', 'Dewas', 'Satna', 'Ratlam', 'Rewa'],
  'Maharashtra': ['Ahmednagar', 'Akola', 'Amravati', 'Aurangabad', 'Beed', 'Bhandara', 'Buldhana', 'Chandrapur', 'Dhule', 'Gadchiroli', 'Gondia', 'Hingoli', 'Jalgaon', 'Jalna', 'Kolhapur', 'Latur', 'Mumbai', 'Nagpur', 'Nanded', 'Nandurbar', 'Nashik', 'Osmanabad', 'Palghar', 'Parbhani', 'Pune', 'Raigad', 'Ratnagiri', 'Sangli', 'Satara', 'Sindhudurg', 'Solapur', 'Thane', 'Wardha', 'Washim', 'Yavatmal'],
  'Odisha': ['Bhubaneswar', 'Cuttack', 'Rourkela', 'Brahmapur', 'Sambalpur', 'Puri', 'Balasore', 'Bhadrak', 'Baripada', 'Jharsuguda'],
  'Punjab': ['Amritsar', 'Barnala', 'Bathinda', 'Faridkot', 'Fatehgarh Sahib', 'Fazilka', 'Ferozepur', 'Gurdaspur', 'Hoshiarpur', 'Jalandhar', 'Kapurthala', 'Ludhiana', 'Mansa', 'Moga', 'Pathankot', 'Patiala', 'Rupnagar', 'Sangrur', 'SAS Nagar', 'SBS Nagar', 'Sri Muktsar Sahib', 'Tarn Taran'],
  'Rajasthan': ['Jaipur', 'Jodhpur', 'Kota', 'Bikaner', 'Ajmer', 'Udaipur', 'Bhilwara', 'Alwar', 'Bharatpur', 'Sikar'],
  'Tamil Nadu': ['Ariyalur', 'Chengalpattu', 'Chennai', 'Coimbatore', 'Cuddalore', 'Dharmapuri', 'Dindigul', 'Erode', 'Kallakurichi', 'Kanchipuram', 'Kanyakumari', 'Karur', 'Krishnagiri', 'Madurai', 'Nagapattinam', 'Namakkal', 'Nilgiris', 'Perambalur', 'Pudukkottai', 'Ramanathapuram', 'Ranipet', 'Salem', 'Sivaganga', 'Tenkasi', 'Thanjavur', 'Theni', 'Thoothukudi', 'Tiruchirappalli', 'Tirunelveli', 'Tirupathur', 'Tiruppur', 'Tiruvallur', 'Tiruvannamalai', 'Tiruvarur', 'Vellore', 'Viluppuram', 'Virudhunagar'],
  'Telangana': ['Adilabad', 'Hyderabad', 'Karimnagar', 'Khammam', 'Mahabubnagar', 'Medak', 'Nalgonda', 'Nizamabad', 'Ranga Reddy', 'Warangal'],
  'Uttar Pradesh': ['Agra', 'Aligarh', 'Allahabad', 'Ambedkar Nagar', 'Amethi', 'Amroha', 'Auraiya', 'Azamgarh', 'Baghpat', 'Bahraich', 'Ballia', 'Balrampur', 'Banda', 'Barabanki', 'Bareilly', 'Basti', 'Bhadohi', 'Bijnor', 'Budaun', 'Bulandshahr', 'Chandauli', 'Chitrakoot', 'Deoria', 'Etah', 'Etawah', 'Faizabad', 'Farrukhabad', 'Fatehpur', 'Firozabad', 'Gautam Bagh', 'Ghaziabad', 'Ghazipur', 'Gonda', 'Gorakhpur', 'Hamirpur', 'Hapur', 'Hardoi', 'Hathras', 'Jalaun', 'Jaunpur', 'Jhansi', 'Kannauj', 'Kanpur', 'Kasganj', 'Kaushambi', 'Kushinagar', 'Lakhimpur Kheri', 'Lalitpur', 'Lucknow', 'Maharajganj', 'Mahoba', 'Mainpuri', 'Mathura', 'Mau', 'Meerut', 'Mirzapur', 'Moradabad', 'Muzaffarnagar', 'Pilibhit', 'Pratapgarh', 'Raebareli', 'Rampur', 'Saharanpur', 'Sambhal', 'Sant Kabir Nagar', 'Shahjahanpur', 'Shamli', 'Shravasti', 'Siddharthnagar', 'Sitapur', 'Sonbhadra', 'Sultanpur', 'Unnao', 'Varanasi'],
  'Uttarakhand': ['Dehradun', 'Haridwar', 'Roorkee', 'Haldwani', 'Rudrapur', 'Kashipur', 'Rishikesh', 'Pantnagar', 'Pithoragarh', 'Ramnagar'],
  'West Bengal': ['Kolkata', 'Howrah', 'Darjeeling', 'Jalpaiguri', 'Cooch Behar', 'Malda', 'Murshidabad', 'Nadia', 'Hooghly', 'Purulia']
};

const STATES = Object.keys(STATE_DISTRICTS);

export default function AuthPage() {
  const [tab, setTab] = useState('login');
  const [form, setForm] = useState({ name:'', phone:'', password:'', email:'', state:'', district:'' });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register, user } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  const [translatedStates, setTranslatedStates] = useState({});
  const [translatedDistricts, setTranslatedDistricts] = useState({});

  useEffect(() => {
    if (language === 'en') { setTranslatedStates({}); return; }
    const fetchStates = async () => {
       const text = STATES.join('||');
       try {
         const res = await axios.get(`https://translate.googleapis.com/translate_a/single`, {
           params: { client: 'gtx', sl: 'en', tl: language, dt: 't', q: text }
         });
         const tTxt = res.data[0].map(x => x[0]).join('');
         const arr = tTxt.split('||').map(s => s.trim().replace(/^[\s|]+|[\s|]+$/g, ''));
         const obj = {};
         STATES.forEach((enStr, i) => obj[enStr] = arr[i] || enStr);
         setTranslatedStates(obj);
       } catch { setTranslatedStates({}); }
    }
    fetchStates();
  }, [language]);

  useEffect(() => {
    if (language === 'en' || !form.state) { setTranslatedDistricts({}); return; }
    const dists = STATE_DISTRICTS[form.state] || [];
    if (dists.length === 0) return;
    const fetchDists = async () => {
       const text = dists.join('||');
       try {
         const res = await axios.get(`https://translate.googleapis.com/translate_a/single`, {
           params: { client: 'gtx', sl: 'en', tl: language, dt: 't', q: text }
         });
         const tTxt = res.data[0].map(x => x[0]).join('');
         const arr = tTxt.split('||').map(s => s.trim().replace(/^[\s|]+|[\s|]+$/g, ''));
         const overrides = { ta: { 'Pudukkottai': 'புதுக்கோட்டை' } };
         dists.forEach((enStr, i) => obj[enStr] = (overrides[language] && overrides[language][enStr]) || arr[i] || enStr);
         setTranslatedDistricts(obj);
       } catch { setTranslatedDistricts({}); }
    };
    fetchDists();
  }, [form.state, language]);

  useEffect(() => { if (user) navigate('/'); }, [user]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess(''); setLoading(true);
    try {
      if (tab === 'login') {
        if (!form.phone || !form.password) { setError(t('fillAll')); setLoading(false); return; }
        await login(form.phone, form.password);
      } else {
        if (!form.name || !form.phone || !form.password || !form.state) {
          setError(t('fillAll')); setLoading(false); return;
        }
        await register({ ...form, language });
        setTab('login');
        setSuccess(t('accountCreated'));
      }
    } catch (err) {
      const msg = err?.response?.data?.error;
      setError(msg ? (tab === 'login' ? t('wrongCredentials') : msg) : t('wrongCredentials'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100dvh',
      background: 'var(--bg-deep)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem',
      position: 'relative',
      overflow: 'hidden',
    }}>

      {/* Ambient Background Blobs */}
      <div style={{
        position: 'fixed', top: '-20%', left: '-20%',
        width: '60vw', height: '60vw', maxWidth: '400px', maxHeight: '400px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 0,
      }} />
      <div style={{
        position: 'fixed', bottom: '-15%', right: '-15%',
        width: '50vw', height: '50vw', maxWidth: '350px', maxHeight: '350px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(59,130,246,0.07) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 0,
      }} />

      {/* Language Switcher — top right */}
      <div style={{ position: 'fixed', top: '1.25rem', right: '1.25rem', zIndex: 1001 }}>
        <LanguageSwitcher />
      </div>

      <div style={{ width: '100%', maxWidth: '430px', zIndex: 2, position: 'relative' }}>

        {/* ── BRANDING ── */}
        <div className="animate-up" style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem' }}>
            <div className="auth-logo-ring">🌱</div>
          </div>
          <h1 style={{
            fontFamily: "'Sora', sans-serif",
            fontSize: 'clamp(2rem, 7vw, 2.8rem)',
            fontWeight: 800,
            marginBottom: '0.5rem',
            background: 'linear-gradient(135deg, #fff 30%, rgba(16,185,129,0.9) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            letterSpacing: '-0.02em',
          }}>
            {t('appName')}
          </h1>
          <p style={{
            color: 'var(--text-muted)',
            fontSize: '0.95rem',
            fontWeight: 500,
            lineHeight: 1.5,
          }}>
            {t('tagline')}
          </p>
        </div>

        {/* ── AUTH CARD ── */}
        <div
          className="glass-panel animate-up delay-1"
          style={{ padding: '2rem', borderRadius: '32px' }}
        >
          {/* Tab bar */}
          <div className="auth-tab-bar">
            <button
              className={`auth-tab ${tab === 'login' ? 'active' : ''}`}
              onClick={() => { setTab('login'); setError(''); setSuccess(''); }}
            >
              {t('login')}
            </button>
            <button
              className={`auth-tab ${tab === 'register' ? 'active' : ''}`}
              onClick={() => { setTab('register'); setError(''); setSuccess(''); }}
            >
              {t('register')}
            </button>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>

            {/* ── REGISTER FIELDS ── */}
            {tab === 'register' && (
              <div className="animate-up" style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                {/* Full Name */}
                <div className="form-group">
                  <label className="form-label" htmlFor="auth-name">👤 {t('name')}</label>
                  <input
                    id="auth-name"
                    className="form-input"
                    placeholder={t('namePlaceholder')}
                    value={form.name}
                    onChange={e => set('name', e.target.value)}
                    autoComplete="name"
                  />
                </div>

                {/* State + District */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="auth-state">🗺️ {t('state')}</label>
                    <select
                      id="auth-state"
                      className="form-select"
                      value={form.state}
                      onChange={e => { set('state', e.target.value); set('district', ''); }}
                    >
                      <option value="">{t('select')}</option>
                      {STATES.map(s => <option key={s} value={s}>{translatedStates[s] || t(s) || s}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="auth-district">📍 {t('district')}</label>
                    <select
                      id="auth-district"
                      className="form-select"
                      value={form.district}
                      onChange={e => set('district', e.target.value)}
                      disabled={!form.state}
                    >
                      <option value="">{t('selectDistrict') || 'Select District'}</option>
                      {form.state && STATE_DISTRICTS[form.state]?.map(d => <option key={d} value={d}>{translatedDistricts[d] || t(d) || d}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* ── PHONE ── */}
            <div className="form-group">
              <label className="form-label" htmlFor="auth-phone">📱 {t('phone')}</label>
              <input
                id="auth-phone"
                className="form-input"
                type="tel"
                placeholder={t('phonePlaceholder')}
                value={form.phone}
                onChange={e => set('phone', e.target.value)}
                autoComplete="tel"
                inputMode="numeric"
                maxLength={10}
              />
            </div>

            {/* ── PASSWORD ── */}
            <div className="form-group">
              <label className="form-label" htmlFor="auth-password">🔒 {t('password')}</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="auth-password"
                  className="form-input"
                  type={showPass ? 'text' : 'password'}
                  placeholder={t('passwordPlaceholder')}
                  value={form.password}
                  onChange={e => set('password', e.target.value)}
                  autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
                  style={{ paddingRight: '3rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(p => !p)}
                  style={{
                    position: 'absolute', right: '1rem', top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none', border: 'none',
                    color: 'var(--text-dim)', fontSize: '1rem', cursor: 'pointer',
                    display: 'flex', alignItems: 'center',
                  }}
                  aria-label={showPass ? t('hidePassword') : t('showPassword')}
                >
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* ── ALERTS ── */}
            {error && (
              <div className="alert alert-error animate-in" style={{ borderRadius: '16px' }}>
                <span>⚠️</span> <span>{error}</span>
              </div>
            )}
            {success && (
              <div className="alert alert-success animate-in" style={{ borderRadius: '16px' }}>
                <span>✅</span> <span>{success}</span>
              </div>
            )}

            {/* ── SUBMIT ── */}
            <button
              type="submit"
              id="auth-submit-btn"
              className="btn btn-primary btn-full btn-lg"
              style={{ marginTop: '0.5rem', borderRadius: '20px', fontSize: '1rem', letterSpacing: '0.02em' }}
              disabled={loading}
            >
              {loading
                ? <><span className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} /> {t('loading')}</>
                : tab === 'login'
                  ? <>{t('loginBtn')} →</>
                  : <>{t('registerBtn')} ✨</>
              }
            </button>
          </form>

          {/* ── SWITCH LINK ── */}
          <p style={{
            textAlign: 'center', marginTop: '1.75rem',
            fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500,
            lineHeight: 1.6,
          }}>
            {tab === 'login' ? (
              <>
                {t('noAccount')}
                <span
                  id="switch-to-register"
                  style={{ color: 'var(--green-main)', fontWeight: 800, cursor: 'pointer', marginLeft: '4px' }}
                  onClick={() => { setTab('register'); setError(''); setSuccess(''); }}
                >
                  {t('register')}
                </span>
              </>
            ) : (
              <>
                {t('alreadyRegistered')}
                <span
                  id="switch-to-login"
                  style={{ color: 'var(--green-main)', fontWeight: 800, cursor: 'pointer', marginLeft: '4px' }}
                  onClick={() => { setTab('login'); setError(''); setSuccess(''); }}
                >
                  {t('login')}
                </span>
              </>
            )}
          </p>
        </div>

        {/* Footer note */}
        <p style={{
          textAlign: 'center', marginTop: '1.5rem',
          fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 500,
        }}>
          {t('footerNote')}
        </p>
      </div>
    </div>
  );
}
