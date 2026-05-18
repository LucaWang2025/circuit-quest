import { useState, useMemo } from 'react';

const TABS = [
  { id: 'ohm', label: '欧姆定律', unit: 'V=I×R' },
  { id: 'power', label: '功率', unit: 'P=V×I' },
  { id: 'bill', label: '电费', unit: 'kWh' },
  { id: 'rpara', label: '并联电阻', unit: '1/R' },
];

export default function Calculator({ accent = '#7c4dff' }) {
  const [tab, setTab] = useState('ohm');
  const [a, setA] = useState('');
  const [b, setB] = useState('');
  const [c, setC] = useState('');

  const result = useMemo(() => {
    const na = parseFloat(a), nb = parseFloat(b), nc = parseFloat(c);
    const vals = [isNaN(na) ? null : na, isNaN(nb) ? null : nb, isNaN(nc) ? null : nc];
    const filled = vals.filter(v => v !== null).length;
    if (tab === 'ohm' && filled === 2) {
      if (vals[0] == null) return { out: `V = ${(nb * nc).toFixed(3)} V`, f: 'V = I × R' };
      if (vals[1] == null) return { out: `I = ${(na / nc).toFixed(4)} A`, f: 'I = V / R' };
      if (vals[2] == null) return { out: `R = ${(na / nb).toFixed(2)} Ω`, f: 'R = V / I' };
    }
    if (tab === 'power' && !isNaN(na) && !isNaN(nb)) {
      return { out: `P = ${(na * nb).toFixed(1)} W`, f: 'P = V × I' };
    }
    if (tab === 'bill' && !isNaN(na) && !isNaN(nb)) {
      return { out: `电费 ≈ ¥${(na * nb * 0.56).toFixed(2)}（0.56元/度）`, f: '费用 = 功率kW × 小时 × 单价' };
    }
    if (tab === 'rpara' && !isNaN(na) && !isNaN(nb)) {
      const rt = 1 / (1 / na + 1 / nb);
      return { out: `R总 = ${rt.toFixed(2)} Ω`, f: '1/R = 1/R1 + 1/R2' };
    }
    return null;
  }, [tab, a, b, c]);

  const inp = (label, val, set) => (
    <div style={{ marginBottom: 10 }}>
      <label style={{ fontSize: 11, color: 'var(--dim)' }}>{label}</label>
      <input type="number" value={val} onChange={e => set(e.target.value)} step="any"
        style={{ width: '100%', marginTop: 4, padding: '8px 10px', borderRadius: 8,
          border: '1px solid rgba(255,255,255,.12)', background: 'rgba(0,0,0,.3)', color: '#fff', font: '13px monospace' }} />
    </div>
  );

  return (
    <div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => { setTab(t.id); setA(''); setB(''); setC(''); }} style={{
            padding: '6px 12px', borderRadius: 8, fontSize: 11, cursor: 'pointer',
            border: `1px solid ${tab === t.id ? accent : 'rgba(255,255,255,.1)'}`,
            background: tab === t.id ? accent + '22' : 'transparent',
            color: tab === t.id ? accent : '#889',
          }}>{t.label}</button>
        ))}
      </div>
      {tab === 'ohm' && (<>{inp('V 电压', a, setA)}{inp('I 电流', b, setB)}{inp('R 电阻', c, setC)}</>)}
      {tab === 'power' && (<>{inp('V 电压', a, setA)}{inp('I 电流', b, setB)}</>)}
      {tab === 'bill' && (<>{inp('功率 W', a, setA)}{inp('时长 小时', b, setB)}</>)}
      {tab === 'rpara' && (<>{inp('R1 Ω', a, setA)}{inp('R2 Ω', b, setB)}</>)}
      {result && (
        <div style={{ padding: 12, borderRadius: 10, background: accent + '18', border: `1px solid ${accent}44`, textAlign: 'center' }}>
          <div style={{ font: 'bold 16px monospace', color: accent }}>{result.out}</div>
          <div style={{ fontSize: 11, color: '#8aacb8', marginTop: 4 }}>{result.f}</div>
        </div>
      )}
    </div>
  );
}
