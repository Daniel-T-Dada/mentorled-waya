
import { HoverScale } from "@/components/animations/hover-scale"
import { StaggerItem } from "@/components/animations/stagger-item"
import Image from "next/image"


interface FeatureCardProps {
  title: string
  description: string
  imageSrc: string
  
}

export function FeatureCard({ title, description, imageSrc }: FeatureCardProps) {
  return (
    <StaggerItem>
      <HoverScale className="flex flex-col items-center text-center p-4 hover:shadow-md dark:hover:shadow-gray-800 transition-shadow duration-300 rounded-lg bg-white dark:bg-gray-900 h-full">
        <div className="mb-4 h-32 w-32 relative">
          <Image
            src={imageSrc}
            alt={title}
            fill
            className="object-contain"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            
            
          />
        </div>
        <h3 className="text-lg font-semibold mb-2 text-[#500061] dark:text-[#9333EA]">{title}</h3>
        <p className="text-gray-600 dark:text-gray-300 text-sm">{description}</p>
      </HoverScale>
    </StaggerItem>
  )
}
