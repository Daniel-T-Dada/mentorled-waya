import React from "react"
import { HoverScale } from "@/components/animations/hover-scale"
import { StaggerItem } from "@/components/animations/stagger-item"
import Image from "next/image"

interface FeatureCardProps {
  title: string
  description: string
  imageSrc: string
}

export const FeatureCard = React.memo<FeatureCardProps>(({ title, description, imageSrc }) => (
  <StaggerItem>
    <HoverScale className="flex flex-col items-center text-center p-6 hover:shadow-md transition-shadow duration-300 rounded-lg h-full">
      <div className="mb-4 h-60 w-60 sm:h-32 sm:w-32 md:h-60 md:w-60 relative ">
        <Image
          src={imageSrc}
          alt={title}
          fill
          sizes="(max-width: 640px) 240px, (max-width: 768px) 128px, 240px"
          className="object-contain dark:brightness-80 dark:contrast-80"
        />
      </div>
      <h3 className="text-lg sm:text-lg lg:text-2xl font-semibold mb-2 text-primary">{title}</h3>
      <p className="text-muted-foreground text-sm sm:text-lg">{description}</p>
    </HoverScale>
  </StaggerItem>
))

FeatureCard.displayName = 'FeatureCard'
