import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import {
  MapPin, Mail, Github, Linkedin, Twitter, ExternalLink, Code2,
  Briefcase, Star, Send, ChevronDown, Sun, Cloud, CloudRain, Moon,
  Sunrise, Sunset, Wind, Droplets, Thermometer, Quote,
} from 'lucide-react';
import data from '../../../../data/dummy_data.json';

// ─── Time-of-Day Engine ──────────────────────────────────────────────────────

function getTimeSlot(hour) {
  if (hour >= 5 && hour < 8)   return 'dawn';
  if (hour >= 8 && hour < 12)  return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 20) return 'evening';
  return 'night';
}

const THEMES = {
  dawn: {
    bg: 'from-rose-950 via-orange-900 to-amber-800',
    card: 'bg-orange-900/30 border-orange-400/20',
    accent: 'text-amber-300',
    accentBg: 'bg-amber-400/20',
    badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    bar: 'bg-gradient-to-r from-amber-400 to-rose-400',
    nav: 'bg-rose-950/80 border-orange-400/20',
    button: 'bg-amber-500 hover:bg-amber-400 text-rose-950',
    icon: Sun,
    label: 'Dawn',
    particle: 'dawn',
    prose: 'text-orange-100',
    muted: 'text-orange-200/70',
    ring: 'ring-amber-400/40',
  },
  morning: {
    bg: 'from-sky-200 via-blue-100 to-white',
    card: 'bg-white/40 border-sky-200/60',
    accent: 'text-sky-600',
    accentBg: 'bg-sky-100/80',
    badge: 'bg-sky-100 text-sky-700 border-sky-200',
    bar: 'bg-gradient-to-r from-sky-400 to-blue-500',
    nav: 'bg-white/70 border-sky-200/50',
    button: 'bg-sky-500 hover:bg-sky-400 text-white',
    icon: Sunrise,
    label: 'Morning',
    particle: 'morning',
    prose: 'text-slate-700',
    muted: 'text-slate-500',
    ring: 'ring-sky-400/40',
  },
  afternoon: {
    bg: 'from-sky-400 via-blue-300 to-cyan-200',
    card: 'bg-white/30 border-white/40',
    accent: 'text-blue-700',
    accentBg: 'bg-white/40',
    badge: 'bg-blue-100/80 text-blue-700 border-blue-200',
    bar: 'bg-gradient-to-r from-blue-500 to-cyan-400',
    nav: 'bg-sky-500/80 border-white/20',
    button: 'bg-blue-600 hover:bg-blue-500 text-white',
    icon: Sun,
    label: 'Afternoon',
    particle: 'afternoon',
    prose: 'text-slate-800',
    muted: 'text-slate-600',
    ring: 'ring-blue-400/40',
  },
  evening: {
    bg: 'from-purple-950 via-orange-900 to-rose-800',
    card: 'bg-purple-900/30 border-purple-400/20',
    accent: 'text-orange-300',
    accentBg: 'bg-orange-400/20',
    badge: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
    bar: 'bg-gradient-to-r from-orange-400 to-purple-500',
    nav: 'bg-purple-950/80 border-orange-400/20',
    button: 'bg-orange-500 hover:bg-orange-400 text-white',
    icon: Sunset,
    label: 'Evening',
    particle: 'rain',
    prose: 'text-orange-100',
    muted: 'text-orange-200/60',
    ring: 'ring-orange-400/40',
  },
  night: {
    bg: 'from-slate-950 via-indigo-950 to-slate-900',
    card: 'bg-indigo-950/40 border-indigo-400/15',
    accent: 'text-indigo-300',
    accentBg: 'bg-indigo-400/10',
    badge: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    bar: 'bg-gradient-to-r from-indigo-400 to-violet-500',
    nav: 'bg-slate-950/90 border-indigo-400/15',
    button: 'bg-indigo-500 hover:bg-indigo-400 text-white',
    icon: Moon,
    label: 'Night',
    particle: 'stars',
    prose: 'text-indigo-100',
    muted: 'text-indigo-200/60',
    ring: 'ring-indigo-400/40',
  },
};

// ─── Particle / Weather Layers ───────────────────────────────────────────────

function StarField() {
  const stars = useMemo(() =>
    Array.from({ length: 80 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 0.5,
      delay: Math.random() * 4,
      dur: Math.random() * 3 + 2,
    })), []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {stars.map((s) => (
        <motion.div
          key={s.id}
          className="absolute rounded-full bg-white"
          style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.size, height: s.size }}
          animate={{ opacity: [0.2, 1, 0.2] }}
          transition={{ duration: s.dur, delay: s.delay, repeat: Infinity }}
        />
      ))}
    </div>
  );
}

function RainLayer() {
  const drops = useMemo(() =>
    Array.from({ length: 60 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 2,
      dur: Math.random() * 0.8 + 0.6,
      h: Math.random() * 14 + 8,
    })), []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {drops.map((d) => (
        <motion.div
          key={d.id}
          className="absolute w-px bg-gradient-to-b from-transparent via-blue-300/60 to-transparent rounded-full"
          style={{ left: `${d.x}%`, height: d.h, top: -20 }}
          animate={{ y: ['0vh', '110vh'] }}
          transition={{ duration: d.dur, delay: d.delay, repeat: Infinity, ease: 'linear' }}
        />
      ))}
    </div>
  );
}

function CloudLayer({ count = 4, opacity = 0.15 }) {
  const clouds = useMemo(() =>
    Array.from({ length: count }, (_, i) => ({
      id: i,
      y: Math.random() * 30 + 5,
      scale: Math.random() * 0.6 + 0.6,
      dur: Math.random() * 30 + 30,
      start: -(Math.random() * 30 + 20),
    })), [count]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {clouds.map((c) => (
        <motion.div
          key={c.id}
          className="absolute"
          style={{ top: `${c.y}%`, scale: c.scale, opacity }}
          animate={{ x: [`${c.start}vw`, '120vw'] }}
          transition={{ duration: c.dur, repeat: Infinity, ease: 'linear' }}
        >
          <svg width="160" height="60" viewBox="0 0 160 60" fill="white">
            <ellipse cx="80" cy="45" rx="70" ry="15" />
            <ellipse cx="55" cy="38" rx="35" ry="22" />
            <ellipse cx="95" cy="35" rx="40" ry="25" />
            <ellipse cx="115" cy="42" rx="28" ry="18" />
          </svg>
        </motion.div>
      ))}
    </div>
  );
}

function SunGlow() {
  return (
    <div className="absolute top-12 right-16 pointer-events-none">
      <motion.div
        className="w-28 h-28 rounded-full bg-yellow-300/80"
        animate={{ scale: [1, 1.08, 1], opacity: [0.8, 1, 0.8] }}
        transition={{ duration: 4, repeat: Infinity }}
        style={{ boxShadow: '0 0 60px 30px rgba(253,224,71,0.4)' }}
      />
    </div>
  );
}

function MoonGlow() {
  return (
    <div className="absolute top-12 right-20 pointer-events-none">
      <motion.div
        className="w-20 h-20 rounded-full bg-indigo-100/90"
        animate={{ opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 6, repeat: Infinity }}
        style={{ boxShadow: '0 0 40px 20px rgba(199,210,254,0.25)' }}
      />
    </div>
  );
}

function WeatherParticles({ slot }) {
  if (slot === 'stars' || slot === 'night') return <StarField />;
  if (slot === 'rain')    return <RainLayer />;
  if (slot === 'morning') return <CloudLayer count={3} opacity={0.25} />;
  if (slot === 'afternoon') return (
    <>
      <SunGlow />
      <CloudLayer count={4} opacity={0.3} />
    </>
  );
  if (slot === 'dawn')    return <CloudLayer count={3} opacity={0.12} />;
  return null;
}

// ─── Navigation ──────────────────────────────────────────────────────────────

const NAV_ITEMS = ['about', 'skills', 'projects', 'experience', 'testimonials', 'contact'];

function Navbar({ theme, active }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <motion.nav
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.4 }}
      className={`fixed top-0 left-0 right-0 z-50 px-6 py-3 flex items-center justify-between backdrop-blur-md border-b transition-all duration-300 ${theme.nav} ${scrolled ? 'shadow-lg' : ''}`}
    >
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className={`font-bold tracking-tight text-sm ${theme.accent}`}
      >
        {data.personal.name.split(' ')[0]}
        <span className={theme.muted}>.dev</span>
      </button>

      <div className="hidden sm:flex items-center gap-1">
        {NAV_ITEMS.map((item) => (
          <button
            key={item}
            onClick={() => scrollTo(item)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
              active === item
                ? `${theme.accentBg} ${theme.accent}`
                : `${theme.muted} hover:${theme.accent}`
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      <div className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border ${theme.badge}`}>
        {React.createElement(theme.icon, { size: 12 })}
        <span>{theme.label}</span>
      </div>
    </motion.nav>
  );
}

// ─── Section Wrapper ─────────────────────────────────────────────────────────

function Section({ id, children, className = '' }) {
  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6 }}
      className={`max-w-5xl mx-auto px-6 py-20 ${className}`}
    >
      {children}
    </motion.section>
  );
}

function SectionTitle({ theme, children }) {
  return (
    <h2 className={`text-3xl md:text-4xl font-bold mb-12 ${theme.prose}`}>
      {children}
      <span className={theme.accent}>.</span>
    </h2>
  );
}

// ─── Hero ────────────────────────────────────────────────────────────────────

function Hero({ theme, slot }) {
  const isLight = slot === 'morning' || slot === 'afternoon';

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-20 pb-16 text-center overflow-hidden">
      <WeatherParticles slot={theme.particle} />
      {slot === 'night' && <MoonGlow />}

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7 }}
        className="relative z-10 flex flex-col items-center"
      >
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`inline-flex items-center gap-2 text-xs font-semibold px-4 py-1.5 rounded-full border mb-8 ${theme.badge}`}
        >
          {React.createElement(theme.icon, { size: 13 })}
          {theme.label} — {data.personal.location}
        </motion.div>

        <motion.img
          src={data.personal.avatar}
          alt={data.personal.name}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 120 }}
          className={`w-28 h-28 rounded-full object-cover mb-6 ring-4 ${theme.ring} shadow-2xl`}
        />

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className={`text-5xl md:text-7xl font-extrabold tracking-tight mb-4 ${theme.prose}`}
        >
          {data.personal.name}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className={`text-lg md:text-xl font-medium mb-6 ${theme.accent}`}
        >
          {data.personal.title}
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className={`max-w-xl text-sm md:text-base leading-relaxed mb-10 ${theme.muted}`}
        >
          {data.personal.bio}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="flex flex-wrap gap-3 justify-center mb-10"
        >
          <a
            href={data.socials.github}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${theme.button} shadow-lg hover:shadow-xl hover:-translate-y-0.5`}
          >
            <Github size={16} /> GitHub
          </a>
          <a
            href={data.socials.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold border transition-all ${theme.card} ${theme.prose} hover:-translate-y-0.5`}
          >
            <Linkedin size={16} /> LinkedIn
          </a>
          <a
            href={`mailto:${data.personal.email}`}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold border transition-all ${theme.card} ${theme.prose} hover:-translate-y-0.5`}
          >
            <Mail size={16} /> Email
          </a>
        </motion.div>

        <div className={`grid grid-cols-3 gap-8 text-center`}>
          {[
            { label: 'Years Exp.', value: data.stats.yearsExperience + '+' },
            { label: 'Projects', value: data.stats.projectsCompleted + '+' },
            { label: 'Happy Clients', value: data.stats.happyClients + '+' },
          ].map(({ label, value }) => (
            <div key={label}>
              <div className={`text-3xl font-extrabold ${theme.accent}`}>{value}</div>
              <div className={`text-xs mt-1 ${theme.muted}`}>{label}</div>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className={`absolute bottom-8 ${theme.muted}`}
        onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
        role="button"
        aria-label="Scroll down"
      >
        <ChevronDown size={28} />
      </motion.div>
    </section>
  );
}

// ─── About ───────────────────────────────────────────────────────────────────

function About({ theme }) {
  return (
    <Section id="about">
      <SectionTitle theme={theme}>About Me</SectionTitle>
      <div className="grid md:grid-cols-2 gap-10 items-center">
        <div className="space-y-4">
          <p className={`text-base leading-relaxed ${theme.prose}`}>{data.personal.bio}</p>
          <div className={`flex items-center gap-2 text-sm ${theme.muted}`}>
            <MapPin size={14} className={theme.accent} />
            {data.personal.location}
          </div>
          <div className={`flex items-center gap-2 text-sm ${theme.muted}`}>
            <Mail size={14} className={theme.accent} />
            {data.personal.email}
          </div>
        </div>
        <div className={`p-6 rounded-2xl border backdrop-blur-sm ${theme.card}`}>
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: Thermometer, label: 'Experience', val: `${data.stats.yearsExperience}+ Years` },
              { icon: Code2, label: 'Projects', val: `${data.stats.projectsCompleted}+ Built` },
              { icon: Wind, label: 'Clients', val: `${data.stats.happyClients}+ Served` },
              { icon: Droplets, label: 'Skills', val: `${data.skills.length} Tools` },
            ].map(({ icon: Icon, label, val }) => (
              <div key={label} className={`p-4 rounded-xl ${theme.accentBg} text-center`}>
                <Icon size={20} className={`${theme.accent} mx-auto mb-2`} />
                <div className={`text-xs ${theme.muted} mb-1`}>{label}</div>
                <div className={`text-sm font-bold ${theme.prose}`}>{val}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}

// ─── Skills ──────────────────────────────────────────────────────────────────

function Skills({ theme }) {
  const categories = useMemo(() => {
    const map = {};
    data.skills.forEach((s) => {
      if (!map[s.category]) map[s.category] = [];
      map[s.category].push(s);
    });
    return map;
  }, []);

  return (
    <Section id="skills">
      <SectionTitle theme={theme}>Skills</SectionTitle>
      <div className="space-y-10">
        {Object.entries(categories).map(([cat, skills]) => (
          <div key={cat}>
            <h3 className={`text-xs font-semibold uppercase tracking-widest mb-4 ${theme.muted}`}>{cat}</h3>
            <div className="space-y-3">
              {skills.map((skill, i) => (
                <motion.div
                  key={skill.name}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07 }}
                >
                  <div className="flex justify-between mb-1.5">
                    <span className={`text-sm font-medium ${theme.prose}`}>{skill.name}</span>
                    <span className={`text-xs ${theme.muted}`}>{skill.level}%</span>
                  </div>
                  <div className={`h-1.5 rounded-full ${theme.accentBg} overflow-hidden`}>
                    <motion.div
                      className={`h-full rounded-full ${theme.bar}`}
                      initial={{ width: 0 }}
                      whileInView={{ width: `${skill.level}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.9, delay: i * 0.07, ease: 'easeOut' }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

// ─── Projects ────────────────────────────────────────────────────────────────

function Projects({ theme }) {
  return (
    <Section id="projects">
      <SectionTitle theme={theme}>Projects</SectionTitle>
      <div className="grid md:grid-cols-2 gap-6">
        {data.projects.map((project, i) => (
          <motion.div
            key={project.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className={`group rounded-2xl border overflow-hidden backdrop-blur-sm ${theme.card} hover:scale-[1.02] transition-transform duration-300`}
          >
            <div className="relative h-44 overflow-hidden">
              <img
                src={project.image}
                alt={project.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              {project.featured && (
                <span className={`absolute top-3 left-3 text-xs px-2.5 py-1 rounded-full border font-semibold ${theme.badge}`}>
                  Featured
                </span>
              )}
            </div>
            <div className="p-5">
              <h3 className={`text-lg font-bold mb-2 ${theme.prose}`}>{project.title}</h3>
              <p className={`text-sm leading-relaxed mb-4 ${theme.muted}`}>{project.description}</p>
              <div className="flex flex-wrap gap-1.5 mb-4">
                {project.techStack.map((tech) => (
                  <span key={tech} className={`text-xs px-2.5 py-1 rounded-lg border font-medium ${theme.badge}`}>
                    {tech}
                  </span>
                ))}
              </div>
              <div className="flex gap-3">
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${theme.button}`}
                >
                  <ExternalLink size={12} /> Live
                </a>
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all ${theme.card} ${theme.prose}`}
                >
                  <Github size={12} /> Code
                </a>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}

// ─── Experience ───────────────────────────────────────────────────────────────

function Experience({ theme }) {
  return (
    <Section id="experience">
      <SectionTitle theme={theme}>Experience</SectionTitle>
      <div className="relative">
        <div className={`absolute left-3 top-0 bottom-0 w-px ${theme.accentBg}`} />
        <div className="space-y-10 pl-10">
          {data.experience.map((exp, i) => (
            <motion.div
              key={exp.company}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="relative"
            >
              <div className={`absolute -left-[2.35rem] top-1.5 w-3 h-3 rounded-full border-2 ${theme.button.includes('bg-') ? 'bg-current' : ''} ${theme.accent} border-current`} />
              <div className={`p-5 rounded-2xl border backdrop-blur-sm ${theme.card}`}>
                <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                  <div>
                    <h3 className={`text-base font-bold ${theme.prose}`}>{exp.role}</h3>
                    <p className={`text-sm font-medium ${theme.accent}`}>{exp.company}</p>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full border ${theme.badge}`}>
                    {exp.period}
                  </span>
                </div>
                <p className={`text-sm leading-relaxed ${theme.muted}`}>{exp.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </Section>
  );
}

// ─── Testimonials ────────────────────────────────────────────────────────────

function Testimonials({ theme }) {
  return (
    <Section id="testimonials">
      <SectionTitle theme={theme}>Testimonials</SectionTitle>
      <div className="grid md:grid-cols-3 gap-6">
        {data.testimonials.map((t, i) => (
          <motion.div
            key={t.name}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.12 }}
            className={`p-6 rounded-2xl border backdrop-blur-sm flex flex-col gap-4 ${theme.card}`}
          >
            <Quote size={20} className={`${theme.accent} opacity-60`} />
            <p className={`text-sm leading-relaxed flex-1 ${theme.muted}`}>{t.text}</p>
            <div className="flex items-center gap-3">
              <img
                src={t.avatar}
                alt={t.name}
                className={`w-10 h-10 rounded-full ring-2 ${theme.ring}`}
              />
              <div>
                <div className={`text-sm font-bold ${theme.prose}`}>{t.name}</div>
                <div className={`text-xs ${theme.muted}`}>{t.role}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}

// ─── Contact ─────────────────────────────────────────────────────────────────

function Contact({ theme }) {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    setSent(true);
  };

  const inputClass = `w-full px-4 py-3 rounded-xl text-sm border backdrop-blur-sm outline-none transition-all focus:ring-2 ${theme.card} ${theme.prose} focus:${theme.ring}`;

  return (
    <Section id="contact">
      <SectionTitle theme={theme}>Get in Touch</SectionTitle>
      <div className="grid md:grid-cols-2 gap-12">
        <div className="space-y-6">
          <p className={`text-base leading-relaxed ${theme.muted}`}>
            Have a project in mind or just want to say hello? Drop a message and I'll get back to you.
          </p>
          {[
            { icon: Mail, label: data.personal.email, href: `mailto:${data.personal.email}` },
            { icon: Github, label: 'GitHub', href: data.socials.github },
            { icon: Linkedin, label: 'LinkedIn', href: data.socials.linkedin },
            { icon: Twitter, label: 'Twitter', href: data.socials.twitter },
          ].map(({ icon: Icon, label, href }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-3 text-sm font-medium transition-all hover:-translate-x-1 ${theme.prose}`}
            >
              <span className={`p-2 rounded-lg ${theme.accentBg}`}>
                <Icon size={16} className={theme.accent} />
              </span>
              {label}
            </a>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {sent ? (
            <motion.div
              key="thanks"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`flex flex-col items-center justify-center p-10 rounded-2xl border text-center ${theme.card}`}
            >
              <Star size={40} className={`${theme.accent} mb-4`} />
              <h3 className={`text-xl font-bold mb-2 ${theme.prose}`}>Message Sent!</h3>
              <p className={`text-sm ${theme.muted}`}>Thanks for reaching out. I'll reply soon.</p>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              onSubmit={handleSubmit}
              className="space-y-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <input
                type="text"
                placeholder="Your Name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className={inputClass}
                required
              />
              <input
                type="email"
                placeholder="Email Address"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                className={inputClass}
                required
              />
              <textarea
                rows={5}
                placeholder="Your message..."
                value={form.message}
                onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                className={inputClass}
                required
              />
              <button
                type="submit"
                className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${theme.button} hover:-translate-y-0.5 shadow-lg`}
              >
                <Send size={15} /> Send Message
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </Section>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function WeatherMood() {
  const hour = new Date().getHours();
  const slot = getTimeSlot(hour);
  const theme = THEMES[slot];

  const [activeSection, setActiveSection] = useState('');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { rootMargin: '-40% 0px -55% 0px' }
    );
    NAV_ITEMS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <div className={`relative min-h-screen bg-gradient-to-b ${theme.bg} font-sans`}>
      <Navbar theme={theme} active={activeSection} />
      <Hero theme={theme} slot={slot} />
      <About theme={theme} />
      <Skills theme={theme} />
      <Projects theme={theme} />
      <Experience theme={theme} />
      <Testimonials theme={theme} />
      <Contact theme={theme} />

      <footer className={`text-center py-10 text-xs ${theme.muted} border-t ${theme.card}`}>
        <p>
          Crafted by{' '}
          <span className={`font-semibold ${theme.accent}`}>{data.personal.name}</span>
          {' '}— the mood changes with the hour.
        </p>
      </footer>
    </div>
  );
}
