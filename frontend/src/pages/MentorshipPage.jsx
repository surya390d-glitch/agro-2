import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useLanguage } from '../context/LanguageContext';
import { addToast } from '../components/ToastContainer';
import Translate from '../components/Translate';

const API = 'http://localhost:5000/api';

export default function MentorshipPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [crops, setCrops] = useState([]);
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingTasks, setLoadingTasks] = useState(false);

  useEffect(() => {
    axios.get(`${API}/crop/my-crops`)
      .then(res => setCrops(res.data.crops))
      .catch(()=>{})
      .finally(()=>setLoading(false));
  }, []);

  const loadTasks = async (cid) => {
    setLoadingTasks(true);
    try {
      const res = await axios.get(`${API}/crop/mentorship/${cid}`);
      setSelectedCrop(res.data.crop); setTasks(res.data.tasks);
    } catch { addToast('Load failed', 'error'); }
    finally { setLoadingTasks(false); }
  };

  const toggleTask = async (task) => {
    try {
      await axios.put(`${API}/crop/mentorship/task/${task.id}`, { isCompleted: !task.is_completed });
      setTasks(p => p.map(t => t.id===task.id ? {...t, is_completed: t.is_completed?0:1 } : t));
      addToast(task.is_completed ? 'Task pending' : '✅ Task complete', 'success');
    } catch { addToast('Failed update', 'error'); }
  };

  const completed = tasks.filter(t=>t.is_completed).length;
  const progress  = tasks.length ? Math.round((completed/tasks.length)*100) : 0;
  const byWeek    = tasks.reduce((acc, t) => { const w=t.week_number; if(!acc[w])acc[w]=[]; acc[w].push(t); return acc; }, {});

  if (loading) return <div className="page-wrapper" style={{display:'flex', alignItems:'center', justifyContent:'center'}}><div className="spinner" /></div>;

  return (
    <div className="page-wrapper animate-up">
      {/* ── HEADER ── */}
      <div style={{
        padding:'1.5rem 1.5rem 1.75rem',
        background:'linear-gradient(180deg, rgba(251,146,60,0.08) 0%, transparent 100%)',
        borderBottom:'1px solid var(--border)',
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'0.5rem' }}>
          <div style={{
            width:48, height:48, borderRadius:16,
            background:'rgba(251,146,60,0.12)', border:'1.5px solid rgba(251,146,60,0.3)',
            display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.6rem',
          }}>🎯</div>
          <div>
            <h1 style={{
              fontFamily:"'Sora',sans-serif", fontSize:'1.65rem', fontWeight:800,
              background:'linear-gradient(135deg,#fff 30%,#fb923c 100%)',
              WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text',
            }}>{t('myMentorship') || 'Mentorship'}</h1>
            <p style={{ fontSize:'0.82rem', color:'var(--text-muted)', marginTop:'2px' }}>
              Your guided farming journey.
            </p>
          </div>
        </div>
      </div>

      <div style={{ padding:'1.5rem 1.25rem' }}>
        
        {crops.length===0 ? (
          <div className="card card-p" style={{ textAlign:'center', padding:'3rem 1.5rem' }}>
            <div style={{ fontSize:'3rem', marginBottom:'1rem' }}>🌱</div>
            <h3 style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, color:'white', marginBottom:'0.5rem' }}>{t('noCropsActive') || 'No crops active'}</h3>
            <p style={{ fontSize:'0.9rem', color:'var(--text-muted)', marginBottom:'1.5rem', lineHeight:1.5 }}>
              {t('noCropsDesc') || 'Use Crop Advisor to get AI suggestions and start tracking a crop.'}
            </p>
            <button className="btn btn-primary" onClick={()=>navigate('/crop-advisor')} style={{ background:'linear-gradient(135deg,#f97316,#ea580c)', border:'none' }}>
              🌾 {t('goToAdvisor') || 'Go to Advisor'}
            </button>
          </div>
        ) : !selectedCrop ? (
          <div>
            <h3 style={{ fontFamily:"'Sora',sans-serif", fontSize:'1.1rem', fontWeight:800, color:'white', marginBottom:'1rem', display:'flex', alignItems:'center', gap:'8px' }}>
              <div style={{ width:4, height:20, background:'#fb923c', borderRadius:10 }} /> 
              🌾 {t('myCrops')}
            </h3>
            <div style={{ display:'flex', flexDirection:'column', gap:'0.85rem' }}>
              {crops.map(c => (
                <div key={c.id} className="card card-p" style={{ cursor:'pointer', borderLeft:'4px solid #fb923c' }} onClick={()=>loadTasks(c.id)}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <div>
                      <div style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:'1.1rem', color:'white' }}>{t(c.crop_name)}</div>
                      <div style={{ fontSize:'0.8rem', color:'var(--text-secondary)', marginTop:'4px' }}>
                        {c.land_size} ac • {t(c.season)} • {t(c.soil_type)}
                      </div>
                      <div style={{ fontSize:'0.75rem', color:'var(--text-dim)', marginTop:'8px', fontWeight:600 }}>
                        ⏳ {t('started') || 'Started'}: {new Date(c.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div style={{
                      background:'rgba(251,146,60,0.1)', color:'#fb923c', border:'1px solid rgba(251,146,60,0.3)',
                      padding:'0.4rem 0.8rem', borderRadius:'var(--r-full)', fontSize:'0.75rem', fontWeight:800, textTransform:'uppercase'
                    }}>
                      {c.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="animate-up">
            <button className="btn btn-ghost" onClick={()=>{setSelectedCrop(null);setTasks([]);}} style={{ marginBottom:'1rem', padding:'0.5rem 1rem', fontSize:'0.85rem' }}>
              ← {t('back') || 'Back'}
            </button>

            {/* Progress Card */}
            <div style={{
              background:'linear-gradient(135deg,rgba(249,115,22,0.15),rgba(234,88,12,0.1))',
              border:'1px solid rgba(249,115,22,0.3)', borderRadius:'var(--r-lg)',
              padding:'1.5rem', marginBottom:'1.5rem'
            }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1rem' }}>
                <div>
                  <h3 style={{ fontFamily:"'Sora',sans-serif", fontSize:'1.2rem', fontWeight:900, color:'white' }}>{t(selectedCrop.crop_name)}</h3>
                  <div style={{ fontSize:'0.8rem', color:'var(--orange-light)', fontWeight:600 }}>{selectedCrop.land_size} ac • {t(selectedCrop.season)}</div>
                </div>
                <div style={{ textAlign:'right' }}>
                  <div style={{ fontFamily:"'Sora',sans-serif", fontSize:'1.8rem', fontWeight:900, color:'#fb923c', lineHeight:1 }}>{progress}%</div>
                  <div style={{ fontSize:'0.7rem', color:'var(--text-muted)', fontWeight:700, textTransform:'uppercase' }}>{t('progress')}</div>
                </div>
              </div>

              {/* Bar */}
              <div style={{ height:8, background:'rgba(255,255,255,0.08)', borderRadius:10, overflow:'hidden', marginBottom:'0.75rem' }}>
                <div style={{ height:'100%', width:`${progress}%`, background:'linear-gradient(90deg,#f97316,#fbbf24)', borderRadius:10, transition:'width 0.5s' }} />
              </div>

              <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.75rem', fontWeight:700, color:'var(--text-secondary)' }}>
                <span>✅ {completed} {t('completed')}</span>
                <span>⏳ {tasks.length - completed} {t('pending')}</span>
              </div>
            </div>

            {loadingTasks && <div className="spinner" style={{display:'block',margin:'2rem auto',borderTopColor:'#fb923c'}} />}

            <div style={{ display:'flex', flexDirection:'column', gap:'1.5rem' }}>
              {Object.entries(byWeek).map(([w, wTasks]) => (
                <div key={w}>
                  <h4 style={{ fontSize:'0.8rem', fontWeight:800, color:'var(--orange-light)', marginBottom:'0.85rem', textTransform:'uppercase', letterSpacing:'0.05em' }}>
                    📅 {t('week')} {w}
                  </h4>
                  <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
                    {wTasks.map(tk => (
                      <div key={tk.id} onClick={()=>toggleTask(tk)} className="card card-p" style={{
                        display:'flex', gap:'1rem', alignItems:'flex-start', cursor:'pointer',
                        background: tk.is_completed ? 'rgba(34,197,94,0.04)' : 'var(--bg-card)',
                        border: tk.is_completed ? '1px solid rgba(34,197,94,0.3)' : '1px solid var(--border-light)'
                      }}>
                        <div style={{
                          width:26, height:26, borderRadius:'50%', flexShrink:0,
                          border: tk.is_completed ? 'none' : '2px solid var(--border-light)',
                          background: tk.is_completed ? 'linear-gradient(135deg,#22c55e,#16a34a)' : 'transparent',
                          display:'flex', alignItems:'center', justifyContent:'center',
                          color:'white', fontSize:'0.8rem', transition:'all 0.2s', marginTop:'2px'
                        }}>
                          {tk.is_completed && '✓'}
                        </div>
                        <div>
                          <div style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:'0.95rem', color:tk.is_completed?'var(--text-secondary)':'white', textDecoration:tk.is_completed?'line-through':'none', marginBottom:'4px' }}>
                            <Translate text={tk.task_title} />
                          </div>
                          <div style={{ fontSize:'0.85rem', color:'var(--text-dim)', lineHeight:1.5 }}>
                            <Translate text={tk.task_description} />
                          </div>
                          {tk.target_date && <div style={{ fontSize:'0.7rem', color:'var(--orange-light)', fontWeight:700, marginTop:'8px' }}>🗓️ {t('targetDate') || 'Target'}: {tk.target_date}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
