'use client'

import { useRef, useCallback, KeyboardEvent, ClipboardEvent } from 'react'

interface OTPInputProps {
  value: string
  onChange: (value: string) => void
  onComplete: (code: string) => void
  disabled?: boolean
  error?: string
}

export default function OTPInput({ value, onChange, onComplete, disabled, error }: OTPInputProps) {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([])

  const digits = value.padEnd(6, ' ').slice(0, 6).split('')

  const focusInput = useCallback((index: number) => {
    inputsRef.current[index]?.focus()
  }, [])

  const handleChange = useCallback(
    (index: number, char: string) => {
      if (!/^\d$/.test(char)) return

      const newDigits = value.padEnd(6, ' ').slice(0, 6).split('')
      newDigits[index] = char
      const newValue = newDigits.join('').replace(/ /g, '')
      onChange(newValue)

      if (index < 5) {
        focusInput(index + 1)
      }

      // Auto-submit when 6th digit entered
      if (newValue.replace(/ /g, '').length === 6 && /^\d{6}$/.test(newValue)) {
        onComplete(newValue)
      }
    },
    [value, onChange, onComplete, focusInput]
  )

  const handleKeyDown = useCallback(
    (index: number, e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Backspace') {
        e.preventDefault()
        const newDigits = value.padEnd(6, ' ').slice(0, 6).split('')
        if (newDigits[index] && newDigits[index] !== ' ') {
          newDigits[index] = ' '
          onChange(newDigits.join('').trimEnd())
        } else if (index > 0) {
          newDigits[index - 1] = ' '
          onChange(newDigits.join('').trimEnd())
          focusInput(index - 1)
        }
      } else if (e.key === 'ArrowLeft' && index > 0) {
        focusInput(index - 1)
      } else if (e.key === 'ArrowRight' && index < 5) {
        focusInput(index + 1)
      }
    },
    [value, onChange, focusInput]
  )

  const handlePaste = useCallback(
    (e: ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault()
      const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
      if (pasted.length === 6) {
        onChange(pasted)
        focusInput(5)
        onComplete(pasted)
      }
    },
    [onChange, onComplete, focusInput]
  )

  return (
    <div>
      <div className="flex gap-2 sm:gap-3 justify-center">
        {digits.map((digit, i) => (
          <input
            key={i}
            ref={(el) => { inputsRef.current[i] = el }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit === ' ' ? '' : digit}
            disabled={disabled}
            autoFocus={i === 0}
            autoComplete={i === 0 ? 'one-time-code' : 'off'}
            onChange={(e) => {
              const char = e.target.value.slice(-1)
              if (char) handleChange(i, char)
            }}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={handlePaste}
            className={`w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold bg-[#f5f2ed] border-2 rounded-lg text-[#1a1612] focus:outline-none focus-visible:outline-none transition-colors disabled:opacity-50 ${
              error
                ? 'border-red-400 focus:border-red-400'
                : 'border-[#e8e4dc] focus:border-[var(--accent)]'
            }`}
            aria-label={`Digit ${i + 1}`}
          />
        ))}
      </div>
      {error && <p className="mt-3 text-sm text-red-400 text-center">{error}</p>}
    </div>
  )
}
