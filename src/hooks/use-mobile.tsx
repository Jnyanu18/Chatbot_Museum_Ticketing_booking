
import { useState, useEffect } from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    // Check on mount (client-side only)
    checkIsMobile();
    
    // Add event listener for window resize
    window.addEventListener("resize", checkIsMobile)

    // Cleanup event listener on component unmount
    return () => window.removeEventListener("resize", checkIsisMobile)
  }, [])

  return isMobile;
}
