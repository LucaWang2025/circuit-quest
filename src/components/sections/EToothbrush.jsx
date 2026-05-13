import { useEffect, useRef, useState } from 'react';

const ACC = '#00bcd4';

function InductiveCanvas({ running, speed }) {
  const ref = useRef(null);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const W = 360, H = 260;
    cv.width = W * dpr; cv.height = H * dpr;
    cv.style.width = W + 'px'; cv.style.height = H + 'px';
    const ctx = cv.getContext('2d'); ctx.scale(dpr, dpr);

    let t = 0, raf;
    function draw() {
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = '#0a0f1a'; ctx.fillRect(0, 0, W, H);

      // 充电座底座
      const baseX = 60, baseY = 180, baseW = 80, baseH = 50;
      ctx.fillStyle = '#1a2436';
      ctx.beginPath(); ctx.roundRect(baseX, baseY, baseW, baseH, 8); ctx.fill();
      ctx.strokeStyle = ACC + '88'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.roundRect(baseX, baseY, baseW, baseH, 8); ctx.stroke();

      // 初级线圈
      ctx.strokeStyle = '#ff9800';
      ctx.lineWidth = 2;
      for (let i = 0; i < 5; i++) {
        const cx = baseX + 15 + i * 12;
        ctx.beginPath();
        ctx.arc(cx, baseY + 20, 8, Math.PI, 0);
        ctx.stroke();
      }
      ctx.fillStyle = '#ff9800cc'; ctx.font = '10px monospace';
      ctx.fillText('初级线圈', baseX + 10, baseY + 44);

      // 交变磁场线（动态）
      const fieldPhase = t * 0.06;
      for (let i = 0; i < 7; i++) {
        const yOff = (i - 3) * 18;
        const alpha = Math.abs(Math.sin(fieldPhase + i * 0.4)) * 0.7 + 0.1;
        ctx.strokeStyle = `rgba(255,152,0,${alpha})`;
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(baseX + baseW, baseY + 25 + yOff);
        ctx.bezierCurveTo(baseX + baseW + 30, baseY + 15 + yOff,
          baseX + baseW + 50, baseY + 15 + yOff,
          baseX + baseW + 80, baseY + 25 + yOff);
        ctx.stroke();
      }
      ctx.setLineDash([]);

      // 牙刷体
      const brushX = 190, brushY = 80, brushW = 50, brushH = 170;
      const gradient = ctx.createLinearGradient(brushX, 0, brushX + brushW, 0);
      gradient.addColorStop(0, '#1e3a4a');
      gradient.addColorStop(0.5, '#2a5a7a');
      gradient.addColorStop(1, '#1e3a4a');
      ctx.fillStyle = gradient;
      ctx.beginPath(); ctx.roundRect(brushX, brushY, brushW, brushH, 12); ctx.fill();
      ctx.strokeStyle = ACC + '66'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.roundRect(brushX, brushY, brushW, brushH, 12); ctx.stroke();

      // 次级线圈
      ctx.strokeStyle = ACC;
      ctx.lineWidth = 2;
      for (let i = 0; i < 4; i++) {
        const cy = brushY + brushH - 30 - i * 12;
        ctx.beginPath();
        ctx.arc(brushX + brushW / 2, cy, 14, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(brushX + brushW / 2, cy, 10, 0, Math.PI * 2);
        ctx.strokeStyle = ACC + '44';
        ctx.stroke();
        ctx.strokeStyle = ACC;
      }
      ctx.fillStyle = ACC + 'cc'; ctx.font = '9px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('次级线圈', brushX + brushW / 2, brushY + brushH - 5);
      ctx.textAlign = 'left';

      // 内部电路框图
      const innerY = brushY + 15;
      const blocks = [
        { label: '整流', color: '#ff9800' },
        { label: '充电IC', color: ACC },
        { label: '锂电', color: '#00e676' },
        { label: '驱动', color: '#e040fb' },
      ];
      blocks.forEach((b, i) => {
        const by = innerY + i * 32;
        ctx.fillStyle = b.color + '22';
        ctx.strokeStyle = b.color + '88'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.roundRect(brushX + 8, by, 34, 22, 4); ctx.fill(); ctx.stroke();
        ctx.fillStyle = b.color; ctx.font = '8px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(b.label, brushX + 25, by + 14);
        ctx.textAlign = 'left';
        // 箭头
        if (i < blocks.length - 1) {
          ctx.fillStyle = '#ffffff44'; ctx.font = '8px monospace';
          ctx.fillText('↓', brushX + 21, by + 28);
        }
      });

      // 声波马达振动
      if (running) {
        const motorY = brushY + 20;
        const amp = (speed / 3) * 4;
        const vib = Math.sin(t * 0.3) * amp;
        ctx.strokeStyle = '#e040fb';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let x = 0; x < 40; x++) {
          const vy = motorY + Math.sin(x * 0.5 + t * 0.3) * amp;
          if (x === 0) ctx.moveTo(brushX + 5 + x, vy);
          else ctx.lineTo(brushX + 5 + x, vy);
        }
        ctx.stroke();

        // 刷头振动效果
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.roundRect(brushX + 10, brushY + vib, 30, 12, 4);
        ctx.fill();
        for (let i = 0; i < 8; i++) {
          const bx = brushX + 13 + (i % 4) * 7;
          const by2 = brushY + vib - 8 - (Math.floor(i / 4)) * 5;
          ctx.beginPath(); ctx.moveTo(bx, brushY + vib);
          ctx.lineTo(bx, by2);
          ctx.strokeStyle = '#ccc'; ctx.lineWidth = 1.5;
          ctx.stroke();
        }
      } else {
        // 静止刷头
        ctx.fillStyle = '#ffffff44';
        ctx.beginPath(); ctx.roundRect(brushX + 10, brushY, 30, 12, 4); ctx.fill();
      }

      // 标注
      ctx.fillStyle = '#607a90'; ctx.font = '10px monospace';
      ctx.fillText('充电座', baseX + 20, baseH + 200);
      ctx.fillText('密封外壳 IPX7', brushX - 10, brushY - 8);
      ctx.fillStyle = '#ff9800cc';
      ctx.fillText(`振动: ${speed === 1 ? '低速' : speed === 2 ? '中速' : '高速'}`, 10, 20);
      ctx.fillStyle = running ? '#00e67699' : '#ff174499';
      ctx.fillText(running ? '● 运行中' : '● 待机', 10, 35);

      t++;
      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(raf);
  }, [running, speed]);

  return <canvas ref={ref} style={{ maxWidth: '100%', borderRadius: 12 }} />;
}

export default function EToothbrush() {
  const [running, setRunning] = useState(false);
  const [speed, setSpeed] = useState(2);

  return (
    <section id="e-toothbrush" className="sec">
      <div className="sh">
        <span className="sh-icon">🪥</span>
        <div>
          <div className="sh-title">电动牙刷电路设计</div>
          <div className="sh-tag">E-TOOTHBRUSH · INDUCTIVE CHARGING · SONIC MOTOR</div>
          <div className="sh-sub">感应隔离充电 · 声波马达驱动 · IPX7防水设计</div>
        </div>
      </div>

      <div className="divider" />

      <div className="grid2 reveal">
        <div className="anim-box" style={{ textAlign: 'center' }}>
          <InductiveCanvas running={running} speed={speed} />
          <div style={{ marginTop: 12, display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => setRunning(r => !r)}
              style={{
                padding: '8px 20px', borderRadius: 20, border: 'none', cursor: 'pointer',
                background: running ? '#ff1744' : ACC, color: '#000', fontWeight: 700, fontSize: 13,
              }}
            >{running ? '⏹ 停止' : '▶ 启动'}</button>
            {[1, 2, 3].map(s => (
              <button key={s}
                onClick={() => setSpeed(s)}
                style={{
                  padding: '8px 14px', borderRadius: 20, cursor: 'pointer',
                  border: `1px solid ${speed === s ? ACC : 'rgba(255,255,255,.15)'}`,
                  background: speed === s ? ACC + '22' : 'transparent',
                  color: speed === s ? ACC : 'var(--dim)', fontSize: 12,
                }}
              >{s === 1 ? '低速' : s === 2 ? '中速' : '高速'}</button>
            ))}
          </div>
        </div>

        <div>
          <div className="glass reveal" style={{ marginBottom: 12 }}>
            <div style={{ color: ACC, fontWeight: 700, marginBottom: 8 }}>感应充电优势</div>
            <ul style={{ paddingLeft: 16, lineHeight: 1.9, fontSize: 13 }}>
              <li><strong>完全密封</strong>——无任何金属触点，防水性极佳</li>
              <li>塑料外壳直接隔离初次级，<strong>安全用于浴室</strong></li>
              <li>Qi 无线充电同理，但电动牙刷频率更低（约 200kHz）</li>
              <li>效率约 75~85%，略低于有线充电</li>
            </ul>
          </div>
          <div className="glass reveal">
            <div style={{ color: ACC, fontWeight: 700, marginBottom: 8 }}>关键参数</div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <tbody>
                {[
                  ['振动频率', '31,000 次/分（声波式）'],
                  ['电池类型', 'NiMH 镍氢 / 锂聚合物'],
                  ['充电时间', '12 小时（NiMH）/ 4 小时（Li）'],
                  ['防水等级', 'IPX7（水下 1m / 30min）'],
                  ['工作电压', '1.2V（NiMH）/ 3.7V（Li）'],
                ].map(([k, v]) => (
                  <tr key={k} style={{ borderBottom: '1px solid rgba(255,255,255,.06)' }}>
                    <td style={{ padding: '6px 4px', color: 'var(--dim)' }}>{k}</td>
                    <td style={{ padding: '6px 4px', color: 'var(--white)' }}>{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="divider" />

      <div className="grid2 reveal">
        <div className="glass">
          <div style={{ color: ACC, fontWeight: 700, marginBottom: 10 }}>声波马达原理</div>
          <p style={{ fontSize: 13, lineHeight: 1.8, color: 'var(--dim)' }}>
            电磁线圈通交变电流 → 铁芯周期性磁化/退磁 → 驱动刷头高频往复振动。
            频率约 260Hz（即 15,600 次/分单向 × 2 = 31,200 次/分双向）。
          </p>
          <div className="fbox" style={{ marginTop: 10 }}>
            <div className="fbox-f">v = 2 × f × A</div>
            <div className="fbox-desc">振动速度 = 2 × 频率 × 振幅</div>
          </div>
          <p style={{ fontSize: 13, lineHeight: 1.8, color: 'var(--dim)', marginTop: 8 }}>
            声波式 vs 旋转式：旋转式用偏心电机（如剃须刀），结构简单成本低；声波式清洁力更强，对牙龈友好。
          </p>
        </div>

        <div className="glass">
          <div style={{ color: ACC, fontWeight: 700, marginBottom: 10 }}>电路板设计要点</div>
          <div style={{ fontSize: 13, lineHeight: 1.9, color: 'var(--dim)' }}>
            <div style={{ marginBottom: 6 }}>🔷 <strong>三防漆</strong>：PCB喷涂绝缘防水漆（三防：防潮、防盐雾、防霉）</div>
            <div style={{ marginBottom: 6 }}>🔷 <strong>密封圈</strong>：刷头接口/充电端 O形圈，配合过盈装配</div>
            <div style={{ marginBottom: 6 }}>🔷 <strong>过充保护</strong>：NiMH 检测 △V 截止，锂电用专用充电IC</div>
            <div style={{ marginBottom: 6 }}>🔷 <strong>低压检测</strong>：电量不足时自动降速，延长使用时间</div>
            <div>🔷 <strong>防反接</strong>：初级线圈极性不影响感应，天然防接反</div>
          </div>
        </div>
      </div>

      <div className="divider" />

      <div className="glass reveal">
        <div style={{ color: '#ff9800', fontWeight: 700, marginBottom: 10 }}>维修判断技巧</div>
        <div className="grid2" style={{ fontSize: 13, gap: 12 }}>
          <div>
            <div style={{ color: 'var(--dim)', marginBottom: 6 }}>充电故障判断：</div>
            <ol style={{ paddingLeft: 16, lineHeight: 1.9, color: 'var(--dim)' }}>
              <li>用小线圈+LED接近充电座底部，LED亮说明初级线圈正常</li>
              <li>万用表测充电座输出：约 5~9V AC（感应电压）</li>
              <li>次级整流后应有 DC 4~5V，低于此说明整流桥故障</li>
              <li>充电IC芯片型号查数据手册，测关键引脚电压</li>
            </ol>
          </div>
          <div>
            <div style={{ color: 'var(--dim)', marginBottom: 6 }}>不振动故障判断：</div>
            <ol style={{ paddingLeft: 16, lineHeight: 1.9, color: 'var(--dim)' }}>
              <li>按键响应正常但刷头不动 → 检查驱动电路输出</li>
              <li>万用表测线圈阻值：正常约 3~10Ω，断路则∞</li>
              <li>电池电压：NiMH单节≥1.0V，锂电≥3.5V</li>
              <li>刷头连接器接触不良 → 清洁触点并重新安装</li>
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
