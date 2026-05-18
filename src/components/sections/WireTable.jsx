import { useState } from 'react';

const ACC = '#607d8b';
const WIRE_DATA = [
  { mm: '1.0', awg: '18', amp: '10-12', use: '照明回路' },
  { mm: '1.5', awg: '16', amp: '14-16', use: '普通插座' },
  { mm: '2.5', awg: '14', amp: '20-25', use: '空调/厨房' },
  { mm: '4.0', awg: '12', amp: '28-32', use: '大功率设备' },
  { mm: '6.0', awg: '10', amp: '38-42', use: '即热/入户' },
];

export default function WireTable() {
  const [sel, setSel] = useState(1);

  return (
    <section id="wire-table" className="sec">
      <div className="sh">
        <span className="sh-icon">📋</span>
        <div>
          <div className="sh-tag">WIRE TABLE · 国标载流量</div>
          <h2 className="sh-title" style={{ color: ACC }}>线径载流量表</h2>
          <p className="sh-sub">铜芯导线明敷参考值，暗敷或高温环境应降额使用</p>
        </div>
      </div>
      <div className="divider" style={{ background: `linear-gradient(90deg,transparent,${ACC},transparent)` }} />
      <div className="anim-box reveal" style={{ borderColor: 'rgba(96,125,139,.3)', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, color: '#aabfc8' }}>
          <thead>
            <tr style={{ color: ACC, borderBottom: '1px solid rgba(255,255,255,.1)' }}>
              {['截面积 mm²', '约 AWG', '载流量 A', '典型用途'].map(h => (
                <th key={h} style={{ padding: '10px 12px', textAlign: 'left' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {WIRE_DATA.map((row, i) => (
              <tr key={row.mm} onClick={() => setSel(i)} style={{
                cursor: 'pointer',
                background: sel === i ? 'rgba(96,125,139,.2)' : 'transparent',
                borderBottom: '1px solid rgba(255,255,255,.05)',
              }}>
                <td style={{ padding: '10px 12px', color: sel === i ? '#fff' : undefined }}>{row.mm}</td>
                <td style={{ padding: '10px 12px' }}>{row.awg}</td>
                <td style={{ padding: '10px 12px', fontWeight: 600, color: ACC }}>{row.amp}</td>
                <td style={{ padding: '10px 12px' }}>{row.use}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p style={{ marginTop: 14, fontSize: 12, color: '#8aacb8' }}>
          选型：负载电流 × 1.25 安全系数 ≤ 载流量。16A 断路器配 2.5mm² 铜线。
        </p>
      </div>
    </section>
  );
}
