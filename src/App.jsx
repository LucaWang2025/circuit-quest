import { useEffect } from 'react';
import { useTheme } from './hooks/useTheme';
import CircuitBg from './components/CircuitBg';
import Nav from './components/Nav';
import Home from './components/sections/Home';
import Voltage from './components/sections/Voltage';
import Current from './components/sections/Current';
import Resistance from './components/sections/Resistance';
import Multimeter from './components/sections/Multimeter';
import Power from './components/sections/Power';
import HomeCkt from './components/sections/HomeCkt';
import Capacitor from './components/sections/Capacitor';
import Transformer from './components/sections/Transformer';
import Wiring from './components/sections/Wiring';
import Outlet from './components/sections/Outlet';
import Safety from './components/sections/Safety';
import Troubleshoot from './components/sections/Troubleshoot';
import BLDCFan from './components/sections/BLDCFan';
import Flashlight from './components/sections/Flashlight';
import Footer from './components/Footer';

export default function App() {
  const { theme, toggle } = useTheme();

  // Scroll reveal
  useEffect(() => {
    const io = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('vis'); }),
      { threshold: 0.12 }
    );
    const timer = setTimeout(() => {
      document.querySelectorAll('.reveal').forEach(el => io.observe(el));
    }, 100);
    return () => { clearTimeout(timer); io.disconnect(); };
  }, []);

  return (
    <>
      <CircuitBg />
      <Nav theme={theme} onToggleTheme={toggle} />
      <main>
        <Home />
        <Voltage />
        <Current />
        <Resistance />
        <Multimeter />
        <Power />
        <HomeCkt />
        <Capacitor />
        <Transformer />
        <Wiring />
        <Outlet />
        <Safety />
        <Troubleshoot />
        <BLDCFan />
        <Flashlight />
        <Footer />
      </main>
    </>
  );
}
