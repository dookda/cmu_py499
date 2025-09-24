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
            <span className="font-semibold tracking-tight text-slate-800 dark:text-slate-100">geodev.fun</span>
          </a>
          <nav className="hidden md:flex items-center gap-6" aria-label="Main navigation">
            <a href="#projects" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 focus-outline">Projects</a>
            <a href="#features" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 focus-outline">Features</a>
            <a href="#contact" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 focus-outline">Contact</a>
          </nav>
          <div className="flex items-center gap-3">
            <button onClick={toggle} aria-label="Toggle dark mode" className="btn btn-outline px-3 py-2">
              {dark ? <SunMedium className="w-4 h-4" aria-hidden="true" /> : <Moon className="w-4 h-4" aria-hidden="true" />}
            </button>
            <a href="#projects" className="btn hidden sm:inline-flex">Explore</a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section id="hero" className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-brand-50 via-white to-brand-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 md:py-28 flex flex-col lg:flex-row items-center gap-14">
          <div className="flex-1">
            <motion.h1
              className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              Geospatial <span className="gradient-text">AI & Developer</span> Project Hub
            </motion.h1>
            <motion.p
              className="max-w-xl text-lg text-slate-600 dark:text-slate-300 leading-relaxed mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
            >
              High‑performance, open tooling & applied machine learning for remote sensing, environmental intelligence &
              realtime geospatial analytics.
            </motion.p>
            <motion.div
              className="flex flex-wrap gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}
            >
              <a href="#projects" className="btn text-base px-7 py-3">View Projects</a>
              <a href="#contact" className="btn btn-secondary text-base px-7 py-3" aria-label="Scroll to contact CTA">Get In Touch</a>
            </motion.div>
          </div>
          <motion.div
            className="flex-1 relative"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="aspect-square max-w-md mx-auto rounded-2xl bg-gradient-to-br from-brand-500/20 via-brand-600/10 to-brand-700/20 dark:from-brand-400/10 dark:via-brand-500/5 dark:to-brand-600/10 p-[2px]">
              <div className="w-full h-full rounded-2xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm flex items-center justify-center">
                <div className="grid grid-cols-3 gap-4 p-6">
                  <div className="w-14 h-14 rounded-lg bg-brand-500/20 flex items-center justify-center text-brand-700 dark:text-brand-300"><Satellite className="w-7 h-7" aria-hidden="true" /></div>
                  <div className="w-14 h-14 rounded-lg bg-brand-500/20 flex items-center justify-center text-brand-700 dark:text-brand-300"><Map className="w-7 h-7" aria-hidden="true" /></div>
                  <div className="w-14 h-14 rounded-lg bg-brand-500/20 flex items-center justify-center text-brand-700 dark:text-brand-300"><Layers3 className="w-7 h-7" aria-hidden="true" /></div>
                  <div className="w-14 h-14 rounded-lg bg-brand-500/20 flex items-center justify-center text-brand-700 dark:text-brand-300"><Cpu className="w-7 h-7" aria-hidden="true" /></div>
                  <div className="col-span-2 w-full h-14 rounded-lg bg-gradient-to-r from-brand-500/30 to-brand-600/30 flex items-center justify-center text-brand-800 dark:text-brand-200 font-semibold text-sm">ML Pipelines</div>
                  <div className="w-14 h-14 rounded-lg bg-brand-500/20 flex items-center justify-center text-brand-700 dark:text-brand-300"><Rocket className="w-7 h-7" aria-hidden="true" /></div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-slate-50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-end justify-between mb-10">
            <h2 className="section-title">Why <span className="gradient-text">geodev.fun</span></h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm hidden md:block">Curated set of high‑impact geospatial & AI utilities focused on performance, clarity and real-world applicability.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <Feature icon={Satellite} title="Remote Sensing ML" description="Optimized model workflows for imagery segmentation, change detection & spectral analytics." />
            <Feature icon={Globe2} title="Scalable Geo APIs" description="Tile & feature services designed for low latency and cloud-edge friendly deployment." delay={0.1} />
            <Feature icon={Map} title="Interactive Visualization" description="Composable mapping + temporal storytelling components with strong accessibility." delay={0.2} />
          </div>
        </div>
      </section>

      {/* Projects */}
      <section id="projects" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-12">
            <h2 className="section-title mb-3">Featured <span className="gradient-text">Projects</span></h2>
            <p className="text-slate-600 dark:text-slate-300 max-w-2xl text-sm">Exactly seven production‑grade experiments & frameworks spanning imagery intelligence, streaming analytics & spatial data infrastructure.</p>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid md:grid-cols-2 lg:grid-cols-3 gap-6" aria-label="Project list">
          {projects.map((p, i) => (
            <ProjectCard key={p.id} project={p} index={i} />
          ))}
        </div>
      </section>

      {/* CTA Band */}
      <section id="contact" className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-brand-600 via-brand-500 to-brand-700 dark:from-brand-500 dark:via-brand-600 dark:to-brand-700 p-8 md:p-14">
            <div className="relative z-10">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Collaborate or Deploy</h2>
              <p className="text-brand-100/90 max-w-2xl mb-8 text-sm md:text-base leading-relaxed">Interested in accelerating geospatial ML pipelines, deploying resilient geo services or co‑building open tooling? Reach out for collaboration or advisory.</p>
              <div className="flex flex-wrap gap-4">
                <a href="mailto:contact@geodev.fun" className="btn bg-white text-brand-700 hover:bg-brand-50" aria-label="Email contact@geodev.fun">Email Us</a>
                <a href="#projects" className="btn btn-outline border-white text-white hover:bg-white/10" aria-label="Scroll to projects">View Projects</a>
              </div>
            </div>
            <div aria-hidden="true" className="absolute -right-10 -bottom-10 w-64 h-64 rounded-full bg-white/10 blur-3xl" />
          </div>
        </div>
      </section>

      <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 py-10 text-sm bg-white/70 dark:bg-slate-900/70 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row gap-6 md:items-center justify-between">
          <div>
            <p className="font-semibold tracking-tight text-slate-800 dark:text-slate-100">geodev.fun</p>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Geospatial & AI developer experiments. Crafted with accessibility & performance.</p>
          </div>
          <div className="flex items-center gap-6">
            <a href="#hero" className="text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 focus-outline">Top</a>
            <a href="#projects" className="text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 focus-outline">Projects</a>
            <a href="#contact" className="text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 focus-outline">Contact</a>
          </div>
        </div>
        <div className="mt-8 text-center text-xs text-slate-500 dark:text-slate-500">&copy; {new Date().getFullYear()} geodev.fun. All rights reserved.</div>
      </footer>
    </div>
  );
};

export default App;
