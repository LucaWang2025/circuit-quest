import { useState, useEffect, useCallback } from 'react';
import { useTheme } from './hooks/useTheme';
import { useProgress } from './hooks/useProgress';
import { NavContext } from './NavContext';
import { ALL_SECS, SEC_CATEGORY } from './secs';

import CircuitBg from './components/CircuitBg';
import Nav from './components/Nav';
import Footer from './components/Footer';
import ProgressBar from './components/ProgressBar';
import CompleteButton from './components/CompleteButton';

import Home          from './components/sections/Home';
import Voltage       from './components/sections/Voltage';
import AcDc          from './components/sections/AcDc';
import SeriesParallel from './components/sections/SeriesParallel';
import OhmsLaw       from './components/sections/OhmsLaw';
import Kirchhoff     from './components/sections/Kirchhoff';
import GroundNeutral from './components/sections/GroundNeutral';
import Current       from './components/sections/Current';
import Resistance    from './components/sections/Resistance';
import Multimeter    from './components/sections/Multimeter';
import Power         from './components/sections/Power';
import Capacitor     from './components/sections/Capacitor';
import Inductor      from './components/sections/Inductor';
import Diode         from './components/sections/Diode';
import Transistor    from './components/sections/Transistor';
import Transformer   from './components/sections/Transformer';
import Schematic     from './components/sections/Schematic';
import HomeCkt       from './components/sections/HomeCkt';
import Wiring        from './components/sections/Wiring';
import Outlet        from './components/sections/Outlet';
import BreakPanel    from './components/sections/BreakPanel';
import Relay         from './components/sections/Relay';
import AirCon        from './components/sections/AirCon';
import LowVoltage    from './components/sections/LowVoltage';
import FloorHeat     from './components/sections/FloorHeat';
import Safety        from './components/sections/Safety';
import Troubleshoot  from './components/sections/Troubleshoot';
import BLDCFan       from './components/sections/BLDCFan';
import Flashlight    from './components/sections/Flashlight';
import DeskLamp      from './components/sections/DeskLamp';
import Kettle        from './components/sections/Kettle';
import HairDryer     from './components/sections/HairDryer';
import PowerBank     from './components/sections/PowerBank';
import Router        from './components/sections/Router';
import RiceCooker    from './components/sections/RiceCooker';
import WashingMachine from './components/sections/WashingMachine';
import BTSpeaker     from './components/sections/BTSpeaker';
import WirelessCharge from './components/sections/WirelessCharge';
import EToothbrush   from './components/sections/EToothbrush';
import RobotVacuum   from './components/sections/RobotVacuum';
import Soldering     from './components/sections/Soldering';
import Oscilloscope  from './components/sections/Oscilloscope';
import Breadboard    from './components/sections/Breadboard';
import PCB           from './components/sections/PCB';
import Arduino       from './components/sections/Arduino';

const SECTION_MAP = {
  home:             Home,
  voltage:          Voltage,
  'ac-dc':          AcDc,
  'series-parallel': SeriesParallel,
  'ohms-law':       OhmsLaw,
  kirchhoff:        Kirchhoff,
  'ground-neutral': GroundNeutral,
  current:          Current,
  resistance:       Resistance,
  multimeter:       Multimeter,
  power:            Power,
  capacitor:        Capacitor,
  inductor:         Inductor,
  diode:            Diode,
  transistor:       Transistor,
  transformer:      Transformer,
  schematic:        Schematic,
  'home-ckt':       HomeCkt,
  wiring:           Wiring,
  outlet:           Outlet,
  'break-panel':    BreakPanel,
  relay:            Relay,
  aircon:           AirCon,
  'low-voltage':    LowVoltage,
  'floor-heat':     FloorHeat,
  safety:           Safety,
  troubleshoot:     Troubleshoot,
  'bldc-fan':       BLDCFan,
  flashlight:       Flashlight,
  'desk-lamp':      DeskLamp,
  kettle:           Kettle,
  'hair-dryer':     HairDryer,
  'power-bank':     PowerBank,
  router:           Router,
  'rice-cooker':    RiceCooker,
  'washing-machine': WashingMachine,
  'bt-speaker':     BTSpeaker,
  'wireless-charge': WirelessCharge,
  'e-toothbrush':   EToothbrush,
  'robot-vacuum':   RobotVacuum,
  soldering:        Soldering,
  oscilloscope:     Oscilloscope,
  breadboard:       Breadboard,
  pcb:              PCB,
  arduino:          Arduino,
};

function BottomNav({ currentId, onNavigate }) {
  const idx = ALL_SECS.findIndex(s => s.id === currentId);
  const prev = idx > 0 ? ALL_SECS[idx - 1] : null;
  const next = idx < ALL_SECS.length - 1 ? ALL_SECS[idx + 1] : null;
  const cat  = SEC_CATEGORY[currentId];

  const btnStyle = (sec) => ({
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '10px 20px', borderRadius: 12,
    border: `1px solid ${sec ? 'rgba(255,255,255,.12)' : 'transparent'}`,
    background: sec ? 'rgba(255,255,255,.04)' : 'transparent',
    color: sec ? 'var(--dim)' : 'transparent',
    cursor: sec ? 'pointer' : 'default',
    font: '13px/1 inherit', transition: 'all .2s', flexShrink: 0,
  });

  return (
    <div style={{ maxWidth: 1240, margin: '0 auto', padding: '20px 48px 44px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>

      <button
        onClick={() => prev && onNavigate(prev.id)} disabled={!prev}
        style={btnStyle(prev)}
        onMouseEnter={e => { if (prev) e.currentTarget.style.borderColor = `${SEC_CATEGORY[prev.id]?.color}55`; }}
        onMouseLeave={e => { if (prev) e.currentTarget.style.borderColor = 'rgba(255,255,255,.12)'; }}
      >
        ←&nbsp;<span style={{ fontSize: 11, opacity: .6 }}>上一节</span>
        &nbsp;<strong>{prev?.label}</strong>
      </button>

      <div style={{ textAlign: 'center', flex: 1, minWidth: 0 }}>
        <div style={{ font: '10px "Courier New",monospace', color: cat?.color ?? 'var(--dim)',
          letterSpacing: 2, marginBottom: 6 }}>{cat?.label?.toUpperCase()}</div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 4, flexWrap: 'wrap' }}>
          {ALL_SECS.map(s => (
            <button key={s.id} onClick={() => onNavigate(s.id)} style={{
              width: s.id === currentId ? 22 : 7, height: 7, borderRadius: 4,
              border: 'none', cursor: 'pointer', padding: 0,
              background: s.id === currentId
                ? (SEC_CATEGORY[s.id]?.color ?? '#00e5ff')
                : SEC_CATEGORY[s.id]?.id === cat?.id
                  ? 'rgba(255,255,255,.2)'
                  : 'rgba(255,255,255,.07)',
              transition: 'all .25s',
            }} />
          ))}
        </div>
      </div>

      <button
        onClick={() => next && onNavigate(next.id)} disabled={!next}
        style={btnStyle(next)}
        onMouseEnter={e => { if (next) e.currentTarget.style.borderColor = `${SEC_CATEGORY[next.id]?.color}55`; }}
        onMouseLeave={e => { if (next) e.currentTarget.style.borderColor = 'rgba(255,255,255,.12)'; }}
      >
        <strong>{next?.label}</strong>&nbsp;
        <span style={{ fontSize: 11, opacity: .6 }}>下一节</span>&nbsp;→
      </button>
    </div>
  );
}

export default function App() {
  const { theme, toggle } = useTheme();
  const [activeSection, setActiveSection] = useState('home');
  const { markCompleted, isCompleted, completedCount, totalCount } = useProgress(ALL_SECS);

  const navigate = useCallback(id => {
    setActiveSection(id);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  useEffect(() => {
    const io = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('vis'); }),
      { threshold: 0.1 }
    );
    const timer = setTimeout(() => {
      document.querySelectorAll('.reveal').forEach(el => io.observe(el));
    }, 80);
    return () => { clearTimeout(timer); io.disconnect(); };
  }, [activeSection]);

  const ActiveComponent = SECTION_MAP[activeSection] ?? Home;

  return (
    <NavContext.Provider value={navigate}>
      <CircuitBg />
      <Nav theme={theme} onToggleTheme={toggle} activeSection={activeSection} onNavigate={navigate}>
        <ProgressBar completed={completedCount} total={totalCount} />
      </Nav>
      <main>
        <div key={activeSection} className="sec-fade">
          <ActiveComponent />
          {activeSection !== 'home' && (
            <CompleteButton sectionId={activeSection} isCompleted={isCompleted} onComplete={markCompleted} />
          )}
        </div>
        <BottomNav currentId={activeSection} onNavigate={navigate} />
        {activeSection === 'home' && <Footer onNavigate={navigate} />}
      </main>
    </NavContext.Provider>
  );
}
