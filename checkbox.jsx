import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';

const AnimatedCounter = ({ value, duration = 2, prefix = '', suffix = '' }) => {
  const count = useMotionValue(0);
  const rounded = useTransform(count, latest => {
    if (suffix === '+') {
      return Math.round(latest).toLocaleString();
    }
    if (prefix === '$') {
      return Math.round(latest).toLocaleString();
    }
    return Math.round(latest).toLocaleString();
  });

  const [displayValue, setDisplayValue] = useState('0');

  useEffect(() => {
    const controls = animate(count, value, { duration });
    
    const unsubscribe = rounded.on('change', latest => {
      setDisplayValue(latest);
    });

    return () => {
      controls.stop();
      unsubscribe();
    };
  }, [value, duration, count, rounded]);

  return (
    <span className="tabular-nums">
      {prefix}{displayValue}{suffix}
    </span>
  );
};

export default AnimatedCounter;