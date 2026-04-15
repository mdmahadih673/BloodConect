import React, { useState, useEffect } from 'react';
import { motion, useSpring, useTransform, animate } from 'motion/react';

export default function AnimatedCounter({ value, title, icon: Icon, color }: { value: number, title: string, icon: any, color: string }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const controls = animate(0, value, {
      duration: 2,
      onUpdate: (latest) => setDisplayValue(Math.floor(latest)),
      ease: "easeOut"
    });
    return () => controls.stop();
  }, [value]);

  return (
    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all group">
      <div className={`w-14 h-14 ${color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
        <Icon className="w-7 h-7" />
      </div>
      <div className="text-4xl font-black text-gray-900 mb-2 tabular-nums">
        {displayValue.toLocaleString()}+
      </div>
      <div className="text-sm font-bold text-gray-400 uppercase tracking-widest">{title}</div>
    </div>
  );
}
