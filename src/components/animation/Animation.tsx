"use client";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

type Props = {
  children: React.ReactNode;
  direction?: "up" | "down" | "left" | "right" | "in";
  duration?: number;
  delay?: number;
};

export default function FadeAnimation({ 
  children, 
  direction = "up", 
  duration = 0.8, 
  delay = 0 
}: Props) {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.2,     
  });

  const variants = {
    up: { opacity: 0, y: 50 },
    down: { opacity: 0, y: -50 },
    left: { opacity: 0, x: 50 },
    right: { opacity: 0, x: -50 },
    in: { opacity: 0 },
  };

  return (
    <motion.div
      ref={ref}
      initial={variants[direction]}
      animate={inView ? { opacity: 1, x: 0, y: 0 } : variants[direction]}
      transition={{ duration, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}