import { useState, useRef } from 'react';
import axios from 'axios';
import { useLanguage } from '../context/LanguageContext';
import Translate from '../components/Translate';

const API = 'http://localhost:5000/api';

export default function DiseaseDetectionPage() {
  const { t } = useLanguage();
  const [image, setImage]       = useState(null);
  const [preview, setPreview]   = useState(null);
  const [result, setResult]     = useState(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [showCamera, setShowCamera] = useState(false);
  const fileRef = useRef(null);
  const videoRef = useRef(null);

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (file) { setImage(file); setPreview(URL.createObjectURL(file)); setResult(null); setError(''); }
  };

  const startCamera = async () => {
    setShowCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video:{ facingMode:'environment' } });
      videoRef.current.srcObject = stream;
    } catch { setError(t('cameraError') || 'Camera access denied.'); setShowCamera(false); }
  };

  const captureImage = () => {
    const canvas = document.createElement('canvas');
    canvas.width  = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext('2d').drawImage(videoRef.current, 0, 0);
    canvas.toBlob((blob) => {
      const file = new File([blob], 'capture.jpg', { type:'image/jpeg' });
      setImage(file); setPreview(URL.createObjectURL(file)); stopCamera();
    }, 'image/jpeg');
  };

  const stopCamera = () => {
    videoRef.current?.srcObject?.getTracks().forEach(t => t.stop());
    setShowCamera(false);
  };

  const handleDetect = async () => {
    if (!image) { setError(t('fillAll')); return; }
    setLoading(true); setError(''); setResult(null);
    const fd = new FormData(); fd.append('image', image);
    try {
      const res = await axios.post(`${API}/disease/detect`, fd);
      setResult(res.data);
    } catch (err) {
      setError(err?.response?.data?.error || t('wrongCredentials'));
    } finally { setLoading(false); }
  };

  return (
    <div className="page-wrapper animate-up">

      {/* ── HEADER ── */}
      <div style={{
        padding:'1.5rem 1.5rem 1.75rem',
        background:'linear-gradient(180deg, rgba(245,158,11,0.08) 0%, transparent 100%)',
        borderBottom:'1px solid var(--border)',
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
          <div style={{
            width:48, height:48, borderRadius:16,
            background:'rgba(245,158,11,0.12)', border:'1.5px solid rgba(245,158,11,0.3)',
            display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.6rem',
          }}>🔬</div>
          <div>
            <h1 style={{
              fontFamily:"'Sora',sans-serif", fontSize:'1.65rem', fontWeight:800,
              background:'linear-gradient(135deg,#fff 30%,#fbbf24 100%)',
              WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text',
            }}>{t('diseaseDetection')}</h1>
            <p style={{ fontSize:'0.82rem', color:'var(--text-muted)', marginTop:'2px' }}>
              {t('diseaseDetectionDesc')}
            </p>
          </div>
        </div>
      </div>

      <div style={{ padding:'1.5rem 1.25rem' }}>

        {/* ── UPLOAD / CAMERA AREA ── */}
        <div className="card card-p" style={{ marginBottom:'1.25rem', textAlign:'center' }}>

          {showCamera ? (
            <div style={{ borderRadius:'var(--r-md)', overflow:'hidden', background:'#000', position:'relative' }}>
              <video ref={videoRef} autoPlay playsInline style={{ width:'100%', display:'block', maxHeight:320 }} />
              <div style={{
                position:'absolute', bottom:'1.25rem', left:0, right:0,
                display:'flex', justifyContent:'center', gap:'1rem',
              }}>
                <button className="btn btn-primary" onClick={captureImage}
                  style={{ width:64, height:64, borderRadius:'50%', padding:0, fontSize:'1.6rem' }}>📸</button>
                <button onClick={stopCamera}
                  style={{ width:64, height:64, borderRadius:'50%', border:'none',
                    background:'rgba(0,0,0,0.6)', color:'white', fontSize:'1.4rem', cursor:'pointer' }}>✕</button>
              </div>
            </div>
          ) : preview ? (
            <div style={{ position:'relative', display:'inline-block', width:'100%' }}>
              <img src={preview} alt="Plant" style={{
                width:'100%', borderRadius:'var(--r-md)', maxHeight:300,
                objectFit:'cover', display:'block',
              }} />
              <button onClick={() => { setImage(null); setPreview(null); setResult(null); }} style={{
                position:'absolute', top:10, right:10,
                background:'rgba(0,0,0,0.7)', border:'none', color:'white',
                width:34, height:34, borderRadius:'50%', fontSize:'1rem',
                display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer',
              }}>✕</button>
            </div>
          ) : (
            <div
              id="upload-drop-zone"
              onClick={() => fileRef.current?.click()}
              style={{
                height:220, border:'2px dashed rgba(245,158,11,0.35)',
                borderRadius:'var(--r-md)', display:'flex', flexDirection:'column',
                alignItems:'center', justifyContent:'center', gap:'0.85rem',
                cursor:'pointer', background:'rgba(245,158,11,0.04)',
                transition:'all 0.25s',
              }}
              onMouseEnter={e => e.currentTarget.style.background='rgba(245,158,11,0.08)'}
              onMouseLeave={e => e.currentTarget.style.background='rgba(245,158,11,0.04)'}
            >
              <div style={{ fontSize:'3rem' }}>🌿</div>
              <div style={{ fontWeight:700, color:'var(--orange-light)', fontSize:'0.92rem' }}>
                {t('uploadPhoto')}
              </div>
              <div style={{ fontSize:'0.75rem', color:'var(--text-dim)' }}>
                JPG · PNG · WEBP
              </div>
            </div>
          )}

          <input ref={fileRef} type="file" hidden accept="image/*" onChange={handleFile} />

          {/* Action buttons */}
          {!showCamera && !preview && (
            <div style={{ display:'flex', gap:'0.75rem', marginTop:'1rem' }}>
              <button className="btn btn-ghost btn-full" onClick={() => fileRef.current?.click()}>
                📁 {t('uploadPhoto')}
              </button>
              <button
                className="btn btn-full"
                onClick={startCamera}
                style={{ background:'linear-gradient(135deg,#f59e0b,#d97706)', color:'white', border:'none' }}
              >
                📷 {t('takePhoto')}
              </button>
            </div>
          )}

          {preview && !loading && (
            <button
              id="detect-btn"
              className="btn btn-full btn-lg"
              onClick={handleDetect}
              style={{ marginTop:'1rem', background:'linear-gradient(135deg,#f59e0b,#d97706)', color:'white', border:'none' }}
            >
              ✨ {t('detectDisease')}
            </button>
          )}

          {loading && (
            <div style={{ padding:'2rem', textAlign:'center' }}>
              <div className="spinner" style={{ borderTopColor:'#f59e0b', width:48, height:48, marginBottom:'1rem' }} />
              <div style={{ fontWeight:700, color:'var(--orange-light)', fontSize:'0.9rem' }}>
                {t('analyzing')}
              </div>
            </div>
          )}

          {error && <div className="alert alert-error" style={{ marginTop:'1rem' }}>{error}</div>}
        </div>

        {/* ── RESULTS ── */}
        {result && (
          <div className="animate-up" style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>

            {/* Disease name + confidence */}
            <div style={{
              background:'linear-gradient(135deg,rgba(245,158,11,0.1),rgba(249,115,22,0.08))',
              border:'1px solid rgba(245,158,11,0.25)',
              borderRadius:'var(--r-lg)', padding:'1.5rem',
              display:'flex', justifyContent:'space-between', alignItems:'center',
            }}>
              <div>
                <div style={{ fontSize:'0.72rem', fontWeight:800, color:'var(--orange-light)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'0.4rem' }}>
                  {t('diseaseDetection')}
                </div>
                <h2 style={{ fontFamily:"'Sora',sans-serif", fontSize:'1.4rem', fontWeight:800, color:'var(--text-white)' }}>
                  {result.diseaseName}
                </h2>
              </div>
              <div style={{
                background:'rgba(245,158,11,0.12)', border:'1px solid rgba(245,158,11,0.3)',
                borderRadius:'var(--r-md)', padding:'0.75rem 1rem', textAlign:'center',
              }}>
                <div style={{ fontFamily:"'Sora',sans-serif", fontWeight:900, fontSize:'1.4rem', color:'#fbbf24' }}>
                  {result.confidence}%
                </div>
                <div style={{ fontSize:'0.65rem', color:'var(--text-dim)', fontWeight:700, textTransform:'uppercase' }}>
                  {t('accuracy')}
                </div>
              </div>
            </div>

            {/* Prevention */}
            <div style={{
              background:'rgba(255,255,255,0.03)', border:'1px solid var(--border-light)',
              borderRadius:'var(--r-lg)', padding:'1.25rem',
            }}>
              <div style={{ fontSize:'0.72rem', fontWeight:800, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'0.75rem' }}>
                📜 {t('prevention')}
              </div>
              <div style={{ fontSize:'0.9rem', color:'var(--text-secondary)', lineHeight:1.7 }}>
                <Translate text={result.preventiveMeasures} />
              </div>
            </div>

            {/* Fertilizer recommendation */}
            <div style={{
              background:'rgba(16,185,129,0.07)', border:'1px solid rgba(16,185,129,0.22)',
              borderRadius:'var(--r-lg)', padding:'1.25rem',
            }}>
              <div style={{ fontSize:'0.72rem', fontWeight:800, color:'var(--green-main)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'0.75rem' }}>
                🧪 {t('fertilizerRec')}
              </div>
              <div style={{ fontSize:'0.9rem', color:'var(--text-secondary)', lineHeight:1.7 }}>
                <Translate text={result.fertilizerRecommendation} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
