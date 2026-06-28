import { useState, useRef, useEffect } from 'react';
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useSpring,
  useMotionValue,
  useInView,
  Reorder,
} from 'motion/react';
import {
  ArrowLeft,
  ChevronDown,
  Sparkles,
  Zap,
  Layers,
  GripVertical,
  BarChart3,
  PiggyBank,
  Target,
  Shield,
  TrendingUp,
  Wallet,
  X,
  Play,
} from 'lucide-react';
import { Link } from 'react-router-dom';

/* ── Data ──────────────────────────────────────────────── */

const TITLE = 'Motion Lab';

const TILT_CARDS = [
  {
    icon: Sparkles,
    title: 'Spring Physics',
    desc: 'Every animation is driven by real spring physics — stiffness, damping, and mass produce natural, organic motion that time-based easing can never match.',
    gradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    glowColor: 'rgba(99, 102, 241, 0.2)',
  },
  {
    icon: Zap,
    title: 'GPU Accelerated',
    desc: 'Transforms and opacity run on the compositor thread. No layout thrashing, no paint storms — just buttery 60fps animation on any device.',
    gradient: 'linear-gradient(135deg, #10b981, #06b6d4)',
    glowColor: 'rgba(16, 185, 129, 0.2)',
  },
  {
    icon: Layers,
    title: 'Layout Animation',
    desc: 'Elements animate their position and size automatically when the layout changes. Shared layoutId transitions connect components across the tree.',
    gradient: 'linear-gradient(135deg, #f43f5e, #f97316)',
    glowColor: 'rgba(244, 63, 94, 0.2)',
  },
];

const GALLERY_ITEMS = [
  { id: 1, title: 'Analytics', Icon: BarChart3, bg: '#6366f1', desc: 'Deep insights into your spending patterns with interactive charts and AI-powered trend analysis across all your accounts.' },
  { id: 2, title: 'Savings', Icon: PiggyBank, bg: '#10b981', desc: 'Automated savings goals that adapt to your income and spending velocity. Never miss a milestone.' },
  { id: 3, title: 'Goals', Icon: Target, bg: '#f59e0b', desc: 'Set financial milestones and track progress with real-time projections and smart notifications.' },
  { id: 4, title: 'Security', Icon: Shield, bg: '#f43f5e', desc: 'Bank-level AES-256 encryption for every transaction, credential, and personal detail you store.' },
  { id: 5, title: 'Growth', Icon: TrendingUp, bg: '#8b5cf6', desc: 'Watch your net worth grow with compound interest visualizations and investment tracking.' },
  { id: 6, title: 'Wallet', Icon: Wallet, bg: '#06b6d4', desc: 'All your accounts, cards, and cash in a single unified dashboard with real-time sync.' },
];

const STATS = [
  { value: 60, suffix: 'fps', label: 'Buttery smooth' },
  { value: 12, suffix: '+', label: 'Motion APIs' },
  { value: 5, suffix: 'kb', label: 'Core bundle' },
  { value: 100, suffix: '%', label: 'Spring-powered' },
];

const SPRING_PRESETS = [
  { label: 'Bouncy', stiffness: 200, damping: 8 },
  { label: 'Snappy', stiffness: 600, damping: 30 },
  { label: 'Gentle', stiffness: 80, damping: 20 },
];

const DRAG_ITEMS_INIT = [
  { id: 'design', label: 'Design', color: '#6366f1' },
  { id: 'prototype', label: 'Prototype', color: '#8b5cf6' },
  { id: 'develop', label: 'Develop', color: '#06b6d4' },
  { id: 'test', label: 'Test', color: '#10b981' },
  { id: 'deploy', label: 'Deploy', color: '#f59e0b' },
  { id: 'monitor', label: 'Monitor', color: '#f43f5e' },
];

/* ── Scroll Progress ───────────────────────────────────── */

function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  return (
    <motion.div
      className="fixed top-0 left-0 right-0 z-50 h-1 origin-left"
      style={{
        scaleX: scrollYProgress,
        backgroundImage: 'linear-gradient(90deg, #6366f1, #8b5cf6, #d946ef)',
      }}
    />
  );
}

/* ── Hero ──────────────────────────────────────────────── */

function Hero() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const orb1XRaw = useTransform(mouseX, [-800, 800], [-50, 50]);
  const orb1YRaw = useTransform(mouseY, [-500, 500], [-40, 40]);
  const orb1X = useSpring(orb1XRaw, { stiffness: 80, damping: 20 });
  const orb1Y = useSpring(orb1YRaw, { stiffness: 80, damping: 20 });

  const orb2XRaw = useTransform(mouseX, [-800, 800], [-30, 30]);
  const orb2YRaw = useTransform(mouseY, [-500, 500], [-25, 25]);
  const orb2X = useSpring(orb2XRaw, { stiffness: 50, damping: 25 });
  const orb2Y = useSpring(orb2YRaw, { stiffness: 50, damping: 25 });

  const orb3XRaw = useTransform(mouseX, [-800, 800], [-18, 18]);
  const orb3YRaw = useTransform(mouseY, [-500, 500], [-14, 14]);
  const orb3X = useSpring(orb3XRaw, { stiffness: 30, damping: 30 });
  const orb3Y = useSpring(orb3YRaw, { stiffness: 30, damping: 30 });

  function handleMouseMove(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left - rect.width / 2);
    mouseY.set(e.clientY - rect.top - rect.height / 2);
  }

  return (
    <section
      className="relative flex h-screen items-center justify-center overflow-hidden"
      onMouseMove={handleMouseMove}
    >
      {/* Floating orbs — depth via different spring configs */}
      <motion.div
        className="pointer-events-none absolute left-1/4 top-1/3 h-96 w-96 rounded-full bg-indigo-500/20 blur-[100px]"
        style={{ x: orb1X, y: orb1Y }}
      />
      <motion.div
        className="pointer-events-none absolute right-1/4 top-1/4 h-80 w-80 rounded-full bg-fuchsia-500/15 blur-[100px]"
        style={{ x: orb2X, y: orb2Y }}
      />
      <motion.div
        className="pointer-events-none absolute bottom-1/4 left-1/2 h-72 w-72 rounded-full bg-cyan-400/10 blur-[100px]"
        style={{ x: orb3X, y: orb3Y }}
      />

      {/* Title — letter-by-letter spring entrance */}
      <div className="relative z-10 px-6 text-center">
        <div className="mb-3 flex justify-center gap-0.5">
          {TITLE.split('').map((char, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 60, scale: 0.5, rotateX: 90 }}
              animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
              transition={{
                delay: 0.3 + i * 0.07,
                type: 'spring',
                stiffness: 200,
                damping: 12,
              }}
              className="text-gradient inline-block text-6xl font-extrabold sm:text-8xl lg:text-9xl"
            >
              {char === ' ' ? ' ' : char}
            </motion.span>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="text-lg text-slate-400 sm:text-xl"
        >
          An interactive showcase of{' '}
          <code className="text-brand-400 font-semibold">motion/react</code>
        </motion.p>

        <motion.div
          className="mt-5 flex flex-wrap justify-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6, duration: 0.5 }}
        >
          {['useSpring', 'useTransform', 'variants', 'layoutId', 'AnimatePresence', 'Reorder'].map(
            (tag) => (
              <span
                key={tag}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-500"
              >
                {tag}
              </span>
            ),
          )}
        </motion.div>
      </div>

      {/* SVG wave — draws itself in */}
      <svg
        className="absolute bottom-0 left-0 right-0 w-full"
        viewBox="0 0 1440 120"
        fill="none"
      >
        <motion.path
          d="M0 60 Q 360 0, 720 60 Q 1080 120, 1440 60"
          stroke="url(#wave-grad)"
          strokeWidth="2"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ delay: 1.8, duration: 2, ease: 'easeInOut' }}
        />
        <defs>
          <linearGradient id="wave-grad" x1="0" y1="0" x2="1440" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4" />
            <stop offset="50%" stopColor="#d946ef" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.4" />
          </linearGradient>
        </defs>
      </svg>

      {/* Scroll hint */}
      <motion.div
        className="absolute bottom-8 text-slate-600"
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
      >
        <ChevronDown size={28} />
      </motion.div>
    </section>
  );
}

/* ── Section Heading ───────────────────────────────────── */

function SectionHeading({ title, subtitle, tags }) {
  return (
    <motion.div
      className="mb-16 text-center"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-gradient text-4xl font-bold sm:text-5xl">{title}</h2>
      <p className="mt-3 text-slate-400">{subtitle}</p>
      {tags && (
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {tags.map((t) => (
            <span
              key={t}
              className="text-brand-400 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs"
            >
              {t}
            </span>
          ))}
        </div>
      )}
    </motion.div>
  );
}

/* ── 3D Tilt Cards ─────────────────────────────────────── */

function TiltCard({ icon: Icon, title, desc, gradient, glowColor }) {
  const ref = useRef(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const glowPxX = useMotionValue(-200);
  const glowPxY = useMotionValue(-200);

  const rotateX = useTransform(mouseY, [-0.5, 0.5], [12, -12]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], [-12, 12]);

  function handleMouse(e) {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
    glowPxX.set(e.clientX - rect.left);
    glowPxY.set(e.clientY - rect.top);
  }

  function handleLeave() {
    mouseX.set(0);
    mouseY.set(0);
    glowPxX.set(-200);
    glowPxY.set(-200);
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={handleLeave}
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
      whileHover={{ scale: 1.03 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      className="card group relative cursor-default overflow-hidden p-8"
    >
      {/* Cursor-following glow */}
      <motion.div
        className="-ml-24 -mt-24 pointer-events-none absolute h-48 w-48 rounded-full blur-3xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ left: glowPxX, top: glowPxY, backgroundColor: glowColor }}
      />

      <div className="relative z-10" style={{ transform: 'translateZ(40px)' }}>
        <div className="mb-5 inline-flex rounded-2xl p-3.5" style={{ background: gradient }}>
          <Icon size={28} className="text-white" />
        </div>
        <h3 className="mb-2 text-xl font-bold text-white">{title}</h3>
        <p className="text-sm leading-relaxed text-slate-400">{desc}</p>
      </div>
    </motion.div>
  );
}

function TiltCardsSection() {
  const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.15 } },
  };
  const item = {
    hidden: { opacity: 0, y: 40 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 200, damping: 20 } },
  };

  return (
    <section className="px-6 py-28">
      <SectionHeading
        title="3D Perspective"
        subtitle="Move your cursor over the cards"
        tags={['useMotionValue', 'useTransform', 'whileHover', 'preserve-3d']}
      />
      <motion.div
        className="mx-auto grid max-w-6xl gap-8 sm:grid-cols-2 lg:grid-cols-3"
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
      >
        {TILT_CARDS.map((card) => (
          <motion.div key={card.title} variants={item}>
            <TiltCard {...card} />
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}

/* ── Morphing Gallery ──────────────────────────────────── */

function MorphingGallery() {
  const [selected, setSelected] = useState(null);

  return (
    <section className="px-6 py-28">
      <SectionHeading
        title="Layout Morphing"
        subtitle="Click any card to see shared layout animation"
        tags={['layoutId', 'AnimatePresence', 'layout']}
      />

      <motion.div
        className="mx-auto grid max-w-4xl grid-cols-2 gap-4 sm:grid-cols-3"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
      >
        {GALLERY_ITEMS.map((item) => (
          <motion.div
            key={item.id}
            layoutId={`gallery-card-${item.id}`}
            onClick={() => setSelected(item)}
            variants={{
              hidden: { opacity: 0, scale: 0.9 },
              show: { opacity: 1, scale: 1 },
            }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="card flex cursor-pointer flex-col items-center gap-3 p-6 transition-colors hover:bg-white/[0.08]"
          >
            <motion.div
              layoutId={`gallery-icon-${item.id}`}
              className="grid h-14 w-14 place-items-center rounded-2xl"
              style={{ backgroundColor: item.bg }}
            >
              <item.Icon size={24} className="text-white" />
            </motion.div>
            <motion.span
              layoutId={`gallery-title-${item.id}`}
              className="text-sm font-semibold text-white"
            >
              {item.title}
            </motion.span>
          </motion.div>
        ))}
      </motion.div>

      {/* Expanded overlay */}
      <AnimatePresence>
        {selected && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setSelected(null)}
            />
            <motion.div
              layoutId={`gallery-card-${selected.id}`}
              className="card relative z-10 w-full max-w-lg p-8"
            >
              <button
                onClick={() => setSelected(null)}
                className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 transition hover:bg-white/10 hover:text-white"
              >
                <X size={18} />
              </button>
              <div className="flex items-center gap-4">
                <motion.div
                  layoutId={`gallery-icon-${selected.id}`}
                  className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl"
                  style={{ backgroundColor: selected.bg }}
                >
                  <selected.Icon size={28} className="text-white" />
                </motion.div>
                <motion.h3
                  layoutId={`gallery-title-${selected.id}`}
                  className="text-2xl font-bold text-white"
                >
                  {selected.title}
                </motion.h3>
              </div>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-5 leading-relaxed text-slate-400"
              >
                {selected.desc}
              </motion.p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

/* ── Animated Counters ─────────────────────────────────── */

function AnimatedCounter({ value, suffix, label }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const duration = 1500;
    const startTime = performance.now();
    let frame;
    function tick(now) {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - (1 - progress) * (1 - progress);
      setCount(Math.round(eased * value));
      if (progress < 1) frame = requestAnimationFrame(tick);
    }
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, value]);

  return (
    <motion.div
      ref={ref}
      className="text-center"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
    >
      <div className="text-gradient text-5xl font-extrabold tabular-nums sm:text-6xl">
        {count}
        <span className="text-3xl sm:text-4xl">{suffix}</span>
      </div>
      <div className="mt-2 text-sm text-slate-400">{label}</div>
    </motion.div>
  );
}

function ScrollRevealSection() {
  return (
    <section className="px-6 py-28">
      <SectionHeading
        title="Scroll & Reveal"
        subtitle="Elements animate into view as you scroll"
        tags={['whileInView', 'viewport', 'useInView', 'staggerChildren']}
      />
      <div className="mx-auto grid max-w-4xl grid-cols-2 gap-10 sm:grid-cols-4">
        {STATS.map((stat) => (
          <AnimatedCounter key={stat.label} {...stat} />
        ))}
      </div>
    </section>
  );
}

/* ── Spring Physics Lab ────────────────────────────────── */

function SpringLab() {
  const trackRef = useRef(null);
  const [stiffness, setStiffness] = useState(200);
  const [damping, setDamping] = useState(10);
  const [launched, setLaunched] = useState(false);
  const [maxX, setMaxX] = useState(300);

  useEffect(() => {
    function measure() {
      if (trackRef.current) setMaxX(trackRef.current.clientWidth - 88);
    }
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  function applyPreset(p) {
    setLaunched(false);
    setStiffness(p.stiffness);
    setDamping(p.damping);
    setTimeout(() => setLaunched(true), 60);
  }

  return (
    <section className="px-6 py-28">
      <SectionHeading
        title="Spring Physics"
        subtitle="Adjust stiffness and damping, then launch"
        tags={['type: spring', 'stiffness', 'damping']}
      />

      <div className="mx-auto max-w-2xl">
        {/* Controls */}
        <div className="card mb-8 space-y-6 p-6">
          <div>
            <div className="mb-2 flex justify-between text-sm text-slate-300">
              <span>Stiffness</span>
              <span className="text-brand-400 font-mono">{stiffness}</span>
            </div>
            <input
              type="range"
              min={10}
              max={1000}
              value={stiffness}
              onChange={(e) => setStiffness(+e.target.value)}
              className="w-full accent-brand-500"
            />
          </div>
          <div>
            <div className="mb-2 flex justify-between text-sm text-slate-300">
              <span>Damping</span>
              <span className="text-brand-400 font-mono">{damping}</span>
            </div>
            <input
              type="range"
              min={1}
              max={100}
              value={damping}
              onChange={(e) => setDamping(+e.target.value)}
              className="w-full accent-brand-500"
            />
          </div>

          <div className="flex gap-3">
            {SPRING_PRESETS.map((p) => (
              <button key={p.label} onClick={() => applyPreset(p)} className="btn-ghost flex-1">
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Track */}
        <div ref={trackRef} className="card relative h-24 overflow-hidden">
          <div className="absolute inset-x-6 top-1/2 h-px -translate-y-1/2 bg-white/10" />
          <motion.div
            className="absolute left-4 h-14 w-14 rounded-full"
            style={{
              top: 'calc(50% - 28px)',
              backgroundImage: 'linear-gradient(135deg, #6366f1, #d946ef)',
              boxShadow: '0 0 30px rgba(99, 102, 241, 0.4)',
            }}
            animate={{ x: launched ? maxX : 0 }}
            transition={{ type: 'spring', stiffness, damping }}
          />
        </div>

        <div className="mt-6 text-center">
          <button onClick={() => setLaunched(!launched)} className="btn-primary gap-2 px-8">
            <Play size={16} />
            {launched ? 'Reset' : 'Launch'}
          </button>
        </div>
      </div>
    </section>
  );
}

/* ── Drag Playground ───────────────────────────────────── */

function DragPlayground() {
  const [items, setItems] = useState(DRAG_ITEMS_INIT);
  const constraintsRef = useRef(null);

  return (
    <section className="px-6 py-28">
      <SectionHeading
        title="Drag & Reorder"
        subtitle="Grab the handle and rearrange, or drag the square freely"
        tags={['Reorder', 'whileDrag', 'drag', 'dragConstraints', 'dragElastic']}
      />

      <div className="mx-auto grid max-w-5xl gap-12 lg:grid-cols-2">
        {/* Reorder list */}
        <div>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-500">
            Sortable List
          </h3>
          <Reorder.Group axis="y" values={items} onReorder={setItems} className="space-y-3">
            {items.map((item) => (
              <Reorder.Item
                key={item.id}
                value={item}
                whileDrag={{
                  scale: 1.04,
                  boxShadow: '0 20px 50px rgba(0, 0, 0, 0.4)',
                  cursor: 'grabbing',
                }}
                className="card flex cursor-grab items-center gap-4 p-4 active:cursor-grabbing"
              >
                <GripVertical size={18} className="shrink-0 text-slate-600" />
                <div
                  className="h-3 w-3 shrink-0 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="font-medium text-white">{item.label}</span>
              </Reorder.Item>
            ))}
          </Reorder.Group>
        </div>

        {/* Free drag */}
        <div>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-500">
            Free Drag
          </h3>
          <div
            ref={constraintsRef}
            className="card relative flex h-80 items-center justify-center overflow-hidden"
          >
            <p className="select-none text-sm text-slate-700">drag me around</p>
            <motion.div
              drag
              dragConstraints={constraintsRef}
              dragElastic={0.15}
              whileDrag={{ scale: 1.15, rotate: 8 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              className="absolute h-16 w-16 cursor-grab rounded-2xl active:cursor-grabbing"
              style={{
                backgroundImage: 'linear-gradient(135deg, #6366f1, #d946ef)',
                boxShadow: '0 10px 40px rgba(99, 102, 241, 0.3)',
              }}
            />
            <motion.div
              drag
              dragConstraints={constraintsRef}
              dragElastic={0.2}
              whileDrag={{ scale: 1.2, rotate: -6 }}
              whileHover={{ scale: 1.1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 15 }}
              className="absolute right-16 top-16 h-12 w-12 cursor-grab rounded-full active:cursor-grabbing"
              style={{
                backgroundImage: 'linear-gradient(135deg, #10b981, #06b6d4)',
                boxShadow: '0 10px 40px rgba(16, 185, 129, 0.3)',
              }}
            />
            <motion.div
              drag
              dragConstraints={constraintsRef}
              dragElastic={0.1}
              whileDrag={{ scale: 1.1, rotate: 12 }}
              whileHover={{ scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 500, damping: 20 }}
              className="absolute bottom-12 left-12 h-10 w-10 cursor-grab rounded-xl active:cursor-grabbing"
              style={{
                backgroundImage: 'linear-gradient(135deg, #f59e0b, #f43f5e)',
                boxShadow: '0 10px 40px rgba(245, 158, 11, 0.3)',
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Footer ────────────────────────────────────────────── */

function Footer() {
  return (
    <footer className="border-t border-white/10 py-16 text-center">
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="text-sm text-slate-500"
      >
        Built with{' '}
        <span className="text-brand-400 font-semibold">motion/react</span>
        {' + '}
        <span className="font-semibold text-slate-300">React 18</span>
        {' + '}
        <span className="font-semibold text-slate-300">Tailwind 4</span>
      </motion.p>
    </footer>
  );
}

/* ── Page ──────────────────────────────────────────────── */

export default function Playground() {
  useEffect(() => {
    document.title = 'Motion Lab — Spendly';
    return () => { document.title = 'Spendly — Expense Tracker'; };
  }, []);

  return (
    <div className="min-h-screen">
      <ScrollProgress />

      <Link
        to="/"
        className="fixed left-6 top-4 z-50 flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-400 backdrop-blur-xl transition hover:bg-white/10 hover:text-white"
      >
        <ArrowLeft size={16} />
        Back
      </Link>

      <Hero />
      <TiltCardsSection />
      <MorphingGallery />
      <ScrollRevealSection />
      <SpringLab />
      <DragPlayground />
      <Footer />
    </div>
  );
}
