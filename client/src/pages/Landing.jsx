import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Logo } from '../components/ui/Logo.jsx';
import { Button } from '../components/ui/Button.jsx';
import { fadeUp, staggerContainer, slideUp } from '../utils/motionVariants.js';
import { Mic, TrendingUp, LayoutDashboard, BarChart2, Upload, RefreshCw } from 'lucide-react';

const FEATURES = [
  {
    icon: Mic,
    title: 'Voice Logging',
    body: 'Speak your log. We\'ll handle the rest.',
  },
  {
    icon: TrendingUp,
    title: 'Smart Correlations',
    body: 'Discover what actually moves the needle.',
  },
  {
    icon: LayoutDashboard,
    title: 'All-in-One Tracking',
    body: '7 metrics. One dashboard.',
  },
  {
    icon: BarChart2,
    title: 'Beautiful Charts',
    body: 'Data that\'s a pleasure to explore.',
  },
  {
    icon: Upload,
    title: 'CSV Import',
    body: 'Bring your history with you.',
  },
  {
    icon: RefreshCw,
    title: 'Unit Flexibility',
    body: 'lbs or kg. Your call, always.',
  },
];

const STEPS = [
  { n: '1', title: 'Log anything', body: 'Voice, type, or upload. Any metric, any time.' },
  { n: '2', title: 'See the trends', body: 'Powerful charts surface patterns automatically.' },
  { n: '3', title: 'Own the transformation', body: 'Correlate metrics and act on real insight.' },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-void text-text1 font-sans">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 md:px-12 py-5 border-b border-border/50">
        <Logo size={36} showWordmark />
        <div className="flex items-center gap-3">
          <Link to="/login">
            <Button variant="ghost" className="text-sm">Sign in</Button>
          </Link>
          <Link to="/register">
            <Button variant="primary" className="text-sm">Start free</Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero-bg relative overflow-hidden">
        <div className="hero-glow absolute inset-0 pointer-events-none" />
        <div className="relative max-w-5xl mx-auto px-6 md:px-12 py-24 md:py-36 text-center">
          <motion.h1
            className="font-display text-6xl md:text-8xl font-extrabold tracking-tight leading-none mb-6"
            variants={fadeUp}
            initial="hidden"
            animate="visible"
          >
            <span className="gradient-text">TREND</span>
            <span className="text-text1">FORMATION</span>
          </motion.h1>
          <motion.p
            className="text-xl text-text2 max-w-xl mx-auto mb-10"
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.1 }}
          >
            Track the trend. Own the transformation.
          </motion.p>
          <motion.div
            className="flex items-center justify-center gap-4"
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.2 }}
          >
            <Link to="/register">
              <Button variant="primary" className="text-sm px-8 py-3">Start for free</Button>
            </Link>
            <Link to="/login">
              <Button variant="secondary" className="text-sm px-6 py-3">Sign in</Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 md:px-12 py-24">
        <motion.h2
          className="font-display text-3xl font-bold text-center text-text1 mb-12"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          Everything you need. Nothing you don't.
        </motion.h2>
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {FEATURES.map(({ icon: Icon, title, body }) => (
            <motion.div
              key={title}
              className="bg-surface border border-border rounded-2xl p-6 hover:border-border2 transition-all duration-200 group cursor-default"
              variants={slideUp}
            >
              <Icon
                size={24}
                className="text-indigo-light mb-4 group-hover:text-phosphor transition-colors duration-200"
              />
              <h3 className="font-display text-base font-bold text-text1 mb-2">{title}</h3>
              <p className="font-sans text-sm text-text2 leading-relaxed">{body}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* How it works */}
      <section className="bg-surface/30 border-y border-border py-24">
        <div className="max-w-4xl mx-auto px-6 md:px-12">
          <motion.h2
            className="font-display text-3xl font-bold text-center text-text1 mb-16"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            How it works
          </motion.h2>
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {STEPS.map(({ n, title, body }) => (
              <motion.div key={n} className="relative" variants={slideUp}>
                <span className="font-display text-9xl font-black text-indigo/10 select-none absolute -top-6 -left-2 leading-none">
                  {n}
                </span>
                <div className="relative pt-8">
                  <h3 className="font-display text-xl font-bold text-text1">{title}</h3>
                  <p className="font-sans text-sm text-text2 leading-relaxed mt-2">{body}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-banner py-20">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <motion.h2
            className="font-display text-4xl font-bold text-text1 mb-4"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            Start tracking today.
          </motion.h2>
          <motion.p
            className="text-text2 mb-8"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            Free forever. No credit card required.
          </motion.p>
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <Link to="/register">
              <Button variant="phosphor">Start for free</Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 text-center text-text3 text-sm">
        <Logo size={24} showWordmark={false} />
        <p className="mt-3">© {new Date().getFullYear()} Trendformation. Track the trend.</p>
      </footer>
    </div>
  );
}
