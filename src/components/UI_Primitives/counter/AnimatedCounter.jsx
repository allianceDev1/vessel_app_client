import React, { useEffect, useState, useRef } from 'react';

const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

const parseNumericValue = (val) => {
  if (typeof val === 'number') return Number.isFinite(val) ? val : 0;
  if (!val) return 0;
  const cleaned = String(val).replace(/[^0-9.-]+/g, '');
  const num = parseFloat(cleaned);
  return Number.isFinite(num) ? num : 0;
};

/**
 * AnimatedCounter component for smooth number roll-up / count-up animation on load.
 *
 * @param {Object} props
 * @param {number|string} props.value Target value to count up to
 * @param {number} [props.duration=1000] Animation duration in ms
 * @param {string} [props.locale='en-IN'] Number formatting locale
 * @param {Function} [props.formatter] Custom formatting function
 * @param {string} [props.prefix=''] Prefix (e.g. '₹')
 * @param {string} [props.suffix=''] Suffix (e.g. ' /mo')
 * @param {string} [props.className] Additional CSS class
 */
const AnimatedCounter = ({
  value = 0,
  duration = 1000,
  locale = 'en-IN',
  formatter,
  prefix = '',
  suffix = '',
  className = '',
}) => {
  const target = parseNumericValue(value);
  const isDecimal = !Number.isInteger(target);
  const [displayValue, setDisplayValue] = useState(0);
  const currentValRef = useRef(0);

  useEffect(() => {
    // Accessibility: check for reduced motion
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      setDisplayValue(target);
      currentValRef.current = target;
      return;
    }

    const startValue = currentValRef.current;
    const endValue = target;

    if (startValue === endValue) {
      setDisplayValue(endValue);
      return;
    }

    let startTimestamp = null;
    let frameId = null;

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const elapsed = timestamp - startTimestamp;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutCubic(progress);

      const current = startValue + (endValue - startValue) * easedProgress;
      currentValRef.current = current;
      setDisplayValue(isDecimal ? Number(current.toFixed(2)) : Math.round(current));

      if (progress < 1) {
        frameId = window.requestAnimationFrame(step);
      } else {
        currentValRef.current = endValue;
        setDisplayValue(endValue);
      }
    };

    frameId = window.requestAnimationFrame(step);

    return () => {
      if (frameId) {
        window.cancelAnimationFrame(frameId);
      }
    };
  }, [target, duration, isDecimal]);

  const formatted = formatter
    ? formatter(displayValue)
    : displayValue.toLocaleString(locale, isDecimal ? { minimumFractionDigits: 2, maximumFractionDigits: 2 } : undefined);

  return (
    <span className={className}>
      {prefix}{formatted}{suffix}
    </span>
  );
};

export default AnimatedCounter;
