import { useState, useEffect } from 'react';

const toasts = [];
let listeners = [];

export function addToast(msg, type = 'info', duration = 4000) {
  const id = Date.now();
  toasts.push({ id, msg, type });
  listeners.forEach(fn => fn([...toasts]));
  setTimeout(() => {
    const idx = toasts.findIndex(t => t.id === id);
    if (idx !== -1) { toasts.splice(idx, 1); listeners.forEach(fn => fn([...toasts])); }
  }, duration);
}

const icons = { success: '✅', error: '❌', warning: '⚠️', info: '🔔', pest: '🐛' };
const colors = { success: 'var(--green-mid)', error: 'var(--red)', warning: 'var(--yellow)', info: 'var(--blue)', pest: 'var(--orange)' };

export default function ToastContainer() {
  const [list, setList] = useState([]);

  useEffect(() => {
    listeners.push(setList);
    return () => { listeners = listeners.filter(fn => fn !== setList); };
  }, []);

  return (
    <div className="toast-container">
      {list.map(t => (
        <div key={t.id} className="toast" style={{ borderLeftColor: colors[t.type] || colors.info }}>
          <span style={{ fontSize: '1.2rem' }}>{icons[t.type] || icons.info}</span>
          <span style={{ fontSize: '0.88rem', fontWeight: 500 }}>{t.msg}</span>
        </div>
      ))}
    </div>
  );
}
