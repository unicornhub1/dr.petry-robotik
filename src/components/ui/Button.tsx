'use client'

import React from 'react'
import { motion } from 'framer-motion'

type ButtonVariant = 'primary' | 'secondary'

interface ButtonProps {
  children: string
  variant?: ButtonVariant
  href?: string
  onClick?: () => void
  disabled?: boolean
  className?: string
  type?: 'button' | 'submit' | 'reset'
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  href,
  onClick,
  disabled = false,
  className = '',
  type = 'button',
}) => {
  const Component = href ? motion.a : motion.button

  // Container Hover (Schatten & Scale)
  const containerVariants = {
    initial: {
      scale: 1,
      boxShadow: '0px 0px 0px rgba(218, 78, 36, 0)',
    },
    hover: {
      scale: 1.02,
      boxShadow:
        variant === 'primary'
          ? '0px 0px 30px rgba(218, 78, 36, 0.3)'
          : '0px 0px 20px rgba(255, 255, 255, 0.1)',
    },
  }

  // Text Animation - Blur + Slide (smooth, no spring)
  const text1Variants = {
    initial: { y: 0, opacity: 1, filter: 'blur(0px)' },
    hover: { y: -20, opacity: 0, filter: 'blur(4px)' },
  }

  const text2Variants = {
    initial: { y: 20, opacity: 0, filter: 'blur(4px)' },
    hover: { y: 0, opacity: 1, filter: 'blur(0px)' },
  }

  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : ''

  return (
    <Component
      href={disabled ? undefined : href}
      onClick={disabled ? undefined : onClick}
      type={href ? undefined : type}
      initial="initial"
      whileHover={disabled ? undefined : 'hover'}
      variants={containerVariants}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className={`relative flex items-center justify-center px-6 py-3 rounded-xl cursor-pointer no-underline group ${disabledClasses} ${className}`}
      style={{ isolation: 'isolate' }}
    >
      {/* =======================================
          1. PRIMARY BUTTON LAYERS
         ======================================= */}
      {variant === 'primary' && (
        <>
          {/* LAYER A: Der bunte Gradient-Rahmen (ganz unten) */}
          <div
            className="absolute inset-0 z-0 rounded-xl"
            style={{
              background:
                'linear-gradient(163deg, rgb(255, 137, 24) 28%, rgb(162, 41, 4) 54%, rgb(0, 0, 0) 68%, rgb(0, 152, 243) 100%)',
            }}
          />

          {/* LAYER B: Der Füll-Hintergrund - Inset 1px für Border-Look */}
          <div className="absolute inset-[1px] bg-[var(--theme-background)] rounded-[15px] z-10" />
        </>
      )}

      {/* =======================================
          2. SECONDARY BUTTON LAYERS
         ======================================= */}
      {variant === 'secondary' && (
        <>
          {/* Hintergrund wie Header */}
          <div
            className="absolute inset-0 rounded-xl z-0 transition-all duration-300"
            style={{
              backgroundColor: 'var(--header-bg)',
              backdropFilter: 'var(--header-blur)',
              WebkitBackdropFilter: 'var(--header-blur)',
              borderWidth: '1px',
              borderStyle: 'solid',
              borderColor: 'var(--header-border)',
            }}
          />

          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-[var(--theme-text)]/0 group-hover:bg-[var(--theme-text)]/5 transition-colors duration-300 z-0 rounded-xl" />
        </>
      )}

      {/* =======================================
          3. CONTENT / TEXT ANIMATION (Blur + Slide)
         ======================================= */}
      <div className="relative z-30 h-[20px] overflow-hidden leading-[20px]">
        <motion.div
          className="flex flex-col items-center"
          variants={{
            initial: { y: 0, filter: 'blur(0px)' },
            hover: { y: '-50%', filter: 'blur(0px)' },
          }}
          transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
        >
          {/* Text 1: Sichtbar */}
          <span className="block font-medium text-[14px] text-[var(--theme-text)] whitespace-nowrap h-[20px] flex items-center">
            {children}
          </span>

          {/* Text 2: Kommt von unten */}
          <span className="block font-medium text-[14px] text-[var(--theme-text)] whitespace-nowrap h-[20px] flex items-center">
            {children}
          </span>
        </motion.div>
      </div>
    </Component>
  )
}

export default Button
