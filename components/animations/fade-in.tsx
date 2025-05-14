"use client"


import { motion } from "motion/react"
import type { ReactNode } from "react"
import { useReducedMotion } from "@/hooks/use-reduced-motion"

interface FadeInProps {
  children: ReactNode
  delay?: number
  duration?: number
  className?: string
  direction?: "up" | "down" | "left" | "right" | "none"
  distance?: number
}

export function FadeInOld({
  children,
  delay = 0,
  duration = 0.5,
  className = "",
  direction = "up",
  distance = 20,
}: FadeInProps) {
  const prefersReducedMotion = useReducedMotion()

  // Don't animate if user prefers reduced motion
  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>
  }

  // Set initial and animate values based on direction
  const getDirectionOffset = () => {
    switch (direction) {
      case "up":
        return { y: distance }
      case "down":
        return { y: -distance }
      case "left":
        return { x: distance }
      case "right":
        return { x: -distance }
      case "none":
        return {}
      default:
        return { y: distance }
    }
  }

  return (
    <motion.div
      initial={{
        opacity: 0,
        ...getDirectionOffset(),
      }}
      animate={{
        opacity: 1,
        x: 0,
        y: 0,
      }}
      transition={{
        duration,
        delay,
        ease: "easeOut",
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
