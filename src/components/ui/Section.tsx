import { HTMLAttributes, forwardRef } from 'react'

interface SectionProps extends HTMLAttributes<HTMLElement> {
  variant?: 'default' | 'alternate' | 'dark'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
}

export const Section = forwardRef<HTMLElement, SectionProps>(
  ({ variant = 'default', size = 'md', className = '', children, ...props }, ref) => {
    const variants = {
      default: 'bg-[var(--bg-primary)]',
      alternate: 'bg-[var(--bg-secondary)]',
      dark: 'bg-[var(--text-primary)] text-[var(--bg-primary)]',
    }

    const sizes = {
      sm: 'py-16 md:py-20',
      md: 'py-20 md:py-28',
      lg: 'py-28 md:py-36',
    }

    return (
      <section
        ref={ref}
        className={`${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {children}
      </section>
    )
  }
)

Section.displayName = 'Section'
