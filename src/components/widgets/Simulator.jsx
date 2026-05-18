import { useState } from 'react';
import { loadPractice, savePractice } from '../../hooks/usePracticeScore';

export default function Simulator({ scenarios, accent = '#7c4dff' }) {
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState(null);
  const [score, setScore] = useState(() => loadPractice('fault-sim', { correct: 0, total: 0 }).correct);

  const sc = scenarios[idx];
  if (!sc) return null;

  const choose = (i) => {
    if (picked !== null) return;
    setPicked(i);
    const ok = sc.options[i].correct;
    if (ok) {
      const next = score + 1;
      setScore(next);
      const data = loadPractice('fault-sim', { correct: 0, total: 0 });
      savePractice('fault-sim', { correct: data.correct + 1, total: data.total + 1 });
    } else {
      const data = loadPractice('fault-sim', { correct: 0, total: 0 });
      savePractice('fault-sim', { correct: data.correct, total: data.total + 1 });
    }
  };

  const next = () => {
    setPicked(null);
    setIdx(i => (i + 1) % scenarios.length);
  };

  return (
    <div>
      <div style={{ fontSize: 12, color: accent, marginBottom: 12 }}>累计正确 {score} 题</div>
      <div style={{ fontWeight: 700, fontSize: 16, color: '#e0e8ec', marginBottom: 10 }}>{sc.title}</div>
      <div style={{ marginBottom: 14 }}>
        {sc.symptoms.map(s => (
          <span key={s} style={{ display: 'inline-block', margin: '0 6px 6px 0', padding: '4px 10px', borderRadius: 12,
            background: 'rgba(255,255,255,.06)', fontSize: 12, color: '#8aacb8' }}>{s}</span>
        ))}
      </div>
      {sc.options.map((opt, i) => {
        const revealed = picked !== null;
        const sel = picked === i;
        const ok = opt.correct;
        return (
          <button key={i} onClick={() => choose(i)} style={{
            display: 'block', width: '100%', textAlign: 'left', marginBottom: 8, padding: '12px 14px',
            borderRadius: 10, cursor: revealed ? 'default' : 'pointer',
            border: `1px solid ${revealed ? (ok ? 'rgba(0,230,118,.5)' : sel ? 'rgba(255,82,82,.5)' : 'rgba(255,255,255,.08)') : 'rgba(255,255,255,.12)'}`,
            background: revealed ? (ok ? 'rgba(0,230,118,.1)' : sel ? 'rgba(255,82,82,.08)' : 'transparent') : 'rgba(255,255,255,.03)',
            color: '#c8dce6', fontSize: 13,
          }}>
            {opt.text}
            {revealed && sel && <div style={{ marginTop: 8, fontSize: 12, color: ok ? '#00e676' : '#ff5252' }}>{opt.feedback}</div>}
            {revealed && !sel && ok && <div style={{ marginTop: 8, fontSize: 12, color: '#00e676' }}>{opt.feedback}</div>}
          </button>
        );
      })}
      {picked !== null && (
        <button onClick={next} style={{ marginTop: 12, padding: '10px 24px', borderRadius: 10, border: `1px solid ${accent}55`,
          background: accent + '18', color: accent, cursor: 'pointer', fontWeight: 600 }}>下一题 →</button>
      )}
    </div>
  );
}
