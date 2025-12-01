'use client';

import { useState, useEffect } from 'react';

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };

    // Check on mount (client-side only) and add listener
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);

    // Cleanup event listener on component unmount
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  return isMobile;
}
