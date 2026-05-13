import { useEffect, useRef, useState } from 'react';

const ACC = '#00e676';

function WirelessChargeCanvas({ charging, power, hasForeign }) {
  const ref = useRef(null);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const W = 340, H = 260;
    cv.width = W * dpr; cv.height = H * dpr;
    cv.style.width = W + 'px'; cv.style.height = H + 'px';
    const ctx = cv.getContext('2d'); ctx.scale(dpr, dpr);

    let t = 0, raf;
    // 磁力线粒子
    const fieldLines = Array.from({ length: 16 }, (_, i) => ({
      angle: (i / 16) * Math.PI * 2,
      phase: (i / 16) * Math.PI * 2,
      r: 20 + (i % 4) * 12,
    }));

    function draw() {
      ctx.clearRect(0, 0, W, H);
      t += 0.035;

      const padX = W / 2, padY = 190;
      const phoneX = W / 2, phoneY = 100;

      // ── 充电底板（发射端） ──
      ctx.fillStyle = '#1a1f30';
      ctx.beginPath(); ctx.roundRect(padX - 70, padY - 14, 140, 28, 14); ctx.fill();
      ctx.strokeStyle = charging ? '#00e676' : '#2a2f45'; ctx.lineWidth = 2;
      if (charging) { ctx.shadowColor = '#00e676'; ctx.shadowBlur = 12; }
      ctx.stroke(); ctx.shadowBlur = 0;

      // 发射线圈（平面螺旋示意）
      for (let r = 8; r <= 32; r += 5) {
        const alpha = charging ? (0.3 + 0.2 * Math.sin(t * 6 + r * 0.3)) : 0.15;
        ctx.strokeStyle = `rgba(0,230,118,${alpha})`;
        ctx.lineWidth = 1.8;
        ctx.beginPath(); ctx.arc(padX, padY, r, 0, Math.PI * 2); ctx.stroke();
      }
      ctx.fillStyle = 'rgba(0,230,118,0.6)'; ctx.font = '9px monospace'; ctx.textAlign = 'center';
      ctx.fillText('发射线圈 Tx', padX, padY + 22);

      // ── 交变磁力线动画 ──
      if (charging && !hasForeign) {
        fieldLines.forEach(fl => {
          const progress = ((t * 1.5 + fl.phase) % (Math.PI * 2)) / (Math.PI * 2);
          const rx = fl.r * (1 + 0.3 * Math.sin(fl.angle * 2));
          const ry = (padY - phoneY - 20) * (0.2 + progress * 0.8);
          const fx = padX + Math.cos(fl.angle) * fl.r * Math.sin(progress * Math.PI);
          const fy = padY - ry;
          const alpha = Math.sin(progress * Math.PI) * 0.6;

          ctx.fillStyle = `rgba(0,230,118,${alpha})`;
          ctx.beginPath(); ctx.arc(fx, fy, 2.5, 0, Math.PI * 2); ctx.fill();
        });

        // 磁力线弧线
        for (let i = -3; i <= 3; i++) {
          const xOff = i * 14;
          const fieldAlpha = (0.15 + 0.1 * Math.sin(t * 4)) * (1 - Math.abs(i) * 0.12);
          ctx.strokeStyle = `rgba(0,230,118,${fieldAlpha})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          const cp1x = padX + xOff - 30, cp1y = padY - 30;
          const cp2x = padX + xOff + 30, cp2y = phoneY + 30;
          ctx.moveTo(padX + xOff, padY - 14);
          ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, padX + xOff, phoneY + 16);
          ctx.stroke();
        }
      }

      // ── 异物检测警告 ──
      if (hasForeign) {
        const objX = padX + 35, objY = padY - 5;
        ctx.fillStyle = `rgba(244,67,54,${0.7 + 0.3 * Math.sin(t * 8)})`;
        ctx.beginPath(); ctx.roundRect(objX - 12, objY - 8, 24, 16, 4); ctx.fill();
        ctx.fillStyle = '#fff'; ctx.font = 'bold 9px monospace'; ctx.textAlign = 'center';
        ctx.fillText('金属!', objX, objY + 4);
        // 红色警告场线
        ctx.strokeStyle = `rgba(255,50,50,${0.5 + 0.3 * Math.sin(t * 6)})`;
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(objX, objY, 18, 0, Math.PI * 2); ctx.stroke();
        ctx.fillStyle = '#ff1744'; ctx.font = 'bold 11px monospace'; ctx.textAlign = 'center';
        ctx.shadowColor = '#ff1744'; ctx.shadowBlur = 12;
        ctx.fillText('⚠ FOD异物检测！停止充电', W / 2, 38);
        ctx.shadowBlur = 0;
      }

      // ── 手机（接收端） ──
      ctx.fillStyle = '#1a1f30';
      ctx.beginPath(); ctx.roundRect(phoneX - 30, phoneY - 55, 60, 110, 10); ctx.fill();
      ctx.strokeStyle = charging && !hasForeign ? '#00e676' : '#333';
      ctx.lineWidth = 1.5;
      if (charging && !hasForeign) { ctx.shadowColor = '#00e676'; ctx.shadowBlur = 8; }
      ctx.stroke(); ctx.shadowBlur = 0;

      // 接收线圈
      for (let r = 6; r <= 22; r += 4) {
        const alpha = charging && !hasForeign ? (0.25 + 0.2 * Math.sin(t * 5 + r * 0.2)) : 0.1;
        ctx.strokeStyle = `rgba(0,230,118,${alpha})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(phoneX, phoneY + 20, r, 0, Math.PI * 2); ctx.stroke();
      }
      ctx.fillStyle = 'rgba(0,230,118,0.5)'; ctx.font = '8px monospace'; ctx.textAlign = 'center';
      ctx.fillText('接收线圈 Rx', phoneX, phoneY + 40);

      // 手机屏幕（电池图标）
      const batPct = charging && !hasForeign ? Math.min(100, 60 + (t * 2) % 35) : 60;
      ctx.fillStyle = '#0d1120';
      ctx.beginPath(); ctx.roundRect(phoneX - 22, phoneY - 50, 44, 28, 5); ctx.fill();
      // 电池条
      const batW = 30 * batPct / 100;
      ctx.fillStyle = batPct > 80 ? '#00e676' : batPct > 30 ? '#ffca28' : '#ff1744';
      ctx.beginPath(); ctx.roundRect(phoneX - 15, phoneY - 44, batW, 16, 3); ctx.fill();
      ctx.strokeStyle = '#333'; ctx.lineWidth = 1.5;
      ctx.strokeRect(phoneX - 16, phoneY - 45, 32, 18);
      if (charging && !hasForeign) {
        ctx.fillStyle = `rgba(0,230,118,${0.6 + 0.4 * Math.sin(t * 3)})`;
        ctx.font = 'bold 10px monospace'; ctx.textAlign = 'center';
        ctx.fillText('⚡', phoneX, phoneY - 32);
      }

      // ── 谐振频率标注 ──
      const freqY = 155;
      ctx.strokeStyle = 'rgba(255,255,255,.08)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(40, freqY); ctx.lineTo(W - 40, freqY); ctx.stroke();
      const freq = power === '5W' ? 127 : power === '10W' ? 147 : 205;
      ctx.fillStyle = '#ffca28'; ctx.font = '10px monospace'; ctx.textAlign = 'center';
      ctx.fillText(`谐振频率 ~${freq} kHz`, W / 2, freqY - 5);

      // ── 功率/效率指示 ──
      const effY = H - 22;
      const eff = power === '5W' ? 75 : power === '10W' ? 80 : 85;
      ctx.fillStyle = 'rgba(0,230,118,0.7)'; ctx.font = '10px monospace'; ctx.textAlign = 'left';
      ctx.fillText(`${power} Qi  |  效率约 ${eff}%  |  发热 ${100 - eff}% 散热`, 30, effY);

      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(raf);
  }, [charging, power, hasForeign]);
  return <canvas ref={ref} style={{ maxWidth: '100%' }} />;
}

export default function WirelessCharge() {
  const [charging, setCharging] = useState(false);
  const [power, setPower] = useState('10W');
  const [hasForeign, setHasForeign] = useState(false);

  const btnStyle = (active, col) => ({
    padding: '8px 16px', borderRadius: 8, cursor: 'pointer',
    border: `1px solid ${active ? col : 'rgba(255,255,255,.1)'}`,
    background: active ? col + '20' : 'rgba(255,255,255,.04)',
    color: active ? col : 'rgba(255,255,255,.4)',
    font: '12px/1 monospace', fontWeight: 600, transition: 'all .2s',
  });

  return (
    <section id="wireless-charge" className="sec">
      <div className="sh">
        <span className="sh-icon">⚡</span>
        <div className="sh-tag">Stage 7 · 消费电子 · 无线充电</div>
        <h2 className="sh-title" style={{ color: ACC }}>Qi无线充电原理</h2>
        <p className="sh-sub">电磁感应、谐振耦合、异物检测FOD——从法拉第电磁感应定律到MagSafe 15W的完整无线充电系统。</p>
        <div className="divider" style={{ background: `linear-gradient(90deg,transparent,${ACC},transparent)` }} />
      </div>

      <div className="grid2">
        <div className="anim-box reveal" style={{ borderColor: 'rgba(0,230,118,.2)', flexDirection: 'column', gap: 14 }}>
          <WirelessChargeCanvas charging={charging} power={power} hasForeign={hasForeign} />
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
            <button style={btnStyle(charging, ACC)} onClick={() => setCharging(c => !c)}>
              {charging ? '⏸ 停止充电' : '⚡ 开始充电'}
            </button>
            <button style={{
              ...btnStyle(hasForeign, '#ff1744'), opacity: charging ? 1 : 0.5,
            }} onClick={() => charging && setHasForeign(f => !f)}>
              {hasForeign ? '❌ 移除异物' : '🪙 放置金属'}
            </button>
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
            {['5W', '10W', '15W'].map(p => (
              <button key={p} style={btnStyle(power === p, '#ffca28')} onClick={() => setPower(p)}>{p}</button>
            ))}
          </div>
        </div>

        <div className="reveal" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="glass" style={{ borderColor: 'rgba(0,230,118,.2)' }}>
            <div style={{ fontWeight: 700, color: ACC, marginBottom: 10, fontSize: 15 }}>🔬 核心技术原理</div>
            {[
              { name: 'Qi标准（WPC联盟）', color: '#00e676', d: 'Wireless Power Consortium制定的无线充电标准。5W基础/10W扩展/15W高功率，工作频率100~205kHz，通过反向散射调制通信（1kbps）。' },
              { name: '电磁感应原理', color: '#64ffda', d: '发射线圈通入100~200kHz交变电流→产生交变磁场→接收线圈中产生感应EMF（法拉第定律：ε=-dΦ/dt）→整流→充电IC。本质是松耦合空心变压器。' },
              { name: '谐振式提升效率', color: '#69f0ae', d: '收发线圈各配串联电容，形成LC谐振回路。工作频率匹配谐振点时，虚功率循环补偿漏感，传输效率从感应式75%提升至85%。传输距离也更远（可达5cm）。' },
              { name: '异物检测FOD', color: '#ffca28', d: 'Foreign Object Detection：持续监测（发射功率-接收功率）的差值。金属异物（硬币/钥匙）在磁场中产生涡流发热，消耗额外功率→差值增大→触发告警停止充电。' },
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
        <div className="glass reveal" style={{ borderColor: 'rgba(0,230,118,.18)' }}>
          <div style={{ fontWeight: 700, color: ACC, marginBottom: 10 }}>📊 Qi功率等级对比</div>
          {[
            { name: 'Qi 5W（基础）', f: '127kHz', eff: '72%', use: '通用Android/iPhone慢充' },
            { name: 'Qi 10W（扩展）', f: '147kHz', eff: '79%', use: 'Android快充协议专用' },
            { name: 'Qi 15W（高功率）', f: '205kHz', eff: '84%', use: 'iPhone MagSafe专用' },
          ].map(r => (
            <div key={r.name} style={{ marginBottom: 10, borderBottom: '1px solid rgba(255,255,255,.05)', paddingBottom: 8 }}>
              <div style={{ color: ACC, fontWeight: 700, fontSize: 12 }}>{r.name}</div>
              <div style={{ fontSize: 11.5, color: '#8aacb8', lineHeight: 1.6 }}>
                频率 {r.f} | 效率 {r.eff} | {r.use}
              </div>
            </div>
          ))}
        </div>

        <div className="glass reveal" style={{ borderColor: 'rgba(255,202,40,.18)' }}>
          <div style={{ fontWeight: 700, color: '#ffca28', marginBottom: 10 }}>🍎 MagSafe特殊设计</div>
          <div style={{ fontSize: 12.5, color: '#8aacb8', lineHeight: 1.8 }}>
            ▸ 磁铁阵列精确对位，保证线圈完全对齐<br/>
            ▸ 专用Apple快充协议（非标准Qi 15W）<br/>
            ▸ 充电板中集成NFC芯片身份验证<br/>
            ▸ 非官方充电器被限制在7.5W<br/>
            ▸ 表面温度监控防止过热（40°C限制）
          </div>
        </div>

        <div className="glass reveal" style={{ borderColor: 'rgba(255,82,82,.18)' }}>
          <div style={{ fontWeight: 700, color: '#ff5252', marginBottom: 10 }}>⚠️ 安全须知</div>
          <div className="fbox"><div className="fbox-f">效率 75~85%</div><div className="fbox-desc">比有线低约15%，产生更多热量</div></div>
          <div className="fbox"><div className="fbox-f">金属卡/信用卡</div><div className="fbox-desc">磁条/NFC会被强磁场损坏</div></div>
          <div className="fbox"><div className="fbox-f">心脏起搏器</div><div className="fbox-desc">保持30cm以上安全距离</div></div>
          <div style={{ fontSize: 12, color: 'var(--dim)', marginTop: 6 }}>
            磁场强度符合IEC 62233标准，正常使用不影响健康。
          </div>
        </div>

        <div className="glass reveal" style={{ borderColor: 'rgba(100,255,218,.18)' }}>
          <div style={{ fontWeight: 700, color: '#64ffda', marginBottom: 10 }}>📐 感应式 vs 谐振式</div>
          <div style={{ fontSize: 12, color: '#8aacb8', lineHeight: 1.8 }}>
            <b style={{ color: '#64ffda' }}>感应式（Qi 5W/10W）：</b><br/>
            频率 100~200kHz，距离 &lt;5mm，效率 72~79%<br/><br/>
            <b style={{ color: ACC }}>谐振式（Rezence/未来）：</b><br/>
            频率 6.78MHz，距离 &lt;5cm，效率 ~85%<br/>
            可对多设备同时充电，桌面嵌入式应用
          </div>
        </div>
      </div>
    </section>
  );
}
