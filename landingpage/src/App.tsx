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
    <div className="min-h-screen flex flex-col">
      <header className="w-full border-b border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <a href="#hero" className="flex items-center gap-2 focus-outline" aria-label="Go to home / hero section">
            <Globe2 className="w-6 h-6 text-brand-600 dark:text-brand-400" aria-hidden="true" />
            <span className="font-semibold tracking-tight text-slate-800 dark:text-slate-100 font-thai">geodev.fun</span>
          </a>
          <nav className="hidden md:flex items-center gap-6" aria-label="Main navigation">
            <a href="#projects" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 focus-outline font-thai">Project</a>
          </nav>
          <div className="flex items-center gap-3">
            <button onClick={toggle} aria-label="Toggle dark mode" className="btn btn-outline px-3 py-2">
              {dark ? <SunMedium className="w-4 h-4" aria-hidden="true" /> : <Moon className="w-4 h-4" aria-hidden="true" />}
            </button>
            <a href="#projects" className="btn hidden sm:inline-flex font-thai">สำรวจ</a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section id="hero" className="relative overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 -z-20">
          <img
            src="https://images.pexels.com/photos/3094211/pexels-photo-3094211.jpeg"
            alt="Technology and data visualization background"
            className="w-full h-full object-cover"
          />
        </div>
        {/* Overlay */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-slate-900/40 via-slate-800/30 to-slate-900/50 dark:from-slate-950/60 dark:via-slate-900/50 dark:to-slate-950/70" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-32 md:py-40 lg:py-48 flex flex-col lg:flex-row items-center gap-14">
          <div className="flex-1">
            <motion.h1
              className="text-6xl md:text-8xl lg:text-9xl font-extrabold tracking-tight leading-tight mb-6 font-thai text-white"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              GEO<span className="gradient-text">DEV</span>
            </motion.h1>
            <motion.p
              className="max-w-xl text-lg text-slate-200 leading-relaxed mb-8 font-thai"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
            >
              งานวิจัยเล็กๆ ของเด็กภูมิศาสตร์ มช.
            </motion.p>
            <motion.div
              className="flex flex-wrap gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}
            >
              {/* <a href="#projects" className="btn text-base px-7 py-3 font-thai">ดูโครงการทั้งหมด</a> */}
              {/* <a href="#contact" className="btn btn-secondary text-base px-7 py-3 font-thai" aria-label="Scroll to contact CTA">ติดต่อเรา</a> */}
            </motion.div>
          </div>

        </div>
      </section>



      {/* Projects */}
      <section id="projects" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-12">
          {/* <h2 className="section-title mb-3 font-thai"><span className="gradient-text">งานเล็กๆ </span>ที่เล่นใหญ่</h2> */}
          {/* <p className="text-slate-600 dark:text-slate-300 max-w-2xl text-sm font-thai">งานวิจัยเล็กๆ ที่เกี่ยวกับ การประมวลผลภาพ ปัญญาประดิษฐ์ และการวิเคราะห์ข้อมูลเชิงพื้นที่</p> */}
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid md:grid-cols-2 lg:grid-cols-3 gap-6" aria-label="Project list">
          {projects.map((p, i) => (
            <ProjectCard key={p.id} project={p} index={i} />
          ))}
        </div>
      </section>


      <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 py-10 text-sm bg-white/70 dark:bg-slate-900/70 backdrop-blur">

        <div className="mt-8 text-center text-xs text-slate-500 dark:text-slate-500 font-thai">&copy; {new Date().getFullYear()} สงวนลิขสิทธิ์</div>
      </footer>
    </div>
  );
};

export default App;
