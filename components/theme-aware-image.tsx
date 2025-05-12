"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import Image, { type ImageProps } from "next/image"

interface ThemeAwareImageProps extends Omit<ImageProps, "src"> {
  lightSrc: string
  darkSrc?: string
  svgImage?: boolean
}

export function ThemeAwareImage({
  lightSrc,
  darkSrc,
  svgImage = false,
  alt,
  className,
  ...props
}: ThemeAwareImageProps) {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Only show the image after mounting to avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  // If it's an SVG image, we'll use the same source but apply CSS filters in dark mode
  if (svgImage) {
    return (
      <div className={`relative ${resolvedTheme === "dark" ? "svg-dark-filter" : ""}`}>
        <Image src={lightSrc || "/placeholder.svg"} alt={alt} className={className} {...props} />
      </div>
    )
  }

  // For regular images, use different sources for light and dark modes
  const src = resolvedTheme === "dark" && darkSrc ? darkSrc : lightSrc

  return <Image src={src || "/placeholder.svg"} alt={alt} className={className} {...props} />
}
