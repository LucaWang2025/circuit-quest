import { useEffect, useRef, useState } from 'react';
import { setupHiDpi } from '../../utils/canvas';

const ACC = '#00bcd4';

// 色环颜色对照
const COLOR_BANDS = [
  { name: '黑', hex: '#333', val: 0, mult: 1, tol: null },
  { name: '棕', hex: '#795548', val: 1, mult: 10, tol: '±1%' },
  { name: '红', hex: '#f44336', val: 2, mult: 100, tol: '±2%' },
  { name: '橙', hex: '#ff9800', val: 3, mult: 1000, tol: null },
  { name: '黄', hex: '#ffeb3b', val: 4, mult: 10000, tol: null },
  { name: '绿', hex: '#4caf50', val: 5, mult: 100000, tol: '±0.5%' },
  { name: '蓝', hex: '#2196f3', val: 6, mult: 1000000, tol: '±0.25%' },
  { name: '紫', hex: '#9c27b0', val: 7, mult: 10000000, tol: '±0.1%' },
  { name: '灰', hex: '#9e9e9e', val: 8, mult: 100000000, tol: '±0.05%' },
  { name: '白', hex: '#eeeeee', val: 9, mult: 1000000000, tol: null },
  { name: '金', hex: '#ffd700', val: null, mult: 0.1, tol: '±5%' },
  { name: '银', hex: '#c0c0c0', val: null, mult: 0.01, tol: '±10%' },
];

function ResistorCanvas({ b1i, b2i, b3i, b4i }) {
  const ref = useRef(null);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const W = 320, H = 100;
    const ctx = setupHiDpi(cv, W, H);
    const bands = [b1i, b2i, b3i, b4i];
    const cols = bands.map(i => COLOR_BANDS[i] || COLOR_BANDS[0]);

    ctx.clearRect(0, 0, W, H);
    // 导线
    ctx.strokeStyle = '#aaa'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(20, 50); ctx.lineTo(80, 50); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(240, 50); ctx.lineTo(300, 50); ctx.stroke();
    // 电阻体
    ctx.fillStyle = '#d4a843';
    ctx.beginPath(); ctx.roundRect(80, 30, 160, 40, 8); ctx.fill();
    // 色环
    const bx = [105, 130, 155, 195];
    bx.forEach((x, i) => {
      ctx.fillStyle = cols[i].hex;
      ctx.fillRect(x, 30, 16, 40);
    });
    // 电阻体描边
    ctx.strokeStyle = '#8b6914'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.roundRect(80, 30, 160, 40, 8); ctx.stroke();
    // 标注
    const colorNames = cols.map(c => c.name);
    const val1 = cols[0].val, val2 = cols[1].val, multIdx = cols[2].mult, tol = cols[3].tol;
    let resistance = 'N/A';
    if (val1 !== null && val2 !== null && multIdx !== null) {
      const r = (val1 * 10 + val2) * multIdx;
      resistance = r >= 1e6 ? `${(r / 1e6).toFixed(2)}MΩ` : r >= 1000 ? `${(r / 1000).toFixed(1)}kΩ` : `${r}Ω`;
    }
    ctx.fillStyle = '#fff'; ctx.font = 'bold 11px monospace'; ctx.textAlign = 'center';
    ctx.fillText(`${resistance}  ${tol || ''}`, 160, 88);
  }, [b1i, b2i, b3i, b4i]);

  return <canvas ref={ref} style={{ width: 320, maxWidth: '100%', flexShrink: 0 }} />;
}

const PARTS = [
  {
    cat: '电阻', color: '#ff9800', icon: '⬛',
    items: [
      { name: '碳膜电阻', spec: '1/4W 100Ω~10MΩ ±5%', use: '通用限流、分压，色环识别' },
      { name: '金属膜电阻', spec: '1/4W ±1%', use: '精密电路，温度系数更低' },
      { name: '贴片电阻', spec: '0402/0603/0805', use: 'SMD，数字丝印（如"103"=10kΩ）' },
      { name: '热敏电阻NTC', spec: '10kΩ@25°C', use: '温度传感，冰箱、空调等' },
    ],
  },
  {
    cat: '电容', color: '#2196f3', icon: '⊣⊢',
    items: [
      { name: '电解电容', spec: '10μF~10000μF, 6.3V~450V', use: '有极性，电源滤波，注意方向' },
      { name: '薄膜电容', spec: '0.1nF~10μF', use: '无极性，交流耦合，旁路，精度高' },
      { name: '陶瓷电容', spec: '1pF~100nF', use: '高频去耦，0.1μF+10μF组合' },
      { name: '超级电容', spec: '1F~3000F, 2.7V', use: '短时储能，启动电流补偿' },
    ],
  },
  {
    cat: '常用IC', color: '#7c4dff', icon: '▬',
    items: [
      { name: '555 定时器', spec: 'DIP-8', use: '单稳/双稳/无稳定时电路，入门必备' },
      { name: 'LM7805', spec: 'TO-220, 1A', use: '线性稳压 5V，需散热片' },
      { name: 'LM358 运放', spec: 'DIP-8 双运放', use: '比较器、放大、积分器' },
      { name: 'ATmega328', spec: 'Arduino Uno 主控', use: '8位单片机，数字/模拟IO' },
      { name: 'ESP32', spec: 'WiFi+BLE', use: '物联网开发，支持FreeRTOS' },
    ],
  },
  {
    cat: '功率器件', color: '#f44336', icon: '▷|',
    items: [
      { name: 'IRF540N', spec: 'N-MOS 100V/33A', use: '通用功率开关，电机驱动' },
      { name: '1N4007', spec: '1A/1000V 整流二极管', use: 'AC整流，反向保护' },
      { name: '1N5819', spec: '1A/40V 肖特基', use: '低正向压降（0.3V），高频整流' },
      { name: '2N7002', spec: 'N-MOS SOT-23', use: 'GPIO驱动小负载，逻辑电平转换' },
    ],
  },
];

export default function PartsRef() {
  const [activeCat, setActiveCat] = useState(null);
  const [b1, setB1] = useState(1); // 棕
  const [b2, setB2] = useState(0); // 黑
  const [b3, setB3] = useState(2); // 红 (mult 100)
  const [b4, setB4] = useState(10); // 金 (±5%)

  const filteredCats = activeCat ? PARTS.filter(p => p.cat === activeCat) : PARTS;
  const b3Options = COLOR_BANDS.map((c, i) => ({ ...c, i })); // 倍率可包含金银

  return (
    <section id="parts-ref" className="sec">
      <div className="sh">
        <span className="sh-icon">🧰</span>
        <div>
          <div className="sh-tag">PARTS REF · 元件速查 · 色环计算</div>
          <h2 className="sh-title" style={{ color: ACC, textShadow: `0 0 35px ${ACC}44` }}>元件库速查</h2>
          <p className="sh-sub">常用电阻、电容、IC、功率器件速查 + 交互式色环计算器</p>
        </div>
      </div>
      <div className="divider" style={{ background: `linear-gradient(90deg,transparent,${ACC},transparent)` }} />

      {/* ── 色环计算器 ── */}
      <div className="reveal" style={{
        background: 'rgba(255,255,255,.03)', borderRadius: 14, border: '1px solid rgba(0,188,212,.15)',
        padding: 20, marginBottom: 32
      }}>
        <div style={{ fontWeight: 700, color: ACC, marginBottom: 16, fontSize: 14 }}>🎨 四环电阻色环计算器</div>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
          <ResistorCanvas b1i={b1} b2i={b2} b3i={b3} b4i={b4} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { label: '第1环（十位）', val: b1, set: setB1, filter: c => c.val !== null },
              { label: '第2环（个位）', val: b2, set: setB2, filter: c => c.val !== null },
              { label: '第3环（倍率）', val: b3, set: setB3, filter: () => true },
              { label: '第4环（误差）', val: b4, set: setB4, filter: c => c.tol !== null },
            ].map(({ label, val, set, filter }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ fontSize: 11, color: '#889', minWidth: 90 }}>{label}</div>
                <select
                  value={val}
                  onChange={e => set(+e.target.value)}
                  style={{
                    background: COLOR_BANDS[val]?.hex || '#333', color: [0, 3, 4].includes(val) ? '#333' : '#fff',
                    border: 'none', borderRadius: 6, padding: '4px 8px', fontSize: 12, cursor: 'pointer'
                  }}
                >
                  {COLOR_BANDS.map((c, i) => filter(c) ? (
                    <option key={i} value={i} style={{ background: c.hex, color: [0, 3, 4].includes(i) ? '#333' : '#fff' }}>
                      {c.name} {c.val !== null ? `(${c.val})` : ''}{c.tol ? ` ${c.tol}` : ''}
                    </option>
                  ) : null)}
                </select>
              </div>
            ))}
          </div>
        </div>
        <div style={{ marginTop: 12, fontSize: 12, color: '#889', lineHeight: 1.7 }}>
          💡 例：棕黑红金 → 10 × 100 = <strong style={{ color: ACC }}>1kΩ ±5%</strong>；
          黄紫橙金 → 47 × 1000 = <strong style={{ color: ACC }}>47kΩ ±5%</strong>
        </div>
      </div>

      {/* 分类筛选 */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
        <button onClick={() => setActiveCat(null)} style={{
          padding: '7px 16px', borderRadius: 20, cursor: 'pointer', fontSize: 12, fontWeight: 600,
          border: `1px solid ${activeCat === null ? ACC : 'rgba(255,255,255,.12)'}`,
          background: activeCat === null ? ACC + '22' : 'transparent',
          color: activeCat === null ? ACC : 'rgba(255,255,255,.5)',
        }}>全部</button>
        {PARTS.map(p => (
          <button key={p.cat} onClick={() => setActiveCat(activeCat === p.cat ? null : p.cat)} style={{
            padding: '7px 16px', borderRadius: 20, cursor: 'pointer', fontSize: 12, fontWeight: 600,
            border: `1px solid ${activeCat === p.cat ? p.color : 'rgba(255,255,255,.12)'}`,
            background: activeCat === p.cat ? p.color + '22' : 'transparent',
            color: activeCat === p.cat ? p.color : 'rgba(255,255,255,.5)',
          }}>{p.cat}</button>
        ))}
      </div>

      {/* 元件表格 */}
      {filteredCats.map(group => (
        <div key={group.cat} className="reveal" style={{ marginBottom: 24 }}>
          <div style={{
            fontWeight: 700, color: group.color, fontSize: 14, marginBottom: 10,
            paddingBottom: 6, borderBottom: `2px solid ${group.color}44`
          }}>
            {group.icon} {group.cat}
          </div>
          <div style={{
            background: 'rgba(255,255,255,.03)', borderRadius: 10,
            border: `1px solid rgba(255,255,255,.07)`, overflow: 'auto'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 480 }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,.05)' }}>
                  {['元件', '常见规格', '典型用途'].map(h => (
                    <th key={h} style={{ padding: '8px 14px', color: '#889', fontSize: 11, textAlign: 'left', fontWeight: 600, whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {group.items.map((item, i) => (
                  <tr key={item.name} style={{ borderBottom: '1px solid rgba(255,255,255,.06)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,.02)' }}>
                    <td style={{ padding: '9px 14px', fontWeight: 700, color: group.color, fontSize: 13, whiteSpace: 'nowrap' }}>{item.name}</td>
                    <td style={{ padding: '9px 14px', fontFamily: 'monospace', color: '#ccc', fontSize: 12.5, whiteSpace: 'nowrap' }}>{item.spec}</td>
                    <td style={{ padding: '9px 14px', color: '#8aacb8', fontSize: 12.5, lineHeight: 1.5 }}>{item.use}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      {/* 采购贴士 */}
      <div className="reveal" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 14, marginTop: 8 }}>
        {[
          { c: ACC, t: '🛒 采购贴士', b: '立创商城/淘宝搜元件型号精准高效；散件常用"直插"方便手工焊接；批量用贴片降成本。' },
          { c: '#ff9800', t: '🔢 SMD 电阻读法', b: '三位数：前两位数值×10^第三位；例如 103 = 10×1000 = 10kΩ；R代表小数点如 4R7=4.7Ω。' },
          { c: '#00e676', t: '💧 电解电容注意', b: '有极性！长脚或正号(+)接高电位。反接会炸裂。耐压要留 2× 余量（5V电路用16V电容）。' },
        ].map(x => (
          <div key={x.t} className="glass" style={{ borderColor: `${x.c}33` }}>
            <div style={{ fontWeight: 700, color: x.c, marginBottom: 8, fontSize: 13 }}>{x.t}</div>
            <div style={{ fontSize: 12.5, color: '#8aacb8', lineHeight: 1.8 }}>{x.b}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
