import { useEffect, useRef, useState } from 'react';

const ACC = '#00e5ff';

const LAYERS = [
  { id: 'soldermask_top', name: '阻焊层（顶）', color: '#1a6e2a', alpha: 0.9, desc: '防止焊锡粘连，保护铜层，通常绿色/蓝色/黑色', thickness: 14 },
  { id: 'copper_top',     name: '铜箔信号层', color: '#d4a820', alpha: 0.85, desc: '顶层信号走线，连接元件引脚', thickness: 10 },
  { id: 'fr4_1',          name: '玻纤基板', color: '#c8b878', alpha: 0.9, desc: 'FR4 玻纤环氧树脂，机械支撑与绝缘', thickness: 18 },
  { id: 'copper_gnd',     name: '铜箔地平面', color: '#c89820', alpha: 0.8, desc: '地（GND）铺铜层，提供稳定参考地', thickness: 10 },
  { id: 'fr4_2',          name: '玻纤基板', color: '#c8b878', alpha: 0.9, desc: 'FR4 中间绝缘层', thickness: 18 },
  { id: 'copper_pwr',     name: '铜箔电源层', color: '#d4a820', alpha: 0.8, desc: '电源（VCC）分配层，低阻抗供电', thickness: 10 },
  { id: 'soldermask_bot', name: '阻焊层（底）', color: '#1a6e2a', alpha: 0.9, desc: '底层阻焊，保护底层铜箔', thickness: 14 },
];

const SOFTWARES = [
  { name: 'KiCad', price: '免费开源', url: 'https://www.kicad.org', level: '推荐', desc: '功能完整，社区活跃，本地安装，支持 Gerber 导出' },
  { name: '立创EDA', price: '在线免费', url: 'https://lceda.cn', level: '入门推荐', desc: '浏览器即用，无缝对接嘉立创打样，国内首选' },
  { name: 'Altium Designer', price: '¥数万/年', url: '', level: '专业', desc: '工业级EDA，功能强大，SI/PI分析，大型企业使用' },
  { name: 'Eagle', price: '$$$', url: '', level: '经典', desc: 'Autodesk旗下，老牌EDA，Arduino官方采用' },
];

export default function PCB() {
  const canvasRef = useRef(null);
  const [expandedLayers, setExpandedLayers] = useState(false);
  const expandRef = useRef(false);

  useEffect(() => { expandRef.current = expandedLayers; }, [expandedLayers]);

  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const W = 380, H = 280;
    cv.width = W * dpr; cv.height = H * dpr;
    cv.style.width = W + 'px'; cv.style.height = H + 'px';
    const ctx = cv.getContext('2d'); ctx.scale(dpr, dpr);

    let frame = 0;
    let rafId;
    let expandAnim = 0; // 0 = collapsed, 1 = expanded

    const BASE_Y = 60;
    const LAYER_BASE_H = 12;
    const LAYER_EXPANDED_SPACING = 36;
    const LAYER_COLLAPSED_SPACING = 10;
    const STACK_X = 30, STACK_W = 200;

    function easeInOut(t) {
      return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    }

    function drawLayer(lIdx, yPos, layerH, alpha, showLabel) {
      const layer = LAYERS[lIdx];
      const x = STACK_X, y = yPos, w = STACK_W, h = layerH;

      // 3D perspective effect
      const depth = 8;
      ctx.save();
      ctx.globalAlpha = alpha;

      // Side face (3D depth)
      ctx.fillStyle = layer.color;
      ctx.globalAlpha = alpha * 0.5;
      ctx.beginPath();
      ctx.moveTo(x + w, y);
      ctx.lineTo(x + w + depth, y - depth * 0.5);
      ctx.lineTo(x + w + depth, y + h - depth * 0.5);
      ctx.lineTo(x + w, y + h);
      ctx.closePath();
      ctx.fill();

      // Bottom face
      ctx.globalAlpha = alpha * 0.3;
      ctx.beginPath();
      ctx.moveTo(x, y + h);
      ctx.lineTo(x + depth, y + h - depth * 0.5);
      ctx.lineTo(x + w + depth, y + h - depth * 0.5);
      ctx.lineTo(x + w, y + h);
      ctx.closePath();
      ctx.fill();

      // Top face (main)
      ctx.globalAlpha = alpha;
      const grad = ctx.createLinearGradient(x, y, x + w, y + h);
      grad.addColorStop(0, layer.color + 'ee');
      grad.addColorStop(1, layer.color + '99');
      ctx.fillStyle = grad;
      ctx.fillRect(x, y, w, h);

      // Copper layer pattern - traces
      if (layer.id === 'copper_top') {
        ctx.strokeStyle = 'rgba(255,220,80,0.6)';
        ctx.lineWidth = 1.5;
        ctx.globalAlpha = alpha * 0.8;
        // Draw traces
        [[20, 0.4], [60, 0.25], [100, 0.5], [140, 0.3], [165, 0.45]].forEach(([lx, t]) => {
          ctx.beginPath();
          ctx.moveTo(x + lx, y + 1);
          ctx.lineTo(x + lx + 25, y + 1);
          ctx.lineTo(x + lx + 25, y + h - 1);
          ctx.stroke();
        });
        // Via holes
        [30, 80, 130, 175].forEach(vx => {
          ctx.fillStyle = '#888';
          ctx.globalAlpha = alpha;
          ctx.beginPath(); ctx.arc(x + vx, y + h / 2, 2.5, 0, Math.PI * 2); ctx.fill();
          ctx.strokeStyle = 'rgba(255,220,80,0.8)';
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.arc(x + vx, y + h / 2, 4, 0, Math.PI * 2); ctx.stroke();
        });
      }

      if (layer.id === 'copper_gnd' || layer.id === 'copper_pwr') {
        ctx.globalAlpha = alpha * 0.4;
        ctx.fillStyle = layer.id === 'copper_gnd' ? '#e0c050' : '#e8a020';
        ctx.fillRect(x + 4, y + 1, w - 8, h - 2);
      }

      // Soldermask - show pad openings
      if (layer.id === 'soldermask_top' || layer.id === 'soldermask_bot') {
        ctx.globalAlpha = alpha * 0.7;
        ctx.fillStyle = '#00ff44';
        [40, 90, 150].forEach(px => {
          ctx.clearRect(x + px, y, 8, h);
          ctx.fillStyle = '#d4a820';
          ctx.fillRect(x + px, y, 8, h);
        });
      }

      // Border
      ctx.globalAlpha = alpha * 0.3;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 0.5;
      ctx.strokeRect(x, y, w, h);

      // Label
      if (showLabel) {
        ctx.globalAlpha = Math.max(0, (alpha - 0.3) * 1.4);
        ctx.font = 'bold 9px monospace';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'left';
        ctx.fillText(layer.name, x + w + depth + 8, y + h / 2 + 4);
      }
      ctx.restore();
    }

    function drawCrossSection() {
      // Cross section panel on right
      const cx = 258, cy = 30, cw = 105, ch = H - 50;

      ctx.fillStyle = 'rgba(0,229,255,0.05)';
      ctx.beginPath(); ctx.roundRect(cx, cy, cw, ch, 6); ctx.fill();
      ctx.strokeStyle = 'rgba(0,229,255,0.25)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.roundRect(cx, cy, cw, ch, 6); ctx.stroke();

      ctx.font = 'bold 9px monospace';
      ctx.fillStyle = ACC;
      ctx.textAlign = 'center';
      ctx.fillText('走线截面', cx + cw / 2, cy + 14);

      // Draw cross section: trace, pad, via
      const midX = cx + cw / 2;
      const startY = cy + 24;
      const totalH = ch - 34;

      // Substrate
      ctx.fillStyle = '#c8b878';
      ctx.fillRect(cx + 8, startY + totalH * 0.2, cw - 16, totalH * 0.6);

      // Bottom copper
      ctx.fillStyle = '#d4a820';
      ctx.fillRect(cx + 8, startY + totalH * 0.8, cw - 16, totalH * 0.08);

      // Top copper trace
      ctx.fillStyle = '#d4a820';
      const traceW = cw * 0.35;
      ctx.fillRect(midX - traceW / 2, startY + totalH * 0.12, traceW, totalH * 0.08);
      // Pad (wider)
      ctx.fillStyle = '#e8c030';
      ctx.fillRect(midX - traceW * 0.8, startY + totalH * 0.12, traceW * 1.6, totalH * 0.08);

      // Via (plated hole)
      ctx.fillStyle = '#d4a820';
      ctx.fillRect(midX - 3, startY + totalH * 0.12, 6, totalH * 0.68 + totalH * 0.08);
      ctx.fillStyle = '#aaa';
      ctx.fillRect(midX - 1.5, startY + totalH * 0.14, 3, totalH * 0.64);

      // Soldermask top
      ctx.fillStyle = '#1a6e2a'; ctx.globalAlpha = 0.85;
      ctx.fillRect(cx + 8, startY + totalH * 0.05, cw - 16, totalH * 0.07);
      // Clear for pad
      ctx.clearRect(midX - traceW * 0.8, startY + totalH * 0.05, traceW * 1.6, totalH * 0.07);
      ctx.globalAlpha = 1;

      // Soldermask bottom
      ctx.fillStyle = '#1a6e2a'; ctx.globalAlpha = 0.85;
      ctx.fillRect(cx + 8, startY + totalH * 0.88, cw - 16, totalH * 0.07);
      ctx.globalAlpha = 1;

      // Labels
      ctx.font = '8px monospace'; ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.textAlign = 'left';
      const labelX = cx + 10;
      [
        [startY + totalH * 0.08, '阻焊'],
        [startY + totalH * 0.16, '铜箔'],
        [startY + totalH * 0.5, 'FR4'],
        [startY + totalH * 0.82, '铜箔'],
        [startY + totalH * 0.91, '阻焊'],
      ].forEach(([ly, txt]) => {
        ctx.fillText(txt, labelX, ly);
      });

      // Via label
      ctx.fillStyle = ACC; ctx.textAlign = 'center';
      ctx.fillText('过孔', midX, startY + totalH + 10);

      // Line width annotation
      ctx.strokeStyle = 'rgba(0,229,255,0.5)'; ctx.lineWidth = 0.8;
      ctx.setLineDash([3, 3]);
      ctx.beginPath(); ctx.moveTo(midX - traceW / 2, startY); ctx.lineTo(midX - traceW / 2, startY + totalH * 0.11); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(midX + traceW / 2, startY); ctx.lineTo(midX + traceW / 2, startY + totalH * 0.11); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(midX - traceW / 2, startY + 4); ctx.lineTo(midX + traceW / 2, startY + 4); ctx.stroke();
      ctx.setLineDash([]);
      ctx.font = '8px monospace'; ctx.fillStyle = ACC; ctx.textAlign = 'center';
      ctx.fillText('0.2mm', midX, startY + 2);
    }

    function draw() {
      rafId = requestAnimationFrame(draw);
      frame++;

      // Animate expand/collapse
      const targetExpand = expandRef.current ? 1 : 0;
      expandAnim += (targetExpand - expandAnim) * 0.06;

      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = '#0d1117';
      ctx.fillRect(0, 0, W, H);

      // Draw layers
      const spacing = LAYER_COLLAPSED_SPACING + (LAYER_EXPANDED_SPACING - LAYER_COLLAPSED_SPACING) * easeInOut(expandAnim);
      const totalCollapsed = LAYERS.length * (LAYER_BASE_H + LAYER_COLLAPSED_SPACING);
      const totalExpanded = LAYERS.length * (LAYER_BASE_H + LAYER_EXPANDED_SPACING);
      const totalH = totalCollapsed + (totalExpanded - totalCollapsed) * easeInOut(expandAnim);

      LAYERS.forEach((layer, i) => {
        const yBase = BASE_Y + i * (LAYER_BASE_H + spacing);
        const alpha = 0.7 + Math.sin(frame * 0.02 + i * 0.3) * 0.05;
        drawLayer(i, yBase, LAYER_BASE_H, alpha, expandAnim > 0.3);
      });

      drawCrossSection();

      // Title
      ctx.font = 'bold 12px monospace';
      ctx.fillStyle = ACC;
      ctx.textAlign = 'left';
      ctx.fillText('PCB 层压结构（4层板）', STACK_X, BASE_Y - 10);

      // Expand hint
      ctx.font = '10px monospace';
      ctx.fillStyle = 'rgba(0,229,255,0.5)';
      ctx.fillText(expandRef.current ? '▲ 点击收起' : '▼ 点击展开各层', STACK_X, BASE_Y + totalH + 14);
    }

    draw();
    return () => cancelAnimationFrame(rafId);
  }, []);

  return (
    <section id="pcb" className="sec">
      <div className="sh">
        <span className="sh-icon" style={{ color: ACC }}>🟩</span>
        <div>
          <div className="sh-title">PCB 设计与制造</div>
          <div className="sh-tag" style={{ color: ACC }}>进阶动手 · 电路板设计</div>
        </div>
      </div>

      <div className="divider" />

      {/* Canvas */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
        <canvas
          ref={canvasRef}
          onClick={() => setExpandedLayers(v => !v)}
          style={{ maxWidth: '100%', borderRadius: '12px', border: '1px solid rgba(0,229,255,0.2)', cursor: 'pointer' }}
        />
        <button onClick={() => setExpandedLayers(v => !v)} style={{
          padding: '7px 20px', borderRadius: '20px', fontSize: '12px', cursor: 'pointer',
          background: expandedLayers ? ACC : 'rgba(0,229,255,0.1)',
          color: expandedLayers ? '#000' : ACC,
          border: `1px solid ${ACC}`, fontWeight: 'bold', transition: 'all 0.2s',
        }}>
          {expandedLayers ? '▲ 收起层压结构' : '▼ 展开层压结构'}
        </button>
      </div>

      <div className="divider" />

      {/* Layer descriptions */}
      <div className="sh-sub">📚 各层功能说明</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
        {LAYERS.map((layer, i) => (
          <div key={layer.id} className="fbox reveal" style={{ animationDelay: `${i * 0.04}s` }}>
            <div style={{ width: '14px', height: '14px', borderRadius: '3px', background: layer.color, flexShrink: 0, marginTop: '2px' }} />
            <div>
              <span style={{ fontWeight: 'bold', color: '#fff', fontSize: '13px' }}>{layer.name}</span>
              <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginLeft: '8px' }}>{layer.desc}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Material */}
      <div className="divider" />
      <div className="sh-sub">🧪 PCB 材料规格</div>
      <div className="grid2">
        {[
          { param: 'FR4 介质', val: '玻纤环氧树脂', note: 'Tg≥130°C，最常用基材' },
          { param: '覆铜厚度', val: '1oz = 35μm', note: '2oz=70μm，大电流用2oz' },
          { param: '板厚标准', val: '1.6mm', note: '也有0.8/1.2/2.0mm规格' },
          { param: '阻焊颜色', val: '绿/蓝/红/黑', note: '黑色散热好，白色美观' },
        ].map(item => (
          <div key={item.param} className="glass reveal">
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginBottom: '2px' }}>{item.param}</div>
            <div style={{ fontWeight: 'bold', color: ACC, fontSize: '14px', fontFamily: 'monospace' }}>{item.val}</div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginTop: '2px' }}>{item.note}</div>
          </div>
        ))}
      </div>

      {/* Design rules */}
      <div className="divider" />
      <div className="sh-sub">📐 设计规则（DRC）</div>
      <div className="anim-box reveal" style={{ borderColor: 'rgba(0,229,255,0.25)', marginBottom: '16px' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
            <thead>
              <tr>
                {['参数', '最小值', '推荐值', '说明'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '6px 8px', color: ACC, borderBottom: '1px solid rgba(0,229,255,0.2)', fontSize: '11px' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ['线宽（1A）', '0.15mm', '0.2mm', '信号线常规规格'],
                ['线宽（3A）', '0.4mm', '0.5mm', '电源走线加宽'],
                ['线间距', '0.1mm', '0.15mm', '相邻走线最小间隔'],
                ['过孔钻径', '0.2mm', '0.3mm', '机械钻最小孔径'],
                ['焊盘到边缘', '0.2mm', '0.3mm', '防止制造损坏'],
              ].map((row, i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? 'rgba(255,255,255,0.03)' : 'transparent' }}>
                  {row.map((cell, j) => (
                    <td key={j} style={{
                      padding: '5px 8px',
                      color: j === 0 ? '#fff' : j === 2 ? ACC : 'rgba(255,255,255,0.55)',
                      borderBottom: '1px solid rgba(255,255,255,0.05)',
                      fontFamily: j <= 2 ? 'monospace' : 'inherit',
                      fontWeight: j === 2 ? 'bold' : 'normal',
                    }}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pad types */}
      <div className="sh-sub">🔩 焊盘类型</div>
      <div className="grid2">
        {[
          { name: 'SMD 贴片焊盘', icon: '▬', desc: '表面贴装，无孔或有阻焊开窗。精度高，适合自动贴装生产线。' },
          { name: 'THT 插件焊盘', icon: '⊙', desc: '穿孔安装，引脚穿过PCB后焊接。机械强度高，适合大功率元件。' },
        ].map(p => (
          <div key={p.name} className="glass reveal">
            <div style={{ fontSize: '28px', marginBottom: '6px', color: ACC }}>{p.icon}</div>
            <div style={{ fontWeight: 'bold', color: '#fff', fontSize: '13px', marginBottom: '4px' }}>{p.name}</div>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.55)', lineHeight: '1.6' }}>{p.desc}</div>
          </div>
        ))}
      </div>

      {/* Software */}
      <div className="divider" />
      <div className="sh-sub">💻 常用设计软件</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
        {SOFTWARES.map((s, i) => (
          <div key={s.name} className="glass reveal" style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', animationDelay: `${i * 0.05}s` }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '3px' }}>
                <span style={{ fontWeight: 'bold', color: '#fff', fontSize: '14px' }}>{s.name}</span>
                <span style={{
                  fontSize: '10px', padding: '2px 7px', borderRadius: '10px',
                  background: 'rgba(0,229,255,0.12)', color: ACC, border: '1px solid rgba(0,229,255,0.3)',
                }}>{s.level}</span>
              </div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.55)' }}>{s.desc}</div>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ fontWeight: 'bold', color: ACC, fontSize: '13px' }}>{s.price}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Fabrication */}
      <div className="divider" />
      <div className="sh-sub">🏭 PCB 打样服务</div>
      <div className="grid2">
        {[
          { name: '嘉立创（JLC）', price: '5片 ¥5起', note: '10×10cm，2层，免费SMT贴片元件补贴' },
          { name: 'JLCPCB', price: '$2起', note: '国际版，快速发货，4层板性价比高' },
          { name: 'PCBway', price: '5片 $5起', note: '多种颜色，特殊工艺丰富，铝基板可做' },
          { name: '华秋DFM', price: '5片 ¥10起', note: '含DFM分析，提供可制造性检查' },
        ].map(f => (
          <div key={f.name} className="glass reveal">
            <div style={{ fontWeight: 'bold', color: '#fff', fontSize: '13px', marginBottom: '3px' }}>{f.name}</div>
            <div style={{ fontWeight: 'bold', color: ACC, fontSize: '14px', marginBottom: '3px' }}>{f.price}</div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>{f.note}</div>
          </div>
        ))}
      </div>

      {/* Manufacturing flow */}
      <div className="divider" />
      <div className="sh-sub">🔬 PCB 制造流程</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
        {[
          ['光刻', '将电路图案通过感光材料曝光转移到铜板'],
          ['蚀刻', '化学蚀刻去除不需要的铜箔，留下走线图案'],
          ['钻孔', 'CNC 精密钻孔，孔径精度 ±0.05mm'],
          ['电镀', '孔壁沉铜，使顶底层和过孔导通'],
          ['丝印', '印刷白色丝网层（元件位号、标识）'],
          ['测试', 'ATE 飞针测试，检测短路和断路'],
        ].map(([title, desc], i) => (
          <div key={i} className="fbox reveal" style={{ animationDelay: `${i * 0.04}s` }}>
            <div className="fbox-f" style={{ color: ACC }}>{String(i + 1).padStart(2, '0')}</div>
            <div>
              <span style={{ fontWeight: 'bold', color: '#fff', fontSize: '13px' }}>{title}：</span>
              <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>{desc}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="fbox-note reveal" style={{ borderLeft: `3px solid ${ACC}` }}>
        <div style={{ fontWeight: 'bold', color: ACC, marginBottom: '6px' }}>📁 提交文件格式</div>
        <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.65)', lineHeight: '1.8' }}>
          <b style={{ color: '#fff' }}>Gerber 文件：</b>行业标准格式，包含各层的几何图形信息（RS-274X）<br />
          <b style={{ color: '#fff' }}>钻孔文件：</b>Excellon 格式，描述所有钻孔位置和尺寸<br />
          <b style={{ color: '#fff' }}>BOM + 坐标文件：</b>SMT贴装需要，元件型号+位置+角度
        </div>
      </div>
    </section>
  );
}
