'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

interface BookingModalContextType {
  isOpen: boolean
  source: string
  openModal: (source?: string) => void
  closeModal: () => void
}

const BookingModalContext = createContext<BookingModalContextType | undefined>(undefined)

export function BookingModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [source, setSource] = useState('')

  const openModal = useCallback((source?: string) => {
    setSource(source || '')
    setIsOpen(true)
    document.body.style.overflow = 'hidden'
  }, [])

  const closeModal = useCallback(() => {
    setIsOpen(false)
    document.body.style.overflow = ''
  }, [])

  return (
    <BookingModalContext.Provider value={{ isOpen, source, openModal, closeModal }}>
      {children}
    </BookingModalContext.Provider>
  )
}

export function useBookingModal() {
  const context = useContext(BookingModalContext)
  if (context === undefined) {
    return { isOpen: false, source: '', openModal: () => {}, closeModal: () => {} }
  }
  return context
}
