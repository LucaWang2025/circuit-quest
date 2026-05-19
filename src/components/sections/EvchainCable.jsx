import { useEffect, useRef, useState } from 'react';
import { setupHiDpi } from '../../utils/canvas';
import Quiz from '../Quiz';
import RelatedSections from '../RelatedSections';
import { useNav } from '../../NavContext';
import { EV_ACC, QUIZ_CABLE } from '../../data/evchainData';

const ACC = '#69f0ae';

function CableSignalCanvas({ signalRef, connectedRef }) {
  const ref = useRef(null);
  useEffect(() => {
    const cv = ref.current;
    if (!cv) return undefined;
    const W = 480, H = 320;
    const ctx = setupHiDpi(cv, W, H);
    let t = 0, raf;

    function draw() {
      const sig = signalRef.current;
      const connected = connectedRef.current;
      ctx.clearRect(0, 0, W, H);
      t += 0.025;

      ctx.fillStyle = 'rgba(105,240,174,.4)';
      ctx.beginPath(); ctx.roundRect(10, 8, W - 20, 28, 8); ctx.fill();
      ctx.fillStyle = '#111'; ctx.font = 'bold 12px monospace'; ctx.textAlign = 'center';
      ctx.fillText(
        connected ? `CP/PP 导引 · ${sig === 'cp' ? 'Control Pilot' : sig === 'pp' ? 'Proximity Pilot' : 'CC 电阻编码'}` : '未连接 · 等待插枪',
        W / 2, 27,
      );

      const pileX = 100, carX = 360, midY = 150;
      ctx.fillStyle = '#1e2635'; ctx.strokeStyle = connected ? ACC : '#445'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.roundRect(pileX - 45, midY - 70, 90, 140, 10); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#889'; ctx.font = '9px monospace'; ctx.textAlign = 'center';
      ctx.fillText('充电桩', pileX, midY + 82);

      ctx.fillStyle = '#1e2635'; ctx.strokeStyle = connected ? '#00bcd4' : '#445';
      ctx.beginPath(); ctx.roundRect(carX - 45, midY - 70, 90, 140, 10); ctx.fill(); ctx.stroke();
      ctx.fillText('车辆接口', carX, midY + 82);

      ctx.strokeStyle = connected ? `rgba(105,240,174,${0.5 + 0.2 * Math.sin(t * 4)})` : '#334';
      ctx.lineWidth = 4; ctx.setLineDash([8, 6]);
      ctx.beginPath(); ctx.moveTo(pileX + 45, midY); ctx.lineTo(carX - 45, midY); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = ACC; ctx.font = '8px monospace';
      ctx.fillText('充电枪线', (pileX + carX) / 2, midY - 12);

      const waveY = 240;
      const drawWave = (yOff, col, id, label, freq, square) => {
        const active = sig === id;
        ctx.fillStyle = '#1a2030'; ctx.strokeStyle = '#445'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.roundRect(30, yOff - 22, W - 60, 44, 6); ctx.fill(); ctx.stroke();
        ctx.strokeStyle = active && connected ? col : '#445';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        for (let x = 0; x < 380; x++) {
          const px = 50 + x;
          let py;
          if (square && connected) {
            const phase = (x / (40 / freq) + t * 3) % 1;
            py = yOff + (phase < 0.5 ? -8 : 8) * (active ? 1 : 0.3);
          } else if (connected && active) {
            py = yOff + Math.sin(x / 12 + t * 4) * 10;
          } else {
            py = yOff + Math.sin(x / 20) * 2;
          }
          x === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
        }
        ctx.stroke();
        ctx.fillStyle = active && connected ? col : '#667';
        ctx.font = '9px monospace'; ctx.textAlign = 'left';
        ctx.fillText(label, 38, yOff - 8);
      };

      drawWave(waveY - 50, '#ffab00', 'cp', 'CP', 1, true);
      drawWave(waveY, '#00bcd4', 'pp', 'PP', 0.5, false);
      drawWave(waveY + 50, '#e040fb', 'cc', 'CC', 2, false);

      if (connected && sig === 'pp') {
        ctx.fillStyle = '#00bcd4'; ctx.font = '8px monospace'; ctx.textAlign = 'center';
        ctx.fillText('PP 电阻告知电缆额定电流', W / 2, waveY + 78);
      }
      if (connected && sig === 'cp') {
        ctx.fillStyle = '#ffab00'; ctx.font = '8px monospace';
        ctx.fillText('CP PWM 占空比 → 最大允许充电电流', W / 2, waveY + 78);
      }

      ctx.fillStyle = connected ? ACC : '#667';
      ctx.font = '10px monospace'; ctx.textAlign = 'center';
      ctx.fillText(
        connected ? '先停止充电再拔枪，避免带载拉弧' : '○ 插入枪头后 CP/PP 建立连接状态',
        W / 2, H - 10,
      );

      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(raf);
  }, [signalRef, connectedRef]);

  return <canvas ref={ref} style={{ width: '100%', maxWidth: 480, display: 'block' }} />;
}

function ICard({ color, title, children }) {
  return (
    <div className="icard" style={{ borderLeftColor: color }}>
      <h4 style={{ color }}>{title}</h4>
      <div style={{ fontSize: 13.5, color: '#aabfc8', lineHeight: 1.65 }}>{children}</div>
    </div>
  );
}

export default function EvchainCable() {
  const navigate = useNav();
  const [signal, setSignal] = useState('cp');
  const [connected, setConnected] = useState(true);
  const signalRef = useRef(signal);
  const connectedRef = useRef(connected);
  useEffect(() => { signalRef.current = signal; });
  useEffect(() => { connectedRef.current = connected; });

  const btn = (id, col, label) => (
    <button type="button" onClick={() => setSignal(id)} style={{
      padding: '8px 14px', borderRadius: 10, cursor: 'pointer', fontSize: 11, fontWeight: 600,
      border: `1px solid ${signal === id ? col : 'rgba(255,255,255,.12)'}`,
      background: signal === id ? col + '22' : 'rgba(255,255,255,.04)',
      color: signal === id ? col : 'rgba(255,255,255,.5)',
    }}>{label}</button>
  );

  return (
    <section id="evchain-cable" className="sec">
      <div className="sh">
        <span className="sh-icon">🔗</span>
        <div>
          <div className="sh-tag">EV Chain · Chapter 04 · 线缆与协议</div>
          <h2 className="sh-title" style={{ color: ACC, textShadow: `0 0 35px ${ACC}55` }}>线缆与导引信号</h2>
          <p className="sh-sub">CP 控制导引、PP 邻近检测与 CC 电阻编码——在功率线通电之前，细信号线已完成「能不能充、能充多大」的协商。</p>
        </div>
      </div>
      <div className="divider" style={{ background: `linear-gradient(90deg,transparent,${ACC},transparent)` }} />

      <div className="grid2">
        <div className="anim-box reveal" style={{ borderColor: `${ACC}55`, flexDirection: 'column', gap: 12 }}>
          <CableSignalCanvas signalRef={signalRef} connectedRef={connectedRef} />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center' }}>
            {btn('cp', '#ffab00', 'CP 导引')}
            {btn('pp', '#00bcd4', 'PP 检测')}
            {btn('cc', '#e040fb', 'CC 编码')}
          </div>
          <button type="button" className="chip" style={{ borderColor: connected ? ACC : undefined }} onClick={() => setConnected(c => !c)}>
            {connected ? '🔌 已连接（点击模拟拔枪）' : '○ 未连接（点击模拟插枪）'}
          </button>
        </div>

        <div className="info-stack reveal">
          <div className="glass" style={{ borderColor: `${ACC}44` }}>
            <div className="formula" style={{ color: ACC }}>I_max ∝ CP 占空比</div>
            <div className="fdesc">导引信号 · 先于大功率路径建立</div>
          </div>
          <ICard color="#ffab00" title="CP · Control Pilot">1 kHz PWM 方波，占空比告知最大电流；电压状态表示连接/充电允许。</ICard>
          <ICard color="#00bcd4" title="PP · Proximity Pilot">枪头内电阻告知电缆载流能力，防止细线大电流过热。</ICard>
          <ICard color={EV_ACC} title="🔌 接口标准">Type2、CCS、CHAdeMO、GB/T 等物理与协议不同，不可混用。</ICard>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button type="button" className="chip" onClick={() => navigate('fast-charge')}>→ 快充协议（PD/QC）</button>
            <button type="button" className="chip" onClick={() => navigate('safety')}>→ 安全用电</button>
          </div>
        </div>
      </div>

      <Quiz questions={QUIZ_CABLE} accentColor={ACC} title="线缆与协议测验" />
      <RelatedSections sectionId="evchain-cable" />
    </section>
  );
}
