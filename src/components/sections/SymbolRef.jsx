import { useState } from 'react';

const ACC = '#ab47bc';

const SYMBOLS = [
  {
    cat: '电源',
    color: '#f44336',
    items: [
      { sym: '─┤├─', ascii: '─┤├─', name: '直流电源', note: '正极(+)朝外，电动势方向' },
      { sym: '⊕', ascii: '⊕', name: '交流电源', note: '正弦波符号，~AC' },
      { sym: '▭▭', ascii: '═══', name: '电池组', note: '多节串联，长横为正极' },
      { sym: '○+−', ascii: '(+−)', name: '理想电压源', note: '圆圈内注明极性' },
    ],
  },
  {
    cat: '无源元件',
    color: '#ff9800',
    items: [
      { sym: 'R', ascii: '─┬┴─', name: '电阻', note: 'GB 矩形框，ANSI 折线' },
      { sym: 'C', ascii: '─┤├─', name: '电容', note: '两竖线代表两极板' },
      { sym: 'L', ascii: '─⌒⌒─', name: '电感', note: '线圈符号（弧形）' },
      { sym: 'M', ascii: '≈≈≈', name: '变压器', note: '两个线圈中间加铁芯线' },
    ],
  },
  {
    cat: '半导体',
    color: '#2196f3',
    items: [
      { sym: '▷|', ascii: '▷|', name: '二极管', note: '箭头方向=正向电流方向' },
      { sym: 'Z▷|', ascii: 'Z▷|', name: '稳压管（齐纳）', note: '阴极弯折标志' },
      { sym: 'LED▷|', ascii: '▷|←', name: '发光二极管', note: '附加两箭头表示光子' },
      { sym: 'Q NPN', ascii: '▷⊢', name: 'NPN 三极管', note: '发射极箭头向外' },
      { sym: 'Q PNP', ascii: '◁⊢', name: 'PNP 三极管', note: '发射极箭头向内' },
      { sym: 'N-MOSFET', ascii: '┤⊥', name: 'N沟道 MOSFET', note: 'G/D/S三端，栅极绝缘' },
    ],
  },
  {
    cat: '开关与保护',
    color: '#00e676',
    items: [
      { sym: '/ ─', ascii: '─/ ─', name: '常开触点', note: '正常状态下断开' },
      { sym: '─/─', ascii: '─/─', name: '常闭触点', note: '正常状态下闭合' },
      { sym: '▣', ascii: '[F]', name: '保险丝', note: '矩形内 S 形导线' },
      { sym: 'CB', ascii: '[CB]', name: '断路器（空开）', note: '有自动脱扣机构' },
      { sym: 'RCD', ascii: '[RCD]', name: '漏电保护器', note: '检测零火电流差' },
    ],
  },
  {
    cat: '测量 & 接地',
    color: ACC,
    items: [
      { sym: '─(V)─', ascii: '─(V)─', name: '电压表', note: '并联在被测两端，高阻抗' },
      { sym: '─(A)─', ascii: '─(A)─', name: '电流表', note: '串联在支路，低阻抗' },
      { sym: '⏚', ascii: '⏚', name: '保护接地(PE)', note: '三条递减横线' },
      { sym: '⏛', ascii: '⏛', name: '信号地/工作地', note: '两条横线' },
    ],
  },
];

function SymRow({ item, color }) {
  return (
    <tr style={{ borderBottom: '1px solid rgba(255,255,255,.06)' }}>
      <td style={{ padding: '9px 12px', fontFamily: 'monospace', fontSize: 18, color, textAlign: 'center', minWidth: 48 }}>
        {item.sym}
      </td>
      <td style={{ padding: '9px 12px', fontWeight: 700, color: '#ddd', fontSize: 13 }}>{item.name}</td>
      <td style={{ padding: '9px 12px', color: '#8aacb8', fontSize: 12.5, lineHeight: 1.5 }}>{item.note}</td>
    </tr>
  );
}

export default function SymbolRef() {
  const [active, setActive] = useState(null);

  const filtered = active ? SYMBOLS.filter(s => s.cat === active) : SYMBOLS;

  return (
    <section id="symbol-ref" className="sec">
      <div className="sh">
        <span className="sh-icon">📐</span>
        <div>
          <div className="sh-tag">SYMBOL REF · 电气符号 · IEC / GB</div>
          <h2 className="sh-title" style={{ color: ACC, textShadow: `0 0 35px ${ACC}44` }}>电气符号速查</h2>
          <p className="sh-sub">电源 / 无源元件 / 半导体 / 开关 / 测量——常用电气符号手册</p>
        </div>
      </div>
      <div className="divider" style={{ background: `linear-gradient(90deg,transparent,${ACC},transparent)` }} />

      {/* 分类筛选 */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
        <button onClick={() => setActive(null)} style={{
          padding: '7px 16px', borderRadius: 20, cursor: 'pointer', fontSize: 12, fontWeight: 600,
          border: `1px solid ${active === null ? ACC : 'rgba(255,255,255,.12)'}`,
          background: active === null ? ACC + '22' : 'transparent',
          color: active === null ? ACC : 'rgba(255,255,255,.5)',
        }}>全部</button>
        {SYMBOLS.map(s => (
          <button key={s.cat} onClick={() => setActive(active === s.cat ? null : s.cat)} style={{
            padding: '7px 16px', borderRadius: 20, cursor: 'pointer', fontSize: 12, fontWeight: 600,
            border: `1px solid ${active === s.cat ? s.color : 'rgba(255,255,255,.12)'}`,
            background: active === s.cat ? s.color + '22' : 'transparent',
            color: active === s.cat ? s.color : 'rgba(255,255,255,.5)',
          }}>{s.cat}</button>
        ))}
      </div>

      {/* 符号表格 */}
      {filtered.map(group => (
        <div key={group.cat} className="reveal" style={{ marginBottom: 28 }}>
          <div style={{
            fontWeight: 700, color: group.color, fontSize: 14, marginBottom: 10,
            paddingBottom: 6, borderBottom: `2px solid ${group.color}44`
          }}>
            {group.cat}
          </div>
          <div style={{
            background: 'rgba(255,255,255,.03)', borderRadius: 10,
            border: `1px solid rgba(255,255,255,.07)`, overflow: 'hidden'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,.05)' }}>
                  <th style={{ padding: '8px 12px', color: '#889', fontSize: 11, textAlign: 'center', fontWeight: 600 }}>符号</th>
                  <th style={{ padding: '8px 12px', color: '#889', fontSize: 11, textAlign: 'left', fontWeight: 600 }}>元件名称</th>
                  <th style={{ padding: '8px 12px', color: '#889', fontSize: 11, textAlign: 'left', fontWeight: 600 }}>说明 / 记忆要点</th>
                </tr>
              </thead>
              <tbody>
                {group.items.map(item => (
                  <SymRow key={item.name} item={item} color={group.color} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      {/* 快速记忆技巧 */}
      <div className="reveal" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 14, marginTop: 8 }}>
        {[
          { c: '#f44336', t: '🔴 电源判断', b: '直流：长横为正极，短横为负极。交流：圆圈内~符号。' },
          { c: '#2196f3', t: '🔵 二极管方向', b: '三角形尖端→正向电流方向；阴极(K)有竖线；箭头从A到K。' },
          { c: '#00e676', t: '🟢 接地区分', b: '三条递减横线=PE保护地；两条=信号地；注意不可混用。' },
          { c: ACC, t: '🟣 测量仪表', b: '并联=电压表(高阻)；串联=电流表(低阻)。接反量程会损坏指针表。' },
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
