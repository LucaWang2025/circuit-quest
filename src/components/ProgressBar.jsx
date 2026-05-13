const STYLES = {
  wrap: {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '4px 12px', borderRadius: 16,
    background: 'rgba(0,0,0,.3)', border: '1px solid rgba(255,255,255,.06)',
  },
  bar: {
    width: 60, height: 4, borderRadius: 3,
    background: 'rgba(255,255,255,.08)', overflow: 'hidden',
  },
  fill: (pct) => ({
    width: `${pct}%`, height: '100%', borderRadius: 3,
    background: pct >= 80 ? '#00e676' : pct >= 40 ? '#ffab00' : '#64b5f6',
    transition: 'width .4s ease',
  }),
  text: {
    font: '10px "Courier New",monospace', color: 'rgba(200,220,232,.5)',
  },
};

export default function ProgressBar({ completed, total }) {
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  return (
    <div style={STYLES.wrap}>
      <span style={STYLES.text}>{completed}/{total}</span>
      <div style={STYLES.bar}>
        <div style={STYLES.fill(pct)} />
      </div>
      <span style={STYLES.text}>{pct}%</span>
    </div>
  );
}
