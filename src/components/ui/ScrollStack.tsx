'use client'

import React, { useEffect, useRef, useCallback } from 'react'
import type { ReactNode } from 'react'

export interface ScrollStackItemProps {
  children: ReactNode
  className?: string
}

export const ScrollStackItem: React.FC<ScrollStackItemProps> = ({
  children,
  className = '',
}) => (
  <div
    className={`scroll-stack-card relative w-full min-h-[400px] my-8 p-8 md:p-12 rounded-[30px] bg-[var(--theme-surface)] border border-[var(--theme-border)] shadow-lg origin-top will-change-transform ${className}`}
    style={{
      backfaceVisibility: 'hidden',
      transformStyle: 'preserve-3d',
    }}
  >
    {children}
  </div>
)

interface ScrollStackProps {
  className?: string
  children: ReactNode
  itemScale?: number
  stackPosition?: number
  baseScale?: number
}

const ScrollStack: React.FC<ScrollStackProps> = ({
  children,
  className = '',
  itemScale = 0.03,
  stackPosition = 100,
  baseScale = 0.9,
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<HTMLElement[]>([])

  const updateCardTransforms = useCallback(() => {
    if (!cardsRef.current.length) return

    const scrollTop = window.scrollY
    const windowHeight = window.innerHeight

    cardsRef.current.forEach((card, i) => {
      if (!card) return

      const rect = card.getBoundingClientRect()
      const cardTop = rect.top + scrollTop
      const triggerStart = cardTop - windowHeight + stackPosition
      const triggerEnd = cardTop - stackPosition

      // Calculate progress (0 to 1)
      let progress = 0
      if (scrollTop > triggerStart && scrollTop < triggerEnd) {
        progress = (scrollTop - triggerStart) / (triggerEnd - triggerStart)
      } else if (scrollTop >= triggerEnd) {
        progress = 1
      }

      // Calculate scale
      const targetScale = baseScale + i * itemScale
      const scale = 1 - progress * (1 - targetScale)

      // Calculate sticky position
      let translateY = 0
      const stickyStart = cardTop - windowHeight + stackPosition
      const stickyEnd = cardTop + rect.height

      if (scrollTop > stickyStart && scrollTop < stickyEnd) {
        // Card is in sticky range
        const stickyProgress = Math.min(
          1,
          (scrollTop - stickyStart) / (stickyEnd - stickyStart)
        )
        translateY = stickyProgress * (i * 20) // Stack offset
      }

      // Apply transform
      card.style.transform = `scale(${scale}) translateY(${translateY}px)`
      card.style.zIndex = `${cardsRef.current.length - i}`
    })
  }, [itemScale, stackPosition, baseScale])

  useEffect(() => {
    // Get all cards
    const cards = Array.from(
      document.querySelectorAll('.scroll-stack-card')
    ) as HTMLElement[]
    cardsRef.current = cards

    // Initial setup
    cards.forEach((card, i) => {
      card.style.willChange = 'transform'
      card.style.transformOrigin = 'top center'
      card.style.position = 'sticky'
      card.style.top = `${100 + i * 20}px`
    })

    // Add scroll listener
    const handleScroll = () => {
      requestAnimationFrame(updateCardTransforms)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    updateCardTransforms()

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [updateCardTransforms])

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {children}
    </div>
  )
}

export default ScrollStack
