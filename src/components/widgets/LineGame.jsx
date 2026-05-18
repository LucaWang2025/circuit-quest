import { useEffect, useRef, useState } from 'react';
import { setupHiDpi } from '../../utils/canvas';
import { loadPractice, savePractice } from '../../hooks/usePracticeScore';

const NODES = [
  { id: 'bat', label: '电池+', x: 60, y: 160 },
  { id: 'r', label: '电阻', x: 200, y: 100 },
  { id: 'led', label: 'LED', x: 340, y: 160 },
  { id: 'gnd', label: '电池-', x: 200, y: 220 },
];
const TARGET = [['bat', 'r'], ['r', 'led'], ['led', 'gnd'], ['gnd', 'bat']];

export default function LineGame({ accent = '#7c4dff' }) {
  const ref = useRef(null);
  const [lines, setLines] = useState([]);
  const [from, setFrom] = useState(null);
  const [won, setWon] = useState(false);
  const linesRef = useRef(lines);
  linesRef.current = lines;

  const checkWin = (ls) => {
    const set = new Set(ls.map(([a, b]) => [a, b].sort().join('-')));
    const ok = TARGET.every(([a, b]) => set.has([a, b].sort().join('-')));
    if (ok) {
      setWon(true);
      const d = loadPractice('line-game', { wins: 0 });
      savePractice('line-game', { wins: d.wins + 1 });
    }
  };

  const onNode = (id) => {
    if (won) return;
    if (!from) { setFrom(id); return; }
    if (from === id) { setFrom(null); return; }
    const pair = [from, id];
    const key = pair.sort().join('-');
    if (!lines.some(([a, b]) => [a, b].sort().join('-') === key)) {
      const next = [...lines, pair];
      setLines(next);
      checkWin(next);
    }
    setFrom(null);
  };

  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const W = 480, H = 280;
    const ctx = setupHiDpi(cv, W, H);
    let raf;

    function draw() {
      const ls = linesRef.current;
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = 'rgba(124,77,255,.35)';
      ctx.beginPath(); ctx.roundRect(10, 8, W - 20, 26, 8); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.font = 'bold 12px monospace'; ctx.textAlign = 'center';
      ctx.fillText(won ? '✓ 回路接通！LED 将点亮' : '点击两个节点连线：电池→电阻→LED→回电池', W / 2, 26);

      ls.forEach(([a, b]) => {
        const na = NODES.find(n => n.id === a), nb = NODES.find(n => n.id === b);
        if (!na || !nb) return;
        ctx.strokeStyle = accent; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(na.x, na.y); ctx.lineTo(nb.x, nb.y); ctx.stroke();
      });

      NODES.forEach(n => {
        const sel = from === n.id;
        ctx.fillStyle = sel ? accent : (n.id === 'led' && won ? '#00e676' : '#3a4558');
        ctx.beginPath(); ctx.arc(n.x, n.y, 22, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = sel ? '#fff' : '#667'; ctx.lineWidth = 2; ctx.stroke();
        ctx.fillStyle = '#dde8ee'; ctx.font = '10px monospace'; ctx.textAlign = 'center';
        ctx.fillText(n.label, n.x, n.y + 36);
      });

      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(raf);
  }, [won, from, accent]);

  return (
    <div>
      <canvas ref={ref} style={{ width: '100%', maxWidth: 480, flexShrink: 0, display: 'block' }} />
      <div style={{ display: 'flex', gap: 8, marginTop: 10, justifyContent: 'center' }}>
        <button onClick={() => { setLines([]); setWon(false); setFrom(null); }} style={{
          padding: '8px 16px', borderRadius: 8, cursor: 'pointer', border: '1px solid rgba(255,255,255,.12)',
          background: 'rgba(255,255,255,.04)', color: 'var(--dim)',
        }}>重置</button>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginTop: 8 }}>
        {NODES.map(n => (
          <button key={n.id} onClick={() => onNode(n.id)} style={{
            padding: '6px 12px', borderRadius: 8, fontSize: 11, cursor: 'pointer',
            border: `1px solid ${from === n.id ? accent : 'rgba(255,255,255,.1)'}`,
            color: from === n.id ? accent : '#889',
          }}>{n.label}</button>
        ))}
      </div>
    </div>
  );
}
