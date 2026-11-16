'use client';
import { useEffect, useState } from 'react';

/* Ticks every second. Returns null until mounted so server and client markup match. */
export function useClock() {
  const [now, setNow] = useState(null);
  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return now;
}
