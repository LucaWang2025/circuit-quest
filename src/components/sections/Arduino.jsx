import { useEffect, useRef, useState } from 'react';

const ACC = '#ffab00';

function ArduinoCanvas({ mode, brightness }) {
  const ref = useRef(null);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const W = 400, H = 290;
    cv.width = W * dpr; cv.height = H * dpr;
    cv.style.width = W + 'px'; cv.style.height = H + 'px';
    const ctx = cv.getContext('2d'); ctx.scale(dpr, dpr);

    let t = 0, raf;
    function draw() {
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = '#0a0f1a'; ctx.fillRect(0, 0, W, H);

      // 主板
      const bx = 20, by = 40, bw = 220, bh = 160;
      ctx.fillStyle = '#0d3320';
      ctx.beginPath(); ctx.roundRect(bx, by, bw, bh, 8); ctx.fill();
      ctx.strokeStyle = '#00e67633'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.roundRect(bx, by, bw, bh, 8); ctx.stroke();

      // 引脚排（数字）
      ctx.fillStyle = '#333';
      for (let i = 0; i < 14; i++) {
        const px = bx + 15 + i * 14;
        ctx.beginPath(); ctx.roundRect(px, by - 10, 10, 12, 2); ctx.fill();
        ctx.fillStyle = '#00e676'; ctx.font = '6px monospace'; ctx.textAlign = 'center';
        ctx.fillText(i, px + 5, by + 6);
        ctx.fillStyle = '#333';
      }

      // 引脚排（模拟）
      for (let i = 0; i < 6; i++) {
        const px = bx + 15 + i * 14;
        ctx.fillStyle = '#222';
        ctx.beginPath(); ctx.roundRect(px, by + bh - 2, 10, 12, 2); ctx.fill();
        ctx.fillStyle = '#ff9800'; ctx.font = '6px monospace'; ctx.textAlign = 'center';
        ctx.fillText(`A${i}`, px + 5, by + bh + 14);
      }

      // USB口
      ctx.fillStyle = '#555';
      ctx.beginPath(); ctx.roundRect(bx - 10, by + bh / 2 - 15, 14, 28, 3); ctx.fill();
      ctx.strokeStyle = '#777'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.roundRect(bx - 10, by + bh / 2 - 15, 14, 28, 3); ctx.stroke();
      ctx.fillStyle = '#666'; ctx.font = '7px monospace'; ctx.textAlign = 'center';
      ctx.fillText('USB', bx - 3, by + bh / 2 + 24);

      // ATmega328P 芯片
      ctx.fillStyle = '#111';
      ctx.beginPath(); ctx.roundRect(bx + 70, by + 50, 70, 50, 4); ctx.fill();
      ctx.strokeStyle = '#555'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.roundRect(bx + 70, by + 50, 70, 50, 4); ctx.stroke();
      ctx.fillStyle = '#888'; ctx.font = '8px monospace'; ctx.textAlign = 'center';
      ctx.fillText('ATmega', bx + 105, by + 72);
      ctx.fillText('328P', bx + 105, by + 84);
      // 芯片引脚小线
      for (let i = 0; i < 7; i++) {
        ctx.strokeStyle = '#444'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(bx + 70, by + 56 + i * 7); ctx.lineTo(bx + 62, by + 56 + i * 7); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(bx + 140, by + 56 + i * 7); ctx.lineTo(bx + 148, by + 56 + i * 7); ctx.stroke();
      }

      // L型LED（D13）
      const ledOn = mode === 'digital' ? Math.sin(t * 0.05) > 0 : mode === 'pwm';
      const ledAlpha = mode === 'pwm' ? brightness / 255 : (ledOn ? 1 : 0);
      ctx.fillStyle = `rgba(255,171,0,${ledAlpha * 0.9 + 0.05})`;
      ctx.beginPath(); ctx.arc(bx + 185, by + 40, 6, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#888'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(bx + 185, by + 40, 6, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = '#888'; ctx.font = '7px monospace'; ctx.textAlign = 'center';
      ctx.fillText('L', bx + 185, by + 40 + 3);
      // 发光效果
      if (ledAlpha > 0.3) {
        const grd = ctx.createRadialGradient(bx + 185, by + 40, 0, bx + 185, by + 40, 20);
        grd.addColorStop(0, `rgba(255,171,0,${ledAlpha * 0.4})`);
        grd.addColorStop(1, 'transparent');
        ctx.fillStyle = grd;
        ctx.beginPath(); ctx.arc(bx + 185, by + 40, 20, 0, Math.PI * 2); ctx.fill();
      }

      // 电路连接
      if (mode === 'digital' || mode === 'pwm') {
        // D13 到 LED 的连线
        ctx.strokeStyle = ledAlpha > 0.5 ? ACC : '#334455';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 3]);
        ctx.beginPath();
        ctx.moveTo(bx + 15 + 13 * 14 + 5, by);
        ctx.lineTo(bx + 15 + 13 * 14 + 5, by - 15);
        ctx.lineTo(bx + 185, by - 15);
        ctx.lineTo(bx + 185, by + 34);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // 面包板区域
      const bbx = 260, bby = 40, bbw = 120, bbh = 130;
      ctx.fillStyle = '#1a1a2a';
      ctx.beginPath(); ctx.roundRect(bbx, bby, bbw, bbh, 6); ctx.fill();
      ctx.strokeStyle = '#2a3a4a'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.roundRect(bbx, bby, bbw, bbh, 6); ctx.stroke();

      // 面包板孔洞
      for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 10; col++) {
          if (col === 4 || col === 5) continue;
          const hx = bbx + 10 + col * 10;
          const hy = bby + 15 + row * 13;
          ctx.fillStyle = row < 4 ? '#2a3a4a' : '#333344';
          ctx.beginPath(); ctx.arc(hx, hy, 2, 0, Math.PI * 2); ctx.fill();
        }
      }

      if (mode !== 'idle') {
        // 面包板上的LED和电阻
        const ledBbX = bbx + 50, ledBbY = bby + 28;
        const resX = bbx + 50, resY = bby + 41;

        // 电阻（绿色矩形）
        ctx.fillStyle = '#8B4513';
        ctx.beginPath(); ctx.roundRect(resX - 4, resY - 3, 22, 6, 2); ctx.fill();
        ctx.strokeStyle = '#ffd700'; ctx.lineWidth = 1;
        for (let i = 0; i < 3; i++) {
          ctx.beginPath(); ctx.moveTo(resX + 3 + i * 5, resY - 3); ctx.lineTo(resX + 3 + i * 5, resY + 3); ctx.stroke();
        }

        // LED
        const bbLedAlpha = ledAlpha;
        ctx.fillStyle = `rgba(255,50,50,${bbLedAlpha * 0.8 + 0.2})`;
        ctx.beginPath(); ctx.arc(ledBbX, ledBbY, 5, 0, Math.PI * 2); ctx.fill();
        if (bbLedAlpha > 0.3) {
          const g2 = ctx.createRadialGradient(ledBbX, ledBbY, 0, ledBbX, ledBbY, 15);
          g2.addColorStop(0, `rgba(255,50,50,${bbLedAlpha * 0.5})`);
          g2.addColorStop(1, 'transparent');
          ctx.fillStyle = g2;
          ctx.beginPath(); ctx.arc(ledBbX, ledBbY, 15, 0, Math.PI * 2); ctx.fill();
        }

        // 连线
        ctx.strokeStyle = '#ff4444'; ctx.lineWidth = 1; ctx.setLineDash([3, 2]);
        ctx.beginPath();
        ctx.moveTo(bx + bw, by + 40);
        ctx.lineTo(bbx + 5, by + 40);
        ctx.lineTo(bbx + 5, ledBbY);
        ctx.lineTo(ledBbX - 5, ledBbY);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = '#888'; ctx.font = '8px monospace'; ctx.textAlign = 'center';
        ctx.fillText('LED', ledBbX, ledBbY + 16);
        ctx.fillText('220Ω', resX + 6, resY + 15);
      }

      // 模式信息
      ctx.textAlign = 'left';
      const modeInfo = {
        idle: { text: '待机模式', color: '#607a90' },
        digital: { text: `数字输出 D13: ${Math.sin(t * 0.05) > 0 ? 'HIGH' : 'LOW'}`, color: '#00e676' },
        pwm: { text: `PWM调光 D~9: ${brightness}`, color: ACC },
        analog: { text: `模拟读取 A0: ${Math.floor(512 + Math.sin(t * 0.02) * 400)}`, color: '#9c7dff' },
      };
      const mi = modeInfo[mode];
      ctx.fillStyle = mi.color; ctx.font = '10px monospace';
      ctx.fillText(`● ${mi.text}`, 10, H - 14);

      t++;
      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(raf);
  }, [mode, brightness]);

  return <canvas ref={ref} style={{ maxWidth: '100%', borderRadius: 12 }} />;
}

export default function Arduino() {
  const [mode, setMode] = useState('idle');
  const [brightness, setBrightness] = useState(128);

  return (
    <section id="arduino" className="sec">
      <div className="sh">
        <span className="sh-icon">⚡</span>
        <div>
          <div className="sh-title">Arduino 入门实战</div>
          <div className="sh-tag">ARDUINO · ATmega328P · GPIO · PWM · ADC</div>
          <div className="sh-sub">开源微控制器 · 数字/模拟IO · 继电器控220V实战</div>
        </div>
      </div>

      <div className="divider" />

      <div className="grid2 reveal">
        <div className="anim-box" style={{ textAlign: 'center' }}>
          <ArduinoCanvas mode={mode} brightness={brightness} />
          <div style={{ marginTop: 10, display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap' }}>
            {[
              { id: 'idle', label: '待机' },
              { id: 'digital', label: '数字IO闪烁' },
              { id: 'pwm', label: 'PWM调光' },
              { id: 'analog', label: '模拟读取' },
            ].map(m => (
              <button key={m.id}
                onClick={() => setMode(m.id)}
                style={{
                  padding: '7px 14px', borderRadius: 16, cursor: 'pointer',
                  border: `1px solid ${mode === m.id ? ACC : 'rgba(255,255,255,.15)'}`,
                  background: mode === m.id ? ACC + '22' : 'transparent',
                  color: mode === m.id ? ACC : 'var(--dim)', fontSize: 11,
                }}
              >{m.label}</button>
            ))}
          </div>
          {mode === 'pwm' && (
            <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center' }}>
              <span style={{ color: 'var(--dim)', fontSize: 12 }}>亮度</span>
              <input type="range" min={0} max={255} value={brightness}
                onChange={e => setBrightness(+e.target.value)}
                style={{ width: 120, accentColor: ACC }} />
              <span style={{ color: ACC, fontSize: 12, width: 30 }}>{brightness}</span>
            </div>
          )}
        </div>

        <div>
          <div className="glass reveal" style={{ marginBottom: 12 }}>
            <div style={{ color: ACC, fontWeight: 700, marginBottom: 8 }}>Arduino Uno 规格</div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <tbody>
                {[
                  ['主控芯片', 'ATmega328P 8位'],
                  ['时钟频率', '16 MHz'],
                  ['Flash存储', '32 KB'],
                  ['SRAM', '2 KB'],
                  ['数字IO', '14路（6路PWM）'],
                  ['模拟输入', '6路 10位ADC'],
                  ['工作电压', '5V（输入7~12V）'],
                  ['最大IO电流', '单脚40mA，总200mA'],
                ].map(([k, v]) => (
                  <tr key={k} style={{ borderBottom: '1px solid rgba(255,255,255,.06)' }}>
                    <td style={{ padding: '5px 4px', color: 'var(--dim)' }}>{k}</td>
                    <td style={{ padding: '5px 4px', color: 'var(--white)' }}>{v}</td>
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
          <div style={{ color: ACC, fontWeight: 700, marginBottom: 10 }}>入门代码示例</div>
          <div style={{ background: '#0d1a0d', borderRadius: 8, padding: 12, fontSize: 11.5, fontFamily: 'monospace', lineHeight: 1.8 }}>
            <div style={{ color: '#607a90' }}>{'// Blink - 第一个Arduino程序'}</div>
            <div><span style={{ color: '#00e676' }}>void</span> <span style={{ color: ACC }}>setup</span>{'() {'}</div>
            <div style={{ paddingLeft: 16 }}><span style={{ color: '#9c7dff' }}>pinMode</span>{'(13, OUTPUT);'}</div>
            <div>{'}'}</div>
            <div style={{ marginTop: 6 }}><span style={{ color: '#00e676' }}>void</span> <span style={{ color: ACC }}>loop</span>{'() {'}</div>
            <div style={{ paddingLeft: 16 }}><span style={{ color: '#9c7dff' }}>digitalWrite</span>{'(13, HIGH);'}</div>
            <div style={{ paddingLeft: 16 }}><span style={{ color: '#9c7dff' }}>delay</span>{'(500);'}</div>
            <div style={{ paddingLeft: 16 }}><span style={{ color: '#9c7dff' }}>digitalWrite</span>{'(13, LOW);'}</div>
            <div style={{ paddingLeft: 16 }}><span style={{ color: '#9c7dff' }}>delay</span>{'(500);'}</div>
            <div>{'}'}</div>
          </div>
          <div style={{ marginTop: 10, background: '#0d1a0d', borderRadius: 8, padding: 12, fontSize: 11.5, fontFamily: 'monospace', lineHeight: 1.8 }}>
            <div style={{ color: '#607a90' }}>{'// PWM调光'}</div>
            <div><span style={{ color: '#9c7dff' }}>analogWrite</span>{'(9, 128);  '}<span style={{ color: '#607a90' }}>{'// 0~255'}</span></div>
            <div style={{ color: '#607a90' }}>{'// ADC读取'}</div>
            <div><span style={{ color: '#00e676' }}>int</span>{' val = '}<span style={{ color: '#9c7dff' }}>analogRead</span>{'(A0); '}<span style={{ color: '#607a90' }}>{'// 0~1023'}</span></div>
          </div>
        </div>

        <div className="glass">
          <div style={{ color: '#00e676', fontWeight: 700, marginBottom: 10 }}>继电器控制220V</div>
          <p style={{ fontSize: 13, lineHeight: 1.8, color: 'var(--dim)', marginBottom: 10 }}>
            Arduino IO（5V/40mA）→ 光耦隔离 → 继电器线圈（5V/70mA） → 继电器触点（250VAC 10A） → 220V家电
          </p>
          <div style={{ background: '#0d1a0d', borderRadius: 8, padding: 12, fontSize: 11.5, fontFamily: 'monospace', lineHeight: 1.8 }}>
            <div style={{ color: '#607a90' }}>{'// 继电器控制示例'}</div>
            <div><span style={{ color: '#9c7dff' }}>pinMode</span>{'(7, OUTPUT);'}</div>
            <div><span style={{ color: '#9c7dff' }}>digitalWrite</span>{'(7, HIGH); '}<span style={{ color: '#607a90' }}>{'// 闭合'}</span></div>
            <div><span style={{ color: '#9c7dff' }}>delay</span>{'(3000);'}</div>
            <div><span style={{ color: '#9c7dff' }}>digitalWrite</span>{'(7, LOW);  '}<span style={{ color: '#607a90' }}>{'// 断开'}</span></div>
          </div>
          <div className="fbox" style={{ marginTop: 10 }}>
            <div className="fbox-f">⚠️ 安全提示</div>
            <div className="fbox-desc">使用光耦隔离模块，禁止直接连接220V到Arduino引脚</div>
          </div>
        </div>
      </div>

      <div className="divider" />

      <div className="glass reveal">
        <div style={{ color: '#9c7dff', fontWeight: 700, marginBottom: 10 }}>常用传感器与库</div>
        <div className="grid2" style={{ fontSize: 12, gap: 10 }}>
          {[
            { name: 'DHT11/DHT22', desc: '温湿度传感器，数字协议，精度±2%', lib: '#include <DHT.h>' },
            { name: 'HC-SR04', desc: '超声波测距，Trigger/Echo接法，0.2~4m', lib: 'pulseIn(echo, HIGH)' },
            { name: 'OLED 0.96"', desc: 'I2C接口，SDA/SCL，128×64像素', lib: '#include <Adafruit_SSD1306.h>' },
            { name: 'MPU-6050', desc: '六轴陀螺仪+加速度，I2C接口', lib: '#include <MPU6050.h>' },
            { name: 'ESP8266', desc: 'WiFi模块，串口AT命令或直接编程', lib: 'AT+CWJAP="SSID","pwd"' },
            { name: 'NeoPixel', desc: 'WS2812B RGB灯带，单线控制协议', lib: '#include <Adafruit_NeoPixel.h>' },
          ].map(s => (
            <div key={s.name} style={{ padding: '8px 10px', borderRadius: 8, background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.06)' }}>
              <div style={{ color: 'var(--white)', fontWeight: 600, marginBottom: 2 }}>{s.name}</div>
              <div style={{ color: 'var(--dim)', marginBottom: 4 }}>{s.desc}</div>
              <div style={{ color: '#00e676', fontFamily: 'monospace', fontSize: 10 }}>{s.lib}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
