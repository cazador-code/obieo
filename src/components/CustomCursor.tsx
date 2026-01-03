'use client'

import { useEffect, useState, useSyncExternalStore, useRef } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

type CursorState = 'default' | 'hover' | 'button' | 'view' | 'hidden'

// Check if cursor should be disabled (mobile, touch, reduced motion)
function subscribeToCursorDisabled(callback: () => void) {
  const mqlMobile = window.matchMedia('(max-width: 768px)')
  const mqlMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
  mqlMobile.addEventListener('change', callback)
  mqlMotion.addEventListener('change', callback)
  return () => {
    mqlMobile.removeEventListener('change', callback)
    mqlMotion.removeEventListener('change', callback)
  }
}

function getCursorDisabledSnapshot() {
  const isMobile = window.matchMedia('(max-width: 768px)').matches
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const isTouch = 'ontouchstart' in window
  return isMobile || prefersReducedMotion || isTouch
}

function getCursorDisabledServerSnapshot() {
  return true // Disable on server
}


export function CustomCursor() {
  const [cursorState, setCursorState] = useState<CursorState>('default')
  const hasSetupRef = useRef(false)

  const isDisabled = useSyncExternalStore(
    subscribeToCursorDisabled,
    getCursorDisabledSnapshot,
    getCursorDisabledServerSnapshot
  )

  const cursorX = useMotionValue(0)
  const cursorY = useMotionValue(0)

  // Smooth spring animation for cursor following
  const springConfig = { damping: 25, stiffness: 300 }
  const cursorXSpring = useSpring(cursorX, springConfig)
  const cursorYSpring = useSpring(cursorY, springConfig)

  // Outer ring springs (more delay)
  const outerSpringConfig = { damping: 20, stiffness: 150 }
  const outerXSpring = useSpring(cursorX, outerSpringConfig)
  const outerYSpring = useSpring(cursorY, outerSpringConfig)

  // Setup cursor hiding and mark as mounted
  useEffect(() => {
    if (isDisabled || hasSetupRef.current) return

    hasSetupRef.current = true
    document.body.style.cursor = 'none'

    return () => {
      document.body.style.cursor = 'auto'
    }
  }, [isDisabled])

  // Track mouse position
  useEffect(() => {
    if (isDisabled || !hasSetupRef.current) return

    const handleMouseMove = (e: MouseEvent) => {
      cursorX.set(e.clientX)
      cursorY.set(e.clientY)
    }

    const handleMouseLeave = () => setCursorState('hidden')
    const handleMouseEnter = () => setCursorState('default')

    window.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseleave', handleMouseLeave)
    document.addEventListener('mouseenter', handleMouseEnter)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseleave', handleMouseLeave)
      document.removeEventListener('mouseenter', handleMouseEnter)
    }
  }, [isDisabled, cursorX, cursorY])

  // Detect hoverable elements
  useEffect(() => {
    if (isDisabled || !hasSetupRef.current) return

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement

      // Check for data-cursor attribute
      const cursorType = target.closest('[data-cursor]')?.getAttribute('data-cursor')
      if (cursorType) {
        setCursorState(cursorType as CursorState)
        return
      }

      // Check for buttons
      if (target.closest('button, [role="button"], .btn')) {
        setCursorState('button')
        return
      }

      // Check for links
      if (target.closest('a')) {
        setCursorState('hover')
        return
      }

      setCursorState('default')
    }

    document.addEventListener('mouseover', handleMouseOver)

    return () => {
      document.removeEventListener('mouseover', handleMouseOver)
    }
  }, [isDisabled])

  // Don't render on server or when disabled
  if (isDisabled) return null

  // Use a key to force re-render after mount
  if (typeof window === 'undefined') return null

  const cursorVariants = {
    default: {
      width: 8,
      height: 8,
      backgroundColor: 'var(--accent)',
      mixBlendMode: 'difference' as const,
    },
    hover: {
      width: 16,
      height: 16,
      backgroundColor: 'var(--accent)',
      mixBlendMode: 'difference' as const,
    },
    button: {
      width: 48,
      height: 48,
      backgroundColor: 'transparent',
      border: '2px solid var(--accent)',
      mixBlendMode: 'normal' as const,
    },
    view: {
      width: 80,
      height: 80,
      backgroundColor: 'var(--accent)',
      mixBlendMode: 'normal' as const,
    },
    hidden: {
      width: 0,
      height: 0,
      opacity: 0,
    },
  }

  return (
    <>
      {/* Main cursor dot */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9999] rounded-full flex items-center justify-center"
        style={{
          x: cursorXSpring,
          y: cursorYSpring,
          translateX: '-50%',
          translateY: '-50%',
        }}
        variants={cursorVariants}
        animate={cursorState}
        transition={{ duration: 0.15 }}
      >
        {cursorState === 'view' && (
          <span className="text-xs font-medium text-white uppercase tracking-wider">
            View
          </span>
        )}
      </motion.div>

      {/* Outer ring (always visible, follows with more delay) */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9998] rounded-full border border-[var(--accent)]/30"
        style={{
          x: outerXSpring,
          y: outerYSpring,
          translateX: '-50%',
          translateY: '-50%',
        }}
        animate={{
          width: cursorState === 'hidden' ? 0 : 32,
          height: cursorState === 'hidden' ? 0 : 32,
          opacity: cursorState === 'button' || cursorState === 'view' ? 0 : 1,
        }}
        transition={{ duration: 0.15 }}
      />
    </>
  )
}
