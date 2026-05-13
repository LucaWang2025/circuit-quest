import { useEffect, useRef, useState } from 'react';

const ACC = '#00bcd4';

// ── 空调系统 Canvas ──────────────────────────────────────────
function AirConCanvas({ mode }) {
  const ref = useRef(null);

  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const W = 380, H = 280;
    cv.width = W * dpr; cv.height = H * dpr;
    cv.style.width = W + 'px'; cv.style.height = H + 'px';
    const ctx = cv.getContext('2d'); ctx.scale(dpr, dpr);

    let t = 0, rafId;
    const cooling = mode === 'cool';
    const PIPE_COLOR = cooling ? '#64b5f6' : '#ff7043';
    const RETURN_COLOR = cooling ? '#ff7043' : '#64b5f6';

    // 冷媒粒子
    const particles = [];
    function spawnParticle(type) {
      // type: 'high' 高压管, 'low' 低压管
      const isHigh = type === 'high';
      particles.push({
        type,
        prog: 0,
        speed: 0.007 + Math.random() * 0.005,
        color: isHigh ? PIPE_COLOR : RETURN_COLOR,
        size: isHigh ? 3 : 2.5,
      });
    }

    function getPipePos(prog, type) {
      // 室内机 (左): x=30~120, y=60~130
      // 室外机 (右): x=250~340, y=60~180
      // 高压管: 室外机压缩机→室内机蒸发器 (上管)
      // 低压管: 室内机蒸发器→室外机压缩机 (下管)
      const isHigh = type === 'high';
      const p1x = isHigh ? 295 : 75, p1y = isHigh ? 100 : 115;
      const p2x = isHigh ? 75  : 295, p2y = isHigh ? 90  : 110;
      const cpx = W / 2, cpy = isHigh ? 60 : 140;
      // 贝塞尔曲线
      const t2 = prog;
      const x = (1 - t2) ** 2 * p1x + 2 * (1 - t2) * t2 * cpx + t2 ** 2 * p2x;
      const y = (1 - t2) ** 2 * p1y + 2 * (1 - t2) * t2 * cpy + t2 ** 2 * p2y;
      return { x, y };
    }

    function drawPipePath(type) {
      const isHigh = type === 'high';
      const p1x = isHigh ? 295 : 75, p1y = isHigh ? 100 : 115;
      const p2x = isHigh ? 75  : 295, p2y = isHigh ? 90  : 110;
      const cpx = W / 2, cpy = isHigh ? 60 : 140;
      ctx.beginPath();
      ctx.moveTo(p1x, p1y);
      ctx.quadraticCurveTo(cpx, cpy, p2x, p2y);
    }

    function drawWirePath(type) {
      // 电源线和信号线在两机之间
      const y = type === 'power' ? 170 : 185;
      ctx.beginPath();
      ctx.moveTo(120, y);
      ctx.lineTo(250, y);
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      t += 0.018;

      // 背景
      const bg = ctx.createLinearGradient(0, 0, W, H);
      bg.addColorStop(0, '#071520'); bg.addColorStop(1, '#040e18');
      ctx.fillStyle = bg;
      ctx.beginPath(); ctx.roundRect(4, 4, W - 8, H - 8, 10); ctx.fill();

      // ── 室内机 ──
      const indGrad = ctx.createLinearGradient(20, 50, 120, 140);
      indGrad.addColorStop(0, '#1a3a4a'); indGrad.addColorStop(1, '#0d2535');
      ctx.fillStyle = indGrad;
      ctx.beginPath(); ctx.roundRect(20, 50, 100, 90, 10); ctx.fill();
      ctx.strokeStyle = `rgba(0,188,212,${0.4 + 0.2 * Math.sin(t * 1.5)})`; ctx.lineWidth = 1.5;
      ctx.shadowColor = ACC; ctx.shadowBlur = 8;
      ctx.stroke(); ctx.shadowBlur = 0;

      // 室内机散热鳍片（蒸发器）
      for (let i = 0; i < 6; i++) {
        const fy = 58 + i * 11;
        ctx.strokeStyle = `rgba(100,181,246,${0.3 + 0.1 * Math.sin(t * 2 + i)})`; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(30, fy); ctx.lineTo(90, fy); ctx.stroke();
      }
      // 风扇叶片动画
      ctx.save(); ctx.translate(70, 115); ctx.rotate(t * 3);
      for (let i = 0; i < 4; i++) {
        ctx.save(); ctx.rotate((i / 4) * Math.PI * 2);
        ctx.fillStyle = `rgba(100,181,246,0.5)`;
        ctx.beginPath(); ctx.ellipse(0, -10, 4, 10, 0, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }
      ctx.restore();

      ctx.fillStyle = ACC; ctx.font = 'bold 11px inherit'; ctx.textAlign = 'center';
      ctx.fillText('室内机', 70, 155);
      ctx.fillStyle = 'rgba(180,220,232,.5)'; ctx.font = '9px inherit';
      ctx.fillText('蒸发器+风机', 70, 167);

      // ── 室外机 ──
      const outGrad = ctx.createLinearGradient(250, 40, 360, 195);
      outGrad.addColorStop(0, '#1e2a20'); outGrad.addColorStop(1, '#0d1812');
      ctx.fillStyle = outGrad;
      ctx.beginPath(); ctx.roundRect(250, 40, 110, 150, 10); ctx.fill();
      ctx.strokeStyle = `rgba(0,188,212,${0.35 + 0.15 * Math.sin(t * 1.2)})`; ctx.lineWidth = 1.5;
      ctx.shadowColor = '#4caf50'; ctx.shadowBlur = 6;
      ctx.stroke(); ctx.shadowBlur = 0;

      // 压缩机动画（跳动效果）
      const compScale = 1 + 0.02 * Math.sin(t * 4);
      ctx.save(); ctx.translate(280, 130); ctx.scale(compScale, compScale);
      ctx.fillStyle = '#1a3a1a';
      ctx.beginPath(); ctx.roundRect(-18, -18, 36, 36, 6); ctx.fill();
      ctx.strokeStyle = `rgba(76,175,80,0.6)`; ctx.lineWidth = 1.5; ctx.stroke();
      ctx.fillStyle = '#66bb6a'; ctx.font = 'bold 10px monospace'; ctx.textAlign = 'center';
      ctx.fillText('压', 0, 4);
      ctx.restore();

      // 冷凝器鳍片
      for (let i = 0; i < 5; i++) {
        const fy = 50 + i * 14;
        ctx.strokeStyle = `rgba(255,112,67,${0.35 + 0.1 * Math.sin(t * 1.5 + i)})`; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(325, fy); ctx.lineTo(355, fy); ctx.stroke();
      }
      // 室外机风扇
      ctx.save(); ctx.translate(340, 140); ctx.rotate(-t * 2.5);
      for (let i = 0; i < 4; i++) {
        ctx.save(); ctx.rotate((i / 4) * Math.PI * 2);
        ctx.fillStyle = `rgba(255,112,67,0.45)`;
        ctx.beginPath(); ctx.ellipse(0, -12, 4, 12, 0, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }
      ctx.restore();

      ctx.fillStyle = '#66bb6a'; ctx.font = 'bold 11px inherit'; ctx.textAlign = 'center';
      ctx.fillText('室外机', 305, 205);
      ctx.fillStyle = 'rgba(180,220,200,.5)'; ctx.font = '9px inherit';
      ctx.fillText('压缩机+冷凝器', 305, 218);

      // ── 冷媒管道 ──
      // 高压管（液管）
      drawPipePath('high');
      ctx.strokeStyle = `rgba(${cooling ? '100,181,246' : '255,112,67'},0.5)`; ctx.lineWidth = 3;
      ctx.setLineDash([]); ctx.stroke();
      // 低压管（气管）
      drawPipePath('low');
      ctx.strokeStyle = `rgba(${cooling ? '255,112,67' : '100,181,246'},0.4)`; ctx.lineWidth = 4.5;
      ctx.stroke();

      // 管道标注
      ctx.fillStyle = cooling ? '#64b5f6' : '#ff7043'; ctx.font = '9px "Courier New",monospace'; ctx.textAlign = 'center';
      ctx.fillText(cooling ? '液管(高压)' : '气管(低压)', W / 2, 40);
      ctx.fillStyle = cooling ? '#ff7043' : '#64b5f6';
      ctx.fillText(cooling ? '气管(低压)' : '液管(高压)', W / 2, 158);

      // ── 电气连接线 ──
      drawWirePath('power');
      ctx.strokeStyle = 'rgba(255,215,64,0.35)'; ctx.lineWidth = 2; ctx.setLineDash([5, 4]);
      ctx.stroke(); ctx.setLineDash([]);

      drawWirePath('signal');
      ctx.strokeStyle = 'rgba(156,125,255,0.4)'; ctx.lineWidth = 1.5; ctx.setLineDash([3, 3]);
      ctx.stroke(); ctx.setLineDash([]);

      ctx.fillStyle = 'rgba(255,215,64,0.6)'; ctx.font = '9px "Courier New",monospace'; ctx.textAlign = 'center';
      ctx.fillText('电源线 L/N/E', W / 2, 163);
      ctx.fillStyle = 'rgba(156,125,255,0.7)';
      ctx.fillText('信号线 1/2/3', W / 2, 179);

      // ── 粒子 ──
      if (Math.random() < 0.25) spawnParticle('high');
      if (Math.random() < 0.2) spawnParticle('low');
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.prog += p.speed;
        if (p.prog >= 1) { particles.splice(i, 1); continue; }
        const { x, y } = getPipePos(p.prog, p.type);
        const alpha = 0.9 - p.prog * 0.6;
        ctx.beginPath(); ctx.arc(x, y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color + Math.floor(alpha * 255).toString(16).padStart(2, '0');
        ctx.shadowColor = p.color; ctx.shadowBlur = 8;
        ctx.fill(); ctx.shadowBlur = 0;
      }

      // 模式标签
      ctx.fillStyle = cooling ? ACC : '#ff7043'; ctx.font = 'bold 10px "Courier New",monospace'; ctx.textAlign = 'center';
      ctx.fillText(cooling ? '❄ 制冷模式' : '🔥 制热模式', W / 2, H - 10);

      rafId = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(rafId);
  }, [mode]);

  return <canvas ref={ref} style={{ maxWidth: '100%', borderRadius: 10 }} />;
}

// ── 数据 ──────────────────────────────────────────────────────
const TERMINAL_WIRING = [
  { terminal: 'L', color: '#ff5252', desc: '火线，接室内机断路器输出侧' },
  { terminal: 'N', color: '#64b5f6', desc: '零线，接零排或配电箱N排' },
  { terminal: 'E', color: '#8bc34a', desc: '保护地线，必须可靠接地' },
  { terminal: '①', color: '#ffd740', desc: '信号公共端（COM/N），室内→室外' },
  { terminal: '②', color: '#ce93d8', desc: '信号线，室内机通信A端' },
  { terminal: '③', color: '#80deea', desc: '信号线，室内机通信B端（部分机型）' },
];

const FAULT_CODES = [
  { code: 'E1', meaning: '室内外通信故障', cause: '信号线接错或断路', fix: '用万用表量②③端阻值，正常约200Ω' },
  { code: 'E2', meaning: '室内温度传感器故障', cause: 'NTC传感器断路或短路', fix: '更换室温传感器，阻值25℃约10kΩ' },
  { code: 'F0', meaning: '冷媒泄漏或不足', cause: '管路焊点泄漏', fix: '检漏后补充R410A，注意回收旧冷媒' },
  { code: 'H6', meaning: '室内风机故障', cause: '风机电容失效或卡塞', fix: '检测风机电容，更换或清洁轴承' },
];

export default function AirCon() {
  const [mode, setMode] = useState('cool');

  return (
    <section id="aircon" className="sec">
      <div className="sh">
        <span className="sh-icon">❄️</span>
        <div className="sh-tag">Stage 7 · Air Conditioning</div>
        <h2 className="sh-title" style={{ color: ACC, textShadow: `0 0 35px rgba(0,188,212,.4)` }}>
          空调电气系统
        </h2>
        <p className="sh-sub">从专用回路设计到室内外机接线，理解空调电气原理是维修和安装的基础。</p>
        <div className="divider" style={{ background: `linear-gradient(90deg,transparent,${ACC},transparent)` }} />
      </div>

      {/* Canvas + 回路要求 */}
      <div className="grid2">
        <div className="anim-box reveal" style={{ borderColor: 'rgba(0,188,212,.2)', flexDirection: 'column', gap: 14, alignItems: 'center' }}>
          <AirConCanvas mode={mode} />
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            {['cool', 'heat'].map(m => (
              <button key={m} onClick={() => setMode(m)} style={{
                padding: '6px 18px', borderRadius: 20, cursor: 'pointer',
                border: `1px solid ${mode === m ? ACC : 'rgba(0,188,212,.2)'}`,
                background: mode === m ? 'rgba(0,188,212,.15)' : 'transparent',
                color: mode === m ? ACC : 'var(--dim)',
                font: '12px/1 inherit', transition: 'all .18s',
              }}>{m === 'cool' ? '❄ 制冷' : '🔥 制热'}</button>
            ))}
          </div>
        </div>

        <div className="reveal" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ font: '11px "Courier New",monospace', color: 'var(--dim)', letterSpacing: 2, textAlign: 'center' }}>
            ⚡ 专用回路要求
          </div>
          {[
            { label: '专用断路器', value: '2P 20~25A', note: '独立回路，不与其他设备共用' },
            { label: '导线截面', value: '2.5~4 mm²', note: '1.5匹以下用2.5mm²，2匹以上用4mm²' },
            { label: '插座规格', value: '16A/20A三孔', note: '高位安装（距地≥2m），防止冷凝水滴入' },
            { label: '接地要求', value: '必须可靠PE', note: '外壳漏电时保护电路动作，禁止用零线代替地线' },
          ].map(r => (
            <div key={r.label} className="glass reveal" style={{ borderColor: 'rgba(0,188,212,.12)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ color: '#c8dce8', fontWeight: 600, fontSize: 13 }}>{r.label}</span>
                <span style={{ color: ACC, fontFamily: '"Courier New",monospace', fontSize: 13, fontWeight: 700 }}>{r.value}</span>
              </div>
              <div style={{ fontSize: 12, color: '#8aacb8', lineHeight: 1.5 }}>{r.note}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 室内外机接线端子 */}
      <div style={{ marginTop: 44 }}>
        <h3 style={{ fontSize: 20, fontWeight: 700, color: ACC, marginBottom: 20 }}>
          🔌 接线端子台说明
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
          {TERMINAL_WIRING.map(tw => (
            <div key={tw.terminal} className="glass reveal" style={{ borderColor: `${tw.color}22`, flexDirection: 'row', gap: 12, alignItems: 'center' }}>
              <div style={{
                flexShrink: 0, width: 36, height: 36, borderRadius: 8,
                background: `${tw.color}18`, border: `2px solid ${tw.color}55`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: tw.color, fontWeight: 700, fontSize: 14, fontFamily: 'monospace',
              }}>{tw.terminal}</div>
              <div style={{ fontSize: 12.5, color: '#8aacb8', lineHeight: 1.55 }}>{tw.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 变频空调原理 */}
      <div style={{ marginTop: 36, background: 'rgba(0,188,212,.05)', border: '1px solid rgba(0,188,212,.2)', borderRadius: 14, padding: '20px 24px' }}>
        <div style={{ fontWeight: 700, color: ACC, marginBottom: 16, fontSize: 15 }}>🔁 工频 vs 变频空调对比</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
          {[
            { type: '工频空调', color: '#ff8a65', points: ['压缩机固定转速', '启停控制温度', '启动电流≈额定7倍', '成本低，适合轻度使用'] },
            { type: '变频空调', color: ACC, points: ['BLDC变速压缩机', '调频调速，连续调节', 'PFC电路改善功率因数', '节能30%+，高频使用经济'] },
          ].map(item => (
            <div key={item.type} className="glass reveal" style={{ borderColor: `${item.color}22` }}>
              <div style={{ fontWeight: 700, color: item.color, marginBottom: 10, fontSize: 14 }}>{item.type}</div>
              {item.points.map(p => (
                <div key={p} style={{ fontSize: 12.5, color: '#8aacb8', display: 'flex', gap: 8, marginBottom: 6, lineHeight: 1.5 }}>
                  <span style={{ color: item.color, flexShrink: 0 }}>▸</span>{p}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* 功率计算 */}
      <div style={{ marginTop: 24, background: 'rgba(0,0,0,.4)', border: '1px solid rgba(0,188,212,.15)', borderRadius: 12, padding: '16px 20px' }}>
        <div style={{ fontWeight: 700, color: ACC, marginBottom: 12, fontSize: 14 }}>📐 匹数换算公式</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, fontFamily: '"Courier New",monospace', fontSize: 13 }}>
          <div style={{ color: '#ffd740' }}>1匹 ≈ 735W 制冷量<br /><span style={{ color: '#8aacb8' }}>实际耗电约 600~800W</span></div>
          <div style={{ color: '#ffd740' }}>1.5匹 ≈ 1100W<br /><span style={{ color: '#8aacb8' }}>适用 12~18m² 房间</span></div>
          <div style={{ color: '#ffd740' }}>2匹 ≈ 1470W<br /><span style={{ color: '#8aacb8' }}>适用 18~25m² 房间</span></div>
          <div style={{ color: '#ffd740' }}>3匹 ≈ 2200W<br /><span style={{ color: '#8aacb8' }}>适用客厅/大空间</span></div>
        </div>
      </div>

      {/* 故障码 */}
      <div style={{ marginTop: 36 }}>
        <h3 style={{ fontSize: 18, fontWeight: 700, color: ACC, marginBottom: 16 }}>🔧 常见故障码（美的/格力通用）</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
          {FAULT_CODES.map(f => (
            <div key={f.code} className="glass reveal" style={{ borderColor: 'rgba(255,82,82,.15)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <span style={{ fontWeight: 700, color: '#ff5252', fontFamily: 'monospace', fontSize: 16, background: 'rgba(255,82,82,.1)', padding: '2px 8px', borderRadius: 6 }}>{f.code}</span>
                <span style={{ fontWeight: 600, color: '#c8dce8', fontSize: 13 }}>{f.meaning}</span>
              </div>
              <div style={{ fontSize: 12, color: '#ff9800', marginBottom: 4 }}>原因: {f.cause}</div>
              <div style={{ fontSize: 12, color: '#8aacb8' }}>排查: {f.fix}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 安装规范 */}
      <div style={{ marginTop: 32, background: 'rgba(0,188,212,.05)', border: '1px solid rgba(0,188,212,.15)', borderRadius: 14, padding: '18px 22px' }}>
        <div style={{ fontWeight: 700, color: ACC, marginBottom: 14, fontSize: 14 }}>🛠️ 安装施工规范</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
          {[
            ['铜管弯折', '弯折半径 ≥ 管径6倍，避免管内结晶'],
            ['排水坡度', '排水管坡度 ≥ 1/100，防止倒坡积水'],
            ['穿墙孔', '室外侧低于室内侧，防雨水反灌'],
            ['防雷接地', '室外机外壳接PE，与建筑防雷系统连通'],
            ['管路保温', '铜管必须包裹保温棉，防冷凝水'],
            ['真空排气', '充冷媒前先抽真空至−0.1MPa维持15min'],
          ].map(([k, v]) => (
            <div key={k} style={{ fontSize: 12.5, color: '#8aacb8', lineHeight: 1.55 }}>
              <span style={{ color: ACC, fontWeight: 600 }}>{k}：</span>{v}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
