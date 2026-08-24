"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";

interface AnimatedHeadingProps {
  text?: string;
  className?: string;
}

export default function AnimatedHeading({
  text = "Membuka Akses Hasil Panen ke Pasar yang Lebih Luas",
  className = "",
}: AnimatedHeadingProps) {
  const words = text.split(" ");
  const prefersReducedMotion = useReducedMotion();

  const containerVariants: Variants = {
    hidden: {
      opacity: 0,
    },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 2,
      },
    },
  };

  const wordVariants: Variants = {
    hidden: {
      opacity: 0,
      y: 30,
      scale: 0.9,
      filter: "blur(12px)",
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      filter: "blur(0px)",
      transition: {
        duration: 0.9,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  if (prefersReducedMotion) {
    return (
      <h1
        className={`tracking-tight mb-3 font-bold leading-tight max-w-3xl w-full mx-auto text-center ${className}`}
      >
        {text}
      </h1>
    );
  }

  return (
    <motion.h1
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={`tracking-tight mb-3 font-bold leading-tight max-w-3xl w-full mx-auto text-center ${className}`}
    >
      {words.map((word, index) => (
        <span key={`${word}-${index}`} className="inline-block whitespace-nowrap mr-[0.28em] last:mr-0">
          <motion.span
            variants={wordVariants}
            className="inline-block origin-bottom"
          >
            {word}
          </motion.span>
        </span>
      ))}
    </motion.h1>
  );
}