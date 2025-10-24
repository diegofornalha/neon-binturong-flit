"use client"

import { useState, useEffect } from "react"

export function useIsMobile(breakpoint: number = 768): boolean {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < breakpoint)
    }

    // Check on initial load
    checkScreenSize()

    // Add event listener for window resize
    window.addEventListener("resize", checkScreenSize)

    // Cleanup event listener on component unmount
    return () => {
      window.removeEventListener("resize", checkScreenSize)
    }
  }, [breakpoint])

  return isMobile
}