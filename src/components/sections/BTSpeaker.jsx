import { useEffect, useRef, useState } from 'react';

const ACC = '#e040fb';

function BTSpeakerCanvas({ playing, volume, btVersion }) {
  const ref = useRef(null);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const W = 360, H = 260;
    cv.width = W * dpr; cv.height = H * dpr;
    cv.style.width = W + 'px'; cv.style.height = H + 'px';
    const ctx = cv.getContext('2d'); ctx.scale(dpr, dpr);

    let t = 0, raf;

    // 音频粒子（信号流）
    const particles = Array.from({ length: 24 }, (_, i) => ({
      x: 40 + (i / 24) * 280, y: H / 2 + (Math.random() - 0.5) * 60,
      vx: 1.2 + Math.random() * 0.8, alpha: 0.5 + Math.random() * 0.5,
      phase: Math.random() * Math.PI * 2,
    }));

    // 纸盆振动历史
    const waveHistory = new Array(60).fill(0);

    function draw() {
      ctx.clearRect(0, 0, W, H);
      t += 0.04;

      // ── 背景连接线（信号流路径） ──
      const stages = [
        { x: 45, label: '手机\nBT发射', color: '#64b5f6' },
        { x: 115, label: 'BT SoC\n解码', color: '#7986cb' },
        { x: 185, label: 'Class D\n功放', color: '#e040fb' },
        { x: 255, label: '扬声器\n纸盆', color: '#4db6ac' },
      ];

      // 连接管道
      for (let i = 0; i < stages.length - 1; i++) {
        const a = stages[i], b = stages[i + 1];
        const grad = ctx.createLinearGradient(a.x, 0, b.x, 0);
        grad.addColorStop(0, a.color + '40');
        grad.addColorStop(1, b.color + '40');
        ctx.strokeStyle = grad; ctx.lineWidth = 20;
        ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(a.x + 28, H / 2); ctx.lineTo(b.x - 28, H / 2); ctx.stroke();
      }

      // ── 手机蓝牙波（左侧） ──
      const phoneX = 45, phoneY = H / 2;
      ctx.fillStyle = '#1a1f35';
      ctx.beginPath(); ctx.roundRect(phoneX - 15, phoneY - 28, 30, 56, 5); ctx.fill();
      ctx.strokeStyle = '#64b5f6'; ctx.lineWidth = 1.5; ctx.stroke();
      // 蓝牙符号
      ctx.strokeStyle = '#64b5f6'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(phoneX - 5, phoneY - 8); ctx.lineTo(phoneX + 5, phoneY + 8);
      ctx.lineTo(phoneX, phoneY); ctx.lineTo(phoneX + 5, phoneY - 8); ctx.lineTo(phoneX - 5, phoneY + 8);
      ctx.lineTo(phoneX, phoneY); ctx.stroke();
      // BT无线波
      if (playing) {
        for (let r = 1; r <= 3; r++) {
          const a = 0.5 - r * 0.12 + 0.12 * Math.sin(t * 3 - r);
          ctx.strokeStyle = `rgba(100,181,246,${Math.max(0, a)})`;
          ctx.lineWidth = 1.5;
          ctx.beginPath(); ctx.arc(phoneX, phoneY, r * 14, -Math.PI * 0.4, Math.PI * 0.4); ctx.stroke();
        }
      }

      // ── 信号粒子动画 ──
      if (playing) {
        particles.forEach(p => {
          p.x += p.vx;
          if (p.x > W - 30) { p.x = 30; }
          // 按阶段着色
          let col;
          if (p.x < 85) col = '#64b5f6';
          else if (p.x < 155) col = '#7986cb';
          else if (p.x < 225) col = '#e040fb';
          else col = '#4db6ac';
          const wave = Math.sin(p.x * 0.12 + t * 4 + p.phase) * (volume / 100) * 30;
          ctx.fillStyle = col + 'cc';
          ctx.beginPath(); ctx.arc(p.x, H / 2 + wave, 2.5, 0, Math.PI * 2); ctx.fill();
        });
      }

      // ── 各功能模块方块 ──
      stages.forEach((s, i) => {
        const active = playing || i < 2;
        ctx.fillStyle = active ? s.color + '18' : 'rgba(40,40,50,0.8)';
        ctx.beginPath(); ctx.roundRect(s.x - 28, H / 2 - 36, 56, 72, 10); ctx.fill();
        ctx.strokeStyle = active ? s.color + '60' : '#333';
        if (active && playing) { ctx.shadowColor = s.color; ctx.shadowBlur = 10; }
        ctx.lineWidth = 1.5; ctx.stroke(); ctx.shadowBlur = 0;
        ctx.fillStyle = active ? s.color : '#555';
        ctx.font = 'bold 9px monospace'; ctx.textAlign = 'center';
        s.label.split('\n').forEach((line, li) => {
          ctx.fillText(line, s.x, H / 2 - 16 + li * 14);
        });

        // 阶段图标
        const icons = ['📱', '🔷', '⚡', '🔊'];
        ctx.font = '16px serif'; ctx.textAlign = 'center';
        ctx.fillText(icons[i], s.x, H / 2 + 26);
      });

      // ── 扬声器纸盆振动 ──
      const spkX = 315, spkY = H / 2;
      const vibr = playing ? Math.sin(t * 8) * (volume / 100) * 12 : 0;
      waveHistory.push(vibr); waveHistory.shift();
      // 外圈磁铁
      ctx.fillStyle = '#2a2a3a';
      ctx.beginPath(); ctx.arc(spkX, spkY, 38, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#555'; ctx.lineWidth = 2; ctx.stroke();
      // 纸盆
      ctx.fillStyle = '#1a1a2a';
      ctx.beginPath(); ctx.arc(spkX + vibr, spkY, 28, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = playing ? ACC : '#444'; ctx.lineWidth = 1.5; ctx.stroke();
      // 音圈（中心）
      ctx.fillStyle = '#333';
      ctx.beginPath(); ctx.arc(spkX + vibr, spkY, 12, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#666'; ctx.stroke();
      // 音圈导线
      ctx.strokeStyle = '#ff9800'; ctx.lineWidth = 1;
      for (let r = 8; r <= 11; r++) {
        ctx.beginPath(); ctx.arc(spkX + vibr, spkY, r, 0, Math.PI * 2); ctx.stroke();
      }
      // 声波辐射
      if (playing && volume > 20) {
        for (let r = 1; r <= 4; r++) {
          const ar = ((t * 2 + r * 0.4) % 1) * 60;
          const al = (1 - ar / 60) * 0.4;
          ctx.strokeStyle = `rgba(77,182,172,${al})`;
          ctx.lineWidth = 1.5;
          ctx.beginPath(); ctx.arc(spkX + 45, spkY, 10 + ar, -Math.PI * 0.4, Math.PI * 0.4); ctx.stroke();
        }
      }

      // ── PWM波形展示（Class D特征） ──
      if (playing) {
        const pwmY = H - 50, pwmX0 = 115;
        ctx.strokeStyle = 'rgba(224,64,251,0.5)'; ctx.lineWidth = 1.5;
        ctx.beginPath();
        for (let x = 0; x < 80; x++) {
          const sq = Math.sin((x * 0.4 + t * 8) * (volume / 40)) > 0 ? 1 : -1;
          const py = pwmY + sq * 8;
          if (x === 0) ctx.moveTo(pwmX0 + x, py);
          else {
            const prevSq = Math.sin(((x - 1) * 0.4 + t * 8) * (volume / 40)) > 0 ? 1 : -1;
            if (sq !== prevSq) ctx.lineTo(pwmX0 + x, pwmY + prevSq * 8);
            ctx.lineTo(pwmX0 + x, py);
          }
        }
        ctx.stroke();
        ctx.fillStyle = 'rgba(224,64,251,0.5)'; ctx.font = '9px monospace'; ctx.textAlign = 'left';
        ctx.fillText('PWM调制波', pwmX0, pwmY - 13);
        // 滤波后正弦波
        ctx.strokeStyle = 'rgba(77,182,172,0.7)'; ctx.lineWidth = 1.5;
        ctx.beginPath();
        for (let x = 0; x < 80; x++) {
          const sy = pwmY + Math.sin(x * 0.22 + t * 3) * (volume / 100) * 10;
          x === 0 ? ctx.moveTo(pwmX0 + x, sy) : ctx.lineTo(pwmX0 + x, sy);
        }
        ctx.stroke();
        ctx.fillStyle = 'rgba(77,182,172,0.6)'; ctx.font = '9px monospace';
        ctx.fillText('→ 滤波输出', pwmX0 + 84, pwmY - 13);
      }

      // BT版本标签
      ctx.fillStyle = '#7986cb'; ctx.font = '10px monospace'; ctx.textAlign = 'center';
      ctx.fillText(`BT ${btVersion}`, 115, H / 2 + 42);

      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(raf);
  }, [playing, volume, btVersion]);
  return <canvas ref={ref} style={{ maxWidth: '100%' }} />;
}

export default function BTSpeaker() {
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(60);
  const [btVersion, setBtVersion] = useState('5.0');

  return (
    <section id="bt-speaker" className="sec">
      <div className="sh">
        <span className="sh-icon">🔊</span>
        <div className="sh-tag">Stage 6 · 消费电子 · 蓝牙音箱</div>
        <h2 className="sh-title" style={{ color: ACC }}>蓝牙音箱电路架构</h2>
        <p className="sh-sub">BT SoC解码 + Class D功放PWM调制 + 锂电BMS——掌握无线音频从比特流到声波的完整信号链路。</p>
        <div className="divider" style={{ background: `linear-gradient(90deg,transparent,${ACC},transparent)` }} />
      </div>

      <div className="grid2">
        <div className="anim-box reveal" style={{ borderColor: 'rgba(224,64,251,.2)', flexDirection: 'column', gap: 14 }}>
          <BTSpeakerCanvas playing={playing} volume={volume} btVersion={btVersion} />
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
            <button onClick={() => setPlaying(p => !p)} style={{
              padding: '9px 28px', borderRadius: 10, cursor: 'pointer',
              border: `1px solid ${playing ? ACC : 'rgba(224,64,251,.3)'}`,
              background: playing ? ACC + '20' : 'rgba(224,64,251,.06)',
              color: playing ? ACC : 'rgba(255,255,255,.5)',
              font: '13px/1 inherit', fontWeight: 600, transition: 'all .2s',
            }}>{playing ? '⏸ 停止播放' : '▶ 开始播放'}</button>
            {['4.2', '5.0', '5.3'].map(v => (
              <button key={v} onClick={() => setBtVersion(v)} style={{
                padding: '9px 14px', borderRadius: 10, cursor: 'pointer',
                border: `1px solid ${btVersion === v ? '#7986cb' : 'rgba(255,255,255,.1)'}`,
                background: btVersion === v ? 'rgba(121,134,203,.2)' : 'rgba(255,255,255,.04)',
                color: btVersion === v ? '#7986cb' : 'rgba(255,255,255,.4)',
                font: '12px/1 monospace', fontWeight: 600, transition: 'all .2s',
              }}>BT {v}</button>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center' }}>
            <span style={{ fontSize: 12, color: 'var(--dim)' }}>音量</span>
            <input type="range" min="0" max="100" value={volume} onChange={e => setVolume(+e.target.value)}
              style={{ width: 110, accentColor: ACC }} />
            <span style={{ fontSize: 12, color: ACC, fontFamily: 'monospace' }}>{volume}%</span>
          </div>
        </div>

        <div className="reveal" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="glass" style={{ borderColor: 'rgba(224,64,251,.2)' }}>
            <div style={{ fontWeight: 700, color: ACC, marginBottom: 10, fontSize: 15 }}>⚡ Class D功放原理</div>
            {[
              { name: 'PWM调制', color: '#e040fb', d: '音频模拟信号与三角波比较器产生PWM脉冲序列，脉冲占空比随音频幅度变化，携带音频信息。开关频率一般300kHz~1MHz。' },
              { name: 'MOSFET全桥', color: '#ab47bc', d: '4个N-MOSFET构成H桥，高侧/低侧交替开关，将电源电压切换输出，驱动扬声器。开关损耗极小，效率可达92%+。' },
              { name: 'LC低通滤波', color: '#7986cb', d: '输出端L（电感）+C（电容）组成低通滤波器，截止频率约20kHz，滤除PWM高频成分，还原纯净音频模拟信号。' },
              { name: '效率对比', color: '#64b5f6', d: 'Class A：20~30%（偏置电流大，始终导通），Class AB：50~70%（交叉失真折中），Class D：85~95%（开关模式，最省电）。' },
            ].map(item => (
              <div key={item.name} style={{ marginBottom: 10, paddingBottom: 10, borderBottom: '1px solid rgba(255,255,255,.05)' }}>
                <div style={{ fontWeight: 700, color: item.color, fontSize: 13, marginBottom: 3 }}>{item.name}</div>
                <div style={{ fontSize: 12.5, color: '#8aacb8', lineHeight: 1.6 }}>{item.d}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ marginTop: 30, display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(210px,1fr))', gap: 14 }}>
        <div className="glass reveal" style={{ borderColor: 'rgba(121,134,203,.18)' }}>
          <div style={{ fontWeight: 700, color: '#7986cb', marginBottom: 10 }}>📡 蓝牙版本与音质</div>
          <div style={{ fontSize: 12, color: '#8aacb8' }}>
            {[
              { v: 'BT 4.2', d: 'SBC编码，约192kbps，延迟200ms+', col: '#78909c' },
              { v: 'BT 5.0', d: 'aptX，352kbps，延迟70ms', col: '#7986cb' },
              { v: 'BT 5.3', d: 'LDAC 990kbps，接近无损', col: ACC },
            ].map(r => (
              <div key={r.v} style={{ display: 'flex', gap: 10, marginBottom: 8, lineHeight: 1.5 }}>
                <span style={{ color: r.col, fontWeight: 700, minWidth: 50, fontFamily: 'monospace' }}>{r.v}</span>
                <span style={{ fontSize: 12 }}>{r.d}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass reveal" style={{ borderColor: 'rgba(224,64,251,.18)' }}>
          <div style={{ fontWeight: 700, color: ACC, marginBottom: 10 }}>🔋 电源与BMS架构</div>
          <div className="fbox"><div className="fbox-f">锂电 3.7V（18650/软包）</div><div className="fbox-desc">主储能单元</div></div>
          <div className="fbox"><div className="fbox-f">USB-C 5V → CC1 协商</div><div className="fbox-desc">充电输入</div></div>
          <div className="fbox"><div className="fbox-f">BMS芯片（如TP4056）</div><div className="fbox-desc">恒流恒压充电保护</div></div>
          <div className="fbox"><div className="fbox-f">Boost 3.7V→5V / LDO 3.3V</div><div className="fbox-desc">供SoC/DSP</div></div>
        </div>

        <div className="glass reveal" style={{ borderColor: 'rgba(77,182,172,.18)' }}>
          <div style={{ fontWeight: 700, color: '#4db6ac', marginBottom: 10 }}>🌊 防水等级与设计</div>
          <div style={{ fontSize: 12.5, color: '#8aacb8', lineHeight: 1.8 }}>
            <b style={{ color: '#ffca28' }}>IPX5：</b>防低压水流冲击，密封电源口<br/>
            <b style={{ color: '#4db6ac' }}>IPX7：</b>可浸水1m/30min，全密封PCB<br/>
            密封工艺：三防漆喷涂+硅胶圈+超声波焊接外壳<br/>
            注意：防水后无法清洗PCB，维修难度大
          </div>
        </div>

        <div className="glass reveal" style={{ borderColor: 'rgba(255,107,67,.18)' }}>
          <div style={{ fontWeight: 700, color: '#ff7043', marginBottom: 10 }}>🔧 维修诊断要点</div>
          {[
            '无声音 → 用万用表测扬声器音圈（正常4Ω/8Ω）',
            '声音失真 → 功放IC过热保护，检查散热',
            '续航骤降 → 锂电内阻升高，测空载/负载电压差',
            '蓝牙断连 → SoC供电不稳，检查LDO输出',
          ].map(s => (
            <div key={s} style={{ display: 'flex', gap: 8, fontSize: 12, color: '#8aacb8', lineHeight: 1.55, marginBottom: 5 }}>
              <span style={{ color: '#ff7043', flexShrink: 0 }}>▸</span>{s}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
