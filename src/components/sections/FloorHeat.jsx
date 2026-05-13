import { useEffect, useRef, useState } from 'react';

const ACC = '#ff9800';

// ── 地暖+温控电路 Canvas ──────────────────────────────────────
function FloorHeatCanvas({ targetTempRef, curTempRef }) {
  const ref = useRef(null);

  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const W = 340, H = 260;
    cv.width = W * dpr; cv.height = H * dpr;
    cv.style.width = W + 'px'; cv.style.height = H + 'px';
    const ctx = cv.getContext('2d'); ctx.scale(dpr, dpr);

    let t = 0, rafId;

    // 地板加热颜色根据温度变化
    function tempColor(temp, alpha = 1) {
      const r = Math.min(255, Math.round(100 + (temp - 5) * 7));
      const g = Math.max(0, Math.round(180 - (temp - 5) * 6));
      const b = Math.max(0, Math.round(200 - temp * 6));
      return `rgba(${r},${g},${b},${alpha})`;
    }

    function draw() {
      const curTemp = curTempRef.current;
      const targetTemp = targetTempRef.current;
      const heating = curTemp < targetTemp;

      ctx.clearRect(0, 0, W, H);
      t += 0.022;

      // 背景
      const bg = ctx.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, '#0f0a05'); bg.addColorStop(1, '#080604');
      ctx.fillStyle = bg;
      ctx.beginPath(); ctx.roundRect(4, 4, W - 8, H - 8, 10); ctx.fill();

      // ====== 左侧：地暖铺设示意 ======
      const LX = 14, LY = 20, LW = 140, LH = 200;

      // 地板底色（随温度变化）
      const floorGrad = ctx.createLinearGradient(LX, LY, LX, LY + LH);
      floorGrad.addColorStop(0, heating ? tempColor(curTemp, 0.08) : 'rgba(40,30,20,.12)');
      floorGrad.addColorStop(1, heating ? tempColor(curTemp, 0.04) : 'rgba(20,15,10,.08)');
      ctx.fillStyle = floorGrad;
      ctx.beginPath(); ctx.roundRect(LX, LY, LW, LH, 8); ctx.fill();
      ctx.strokeStyle = heating ? `rgba(${255},${Math.max(0, 150 - (curTemp - 20) * 5)},0,.3)` : 'rgba(100,80,50,.2)';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.roundRect(LX, LY, LW, LH, 8); ctx.stroke();

      // 蛇形发热管/电热丝
      const paths = [];
      const step = 18, margin = 12;
      const rows = Math.floor((LH - margin * 2) / step);
      for (let i = 0; i < rows; i++) {
        const y = LY + margin + i * step;
        if (i % 2 === 0) {
          paths.push([LX + margin, y, LX + LW - margin, y]);
        } else {
          paths.push([LX + LW - margin, y, LX + margin, y]);
        }
      }

      // 绘制管道（带加热动画）
      paths.forEach((path, idx) => {
        const [x1, y1, x2] = path;
        ctx.strokeStyle = heating
          ? tempColor(curTemp, 0.5 + 0.2 * Math.sin(t * 2 - idx * 0.5))
          : 'rgba(80,60,40,.4)';
        ctx.lineWidth = heating ? 3 : 2;
        ctx.shadowColor = heating ? tempColor(curTemp, 1) : 'transparent';
        ctx.shadowBlur = heating ? 4 + 3 * Math.sin(t * 2 - idx * 0.5) : 0;
        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y1); ctx.stroke();
        ctx.shadowBlur = 0;
      });
      // 连接弯道
      for (let i = 0; i < rows - 1; i++) {
        const y1 = paths[i][1];
        const ex = (i % 2 === 0) ? paths[i][2] : paths[i][0];
        ctx.strokeStyle = heating ? tempColor(curTemp, 0.4) : 'rgba(80,60,40,.3)';
        ctx.lineWidth = heating ? 3 : 2;
        ctx.beginPath(); ctx.arc(ex, y1 + step / 2, step / 2, i % 2 === 0 ? -Math.PI / 2 : Math.PI / 2, i % 2 === 0 ? Math.PI / 2 : -Math.PI / 2, i % 2 !== 0); ctx.stroke();
      }

      ctx.fillStyle = heating ? `rgba(255,152,0,.7)` : 'rgba(120,100,70,.5)'; ctx.font = '9px "Courier New",monospace'; ctx.textAlign = 'center';
      ctx.fillText(heating ? '🔥 加热中' : '待机', LX + LW / 2, LY + LH + 14);

      // ====== 右侧：温控器电路图 ======
      const RX = 176, RY = 18;

      // 温控器外框
      const tcGrad = ctx.createLinearGradient(RX, RY, RX + 148, RY + 220);
      tcGrad.addColorStop(0, '#1a1005'); tcGrad.addColorStop(1, '#0d0803');
      ctx.fillStyle = tcGrad;
      ctx.beginPath(); ctx.roundRect(RX, RY, 148, 220, 8); ctx.fill();
      ctx.strokeStyle = `rgba(255,152,0,.25)`; ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = 'rgba(255,152,0,.5)'; ctx.font = 'bold 10px inherit'; ctx.textAlign = 'center';
      ctx.fillText('温控器内部电路', RX + 74, RY + 14);

      // 组件Y坐标
      const ntcY = RY + 35, cmpY = RY + 90, relayY = RY + 150, loadY = RY + 205;

      // NTC传感器
      ctx.strokeStyle = `rgba(100,180,255,.5)`; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.roundRect(RX + 30, ntcY, 60, 28, 5); ctx.fill();
      ctx.strokeStyle = `rgba(100,180,255,.4)`; ctx.stroke();
      ctx.fillStyle = '#64b5f6'; ctx.font = '9px "Courier New",monospace'; ctx.textAlign = 'center';
      ctx.fillText('NTC传感器', RX + 74, ntcY + 18);
      ctx.fillStyle = 'rgba(180,210,255,.5)'; ctx.font = '8px inherit';
      ctx.fillText(`${curTemp}°C`, RX + 74, ntcY + 32);

      // 连线：NTC→比较器
      ctx.strokeStyle = 'rgba(100,180,255,.35)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(RX + 74, ntcY + 28); ctx.lineTo(RX + 74, cmpY); ctx.stroke();

      // 比较器
      ctx.fillStyle = 'rgba(156,125,255,.1)';
      ctx.beginPath(); ctx.roundRect(RX + 24, cmpY, 72, 30, 5); ctx.fill();
      ctx.strokeStyle = `rgba(156,125,255,${0.4 + 0.2 * Math.sin(t * 3)})`; ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fillStyle = ACC; ctx.font = '9px "Courier New",monospace'; ctx.textAlign = 'center';
      ctx.fillText(`比较器 Vref=${Math.round(targetTemp)}°C`, RX + 74, cmpY + 11);
      ctx.fillStyle = heating ? '#66bb6a' : '#f44336'; ctx.font = '8px inherit';
      ctx.fillText(heating ? '输出 HIGH' : '输出 LOW', RX + 74, cmpY + 24);

      // 连线：比较器→继电器
      ctx.strokeStyle = heating ? 'rgba(255,152,0,.4)' : 'rgba(80,80,80,.3)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(RX + 74, cmpY + 30); ctx.lineTo(RX + 74, relayY); ctx.stroke();

      // 继电器（开合动画）
      ctx.fillStyle = 'rgba(255,150,0,.1)';
      ctx.beginPath(); ctx.roundRect(RX + 28, relayY, 64, 34, 5); ctx.fill();
      ctx.strokeStyle = heating ? `rgba(255,152,0,${0.5 + 0.2 * Math.sin(t * 5)})` : 'rgba(80,80,80,.3)'; ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.fillStyle = 'rgba(255,152,0,.7)'; ctx.font = '9px "Courier New",monospace'; ctx.textAlign = 'center';
      ctx.fillText('继电器(Relay)', RX + 74, relayY + 12);

      // 继电器触点动画
      const contactOpen = !heating;
      const contactX1 = RX + 46, contactX2 = RX + 100, contactY1 = relayY + 24;
      const gap = contactOpen ? 6 : 0;
      ctx.strokeStyle = heating ? '#ff9800' : '#666'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(contactX1, contactY1); ctx.lineTo(contactX1 + 20, contactY1); ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(contactX2 - 20 + gap, contactY1 - (contactOpen ? 3 : 0));
      ctx.lineTo(contactX2, contactY1); ctx.stroke();
      if (!contactOpen) {
        ctx.fillStyle = `rgba(255,152,0,${0.6 + 0.4 * Math.sin(t * 8)})`;
        ctx.beginPath(); ctx.arc(contactX1 + 20, contactY1, 2, 0, Math.PI * 2); ctx.fill();
      }

      // 连线：继电器→加热体
      ctx.strokeStyle = heating ? `rgba(255,100,0,${0.4 + 0.2 * Math.sin(t * 2)})` : 'rgba(60,40,20,.3)'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(RX + 74, relayY + 34); ctx.lineTo(RX + 74, loadY); ctx.stroke();

      // 加热体标注
      ctx.fillStyle = heating ? `rgba(255,100,0,${0.3 + 0.15 * Math.sin(t * 2)})` : 'rgba(40,30,20,.2)';
      ctx.beginPath(); ctx.roundRect(RX + 28, loadY, 64, 22, 4); ctx.fill();
      ctx.strokeStyle = heating ? `rgba(255,100,0,.5)` : 'rgba(60,40,20,.3)'; ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fillStyle = heating ? '#ff7043' : '#555'; ctx.font = '9px "Courier New",monospace'; ctx.textAlign = 'center';
      ctx.fillText('电热丝/发热膜', RX + 74, loadY + 14);

      rafId = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(rafId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <canvas ref={ref} style={{ maxWidth: '100%', borderRadius: 10 }} />;
}

// ── 数据 ──────────────────────────────────────────────────────
const FLOOR_HEAT_COMPARE = [
  {
    type: '水地暖',
    color: '#64b5f6',
    items: [
      { label: '原理', value: '热水(35~45°C)循环管道' },
      { label: '安装费', value: '较高（含分集水器/锅炉）' },
      { label: '运行费', value: '低，燃气/空气源热泵' },
      { label: '响应时间', value: '慢（4~8小时）' },
      { label: '维护', value: '需年度清洗管路' },
    ],
  },
  {
    type: '电地暖',
    color: ACC,
    items: [
      { label: '原理', value: '发热电缆/碳纤维电热膜' },
      { label: '安装费', value: '较低（无锅炉）' },
      { label: '运行费', value: '较高，用电120~180W/m²' },
      { label: '响应时间', value: '快（30~60分钟）' },
      { label: '维护', value: '基本免维护，寿命20年+' },
    ],
  },
];

export default function FloorHeat() {
  const [targetTemp, setTargetTemp] = useState(25);
  const [curTemp, setCurTemp] = useState(18);
  const heating = curTemp < targetTemp;

  const targetTempRef = useRef(targetTemp);
  const curTempRef = useRef(curTemp);
  useEffect(() => { targetTempRef.current = targetTemp; }, [targetTemp]);
  useEffect(() => { curTempRef.current = curTemp; }, [curTemp]);

  // 模拟温度缓慢上升/下降
  useEffect(() => {
    const interval = setInterval(() => {
      setCurTemp(prev => {
        if (heating && prev < targetTemp) return Math.min(prev + 0.3, targetTemp + 1);
        if (!heating && prev > 15) return Math.max(prev - 0.15, 15);
        return prev;
      });
    }, 500);
    return () => clearInterval(interval);
  }, [heating, targetTemp]);

  return (
    <section id="floor-heat" className="sec">
      <div className="sh">
        <span className="sh-icon">🔥</span>
        <div>
          <div className="sh-title" style={{ color: ACC, textShadow: `0 0 35px rgba(255,152,0,.4)` }}>
            地暖与浴室加热系统
          </div>
          <div className="sh-tag">Stage 9 · Floor Heating</div>
          <div className="sh-sub">电地暖、温控器电路和浴霸接线，掌握家庭供暖系统的电气原理与规范。</div>
        </div>
      </div>

      <div className="divider" style={{ background: `linear-gradient(90deg,transparent,${ACC},transparent)` }} />

      {/* Canvas + 控制面板 */}
      <div className="grid2">
        <div className="anim-box reveal" style={{ borderColor: 'rgba(255,152,0,.2)', flexDirection: 'column', gap: 14, alignItems: 'center' }}>
          <FloorHeatCanvas targetTempRef={targetTempRef} curTempRef={curTempRef} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', maxWidth: 300 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: 'var(--dim)' }}>设定温度：</span>
              <span style={{ color: ACC, fontWeight: 700, fontFamily: 'monospace' }}>{targetTemp}°C</span>
            </div>
            <input type="range" min={16} max={32} value={targetTemp} onChange={e => setTargetTemp(Number(e.target.value))} style={{
              width: '100%', accentColor: ACC, cursor: 'pointer',
            }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
              <span style={{ color: heating ? '#ff7043' : '#66bb6a', fontWeight: 700 }}>
                {heating ? '🔥 加热中' : '✓ 已到温'}
              </span>
              <span style={{ color: '#8aacb8' }}>当前：{Math.round(curTemp * 10) / 10}°C</span>
            </div>
          </div>
        </div>

        {/* 接线说明 */}
        <div className="reveal" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ font: '11px "Courier New",monospace', color: 'var(--dim)', letterSpacing: 2, textAlign: 'center' }}>
            🔌 温控器接线端子
          </div>
          {[
            { t: 'L', color: '#ff5252', desc: '火线输入（来自断路器）' },
            { t: 'N', color: '#64b5f6', desc: '零线（接零排）' },
            { t: 'E', color: '#8bc34a', desc: '保护接地线（必须连接）' },
            { t: 'SEN+/SEN−', color: '#ffd740', desc: 'NTC地温传感器，安装于地板下50mm处' },
            { t: 'L1/N1', color: ACC, desc: '加热体输出端（发热电缆或电热膜）' },
          ].map(r => (
            <div key={r.t} className="glass reveal" style={{ borderColor: `${r.color}22`, flexDirection: 'row', gap: 12, alignItems: 'center' }}>
              <div style={{
                flexShrink: 0, minWidth: 60, borderRadius: 6, padding: '4px 8px',
                background: `${r.color}15`, border: `1px solid ${r.color}40`,
                color: r.color, fontWeight: 700, fontSize: 12, fontFamily: 'monospace',
                textAlign: 'center',
              }}>{r.t}</div>
              <div style={{ fontSize: 12.5, color: '#8aacb8', lineHeight: 1.5 }}>{r.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 水地暖 vs 电地暖 */}
      <div style={{ marginTop: 44 }}>
        <h3 style={{ fontSize: 20, fontWeight: 700, color: ACC, marginBottom: 20 }}>⚡ 水地暖 vs 电地暖</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
          {FLOOR_HEAT_COMPARE.map(item => (
            <div key={item.type} className="glass reveal" style={{ borderColor: `${item.color}22` }}>
              <div style={{ fontWeight: 700, color: item.color, fontSize: 15, marginBottom: 14 }}>{item.type}</div>
              {item.items.map(r => (
                <div key={r.label} style={{ display: 'flex', gap: 10, marginBottom: 8, fontSize: 12.5 }}>
                  <span style={{ color: item.color, flexShrink: 0, minWidth: 60, fontWeight: 600 }}>{r.label}</span>
                  <span style={{ color: '#8aacb8', lineHeight: 1.5 }}>{r.value}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* 功率计算 */}
      <div style={{ marginTop: 32, background: 'rgba(255,152,0,.05)', border: '1px solid rgba(255,152,0,.2)', borderRadius: 14, padding: '20px 24px' }}>
        <div style={{ fontWeight: 700, color: ACC, marginBottom: 16, fontSize: 15 }}>📐 电地暖功率与回路计算</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
          <div>
            <div style={{ fontWeight: 600, color: 'var(--white)', marginBottom: 8, fontSize: 13 }}>① 总功率估算</div>
            <div style={{ background: 'rgba(0,0,0,.4)', borderRadius: 10, padding: '12px 16px', fontFamily: '"Courier New",monospace', fontSize: 13, color: '#ffd740', border: '1px solid rgba(255,215,64,.15)' }}>
              P = 面积(m²) × 功率密度<br />
              <span style={{ color: '#8aacb8' }}>功率密度：120~150W/m²（普通）</span><br />
              <span style={{ color: '#8aacb8' }}>浴室：150~180W/m²（地面潮湿）</span><br />
              <span style={{ color: '#8aacb8' }}>示例：15m²×140 = 2100W</span>
            </div>
          </div>
          <div>
            <div style={{ fontWeight: 600, color: 'var(--white)', marginBottom: 8, fontSize: 13 }}>② 专用回路选型</div>
            <div style={{ background: 'rgba(0,0,0,.4)', borderRadius: 10, padding: '12px 16px', fontFamily: '"Courier New",monospace', fontSize: 13, color: '#ff9800', border: '1px solid rgba(255,152,0,.15)' }}>
              I = P ÷ 220V<br />
              MCB = I × 1.25（安全系数）<br />
              <span style={{ color: '#8aacb8' }}>2100W → 9.5A → 选16A MCB</span><br />
              <span style={{ color: '#8aacb8' }}>导线：2.5mm²，独立回路</span>
            </div>
          </div>
        </div>
      </div>

      {/* 浴霸接线 */}
      <div style={{ marginTop: 36 }}>
        <h3 style={{ fontSize: 18, fontWeight: 700, color: ACC, marginBottom: 16 }}>💡 浴霸接线详解</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14 }}>
          <div className="glass reveal" style={{ borderColor: 'rgba(255,152,0,.15)' }}>
            <div style={{ fontWeight: 700, color: ACC, marginBottom: 12, fontSize: 14 }}>🔆 浴霸内部组成</div>
            {[
              { comp: '取暖灯×2', power: '275W×2', note: '红外卤素灯，即热，IP54防水' },
              { comp: '换气扇', power: '30~40W', note: '排气电机，定时延时功能' },
              { comp: '照明灯', power: '18~25W', note: 'LED灯板，防潮型' },
            ].map(item => (
              <div key={item.comp} style={{ display: 'flex', gap: 10, marginBottom: 10, alignItems: 'flex-start' }}>
                <div style={{ flexShrink: 0, width: 70, color: ACC, fontWeight: 600, fontSize: 12, fontFamily: 'monospace' }}>{item.comp}</div>
                <div>
                  <div style={{ color: '#ffd740', fontSize: 12, fontFamily: 'monospace', marginBottom: 2 }}>{item.power}</div>
                  <div style={{ color: '#8aacb8', fontSize: 12, lineHeight: 1.5 }}>{item.note}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="glass reveal" style={{ borderColor: 'rgba(255,152,0,.15)' }}>
            <div style={{ fontWeight: 700, color: ACC, marginBottom: 12, fontSize: 14 }}>📋 4开浴霸接线端子</div>
            {[
              { t: 'N', color: '#64b5f6', desc: '公共零线，接各组件零线端' },
              { t: 'L', color: '#ff5252', desc: '公共火线进线（来自断路器）' },
              { t: 'L1', color: '#ffd740', desc: '取暖灯1控制火线' },
              { t: 'L2', color: '#ff8a65', desc: '取暖灯2控制火线' },
              { t: 'L3', color: '#ce93d8', desc: '换气扇控制火线' },
              { t: 'L4', color: '#a5d6a7', desc: '照明控制火线' },
            ].map(r => (
              <div key={r.t} style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 7 }}>
                <div style={{ width: 32, textAlign: 'center', color: r.color, fontWeight: 700, fontFamily: 'monospace', fontSize: 13, flexShrink: 0 }}>{r.t}</div>
                <div style={{ fontSize: 12, color: '#8aacb8', lineHeight: 1.5 }}>{r.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 安全规范 */}
      <div style={{ marginTop: 32, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
        <div className="glass reveal" style={{ borderColor: 'rgba(255,82,82,.15)' }}>
          <div style={{ fontWeight: 700, color: '#ff5252', marginBottom: 12, fontSize: 14 }}>⚠️ 浴室电气安全规范</div>
          {[
            'IP44防护等级：能防止≥1mm固体和任何方向溅水',
            '浴室区域0/1/2分区，各区产品需满足对应IP等级',
            '必须使用GFCI/RCD漏电保护：30mA、0.1s以内动作',
            '热水器和浴霸共用回路时，需核算总电流防止过载',
            '插座与花洒/浴缸距离≥600mm，必须使用防水插座面板',
          ].map(tip => (
            <div key={tip} style={{ fontSize: 12, color: '#8aacb8', display: 'flex', gap: 8, marginBottom: 8, lineHeight: 1.55 }}>
              <span style={{ color: '#ff5252', flexShrink: 0 }}>!</span>{tip}
            </div>
          ))}
        </div>
        <div className="glass reveal" style={{ borderColor: 'rgba(255,152,0,.12)' }}>
          <div style={{ fontWeight: 700, color: ACC, marginBottom: 12, fontSize: 14 }}>🛠️ 传感器安装要点</div>
          {[
            '地温传感器套管安装于发热电缆之间，距边缘≥500mm',
            '传感器套管端部密封，防止混凝土/砂浆渗入',
            '传感器线从墙角穿管引至温控器，不得与电源线共管',
            '安装后用万用表测量传感器阻值，25°C约10kΩ为正常',
            '铺设发热电缆前，绘制施工图存档，便于日后维修定位',
          ].map(tip => (
            <div key={tip} style={{ fontSize: 12, color: '#8aacb8', display: 'flex', gap: 8, marginBottom: 8, lineHeight: 1.55 }}>
              <span style={{ color: ACC, flexShrink: 0 }}>▸</span>{tip}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
