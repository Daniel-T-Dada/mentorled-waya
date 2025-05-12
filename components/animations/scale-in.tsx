"use client"

import { useReducedMotion } from "@/hooks/use-reduced-motion"
import { motion } from "motion/react"

import type { ReactNode } from "react"


interface ScaleInProps {
  children: ReactNode
  delay?: number
  duration?: number
  className?: string
}

export function ScaleIn({ children, delay = 0, duration = 0.5, className = "" }: ScaleInProps) {
  const prefersReducedMotion = useReducedMotion()

  // Don't animate if user prefers reduced motion
  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration,
        delay,
        ease: [0.22, 1, 0.36, 1], // Custom cubic bezier for a nice spring effect
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
