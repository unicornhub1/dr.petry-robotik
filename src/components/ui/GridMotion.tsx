'use client'

import { useEffect, useRef, FC, ReactNode } from 'react'
import { gsap } from 'gsap'

interface GridMotionProps {
  items?: (string | ReactNode)[]
  gradientColor?: string
  className?: string
}

const GridMotion: FC<GridMotionProps> = ({
  items = [],
  gradientColor = 'var(--theme-surface)',
  className = '',
}) => {
  const gridRef = useRef<HTMLDivElement>(null)
  const rowRefs = useRef<(HTMLDivElement | null)[]>([])
  const mouseXRef = useRef<number>(typeof window !== 'undefined' ? window.innerWidth / 2 : 0)

  const totalItems = 21 // 3 rows x 7 items
  const defaultItems = Array.from({ length: totalItems }, (_, index) => `Item ${index + 1}`)
  const combinedItems = items.length > 0 ? items.slice(0, totalItems) : defaultItems

  useEffect(() => {
    if (typeof window === 'undefined') return

    mouseXRef.current = window.innerWidth / 2
    gsap.ticker.lagSmoothing(0)

    const handleMouseMove = (e: MouseEvent): void => {
      mouseXRef.current = e.clientX
    }

    const updateMotion = (): void => {
      const maxMoveAmount = 300
      const baseDuration = 0.8
      const inertiaFactors = [0.6, 0.4, 0.3, 0.2]

      rowRefs.current.forEach((row, index) => {
        if (row) {
          const direction = index % 2 === 0 ? 1 : -1
          const moveAmount =
            ((mouseXRef.current / window.innerWidth) * maxMoveAmount - maxMoveAmount / 2) *
            direction

          gsap.to(row, {
            x: moveAmount,
            duration: baseDuration + inertiaFactors[index % inertiaFactors.length],
            ease: 'power3.out',
            overwrite: 'auto',
          })
        }
      })
    }

    const removeAnimationLoop = gsap.ticker.add(updateMotion)
    window.addEventListener('mousemove', handleMouseMove)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      removeAnimationLoop()
    }
  }, [])

  return (
    <div ref={gridRef} className={`h-full w-full overflow-hidden ${className}`}>
      <section
        className="w-full h-[40vh] md:h-[60vh] overflow-hidden relative flex items-center justify-center"
        style={{
          background: `radial-gradient(circle, ${gradientColor} 0%, transparent 100%)`,
        }}
      >
        {/* Grid Container */}
        <div className="gap-4 md:gap-6 flex-none relative w-[300vw] md:w-[150vw] grid grid-rows-3 grid-cols-1 rotate-[-15deg] origin-center z-[2]">
          {Array.from({ length: 3 }, (_, rowIndex) => (
            <div
              key={rowIndex}
              className="grid gap-2 md:gap-4 grid-cols-7"
              style={{ willChange: 'transform, filter' }}
              ref={(el) => {
                if (el) rowRefs.current[rowIndex] = el
              }}
            >
              {Array.from({ length: 7 }, (_, itemIndex) => {
                const content = combinedItems[rowIndex * 7 + itemIndex]
                return (
                  <div key={itemIndex} className="relative aspect-[4/3]">
                    <div className="relative w-full h-full overflow-hidden rounded-xl md:rounded-2xl bg-[var(--theme-surface)] border border-[var(--theme-border)] flex items-center justify-center">
                      {typeof content === 'string' && content.startsWith('/') ? (
                        // Image path
                        <div
                          className="w-full h-full bg-cover bg-center absolute top-0 left-0"
                          style={{ backgroundImage: `url(${content})` }}
                        />
                      ) : typeof content === 'string' && content.startsWith('http') ? (
                        // External URL
                        <div
                          className="w-full h-full bg-cover bg-center absolute top-0 left-0"
                          style={{ backgroundImage: `url(${content})` }}
                        />
                      ) : (
                        // Text or JSX content
                        <div className="p-2 md:p-4 text-center z-[1] text-[var(--theme-text)] text-xs md:text-base">
                          {content}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          ))}
        </div>

        {/* Edge Fades */}
        <div className="absolute inset-0 pointer-events-none z-[3]">
          <div className="absolute top-0 left-0 right-0 h-20 md:h-32 bg-gradient-to-b from-[var(--theme-background)] to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-20 md:h-32 bg-gradient-to-t from-[var(--theme-background)] to-transparent" />
          <div className="absolute top-0 left-0 bottom-0 w-12 md:w-32 bg-gradient-to-r from-[var(--theme-background)] to-transparent" />
          <div className="absolute top-0 right-0 bottom-0 w-12 md:w-32 bg-gradient-to-l from-[var(--theme-background)] to-transparent" />
        </div>
      </section>
    </div>
  )
}

export default GridMotion
