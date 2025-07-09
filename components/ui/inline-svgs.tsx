import React from 'react'

interface WaveProps {
    className?: string
}

export const Wave1: React.FC<WaveProps> = ({ className = "" }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 1437 280"
        className={className}
        aria-hidden="true"
    >
        <path
            stroke="#500061"
            strokeOpacity=".3"
            strokeWidth="2"
            d="M9.52 267.98q441.714 43.795 713.638-95.507 271.923-139.3 713.642-95.507M8.061 257.078Q449.774 300.872 721.7 161.57q271.923-139.3 713.641-95.507M6.602 246.175q441.712 43.794 713.638-95.507C901.523 57.8 1139.4 25.964 1433.88 55.16M5.143 235.272q441.713 43.795 713.637-95.507c181.284-92.868 419.16-124.703 713.64-95.507M3.684 224.369q441.713 43.795 713.637-95.507C898.604 35.994 1136.48 4.159 1430.96 33.355M2.225 213.466q441.713 43.795 713.637-95.507C897.145 25.092 1135.02-6.744 1429.5 22.452M.766 202.564q441.713 43.794 713.637-95.508C895.686 14.189 1133.57-17.647 1428.04 11.549"
        />
    </svg>
)

export const Wave2: React.FC<WaveProps> = ({ className = "" }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 1440 166"
        className={className}
        aria-hidden="true"
    >
        <path
            stroke="#500061"
            strokeOpacity=".3"
            strokeWidth="2"
            d="M0 52q432-102 720 0t720 0M0 63q432-102 720 0t720 0M0 74q432-102 720 0t720 0M0 85q432-102 720 0t720 0M0 96Q432-6 720 96t720 0M0 107q432-102 720 0t720 0M0 118q432-102 720 0t720 0"
        />
    </svg>
)

Wave1.displayName = 'Wave1'
Wave2.displayName = 'Wave2'
