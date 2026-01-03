'use client'

import { forwardRef, ButtonHTMLAttributes, useRef, useState } from 'react'
import { motion } from 'framer-motion'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  magnetic?: boolean
  children: React.ReactNode
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', magnetic = true, className = '', children, ...props }, ref) => {
    const internalRef = useRef<HTMLButtonElement>(null)
    const buttonRef = (ref as React.RefObject<HTMLButtonElement>) || internalRef
    const [position, setPosition] = useState({ x: 0, y: 0 })

    const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none'

    const variants = {
      primary: 'bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] hover:scale-[1.02]',
      secondary: 'bg-[var(--bg-card)] text-[var(--text-primary)] border border-[var(--border)] hover:bg-[var(--bg-secondary)]',
      outline: 'border-2 border-[var(--accent)] text-[var(--accent)] hover:bg-[var(--accent)] hover:text-white',
      ghost: 'text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]',
    }

    const sizes = {
      sm: 'px-4 py-2 text-sm',
      md: 'px-6 py-3 text-base',
      lg: 'px-8 py-4 text-lg',
    }

    const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!magnetic || !buttonRef.current) return

      const { clientX, clientY } = e
      const { left, top, width, height } = buttonRef.current.getBoundingClientRect()

      const x = (clientX - (left + width / 2)) * 0.2
      const y = (clientY - (top + height / 2)) * 0.2

      setPosition({ x, y })
    }

    const handleMouseLeave = () => {
      setPosition({ x: 0, y: 0 })
    }

    // Check for reduced motion preference
    const isBrowser = typeof window !== 'undefined'
    const prefersReducedMotion = isBrowser && window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (!magnetic || prefersReducedMotion) {
      return (
        <button
          ref={buttonRef}
          className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
          data-cursor="button"
          {...props}
        >
          {children}
        </button>
      )
    }

    return (
      <motion.button
        ref={buttonRef}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        animate={{ x: position.x, y: position.y }}
        transition={{ type: 'spring', stiffness: 150, damping: 15, mass: 0.1 }}
        data-cursor="button"
        {...(props as React.ComponentProps<typeof motion.button>)}
      >
        {children}
      </motion.button>
    )
  }
)

Button.displayName = 'Button'
