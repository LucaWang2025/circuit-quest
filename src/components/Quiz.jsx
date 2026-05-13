import { useState, useCallback } from 'react';

const STYLES = {
  wrap: {
    marginTop: 28, padding: '20px 24px', borderRadius: 14,
    background: 'rgba(0,0,0,.45)', border: '1px solid rgba(255,255,255,.08)',
  },
  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16,
  },
  title: { fontWeight: 700, fontSize: 15, color: '#ffe082' },
  progress: { font: '11px "Courier New",monospace', color: 'rgba(200,220,232,.5)' },
  question: {
    fontSize: 14, fontWeight: 600, color: '#e0e8ec', lineHeight: 1.7, marginBottom: 14,
  },
  optionBtn: (selected, correct, revealed) => ({
    display: 'block', width: '100%', textAlign: 'left',
    padding: '10px 16px', marginBottom: 8, borderRadius: 10,
    border: `1px solid ${revealed
      ? correct ? 'rgba(0,230,118,.5)' : selected ? 'rgba(255,82,82,.5)' : 'rgba(255,255,255,.06)'
      : selected ? 'rgba(255,224,102,.4)' : 'rgba(255,255,255,.08)'}`,
    background: revealed
      ? correct ? 'rgba(0,230,118,.08)' : selected ? 'rgba(255,82,82,.06)' : 'transparent'
      : selected ? 'rgba(255,224,102,.08)' : 'rgba(255,255,255,.02)',
    color: revealed
      ? correct ? '#a5d6a7' : selected ? '#ef9a9a' : '#8aacb8'
      : '#c8dce6',
    cursor: revealed ? 'default' : 'pointer',
    font: '13px/1.5 inherit', transition: 'all .2s',
  }),
  explain: {
    marginTop: 10, padding: '10px 14px', borderRadius: 8,
    background: 'rgba(0,230,118,.06)', border: '1px solid rgba(0,230,118,.15)',
    fontSize: 12.5, color: '#a5d6a7', lineHeight: 1.7,
  },
  wrongExplain: {
    marginTop: 10, padding: '10px 14px', borderRadius: 8,
    background: 'rgba(255,82,82,.06)', border: '1px solid rgba(255,82,82,.15)',
    fontSize: 12.5, color: '#ef9a9a', lineHeight: 1.7,
  },
  nextBtn: {
    marginTop: 14, padding: '8px 22px', borderRadius: 20,
    border: '1px solid rgba(255,224,102,.3)', background: 'rgba(255,224,102,.1)',
    color: '#ffe082', cursor: 'pointer', font: '12px/1 inherit', transition: 'all .2s',
  },
  score: {
    textAlign: 'center', padding: '30px 20px',
  },
  scoreNum: { fontSize: 36, fontWeight: 800, color: '#00e676' },
  scoreLabel: { fontSize: 13, color: '#8aacb8', marginTop: 8 },
  retryBtn: {
    marginTop: 18, padding: '10px 28px', borderRadius: 22,
    border: '1px solid rgba(0,230,118,.3)', background: 'rgba(0,230,118,.1)',
    color: '#a5d6a7', cursor: 'pointer', font: '13px/1 inherit',
  },
};

export default function Quiz({ questions, accentColor = '#ffe082', title = '章节小测验' }) {
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const q = questions[idx];

  const handleSelect = useCallback((i) => {
    if (revealed) return;
    setSelected(i);
  }, [revealed]);

  const handleConfirm = useCallback(() => {
    if (selected === null) return;
    if (!revealed) {
      setRevealed(true);
      if (selected === q.answer) setScore(s => s + 1);
    } else {
      if (idx < questions.length - 1) {
        setIdx(i => i + 1);
        setSelected(null);
        setRevealed(false);
      } else {
        setDone(true);
      }
    }
  }, [selected, revealed, idx, questions.length, q.answer]);

  const handleRetry = useCallback(() => {
    setIdx(0); setSelected(null); setRevealed(false); setScore(0); setDone(false);
  }, []);

  if (done) {
    const pct = Math.round((score / questions.length) * 100);
    const msg = pct >= 80 ? '优秀！基础扎实' : pct >= 60 ? '不错，继续加油' : '建议复习本节内容';
    return (
      <div style={STYLES.wrap}>
        <div style={STYLES.score}>
          <div style={{ ...STYLES.scoreNum, color: pct >= 80 ? '#00e676' : pct >= 60 ? '#ffab00' : '#ff5252' }}>
            {score}/{questions.length}
          </div>
          <div style={STYLES.scoreLabel}>正确率 {pct}% · {msg}</div>
          <button style={STYLES.retryBtn} onClick={handleRetry}>重新测试</button>
        </div>
      </div>
    );
  }

  return (
    <div style={STYLES.wrap} className="reveal">
      <div style={STYLES.header}>
        <span style={{ ...STYLES.title, color: accentColor }}>📝 {title}</span>
        <span style={STYLES.progress}>{idx + 1} / {questions.length}</span>
      </div>

      <div style={STYLES.question}>{q.question}</div>

      {q.options.map((opt, i) => (
        <button
          key={i}
          style={STYLES.optionBtn(i === selected, i === q.answer, revealed)}
          onClick={() => handleSelect(i)}
        >
          <span style={{ marginRight: 8, opacity: .5 }}>{'ABCD'[i]}.</span>{opt}
        </button>
      ))}

      {revealed && selected === q.answer && q.explain && (
        <div style={STYLES.explain}>💡 {q.explain}</div>
      )}
      {revealed && selected !== q.answer && (
        <div style={STYLES.wrongExplain}>
          ✗ 正确答案：{'ABCD'[q.answer]}{' '}{q.explain && `— ${q.explain}`}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          style={{ ...STYLES.nextBtn, borderColor: `${accentColor}44`, background: `${accentColor}15`, color: accentColor }}
          onClick={handleConfirm}
          disabled={selected === null}
        >
          {!revealed ? '确认答案' : idx < questions.length - 1 ? '下一题 →' : '查看结果'}
        </button>
      </div>
    </div>
  );
}
