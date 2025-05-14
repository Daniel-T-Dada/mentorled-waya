"use client";

import React from "react";
import { motion, type MotionProps } from "motion/react";
import { cn } from "@/lib/utils";

type AnimationWithInteractions = {
    hover?: MotionProps["animate"];
    tap?: MotionProps["animate"];
};
import { InView } from "react-intersection-observer";

type AnimateProps = {
    children: React.ReactNode;
    className?: string;
    animation?: keyof typeof ANIMATIONS;
    delay?: number;
    duration?: number;
    repeat?: number | boolean;
    type?: "hover" | "tap" | "always" | "scroll";
    threshold?: number;
} & Omit<MotionProps, "animate" | "initial" | "whileHover" | "whileTap">;

// Predefined animations for common micro-interactions
const ANIMATIONS = {
    fadeIn: {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
    },
    fadeInUp: {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0 },
    },
    fadeInDown: {
        initial: { opacity: 0, y: -10 },
        animate: { opacity: 1, y: 0 },
    },
    fadeInLeft: {
        initial: { opacity: 0, x: -10 },
        animate: { opacity: 1, x: 0 },
    },
    fadeInRight: {
        initial: { opacity: 0, x: 10 },
        animate: { opacity: 1, x: 0 },
    },
    scale: {
        initial: { scale: 0.9 },
        animate: { scale: 1 },
        hover: { scale: 1.05 },
        tap: { scale: 0.95 },
    },
    pulse: {
        initial: { scale: 1 },
        animate: { scale: [1, 1.05, 1] },
    },
    bounce: {
        initial: { y: 0 },
        animate: { y: [0, -10, 0] },
    },
    shake: {
        initial: { x: 0 },
        animate: { x: [0, -5, 5, -5, 5, 0] },
    },
    rotate: {
        initial: { rotate: 0 },
        animate: { rotate: 360 },
    },
};

export function Animate({
    children,
    className,
    animation = "fadeIn",
    delay = 0,
    duration = 0.3,
    repeat = false,
    type = "always",
    threshold = 0.1,
    ...props
}: AnimateProps) {
    // Get the selected animation
    const selectedAnimation = ANIMATIONS[animation];

    // Create motion transition config
    const transition = {
        duration,
        delay,
        repeat: repeat === true ? Infinity : Number(repeat) || 0,
        ease: "easeInOut",
    };

    // Create appropriate props based on animation type
    const motionProps: MotionProps = {
        ...props,
        transition,
    };

    // Apply different animations based on type
    if (type === "always") {
        motionProps.initial = selectedAnimation.initial;
        motionProps.animate = selectedAnimation.animate;
    } else if (type === "hover") {
        motionProps.whileHover = selectedAnimation.animate ||
            (selectedAnimation as AnimationWithInteractions).hover;
    } else if (type === "tap") {
        motionProps.whileTap = selectedAnimation.animate ||
            (selectedAnimation as AnimationWithInteractions).tap;
    }

    // For scroll animations, use InView to trigger when scrolled into view
    if (type === "scroll") {
        return (
            <InView threshold={threshold} triggerOnce>
                {({ inView, ref }) => (
                    <motion.div
                        ref={ref}
                        className={cn(className)}
                        initial={selectedAnimation.initial}
                        animate={inView ? selectedAnimation.animate : selectedAnimation.initial}
                        transition={transition}
                        {...props}
                    >
                        {children}
                    </motion.div>
                )}
            </InView>
        );
    }

    // For other animation types
    return (
        <motion.div className={cn(className)} {...motionProps}>
            {children}
        </motion.div>
    );
}

// Other helpful animation components
export const FadeIn = ({ children, className, ...props }: Omit<AnimateProps, "animation">) => (
    <Animate animation="fadeIn" className={className} {...props}>
        {children}
    </Animate>
);

export const FadeInUp = ({ children, className, ...props }: Omit<AnimateProps, "animation">) => (
    <Animate animation="fadeInUp" className={className} {...props}>
        {children}
    </Animate>
);

export const ScrollFadeIn = ({ children, className, ...props }: Omit<AnimateProps, "animation" | "type">) => (
    <Animate animation="fadeIn" type="scroll" className={className} {...props}>
        {children}
    </Animate>
);

export const ScrollFadeInUp = ({ children, className, ...props }: Omit<AnimateProps, "animation" | "type">) => (
    <Animate animation="fadeInUp" type="scroll" className={className} {...props}>
        {children}
    </Animate>
);

export const FadeInStagger = ({
    children,
    className,
    staggerDelay = 0.1,
    type = "always",
    threshold = 0.1,
    ...props
}: Omit<AnimateProps, "animation"> & { staggerDelay?: number }) => {
    // For scroll animations with staggered children
    if (type === "scroll") {
        return (
            <InView threshold={threshold} triggerOnce>
                {({ inView, ref }) => (
                    <div ref={ref} className={cn(className)}>
                        {React.Children.map(children, (child, i) => (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                                transition={{
                                    delay: i * staggerDelay,
                                    duration: 0.3,
                                    ease: "easeInOut",
                                }}
                                {...props}
                            >
                                {child}
                            </motion.div>
                        ))}
                    </div>
                )}
            </InView>
        );
    }

    // For regular staggered animations
    return (
        <motion.div className={cn(className)}>
            {React.Children.map(children, (child, i) => (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                        delay: i * staggerDelay,
                        duration: 0.3,
                        ease: "easeInOut",
                    }}
                    {...props}
                >
                    {child}
                </motion.div>
            ))}
        </motion.div>
    );
};

export default Animate; 