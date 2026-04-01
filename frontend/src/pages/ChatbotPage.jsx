import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useLanguage } from '../context/LanguageContext';
import { addToast } from '../components/ToastContainer';

const API = 'http://localhost:5000/api';
const VOICE_LANGS  = { en:'en-IN', ta:'ta-IN', hi:'hi-IN', mr:'mr-IN', te:'te-IN', kn:'kn-IN', ml:'ml-IN', gu:'gu-IN' };
const QUICK_PROMPTS = {
  en: ['Control aphids?','Best irrigation time?','Fertilizer for wheat?','Rust disease signs?'],
  ta: ['அசுவினி கட்டுப்பாடு?','நீர்ப்பாசன நேரம்?','உர பரிந்துரை?','துரு நோய் அறிகுறி?'],
  hi: ['एफिड्स नियंत्रण?','सिंचाई का समय?','गेहूं की खाद?','रस्ट रोग लक्षण?'],
  mr: ['मावा नियंत्रण?','पाणी देण्याची वेळ?','खत शिफारस?','तांबेरा रोग?'],
  te: ['అఫిడ్స్ నియంత్రణ?','నీటిపారుదల సమయం?','గోధుమకు ఎరువులు?','తుప్పు వ్యాధి లక్షణాలు?'],
  kn: ['ಗಿಡಹೇನು ನಿಯಂತ್ರಣ?','ನೀರಾವರಿ ಸಮಯ?','ಗೋಧಿಗೆ ರಸಗೊಬ್ಬರ?','ತುಕ್ಕು ರೋಗದ ಲಕ್ಷಣಗಳು?'],
  ml: ['മുഞ്ഞ നിയന്ത്രണം?','നനയ്ക്കാനുള്ള സമയം?','ഗോതമ്പിനുള്ള വളം?','തുരുമ്പ് രോഗം?'],
  gu: ['એફિડ્સ નિયંત્રણ?','સિંચાઈનો સમય?','ઘઉં માટે ખાતર?','ગેરુ રોગના લક્ષણો?'],
};

const BOT_GREETING = {
  en: "Hello! I'm AgroBot 🌱 Ask me anything about farming — crops, pests, weather or markets!",
  ta: "வணக்கம்! நான் AgroBot 🌱 விவசாயம் பற்றி எதையும் கேளுங்கள்!",
  hi: "नमस्ते! मैं AgroBot हूँ 🌱 खेती से जुड़ा कुछ भी पूछें!",
  mr: "नमस्कार! मी AgroBot आहे 🌱 शेतीबद्दल काहीही विचारा!",
  te: "నమస్కారం! నేను AgroBot 🌱 వ్యవసాయం గురించి ఏదైనా అడగండి!",
  kn: "ನಮಸ್ಕಾರ! ನಾನು AgroBot 🌱 ಕೃಷಿಯ ಬಗ್ಗೆ ಏನಾದರೂ ಕೇಳಿ!",
  ml: "നമസ്കാരം! ഞാൻ AgroBot ആണ് 🌱 കൃഷിയെക്കുറിച്ച് എന്തും ചോദിക്കാം!",
  gu: "નમસ્તે! હું AgroBot છું 🌱 ખેતી વિશે કંઈ પણ પૂછો!",
};

export default function ChatbotPage() {
  const { language, t } = useLanguage();
  const [messages, setMessages] = useState([
    { role:'bot', text: BOT_GREETING[language] || BOT_GREETING.en }
  ]);
  const [input, setInput]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [listening, setListening] = useState(false);
  const bottomRef = useRef();
  const recRef    = useRef(null);
  const inputRef  = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior:'smooth' });
  }, [messages]);

  // Reset greeting on language change
  useEffect(() => {
    setMessages([{ role:'bot', text: BOT_GREETING[language] || BOT_GREETING.en }]);
  }, [language]);

  const sendMessage = async (text) => {
    if (!text.trim()) return;
    setMessages(p => [...p, { role:'user', text }]);
    setInput('');
    setLoading(true);
    try {
      const res = await axios.post(`${API}/chat/message`, { message:text, language });
      const reply = res.data.response;
      setMessages(p => [...p, { role:'bot', text:reply }]);
      speak(reply);
    } catch {
      setMessages(p => [...p, { role:'bot', text: t('wrongCredentials') || 'Server error. Try again.' }]);
    } finally { setLoading(false); }
  };

  const speak = (text) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = VOICE_LANGS[language] || 'en-IN';
    u.rate = 1.0;
    window.speechSynthesis.speak(u);
  };

  const startListening = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { addToast('Voice not supported in this browser', 'error'); return; }
    const r = new SR();
    r.lang = VOICE_LANGS[language] || 'en-IN';
    r.onresult = (e) => { const txt = e.results[0][0].transcript; setInput(txt); sendMessage(txt); };
    r.onerror   = () => setListening(false);
    r.onend     = () => setListening(false);
    r.start();
    recRef.current = r;
    setListening(true);
  };

  const stopListening = () => { recRef.current?.stop(); setListening(false); };

  const prompts = QUICK_PROMPTS[language] || QUICK_PROMPTS.en;

  return (
    <div className="page-wrapper" style={{
      display:'flex', flexDirection:'column',
      height:'100dvh', paddingBottom:0, overflow:'hidden',
    }}>

      {/* ── HEADER ── */}
      <div style={{
        padding:'1rem 1.25rem 0.85rem',
        background:'rgba(8,15,26,0.95)',
        borderBottom:'1px solid var(--border)',
        backdropFilter:'blur(16px)',
        flexShrink:0,
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'0.85rem' }}>
          <div style={{
            width:46, height:46, borderRadius:15,
            background:'rgba(16,185,129,0.12)', border:'1.5px solid rgba(16,185,129,0.3)',
            display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.5rem',
          }}>🤖</div>
          <div>
            <h1 style={{ fontFamily:"'Sora',sans-serif", fontSize:'1.15rem', fontWeight:800, color:'var(--text-white)' }}>
              AgroBot AI
            </h1>
            <div style={{ display:'flex', alignItems:'center', gap:'6px', fontSize:'0.75rem', color:'var(--green-main)', fontWeight:700 }}>
              <span style={{ width:7, height:7, background:'var(--green-main)', borderRadius:'50%', boxShadow:'0 0 8px var(--green-main)', display:'inline-block' }} />
              {t('online') || 'Online · Voice Active'}
            </div>
          </div>
        </div>

        {/* Quick chips */}
        <div style={{ display:'flex', gap:'0.6rem', overflowX:'auto', paddingBottom:'0.4rem', scrollbarWidth:'none' }}>
          {prompts.map((q,i)=>(
            <button key={i} onClick={()=>sendMessage(q)} style={{
              padding:'0.4rem 0.9rem',
              fontSize:'0.77rem', fontWeight:700, borderRadius:'var(--r-full)',
              whiteSpace:'nowrap', flexShrink:0,
              border:'1px solid var(--border-light)',
              background:'rgba(255,255,255,0.04)',
              color:'var(--text-secondary)',
              cursor:'pointer', fontFamily:'inherit',
              transition:'all 0.2s',
            }}
            onMouseEnter={e=>{e.target.style.borderColor='var(--green-main)';e.target.style.color='var(--green-main)';}}
            onMouseLeave={e=>{e.target.style.borderColor='var(--border-light)';e.target.style.color='var(--text-secondary)';}}>
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* ── MESSAGES ── */}
      <div style={{
        flex:1, overflowY:'auto', padding:'1.25rem',
        display:'flex', flexDirection:'column', gap:'1rem',
      }}>
        {messages.map((msg,i)=>(
          <div key={i} style={{
            display:'flex',
            justifyContent:msg.role==='user'?'flex-end':'flex-start',
            alignItems:'flex-end', gap:'8px',
          }}>
            {msg.role==='bot' && (
              <div style={{
                width:30, height:30, borderRadius:10, flexShrink:0,
                background:'rgba(16,185,129,0.12)', border:'1px solid rgba(16,185,129,0.2)',
                display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.9rem',
              }}>🤖</div>
            )}
            <div style={{
              maxWidth:'82%',
              padding:'0.85rem 1.1rem',
              borderRadius: msg.role==='user' ? '20px 20px 4px 20px' : '4px 20px 20px 20px',
              background: msg.role==='user'
                ? 'linear-gradient(135deg,var(--green-main),var(--green-mid))'
                : 'var(--bg-elevated)',
              color:'var(--text-white)',
              fontSize:'0.92rem', fontWeight:500, lineHeight:1.65,
              border: msg.role==='user' ? 'none' : '1px solid var(--border-light)',
              boxShadow: msg.role==='user' ? '0 4px 16px rgba(16,185,129,0.25)' : 'none',
            }}>
              {msg.text}
            </div>
          </div>
        ))}

        {/* Typing dots */}
        {loading && (
          <div style={{ display:'flex', alignItems:'flex-end', gap:'8px' }}>
            <div style={{ width:30,height:30,borderRadius:10,background:'rgba(16,185,129,0.12)',border:'1px solid rgba(16,185,129,0.2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'0.9rem' }}>🤖</div>
            <div style={{
              display:'flex', gap:'5px', padding:'1rem 1.25rem',
              background:'var(--bg-elevated)', borderRadius:'4px 20px 20px 20px',
              border:'1px solid var(--border-light)',
            }}>
              {[0,1,2].map(d=>(
                <div key={d} style={{
                  width:8, height:8, borderRadius:'50%', background:'var(--green-main)',
                  animation:'bounce 1.4s infinite ease-in-out', animationDelay:`${d*0.2}s`,
                }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* ── INPUT BAR ── */}
      <div style={{
        padding:'0.85rem 1rem',
        paddingBottom:`calc(0.85rem + var(--nav-h) + 14px)`,
        background:'rgba(8,15,26,0.95)',
        borderTop:'1px solid var(--border)',
        backdropFilter:'blur(16px)',
        flexShrink:0,
      }}>
        <div style={{
          display:'flex', gap:'0.65rem', alignItems:'center',
          background:'var(--bg-elevated)',
          border:'1.5px solid var(--border-light)',
          borderRadius:'var(--r-full)',
          padding:'0.45rem 0.55rem 0.45rem 1.25rem',
          transition:'border-color 0.25s',
        }}
        onFocusCapture={e=>e.currentTarget.style.borderColor='var(--green-main)'}
        onBlurCapture={e=>e.currentTarget.style.borderColor='var(--border-light)'}
        >
          <input
            ref={inputRef}
            style={{
              flex:1, border:'none', background:'transparent',
              outline:'none', fontSize:'0.95rem', fontWeight:500,
              color:'var(--text-white)', fontFamily:'inherit',
            }}
            placeholder={listening ? t('listening') : t('chatPlaceholder')}
            value={input}
            onChange={e=>setInput(e.target.value)}
            onKeyDown={e=>e.key==='Enter' && !e.shiftKey && sendMessage(input)}
            disabled={listening}
          />

          {/* Voice toggle */}
          <button
            id="voice-btn"
            onClick={listening ? stopListening : startListening}
            style={{
              width:44, height:44, borderRadius:'50%', flexShrink:0,
              background: listening ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.1)',
              border: listening ? '1.5px solid rgba(239,68,68,0.4)' : '1.5px solid rgba(16,185,129,0.3)',
              color: listening ? 'var(--red-light)' : 'var(--green-main)',
              fontSize:'1.15rem', cursor:'pointer',
              display:'flex', alignItems:'center', justifyContent:'center',
              transition:'all 0.25s', position:'relative',
            }}
          >
            {listening ? '⏹' : '🎙️'}
            {listening && (
              <span style={{
                position:'absolute', inset:-4,
                border:'2px solid rgba(239,68,68,0.5)',
                borderRadius:'50%', animation:'ping 1.5s infinite',
              }} />
            )}
          </button>

          {/* Send */}
          <button
            id="send-btn"
            onClick={()=>sendMessage(input)}
            disabled={!input.trim()||loading}
            style={{
              width:44, height:44, borderRadius:'50%', flexShrink:0,
              background: input.trim()
                ? 'linear-gradient(135deg,var(--green-main),var(--green-mid))'
                : 'rgba(255,255,255,0.05)',
              border:'none', color:'white', fontSize:'1.1rem',
              cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
              transition:'all 0.25s',
              boxShadow: input.trim() ? '0 4px 12px rgba(16,185,129,0.35)' : 'none',
            }}
          >➤</button>
        </div>
      </div>

      <style>{`
        @keyframes bounce { 0%,80%,100%{transform:scale(0)}40%{transform:scale(1)} }
        @keyframes ping { 75%,100%{transform:scale(1.6);opacity:0} }
      `}</style>
    </div>
  );
}
