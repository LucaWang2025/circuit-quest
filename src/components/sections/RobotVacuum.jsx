import { useEffect, useRef, useState } from 'react';

const ACC = '#ffab00';

function RobotCanvas({ scanning, mode }) {
  const ref = useRef(null);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const W = 400, H = 300;
    cv.width = W * dpr; cv.height = H * dpr;
    cv.style.width = W + 'px'; cv.style.height = H + 'px';
    const ctx = cv.getContext('2d'); ctx.scale(dpr, dpr);

    let t = 0, raf;
    const cx = W / 2, cy = H / 2 + 20;
    const r = 80;

    function draw() {
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = '#0a0f1a'; ctx.fillRect(0, 0, W, H);

      // 扫地机圆形本体
      const bodyGrad = ctx.createRadialGradient(cx - 20, cy - 20, 10, cx, cy, r);
      bodyGrad.addColorStop(0, '#2a3a4a');
      bodyGrad.addColorStop(1, '#0d1a2a');
      ctx.fillStyle = bodyGrad;
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = ACC + '66'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();

      // 激光雷达旋转
      if (scanning) {
        const lidarAngle = t * 0.04;
        const lidarRange = 130;
        // 扇形扫描区域
        ctx.fillStyle = `rgba(255,171,0,0.06)`;
        ctx.beginPath();
        ctx.moveTo(cx, cy - 20);
        ctx.arc(cx, cy - 20, lidarRange, lidarAngle - 0.3, lidarAngle + 0.3);
        ctx.closePath(); ctx.fill();
        // 激光线
        ctx.strokeStyle = `rgba(255,171,0,${0.6 + Math.sin(t * 0.2) * 0.3})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(cx, cy - 20);
        ctx.lineTo(cx + Math.cos(lidarAngle) * lidarRange, cy - 20 + Math.sin(lidarAngle) * lidarRange);
        ctx.stroke();
        // 点云
        for (let i = 0; i < 8; i++) {
          const angle = lidarAngle - 0.25 + i * 0.07;
          const dist = lidarRange * (0.85 + Math.sin(angle * 7 + t * 0.01) * 0.12);
          ctx.fillStyle = ACC;
          ctx.beginPath();
          ctx.arc(cx + Math.cos(angle) * dist, cy - 20 + Math.sin(angle) * dist, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 激光雷达模块（顶部圆形）
      ctx.fillStyle = '#1a2a3a';
      ctx.beginPath(); ctx.arc(cx, cy - 20, 14, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = ACC; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(cx, cy - 20, 14, 0, Math.PI * 2); ctx.stroke();
      if (scanning) {
        ctx.fillStyle = ACC;
        ctx.beginPath();
        ctx.arc(cx + Math.cos(t * 0.04) * 8, cy - 20 + Math.sin(t * 0.04) * 8, 3, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = ACC; ctx.font = '8px monospace'; ctx.textAlign = 'center';
      ctx.fillText('LiDAR', cx, cy - 6);

      // 驱动轮
      [[-r, 0], [r, 0]].forEach(([dx]) => {
        const wheelX = cx + dx * 0.95;
        ctx.fillStyle = '#333';
        ctx.beginPath(); ctx.roundRect(wheelX - 8, cy + r * 0.3, 16, 40, 4); ctx.fill();
        ctx.strokeStyle = '#555'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.roundRect(wheelX - 8, cy + r * 0.3, 16, 40, 4); ctx.stroke();
        if (mode === 'clean') {
          const rotOff = t * 0.08;
          ctx.strokeStyle = '#666'; ctx.lineWidth = 1;
          for (let i = 0; i < 4; i++) {
            const angle = rotOff + i * Math.PI / 2;
            ctx.beginPath();
            ctx.arc(wheelX, cy + r * 0.3 + 20, 6, angle, angle + 0.8);
            ctx.stroke();
          }
        }
      });

      // 主刷（底部）
      ctx.fillStyle = '#ff6b35' + '44';
      ctx.beginPath(); ctx.roundRect(cx - 35, cy + r - 10, 70, 12, 4); ctx.fill();
      ctx.strokeStyle = '#ff6b35'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.roundRect(cx - 35, cy + r - 10, 70, 12, 4); ctx.stroke();
      ctx.fillStyle = '#ff6b35'; ctx.font = '8px monospace'; ctx.textAlign = 'center';
      ctx.fillText('主刷', cx, cy + r + 8);

      // 边刷
      [[-60, 40], [60, 40]].forEach(([dx, dy]) => {
        const ex = cx + dx, ey = cy + dy;
        ctx.strokeStyle = '#e040fb';
        ctx.lineWidth = 1.5;
        for (let i = 0; i < 3; i++) {
          const angle = (t * 0.06 + i * Math.PI * 2 / 3) * (dx < 0 ? 1 : -1);
          ctx.beginPath();
          ctx.moveTo(ex, ey);
          ctx.lineTo(ex + Math.cos(angle) * 12, ey + Math.sin(angle) * 12);
          ctx.stroke();
        }
        ctx.fillStyle = '#e040fb66';
        ctx.beginPath(); ctx.arc(ex, ey, 5, 0, Math.PI * 2); ctx.fill();
      });
      ctx.fillStyle = '#e040fb'; ctx.font = '8px monospace';
      ctx.textAlign = 'left'; ctx.fillText('边刷', cx - 85, cy + 56);
      ctx.textAlign = 'right'; ctx.fillText('边刷', cx + 85, cy + 56);

      // 悬崖传感器
      [[-r * 0.7, r * 0.6], [r * 0.7, r * 0.6], [0, r * 0.85]].forEach(([dx, dy]) => {
        ctx.fillStyle = '#00e67688';
        ctx.beginPath(); ctx.arc(cx + dx, cy + dy, 4, 0, Math.PI * 2); ctx.fill();
      });

      // 传感器标注
      ctx.fillStyle = '#00e676'; ctx.font = '8px monospace'; ctx.textAlign = 'center';
      ctx.fillText('悬崖传感器', cx, cy + r * 0.85 + 14);

      // 碰撞传感器（前部）
      ctx.strokeStyle = '#00bcd4';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, cy, r + 4, -Math.PI * 0.6, -Math.PI * 0.4);
      ctx.stroke();
      ctx.fillStyle = '#00bcd4'; ctx.font = '8px monospace'; ctx.textAlign = 'center';
      ctx.fillText('碰撞传感器', cx, cy - r - 10);

      // 状态文字
      ctx.textAlign = 'left';
      ctx.fillStyle = scanning ? ACC + 'cc' : '#607a90';
      ctx.font = '10px monospace';
      ctx.fillText(scanning ? '● LiDAR 扫描中' : '○ LiDAR 待机', 10, 18);
      ctx.fillStyle = mode === 'clean' ? '#00e676cc' : '#607a90';
      ctx.fillText(mode === 'clean' ? '● 清扫模式' : '○ 停止', 10, 32);

      t++;
      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(raf);
  }, [scanning, mode]);

  return <canvas ref={ref} style={{ maxWidth: '100%', borderRadius: 12 }} />;
}

export default function RobotVacuum() {
  const [scanning, setScanning] = useState(true);
  const [mode, setMode] = useState('idle');

  return (
    <section id="robot-vacuum" className="sec">
      <div className="sh">
        <span className="sh-icon">🤖</span>
        <div>
          <div className="sh-title">扫地机器人电路系统</div>
          <div className="sh-tag">ROBOT VACUUM · LIDAR · BLDC · SLAM</div>
          <div className="sh-sub">激光建图 · 多电机驱动 · 传感器融合架构</div>
        </div>
      </div>

      <div className="divider" />

      <div className="grid2 reveal">
        <div className="anim-box" style={{ textAlign: 'center' }}>
          <RobotCanvas scanning={scanning} mode={mode} />
          <div style={{ marginTop: 12, display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => setScanning(s => !s)}
              style={{
                padding: '8px 16px', borderRadius: 20, cursor: 'pointer',
                border: `1px solid ${scanning ? ACC : 'rgba(255,255,255,.15)'}`,
                background: scanning ? ACC + '22' : 'transparent',
                color: scanning ? ACC : 'var(--dim)', fontSize: 12,
              }}
            >{scanning ? '⏸ 暂停LiDAR' : '▶ 启动LiDAR'}</button>
            <button
              onClick={() => setMode(m => m === 'clean' ? 'idle' : 'clean')}
              style={{
                padding: '8px 16px', borderRadius: 20, cursor: 'pointer',
                border: `1px solid ${mode === 'clean' ? '#00e676' : 'rgba(255,255,255,.15)'}`,
                background: mode === 'clean' ? '#00e67622' : 'transparent',
                color: mode === 'clean' ? '#00e676' : 'var(--dim)', fontSize: 12,
              }}
            >{mode === 'clean' ? '⏹ 停止清扫' : '▶ 开始清扫'}</button>
          </div>
        </div>

        <div>
          <div className="glass reveal" style={{ marginBottom: 12 }}>
            <div style={{ color: ACC, fontWeight: 700, marginBottom: 8 }}>系统架构分层</div>
            {[
              { layer: '感知层', color: '#00bcd4', items: 'LiDAR · 碰撞传感器 · 悬崖传感器 · 陀螺仪 · 编码器' },
              { layer: '决策层', color: '#9c7dff', items: 'SoC主控 · SLAM建图 · 路径规划 · 故障诊断' },
              { layer: '执行层', color: '#00e676', items: '驱动轮电机 · 主刷电机 · 边刷电机 · 吸风电机' },
              { layer: '能源层', color: ACC, items: '14.4V锂电组 · BMS保护 · 充电桩红外对接' },
            ].map(l => (
              <div key={l.layer} style={{
                display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 8,
                padding: '6px 10px', borderRadius: 8, background: l.color + '10',
                border: `1px solid ${l.color}33`,
              }}>
                <span style={{ color: l.color, fontWeight: 700, fontSize: 12, minWidth: 44 }}>{l.layer}</span>
                <span style={{ color: 'var(--dim)', fontSize: 11, lineHeight: 1.6 }}>{l.items}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="divider" />

      <div className="grid2 reveal">
        <div className="glass">
          <div style={{ color: ACC, fontWeight: 700, marginBottom: 10 }}>激光雷达 LiDAR</div>
          <p style={{ fontSize: 13, lineHeight: 1.8, color: 'var(--dim)' }}>
            ToF（飞行时间）测距：激光脉冲发出到反射回来的时间 × 光速 / 2 = 距离。
            旋转电机带动棱镜或激光头，实现 360° 平面扫描，每圈采样 360~2000 个点。
          </p>
          <div className="fbox">
            <div className="fbox-f">d = c × Δt / 2</div>
            <div className="fbox-desc">距离 = 光速 × 飞行时间 ÷ 2</div>
          </div>
          <p style={{ fontSize: 13, lineHeight: 1.8, color: 'var(--dim)', marginTop: 8 }}>
            SLAM算法融合 LiDAR + 里程计（编码器）构建环境地图并同步定位，规划覆盖清扫路径。
          </p>
        </div>

        <div className="glass">
          <div style={{ color: '#00e676', fontWeight: 700, marginBottom: 10 }}>电机驱动系统</div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,.1)' }}>
                <th style={{ padding: '4px', textAlign: 'left', color: '#00e676' }}>电机</th>
                <th style={{ padding: '4px', textAlign: 'left', color: 'var(--dim)' }}>类型</th>
                <th style={{ padding: '4px', textAlign: 'left', color: 'var(--dim)' }}>电压/功率</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['驱动轮 ×2', 'BLDC+编码器', '12V / 5W'],
                ['主刷', '有刷DC', '12V / 8W'],
                ['边刷 ×2', '有刷DC减速', '5V / 1W'],
                ['吸风机', '高速BLDC', '14.4V / 30W'],
                ['LiDAR', 'DC减速', '5V / 1W'],
              ].map(([n, t, p]) => (
                <tr key={n} style={{ borderBottom: '1px solid rgba(255,255,255,.05)' }}>
                  <td style={{ padding: '5px 4px', color: 'var(--white)' }}>{n}</td>
                  <td style={{ padding: '5px 4px', color: 'var(--dim)' }}>{t}</td>
                  <td style={{ padding: '5px 4px', color: ACC }}>{p}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="divider" />

      <div className="glass reveal">
        <div style={{ color: '#ff6b35', fontWeight: 700, marginBottom: 10 }}>电源系统与常见故障</div>
        <div className="grid2" style={{ fontSize: 13, gap: 12 }}>
          <div>
            <div style={{ color: 'var(--dim)', marginBottom: 6, fontWeight: 600 }}>电源系统：</div>
            <ul style={{ paddingLeft: 16, lineHeight: 1.9, color: 'var(--dim)' }}>
              <li>电池组：3~5 节 18650 串联，14.4V / 21.6V</li>
              <li>BMS：过充/过放/短路/温度保护</li>
              <li>降压模块：14.4V → 12V（驱动）→ 5V（传感器）→ 3.3V（SoC）</li>
              <li>充电桩：红外信号引导对接，5V 1A 涓流充电</li>
              <li>充电接触：弹簧触点，允许轻微错位</li>
            </ul>
          </div>
          <div>
            <div style={{ color: 'var(--dim)', marginBottom: 6, fontWeight: 600 }}>常见故障排查：</div>
            <ul style={{ paddingLeft: 16, lineHeight: 1.9, color: 'var(--dim)' }}>
              <li>🔴 <strong>找不到充电桩</strong>：红外传感器脏污，擦拭清洁</li>
              <li>🔴 <strong>吸力下降</strong>：风机滤网堵塞，清洁滚刷缠绕</li>
              <li>🔴 <strong>异响</strong>：滚刷轴承磨损，侧刷缠绕头发</li>
              <li>🔴 <strong>LiDAR转但不建图</strong>：LiDAR电机转速异常，检查5V供电</li>
              <li>🔴 <strong>走直线跑偏</strong>：两侧编码器数据不一致，清洁轮毂</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
