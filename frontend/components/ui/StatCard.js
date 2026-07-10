import { useEffect, useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';

function CountUp({ value = 0, duration = 1.2 }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    const target = Number(value) || 0;
    if (target === 0) {
      setDisplay(0);
      return;
    }

    let startTime = null;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      const eased = 1 - (1 - progress) * (1 - progress); // easeOutQuad
      setDisplay(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [isInView, value, duration]);

  return <span ref={ref}>{display}</span>;
}

export default function StatCard({ label, value, icon: Icon, color }) {
  return (
    <motion.div
      className="rounded-[2rem] p-6 w-48 h-48 flex flex-col items-center justify-between text-center"
      style={{ background: '#27384e' }}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      whileHover={{ y: -2, backgroundColor: '#3ec0c7', transition: { duration: 0.18 } }}
    >
      <div className="flex flex-col items-center gap-2">
        <Icon size={20} className="text-white flex-shrink-0" strokeWidth={1.75} />
        <p className="text-xs font-bold uppercase tracking-wide text-white leading-tight text-center whitespace-pre-line">
          {label}
        </p>
      </div>
      <div className="flex-1 flex items-center justify-center">
  <p className="font-display font-extrabold text-white leading-none mt-4" style={{ fontSize: '4.5rem' }}>
    <CountUp value={value} />
  </p>
</div>
    </motion.div>
  );
}