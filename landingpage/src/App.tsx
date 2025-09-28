import React from 'react';
import { motion } from 'framer-motion';
import { Globe2, Satellite, Map, Moon, SunMedium, Rocket, Layers3, Cpu } from 'lucide-react';
import Feature from './components/Feature';
import ProjectCard from './components/ProjectCard';
import { projects } from './data/projects';

const useDarkMode = () => {
  const [dark, setDark] = React.useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const stored = localStorage.getItem('theme');
    if (stored) return stored === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  React.useEffect(() => {
    const root = document.documentElement;
    if (dark) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [dark]);

  return { dark, toggle: () => setDark(d => !d) };
};

const App: React.FC = () => {
  const { dark, toggle } = useDarkMode();

  return (
    <div className="d-flex flex-column min-vh-100">
      <header className={`navbar navbar-expand-lg ${dark ? 'navbar-dark' : 'navbar-light'} navbar-transparent sticky-top`}>
        <div className="container-fluid">
          <a href="#hero" className="navbar-brand d-flex align-items-center" aria-label="Go to home / hero section">
            <Globe2 className="me-2" size={24} aria-hidden="true" />
            <span className="fw-bold font-thai">geodev.fun</span>
          </a>
          <nav className="navbar-nav d-none d-md-flex flex-row gap-4" aria-label="Main navigation">
            <a href="#projects" className="nav-link font-thai">Projects</a>
          </nav>
          <div className="d-flex align-items-center gap-2">
            <button
              onClick={toggle}
              aria-label="Toggle dark mode"
              className={`btn ${dark ? 'btn-outline-light' : 'btn-outline-secondary'}`}
            >
              {dark ? <SunMedium size={16} aria-hidden="true" /> : <Moon size={16} aria-hidden="true" />}
            </button>
            <a href="#projects" className="btn btn-primary d-none d-sm-inline font-thai"> 🤖</a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section id="hero" className="position-relative overflow-hidden hero-bg">
        <div className="container-fluid">
          <div className="row min-vh-100 align-items-center justify-content-center py-5">
            <div className="col-12 text-center">
              <motion.h1
                className="hero-title fw-bold text-white mb-4 font-thai"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
              >
                GEO<span className="gradient-text">DEV</span>
              </motion.h1>
              <motion.p
                className="lead text-light mb-4 font-thai fs-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1 }}
              >
                {/* วิจัยเล่มเล็กของเด็กจีออ */}
              </motion.p>
              <motion.div
                className="d-flex flex-wrap justify-content-center gap-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.15 }}
              >
                {/* <a href="#projects" className="btn btn-primary btn font-thai">Projects</a> */}
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Projects */}
      <section id="projects" className={`py-5 ${dark ? 'bg-dark' : 'bg-light'}`}>
        <div className="container">
          <div className="row mb-5">
            <div className="col-12 text-center">
              <h4 className="display-4 fw-bold font-thai mb-3">
                การค้นคว้าอิสระ<span className="gradient-text">เชิงภูมิศาสตร์</span>
              </h4>
              <p className={`lead ${dark ? 'text-light' : 'text-muted'} font-thai`}>
                วิจัยเล่มเล็กของเด็กจีออ ระบบฐานข้อมูล การประมวลผลภาพ ปัญญาประดิษฐ์ และการวิเคราะห์ข้อมูลเชิงพื้นที่
              </p>
            </div>
          </div>
          <div className="row g-4" aria-label="Project list">
            {projects.map((p, i) => (
              <div key={p.id} className="col-md-6 col-lg-4">
                <ProjectCard project={p} index={i} />
              </div>
            ))}
          </div>
        </div>
      </section>


      <footer className={`${dark ? 'bg-black text-light' : 'bg-dark text-light'} py-4 border-top`}>
        <div className="container">
          <div className="text-center">
            <small className="font-thai">&copy; {new Date().getFullYear()} สงวนลิขสิทธิ์</small>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
