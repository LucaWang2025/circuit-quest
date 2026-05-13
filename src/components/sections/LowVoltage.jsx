import { useEffect, useRef, useState } from 'react';

const ACC = '#9c7dff';

// ── 弱电系统 Canvas ──────────────────────────────────────────
function LowVoltageCanvas({ activeNode }) {
  const ref = useRef(null);

  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const W = 360, H = 280;
    cv.width = W * dpr; cv.height = H * dpr;
    cv.style.width = W + 'px'; cv.style.height = H + 'px';
    const ctx = cv.getContext('2d'); ctx.scale(dpr, dpr);

    let t = 0, rafId;

    // 节点定义
    const NODES = {
      modem:   { x: 40,  y: 140, label: '光猫', icon: '📡', color: '#ffd740' },
      router:  { x: 110, y: 140, label: '路由', icon: '📶', color: ACC },
      switch:  { x: 180, y: 140, label: '交换机', icon: '🔀', color: '#64b5f6' },
      room1:   { x: 260, y: 80,  label: '卧室1', icon: '🖥', color: '#80cbc4' },
      room2:   { x: 310, y: 140, label: '客厅',  icon: '📺', color: '#80cbc4' },
      room3:   { x: 260, y: 200, label: '卧室2', icon: '💻', color: '#80cbc4' },
      camera:  { x: 110, y: 60,  label: '摄像头', icon: '📷', color: '#ff8a65' },
      doorbell:{ x: 40,  y: 60,  label: '门禁',  icon: '🔔', color: '#ce93d8' },
      gateway: { x: 180, y: 210, label: '智能网关', icon: '🏠', color: '#a5d6a7' },
    };

    const LINKS = [
      { from: 'modem',   to: 'router',  type: 'eth' },
      { from: 'router',  to: 'switch',  type: 'eth' },
      { from: 'switch',  to: 'room1',   type: 'eth' },
      { from: 'switch',  to: 'room2',   type: 'eth' },
      { from: 'switch',  to: 'room3',   type: 'eth' },
      { from: 'router',  to: 'camera',  type: 'poe' },
      { from: 'router',  to: 'doorbell',type: 'bus' },
      { from: 'router',  to: 'gateway', type: 'wifi' },
    ];

    // 数据包粒子
    const packets = [];
    function spawnPacket(link) {
      const from = NODES[link.from], to = NODES[link.to];
      packets.push({ from, to, prog: 0, speed: 0.012 + Math.random() * 0.01, type: link.type, color: from.color });
    }

    function drawNode(node, isActive) {
      const { x, y, color, label, icon } = node;
      const r = 20;
      const glow = isActive ? 12 : 0;

      ctx.shadowColor = color; ctx.shadowBlur = isActive ? 18 : 8;
      const grad = ctx.createRadialGradient(x - 4, y - 4, 0, x, y, r);
      grad.addColorStop(0, color + '30'); grad.addColorStop(1, color + '08');
      ctx.fillStyle = grad;
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();

      ctx.strokeStyle = isActive ? color : color + '60'; ctx.lineWidth = isActive ? 2 : 1;
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.stroke();
      ctx.shadowBlur = 0;

      ctx.font = '13px inherit'; ctx.textAlign = 'center';
      ctx.fillText(icon, x, y + 5);

      ctx.fillStyle = isActive ? color : 'rgba(180,200,220,.55)'; ctx.font = '9px inherit';
      ctx.fillText(label, x, y + r + 12);
    }

    function drawLink(link) {
      const from = NODES[link.from], to = NODES[link.to];
      ctx.beginPath(); ctx.moveTo(from.x, from.y); ctx.lineTo(to.x, to.y);

      if (link.type === 'eth') {
        ctx.strokeStyle = `rgba(100,181,246,0.3)`; ctx.lineWidth = 2; ctx.setLineDash([]);
      } else if (link.type === 'poe') {
        ctx.strokeStyle = `rgba(255,138,101,0.35)`; ctx.lineWidth = 2; ctx.setLineDash([4, 3]);
      } else if (link.type === 'bus') {
        ctx.strokeStyle = `rgba(206,147,216,0.3)`; ctx.lineWidth = 1.5; ctx.setLineDash([2, 2]);
      } else {
        ctx.strokeStyle = `rgba(156,125,255,0.2)`; ctx.lineWidth = 1.5; ctx.setLineDash([1, 3]);
      }
      ctx.stroke(); ctx.setLineDash([]);
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      t += 0.02;

      // 背景
      const bg = ctx.createLinearGradient(0, 0, W, H);
      bg.addColorStop(0, '#09080f'); bg.addColorStop(1, '#050510');
      ctx.fillStyle = bg;
      ctx.beginPath(); ctx.roundRect(4, 4, W - 8, H - 8, 10); ctx.fill();

      // 弱电箱背景框
      ctx.fillStyle = 'rgba(156,125,255,.04)';
      ctx.strokeStyle = 'rgba(156,125,255,.15)'; ctx.lineWidth = 1;
      ctx.setLineDash([4, 3]);
      ctx.beginPath(); ctx.roundRect(22, 115, 170, 50, 8); ctx.fill(); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(156,125,255,.35)'; ctx.font = '9px "Courier New",monospace'; ctx.textAlign = 'center';
      ctx.fillText('弱电箱', 107, 112);

      // 网格背景点
      for (let gx = 30; gx < W - 20; gx += 28) {
        for (let gy = 30; gy < H - 20; gy += 28) {
          ctx.fillStyle = 'rgba(156,125,255,.06)';
          ctx.beginPath(); ctx.arc(gx, gy, 1, 0, Math.PI * 2); ctx.fill();
        }
      }

      // 绘制连线
      LINKS.forEach(l => drawLink(l));

      // 生成粒子
      if (Math.random() < 0.2) {
        const l = LINKS[Math.floor(Math.random() * LINKS.length)];
        spawnPacket(l);
      }

      // 更新粒子
      for (let i = packets.length - 1; i >= 0; i--) {
        const p = packets[i];
        p.prog += p.speed;
        if (p.prog >= 1) { packets.splice(i, 1); continue; }
        const px = p.from.x + (p.to.x - p.from.x) * p.prog;
        const py = p.from.y + (p.to.y - p.from.y) * p.prog;
        const alpha = 0.9 - p.prog * 0.4;
        ctx.beginPath(); ctx.arc(px, py, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = p.color + Math.floor(alpha * 255).toString(16).padStart(2, '0');
        ctx.shadowColor = p.color; ctx.shadowBlur = 6;
        ctx.fill(); ctx.shadowBlur = 0;
      }

      // 绘制节点
      Object.entries(NODES).forEach(([key, node]) => {
        drawNode(node, activeNode === key);
      });

      // 图例
      const legends = [
        { color: '#64b5f6', dash: [], label: '以太网', lx: 20, ly: H - 30 },
        { color: '#ff8a65', dash: [4, 3], label: 'POE供电', lx: 90, ly: H - 30 },
        { color: '#ce93d8', dash: [2, 2], label: '总线', lx: 165, ly: H - 30 },
        { color: ACC,      dash: [1, 3], label: 'WiFi', lx: 215, ly: H - 30 },
      ];
      legends.forEach(lg => {
        ctx.strokeStyle = lg.color; ctx.lineWidth = 1.5;
        ctx.setLineDash(lg.dash);
        ctx.beginPath(); ctx.moveTo(lg.lx, lg.ly); ctx.lineTo(lg.lx + 18, lg.ly); ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = lg.color; ctx.font = '8px inherit'; ctx.textAlign = 'left';
        ctx.fillText(lg.label, lg.lx + 22, lg.ly + 3);
      });

      rafId = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(rafId);
  }, [activeNode]);

  return <canvas ref={ref} style={{ maxWidth: '100%', borderRadius: 10 }} />;
}

// ── 数据 ──────────────────────────────────────────────────────
const CABLE_SPECS = [
  { name: '超五类（Cat5e）', speed: '1Gbps', dist: '100m', wire: 'UTP 4对', badge: '常用', color: '#ffd740' },
  { name: '六类（Cat6）',    speed: '1Gbps+', dist: '100m', wire: 'UTP/STP', badge: '推荐', color: ACC },
  { name: '超六类（Cat6A）', speed: '10Gbps', dist: '100m', wire: 'STP',     badge: '高端', color: '#64b5f6' },
];

const SMARTHOME_PROTOCOLS = [
  { name: 'ZigBee', freq: '2.4GHz', range: '10~100m', mesh: '是', power: '超低', note: '家居自动化首选，网状网络，Philips/涂鸦支持' },
  { name: 'Z-Wave', freq: '908MHz', range: '30m', mesh: '是', power: '低', note: '低频段抗干扰，欧美家居常用，设备较贵' },
  { name: 'WiFi',   freq: '2.4/5GHz', range: '30~50m', mesh: '否', power: '中高', note: '无需专用网关，智能插座/摄像头常用' },
  { name: 'Matter', freq: '多协议', range: '覆盖全屋', mesh: '是', power: '低', note: '苹果/谷歌/亚马逊联合推动，跨生态互联' },
];

export default function LowVoltage() {
  const [activeNode, setActiveNode] = useState(null);

  const NODES_INFO = {
    modem:    { label: '光猫 (ONU)', detail: '运营商提供，将光纤信号转为以太网，WAN口连接路由器' },
    router:   { label: '路由器',     detail: '负责NAT地址转换和DHCP分配，建议千兆+WiFi6' },
    switch:   { label: '交换机',     detail: '扩展网口数量，8口非管理型交换机适合家庭使用' },
    room1:    { label: '卧室1网口', detail: '超六类网线，从弱电箱配线架连接，单根最长100m' },
    room2:    { label: '客厅网口',  detail: '建议至少预留2个网口，用于电视和主机' },
    room3:    { label: '卧室2网口', detail: '双网口设计，方便日后扩展' },
    camera:   { label: 'POE摄像头', detail: 'POE供电48V，仅一根网线即可供电+数据，NVR录像' },
    doorbell: { label: '门禁对讲',  detail: '总线制，RS485通信，二总线/四总线视品牌而定' },
    gateway:  { label: '智能家居网关', detail: 'ZigBee/Z-Wave协调器，所有智能设备的控制中枢' },
  };

  return (
    <section id="low-voltage" className="sec">
      <div className="sh">
        <span className="sh-icon">🌐</span>
        <div className="sh-tag">Stage 8 · Low-Voltage Systems</div>
        <h2 className="sh-title" style={{ color: ACC, textShadow: `0 0 35px rgba(156,125,255,.4)` }}>
          家庭弱电系统
        </h2>
        <p className="sh-sub">弱电系统涵盖网络、监控、门禁和智能家居，规范施工是稳定运行的前提。</p>
        <div className="divider" style={{ background: `linear-gradient(90deg,transparent,${ACC},transparent)` }} />
      </div>

      {/* Canvas + 节点选择 */}
      <div className="grid2">
        <div className="anim-box reveal" style={{ borderColor: 'rgba(156,125,255,.2)', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
          <LowVoltageCanvas activeNode={activeNode} />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, justifyContent: 'center' }}>
            {Object.entries(NODES_INFO).map(([key, info]) => (
              <button key={key} onMouseEnter={() => setActiveNode(key)} onMouseLeave={() => setActiveNode(null)} style={{
                padding: '4px 12px', borderRadius: 14, cursor: 'pointer', fontSize: 11,
                border: `1px solid ${activeNode === key ? ACC : 'rgba(156,125,255,.2)'}`,
                background: activeNode === key ? 'rgba(156,125,255,.15)' : 'transparent',
                color: activeNode === key ? ACC : 'var(--dim)',
                font: '11px/1.5 inherit', transition: 'all .15s',
              }}>{info.label}</button>
            ))}
          </div>
          {activeNode && (
            <div style={{ background: 'rgba(156,125,255,.08)', border: '1px solid rgba(156,125,255,.2)', borderRadius: 10, padding: '10px 14px', maxWidth: 340, textAlign: 'center' }}>
              <div style={{ fontWeight: 700, color: ACC, fontSize: 13, marginBottom: 5 }}>{NODES_INFO[activeNode]?.label}</div>
              <div style={{ fontSize: 12, color: '#8aacb8', lineHeight: 1.6 }}>{NODES_INFO[activeNode]?.detail}</div>
            </div>
          )}
        </div>

        <div className="reveal" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ font: '11px "Courier New",monospace', color: 'var(--dim)', letterSpacing: 2, textAlign: 'center' }}>
            ⚡ 强弱电对比
          </div>
          <div className="glass reveal" style={{ borderColor: 'rgba(156,125,255,.15)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[
                { type: '强电', color: '#ff5252', items: ['电压 220V/380V', '能量传输', '照明/动力/加热', '穿PVC/金属管', '线径2.5~10mm²'] },
                { type: '弱电', color: ACC, items: ['电压 ≤36V', '信号/数据传输', '网络/监控/门禁', '独立穿管', '信号电缆0.5~1mm²'] },
              ].map(item => (
                <div key={item.type}>
                  <div style={{ fontWeight: 700, color: item.color, marginBottom: 8, fontSize: 13 }}>{item.type}</div>
                  {item.items.map(i => (
                    <div key={i} style={{ fontSize: 12, color: '#8aacb8', marginBottom: 5, display: 'flex', gap: 6 }}>
                      <span style={{ color: item.color }}>▸</span>{i}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
          <div className="glass reveal" style={{ borderColor: 'rgba(255,82,82,.12)' }}>
            <div style={{ fontWeight: 700, color: '#ff5252', marginBottom: 10, fontSize: 13 }}>📏 施工分管规范</div>
            {[
              '强电与弱电必须分管穿线，不得共管',
              '平行走线间距 ≥ 300mm，防电磁干扰',
              '交叉时垂直交叉，尽量减少交叉点',
              '弱电箱内设备接地排，接建筑共用地',
            ].map(r => (
              <div key={r} style={{ fontSize: 12, color: '#8aacb8', display: 'flex', gap: 8, marginBottom: 7, lineHeight: 1.5 }}>
                <span style={{ color: '#ff9800', flexShrink: 0 }}>⚠</span>{r}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 网线规格 */}
      <div style={{ marginTop: 44 }}>
        <h3 style={{ fontSize: 20, fontWeight: 700, color: ACC, marginBottom: 20 }}>🔌 网络布线规格对比</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
          {CABLE_SPECS.map(s => (
            <div key={s.name} className="glass reveal" style={{ borderColor: `${s.color}22` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <span style={{ fontWeight: 700, color: s.color, fontSize: 13 }}>{s.name}</span>
                <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 10, background: `${s.color}18`, color: s.color, border: `1px solid ${s.color}40` }}>{s.badge}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, fontSize: 12 }}>
                <div><span style={{ color: 'var(--dim)' }}>速率：</span><span style={{ color: '#c8dce8' }}>{s.speed}</span></div>
                <div><span style={{ color: 'var(--dim)' }}>最长：</span><span style={{ color: '#c8dce8' }}>{s.dist}</span></div>
                <div style={{ gridColumn: '1/-1' }}><span style={{ color: 'var(--dim)' }}>结构：</span><span style={{ color: '#c8dce8' }}>{s.wire}</span></div>
              </div>
            </div>
          ))}
        </div>
        {/* 568B接线序图 */}
        <div style={{ marginTop: 20, background: 'rgba(0,0,0,.4)', border: '1px solid rgba(156,125,255,.15)', borderRadius: 12, padding: '16px 20px' }}>
          <div style={{ fontWeight: 700, color: ACC, marginBottom: 12, fontSize: 14 }}>📋 EIA/TIA 568B 标准线序（最常用）</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {[
              { pos: 1, color: '#ff8c00', label: '橙白' },
              { pos: 2, color: '#ff6b00', label: '橙色' },
              { pos: 3, color: '#4fc3f7', label: '绿白' },
              { pos: 4, color: '#1565c0', label: '蓝色' },
              { pos: 5, color: '#5c8eff', label: '蓝白' },
              { pos: 6, color: '#2e7d32', label: '绿色' },
              { pos: 7, color: '#795548', label: '棕白' },
              { pos: 8, color: '#4e342e', label: '棕色' },
            ].map(pin => (
              <div key={pin.pos} style={{ textAlign: 'center', fontSize: 11 }}>
                <div style={{ width: 28, height: 40, background: pin.color, borderRadius: '4px 4px 0 0', border: '1px solid rgba(255,255,255,.2)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: 3, color: '#fff', fontWeight: 700, fontSize: 13 }}>{pin.pos}</div>
                <div style={{ color: '#8aacb8', marginTop: 3 }}>{pin.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 监控系统 */}
      <div style={{ marginTop: 36 }}>
        <h3 style={{ fontSize: 18, fontWeight: 700, color: ACC, marginBottom: 16 }}>📷 POE监控系统</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
          {[
            { icon: '🔌', title: 'POE标准', content: 'IEEE 802.3af（15W）/ 802.3at（30W），48V直流，单根网线传输电力+数据' },
            { icon: '📹', title: '摄像头类型', content: 'IPC（网络摄像头）支持1080P~4K，H.265编码，POE供电免布电源线' },
            { icon: '💾', title: 'NVR录像机', content: '最大支持16~32路，4K录像，硬盘存储，支持移动侦测/报警联动' },
            { icon: '🔗', title: 'DVR区别', content: 'DVR用于模拟摄像头（同轴线），NVR用于IP摄像头（网线），新装推荐NVR' },
          ].map(item => (
            <div key={item.title} className="glass reveal" style={{ borderColor: 'rgba(156,125,255,.12)' }}>
              <div style={{ fontSize: 22, marginBottom: 8 }}>{item.icon}</div>
              <div style={{ fontWeight: 700, color: '#c8dce8', fontSize: 13, marginBottom: 6 }}>{item.title}</div>
              <div style={{ fontSize: 12, color: '#8aacb8', lineHeight: 1.6 }}>{item.content}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 智能家居协议 */}
      <div style={{ marginTop: 36 }}>
        <h3 style={{ fontSize: 18, fontWeight: 700, color: ACC, marginBottom: 16 }}>🏠 智能家居无线协议对比</h3>
        <div style={{ background: 'rgba(6,6,20,.7)', borderRadius: 14, overflow: 'hidden', border: '1px solid rgba(156,125,255,.14)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '80px 90px 60px 40px 50px 1fr', padding: '10px 16px', background: 'rgba(156,125,255,.1)', font: 'bold 11px "Courier New",monospace', color: ACC, gap: 8, alignItems: 'center' }}>
            <span>协议</span><span>频段</span><span>范围</span><span>Mesh</span><span>功耗</span><span>说明</span>
          </div>
          {SMARTHOME_PROTOCOLS.map((p, i) => (
            <div key={p.name} style={{
              display: 'grid', gridTemplateColumns: '80px 90px 60px 40px 50px 1fr', padding: '10px 16px',
              borderTop: '1px solid rgba(255,255,255,.05)',
              background: i % 2 === 0 ? 'rgba(156,125,255,.03)' : 'transparent', gap: 8, alignItems: 'center',
            }}>
              <span style={{ color: ACC, fontWeight: 700, fontSize: 13 }}>{p.name}</span>
              <span style={{ color: '#c8dce8', fontSize: 12, fontFamily: 'monospace' }}>{p.freq}</span>
              <span style={{ color: '#8aacb8', fontSize: 12 }}>{p.range}</span>
              <span style={{ color: p.mesh === '是' ? '#66bb6a' : '#f44336', fontSize: 12 }}>{p.mesh}</span>
              <span style={{ color: '#ffd740', fontSize: 12 }}>{p.power}</span>
              <span style={{ color: '#8aacb8', fontSize: 12, lineHeight: 1.5 }}>{p.note}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
