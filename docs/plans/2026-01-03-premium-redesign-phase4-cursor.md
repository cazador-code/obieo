# Premium Redesign Phase 4: Custom Cursor

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement custom cursor with magnetic effects, contextual states, and accessibility considerations.

**Architecture:** Global cursor component that tracks mouse position, detects hoverable elements, and provides magnetic pull on buttons. Disabled on mobile and when reduced motion is preferred.

**Tech Stack:** React, Framer Motion, CSS

**Depends on:** Phase 1-3 complete

---

## Task 1: Create Custom Cursor Component

**Files:**
- Create: `src/components/CustomCursor.tsx`

**Step 1: Create the cursor component**

Create `src/components/CustomCursor.tsx`:
```typescript
'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

type CursorState = 'default' | 'hover' | 'button' | 'view' | 'hidden'

export function CustomCursor() {
  const [cursorState, setCursorState] = useState<CursorState>('default')
  const [isVisible, setIsVisible] = useState(true)
  const [isMounted, setIsMounted] = useState(false)

  const cursorX = useMotionValue(0)
  const cursorY = useMotionValue(0)

  // Smooth spring animation for cursor following
  const springConfig = { damping: 25, stiffness: 300 }
  const cursorXSpring = useSpring(cursorX, springConfig)
  const cursorYSpring = useSpring(cursorY, springConfig)

  // Check for mobile/reduced motion
  useEffect(() => {
    const isMobile = window.matchMedia('(max-width: 768px)').matches
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const isTouch = 'ontouchstart' in window

    if (isMobile || prefersReducedMotion || isTouch) {
      setIsVisible(false)
      return
    }

    setIsMounted(true)

    // Hide default cursor
    document.body.style.cursor = 'none'

    return () => {
      document.body.style.cursor = 'auto'
    }
  }, [])

  // Track mouse position
  useEffect(() => {
    if (!isMounted) return

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
  }, [isMounted, cursorX, cursorY])

  // Detect hoverable elements
  useEffect(() => {
    if (!isMounted) return

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
  }, [isMounted])

  if (!isVisible || !isMounted) return null

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
          x: useSpring(cursorX, { damping: 20, stiffness: 150 }),
          y: useSpring(cursorY, { damping: 20, stiffness: 150 }),
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
```

**Step 2: Commit**

```bash
git add src/components/CustomCursor.tsx
git commit -m "feat: add custom cursor component with states"
```

---

## Task 2: Add Cursor to Layout

**Files:**
- Modify: `src/app/layout.tsx`

**Step 1: Import and add CustomCursor**

Update `src/app/layout.tsx` to include the cursor:
```typescript
import type { Metadata } from "next";
import { DM_Sans, Outfit } from "next/font/google";
import Script from "next/script";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ThemeProvider } from "@/components/ThemeProvider";
import { SmoothScroll } from "@/components/SmoothScroll";
import { CustomCursor } from "@/components/CustomCursor";
import "./globals.css";

// ... fonts and metadata unchanged

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script
          src="https://assets.calendly.com/assets/external/widget.js"
          strategy="lazyOnload"
        />
      </head>
      <body
        className={`${dmSans.variable} ${outfit.variable} antialiased bg-[var(--bg-primary)] text-[var(--text-primary)]`}
      >
        <ThemeProvider>
          <SmoothScroll>
            <CustomCursor />
            <Header />
            <main className="min-h-screen">{children}</main>
            <Footer />
          </SmoothScroll>
        </ThemeProvider>
      </body>
    </html>
  );
}
```

**Step 2: Test cursor**

Run:
```bash
npm run dev
```

Verify:
- [ ] Cursor appears on desktop
- [ ] Cursor grows on links
- [ ] Cursor expands on buttons
- [ ] No cursor on mobile (resize browser to test)

**Step 3: Commit**

```bash
git add src/app/layout.tsx
git commit -m "feat: add custom cursor to layout"
```

---

## Task 3: Create Magnetic Button Component

**Files:**
- Create: `src/components/MagneticButton.tsx`

**Step 1: Create magnetic button**

Create `src/components/MagneticButton.tsx`:
```typescript
'use client'

import { useRef, useState } from 'react'
import { motion } from 'framer-motion'

interface MagneticButtonProps {
  children: React.ReactNode
  className?: string
  strength?: number
  onClick?: () => void
}

export function MagneticButton({
  children,
  className = '',
  strength = 0.3,
  onClick,
}: MagneticButtonProps) {
  const ref = useRef<HTMLButtonElement>(null)
  const [position, setPosition] = useState({ x: 0, y: 0 })

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const { clientX, clientY } = e
    const { left, top, width, height } = ref.current!.getBoundingClientRect()

    const x = (clientX - (left + width / 2)) * strength
    const y = (clientY - (top + height / 2)) * strength

    setPosition({ x, y })
  }

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 })
  }

  // Check for reduced motion
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (prefersReducedMotion) {
    return (
      <button ref={ref} className={className} onClick={onClick}>
        {children}
      </button>
    )
  }

  return (
    <motion.button
      ref={ref}
      className={className}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: 'spring', stiffness: 150, damping: 15, mass: 0.1 }}
      data-cursor="button"
    >
      {children}
    </motion.button>
  )
}
```

**Step 2: Commit**

```bash
git add src/components/MagneticButton.tsx
git commit -m "feat: add MagneticButton component"
```

---

## Task 4: Add View Cursor to Portfolio Cards

**Files:**
- Modify: `src/app/work/page.tsx`

**Step 1: Add data-cursor attribute to portfolio cards**

Update the featured project card and future project placeholders in `src/app/work/page.tsx` to include `data-cursor="view"`:

Find the main project card div and add the attribute:
```tsx
<div
  data-cursor="view"
  className="bg-[var(--bg-card)] rounded-2xl p-8 md:p-12 border border-[var(--border)] cursor-pointer"
>
```

And for the placeholder grid items:
```tsx
{[1, 2, 3].map((i) => (
  <div
    key={i}
    data-cursor="view"
    className="aspect-[4/3] bg-[var(--bg-secondary)] rounded-xl flex items-center justify-center border border-[var(--border)] cursor-pointer"
  >
    <p className="text-[var(--text-muted)]">Coming Soon</p>
  </div>
))}
```

**Step 2: Test cursor state changes**

Verify cursor shows "View" text when hovering portfolio items

**Step 3: Commit**

```bash
git add src/app/work/page.tsx
git commit -m "feat: add view cursor state to portfolio cards"
```

---

## Task 5: Update Button Component with Magnetic Effect

**Files:**
- Modify: `src/components/ui/Button.tsx`

**Step 1: Add magnetic wrapper option**

Update `src/components/ui/Button.tsx`:
```typescript
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
        {...(props as any)}
      >
        {children}
      </motion.button>
    )
  }
)

Button.displayName = 'Button'
```

**Step 2: Test magnetic effect**

Hover over buttons and verify magnetic pull

**Step 3: Commit**

```bash
git add src/components/ui/Button.tsx
git commit -m "feat: add magnetic effect to Button component"
```

---

## Task 6: Final Phase 4 Verification

**Step 1: Run build**

```bash
npm run build
```

**Step 2: Test checklist**

- [ ] Custom cursor visible on desktop
- [ ] Cursor hidden on mobile
- [ ] Cursor changes state on buttons (larger ring)
- [ ] Cursor shows "View" on portfolio cards
- [ ] Magnetic pull on buttons
- [ ] No cursor when reduced motion is preferred
- [ ] Default cursor returns when leaving window

**Step 3: Commit completion**

```bash
git add -A
git commit -m "chore: phase 4 custom cursor complete"
```

---

## Phase 4 Complete

Custom cursor implemented:
- ✅ Main cursor dot with spring following
- ✅ Outer ring with delayed following
- ✅ Button hover state (larger ring)
- ✅ View state for portfolio cards
- ✅ Magnetic button effect
- ✅ Mobile detection (disabled)
- ✅ Reduced motion support
- ✅ data-cursor attribute system

**Next:** Phase 5 - Quiz Funnel
