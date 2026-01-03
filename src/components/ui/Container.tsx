import { HTMLAttributes, forwardRef } from 'react'

interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  children: React.ReactNode
}

export const Container = forwardRef<HTMLDivElement, ContainerProps>(
  ({ size = 'lg', className = '', children, ...props }, ref) => {
    const sizes = {
      sm: 'max-w-2xl',
      md: 'max-w-4xl',
      lg: 'max-w-6xl',
      xl: 'max-w-7xl',
    }

    return (
      <div
        ref={ref}
        className={`${sizes[size]} mx-auto px-4 sm:px-6 lg:px-8 ${className}`}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Container.displayName = 'Container'
