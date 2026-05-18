import { useEffect, useRef, useState } from 'react';
import { setupHiDpi } from '../../utils/canvas';

const ACC = '#7c4dff';

function LightningCanvas({ stateRef }) {
  const ref = useRef(null);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const W = 480, H = 320;
    const ctx = setupHiDpi(cv, W, H);
    let t = 0, raf;
    let strikeT = -999;

    function drawBolt(x1, y1, x2, y2, depth, alpha) {
      if (depth === 0 || alpha < 0.05) return;
      const mx = (x1 + x2) / 2 + (Math.random() - 0.5) * 30;
      const my = (y1 + y2) / 2 + (Math.random() - 0.5) * 10;
      ctx.strokeStyle = `rgba(200,160,255,${alpha})`;
      ctx.lineWidth = depth;
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(mx, my); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(mx, my); ctx.lineTo(x2, y2); ctx.stroke();
      if (Math.random() > 0.5) drawBolt(mx, my, mx + 40, my + 40, depth - 0.5, alpha * 0.5);
      drawBolt(x1, y1, mx, my, depth - 0.3, alpha * 0.7);
      drawBolt(mx, my, x2, y2, depth - 0.3, alpha * 0.7);
    }

    function draw() {
      const st = stateRef.current;
      const struck = st === 'strike';
      ctx.clearRect(0, 0, W, H);
      t += 0.025;

      if (struck && t - strikeT > 3) { strikeT = t; }

      ctx.fillStyle = 'rgba(60,30,100,.44)';
      ctx.beginPath(); ctx.roundRect(10, 8, W - 20, 28, 8); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.font = 'bold 12px monospace'; ctx.textAlign = 'center';
      ctx.fillText(struck ? '雷击模拟 · 避雷针引导 → 接地体消散' : '防雷接地系统 · 均压环 · 等电位连接', W / 2, 27);

      // ── 房屋轮廓 ──
      ctx.fillStyle = '#1e2635'; ctx.strokeStyle = '#445'; ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(160, 200); ctx.lineTo(160, 270); ctx.lineTo(340, 270);
      ctx.lineTo(340, 200); ctx.lineTo(250, 130); ctx.closePath();
      ctx.fill(); ctx.stroke();
      // 门窗
      ctx.fillStyle = '#2a3545';
      ctx.beginPath(); ctx.roundRect(200, 220, 40, 50, 3); ctx.fill();
      ctx.beginPath(); ctx.roundRect(280, 225, 30, 30, 3); ctx.fill();

      // ── 避雷针 ──
      const rodX = 250, rodTop = 90;
      ctx.strokeStyle = struck ? `rgba(200,160,255,${0.7 + 0.3 * Math.sin(t * 10)})` : '#aaa';
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(rodX, rodTop); ctx.lineTo(rodX, 130); ctx.stroke();
      ctx.fillStyle = struck ? '#c8a0ff' : '#bbb';
      ctx.beginPath(); ctx.moveTo(rodX - 6, 96); ctx.lineTo(rodX + 6, 96); ctx.lineTo(rodX, rodTop); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#889'; ctx.font = '8px monospace'; ctx.textAlign = 'center';
      ctx.fillText('避雷针', rodX + 30, 100);

      // ── 引下线 ──
      ctx.strokeStyle = struck ? `rgba(200,160,255,${0.5 + 0.2 * Math.sin(t * 5)})` : '#667';
      ctx.lineWidth = 2; ctx.setLineDash([4, 4]);
      ctx.beginPath(); ctx.moveTo(rodX, 130); ctx.lineTo(rodX, 270); ctx.lineTo(250, 290); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#667'; ctx.font = '8px monospace'; ctx.textAlign = 'left';
      ctx.fillText('引下线', rodX + 6, 220);

      // ── 接地体 ──
      const gdY = 295;
      ctx.strokeStyle = struck ? `rgba(80,200,120,${0.5 + 0.2 * Math.sin(t * 4)})` : '#4caf50';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(200, gdY); ctx.lineTo(300, gdY); ctx.stroke();
      for (let i = 0; i < 5; i++) {
        ctx.beginPath(); ctx.moveTo(208 + i * 22, gdY); ctx.lineTo(208 + i * 22, gdY + 12); ctx.stroke();
      }
      ctx.fillStyle = '#4caf50'; ctx.font = '8px monospace'; ctx.textAlign = 'center';
      ctx.fillText('接地极（水平扁钢）', 250, gdY + 24);

      // ── 等电位连接（室内）──
      ctx.fillStyle = '#1a2030'; ctx.strokeStyle = '#445'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.roundRect(168, 235, 55, 22, 4); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#00e676'; ctx.font = '7px monospace'; ctx.textAlign = 'center';
      ctx.fillText('等电位端子', 195, 249);
      // 绿线
      ctx.strokeStyle = '#4caf50'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(195, 257); ctx.lineTo(250, 270); ctx.stroke();

      // ── SPD 浪涌保护器 ──
      const spdX = 380, spdY = 180;
      ctx.fillStyle = '#1e2635'; ctx.strokeStyle = struck ? '#ff5252' : '#445'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.roundRect(spdX - 30, spdY - 30, 60, 60, 6); ctx.fill(); ctx.stroke();
      ctx.fillStyle = struck ? '#ff5252' : '#667'; ctx.font = 'bold 9px monospace'; ctx.textAlign = 'center';
      ctx.fillText('SPD', spdX, spdY - 5);
      ctx.fillStyle = '#889'; ctx.font = '7px monospace';
      ctx.fillText('浪涌保护', spdX, spdY + 8);
      ctx.fillText('MOV/GDT', spdX, spdY + 20);
      // SPD→地 连接
      ctx.strokeStyle = '#4caf50'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(spdX, spdY + 30); ctx.lineTo(spdX, gdY - 10); ctx.lineTo(300, gdY); ctx.stroke();

      // ── 雷电 ──
      if (struck) {
        const age = (t - strikeT) % 3;
        if (age < 0.4) {
          ctx.save();
          drawBolt(rodX - 40 + Math.random() * 20, 45, rodX + (Math.random() - 0.5) * 10, rodTop, 2, 0.9 - age * 1.5);
          ctx.restore();
          if (age < 0.1) {
            ctx.fillStyle = `rgba(220,180,255,${0.15})`;
            ctx.fillRect(0, 0, W, H);
          }
        }
      }

      // 云
      const cloudX = 100 + Math.sin(t * 0.3) * 20, cloudY = 55;
      ctx.fillStyle = struck ? 'rgba(100,60,150,.5)' : 'rgba(80,90,120,.35)';
      ctx.beginPath(); ctx.ellipse(cloudX, cloudY, 50, 20, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(cloudX + 30, cloudY - 8, 35, 15, 0, 0, Math.PI * 2); ctx.fill();

      ctx.textAlign = 'center'; ctx.font = 'bold 11px monospace';
      ctx.fillStyle = `rgba(124,77,255,${0.7 + 0.3 * Math.sin(t * 3)})`;
      ctx.fillText(struck ? '雷电 → 避雷针 → 引下线 → 接地体 → 大地（泄流）' : '防雷三要素：接闪器 · 引下线 · 接地体', W / 2, H - 10);

      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);

  return <canvas ref={ref} style={{ width: '100%', maxWidth: 480, flexShrink: 0, display: 'block' }} />;
}

function ICard({ color, title, children }) {
  return (
    <div className="icard" style={{ borderLeftColor: color }}>
      <h4 style={{ color }}>{title}</h4>
      <div style={{ fontSize: 13.5, color: '#aabfc8', lineHeight: 1.65 }}>{children}</div>
    </div>
  );
}

export default function Lightning() {
  const [state, setState] = useState('normal');
  const stateRef = useRef(state);
  stateRef.current = state;

  const btn = (id, col, label) => (
    <button onClick={() => setState(id)} style={{
      padding: '9px 20px', borderRadius: 10, cursor: 'pointer', fontWeight: 600, fontSize: 12,
      border: `1px solid ${state === id ? col : 'rgba(255,255,255,.12)'}`,
      background: state === id ? col + '22' : 'rgba(255,255,255,.04)',
      color: state === id ? col : 'rgba(255,255,255,.5)',
    }}>{label}</button>
  );

  return (
    <section id="lightning" className="sec">
      <div className="sh">
        <span className="sh-icon">⚡</span>
        <div>
          <div className="sh-tag">LIGHTNING · 防雷 · 接地 · 等电位</div>
          <h2 className="sh-title" style={{ color: ACC, textShadow: `0 0 35px ${ACC}44` }}>防雷接地</h2>
          <p className="sh-sub">避雷针 + 引下线 + 接地体 + SPD 浪涌保护——建筑防雷全套系统</p>
        </div>
      </div>
      <div className="divider" style={{ background: `linear-gradient(90deg,transparent,${ACC},transparent)` }} />

      <div className="grid2">
        <div className="anim-box reveal" style={{ borderColor: 'rgba(124,77,255,.2)', flexDirection: 'column', gap: 14 }}>
          <LightningCanvas stateRef={stateRef} />
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            {btn('normal', ACC, '○ 正常')}
            {btn('strike', '#ff5252', '⚡ 模拟雷击')}
          </div>
        </div>

        <div className="info-stack reveal">
          <div className="glass" style={{ borderColor: 'rgba(124,77,255,.18)' }}>
            <div className="formula" style={{ color: ACC }}>雷电 → 接闪器 → 引下线 → 接地</div>
            <div className="fdesc">防雷三要素 + SPD 浪涌保护</div>
          </div>
          <ICard color={ACC} title="⚡ 接闪器（避雷针）">
            利用尖端放电原理，引导雷电优先击中避雷针，而非建筑物。
            保护半径按滚球法计算（一类防雷 h=30m，二类 h=45m，三类 h=60m）。
          </ICard>
          <ICard color={ACC} title="📏 引下线">
            用 ≥φ8 镀锌圆钢或 40×4 扁钢，沿外墙明敷或利用钢筋混凝土柱主筋。
            每隔 25m 设断接卡，方便检测接地电阻（要求 ≤10Ω）。
          </ICard>
          <ICard color={ACC} title="🔴 接地体">
            水平接地极（扁钢）或垂直接地极（角钢/铜棒）埋设于地下 0.6m+。
            土壤电阻率越低（湿土&gt;盐碱&gt;岩石），接地电阻越小，泄流越好。
          </ICard>
          <ICard color="#00e676" title="🛡️ SPD 浪涌保护器">
            过电压时 MOV（压敏电阻）瞬间导通，将浪涌电流泄入大地，
            保护后端电气设备。一般安装在总配电箱（I 级）和弱电箱（II 级）。
          </ICard>
        </div>
      </div>
    </section>
  );
}
