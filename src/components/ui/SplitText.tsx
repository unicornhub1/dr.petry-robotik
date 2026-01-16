'use client'

import { useRef } from 'react'
import { motion, useInView, Variants } from 'framer-motion'

interface SplitTextProps {
  text: string
  className?: string
  delay?: number
  duration?: number
  splitType?: 'chars' | 'words'
  tag?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div'
  once?: boolean
}

export default function SplitText({
  text,
  className = '',
  delay = 0.03,
  duration = 0.5,
  splitType = 'words',
  tag = 'div',
  once = true,
}: SplitTextProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once, margin: '-50px' })

  // Split by words only - chars can cause layout issues
  const words = text.split(' ')

  const container: Variants = {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: delay,
        delayChildren: 0.1,
      },
    },
  }

  const child: Variants = {
    hidden: {
      opacity: 0,
      y: 30,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration,
        ease: [0.25, 0.1, 0.25, 1],
      },
    },
  }

  const Tag = tag as keyof JSX.IntrinsicElements

  return (
    <Tag ref={ref} className={className}>
      <motion.span
        className="inline"
        variants={container}
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
      >
        {words.map((word, index) => (
          <motion.span
            key={index}
            variants={child}
            className="inline-block"
            style={{ marginRight: '0.25em' }}
          >
            {word}
          </motion.span>
        ))}
      </motion.span>
    </Tag>
  )
}
