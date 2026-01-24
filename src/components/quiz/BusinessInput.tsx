'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { VerifiedBusiness } from './types'

interface BusinessInputProps {
  value: VerifiedBusiness | null
  onChange: (business: VerifiedBusiness | null) => void
  error?: string
  placeholder?: string
}

interface PlacePrediction {
  placeId: string
  mainText: string
  secondaryText: string
  fullText: string
}

/**
 * Business name input with Google Places Autocomplete (New API).
 * Uses the REST-based autocomplete instead of the JS widget to avoid legacy API issues.
 */
export function BusinessInput({
  value,
  onChange,
  error,
  placeholder = 'Start typing your business name...',
}: BusinessInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)
  const [inputValue, setInputValue] = useState(value?.name || '')
  const [isVerified, setIsVerified] = useState(!!value)
  const [predictions, setPredictions] = useState<PlacePrediction[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY

  // Fetch autocomplete predictions from new Places API
  const fetchPredictions = useCallback(async (input: string) => {
    if (!apiKey || input.length < 2) {
      setPredictions([])
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(
        'https://places.googleapis.com/v1/places:autocomplete',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': apiKey,
          },
          body: JSON.stringify({
            input,
            includedPrimaryTypes: ['establishment'],
            languageCode: 'en',
          }),
        }
      )

      if (!response.ok) {
        console.error('Places API error:', response.status)
        setPredictions([])
        return
      }

      const data = await response.json()
      const suggestions = data.suggestions || []

      setPredictions(
        suggestions
          .filter((s: any) => s.placePrediction)
          .map((s: any) => ({
            placeId: s.placePrediction.placeId,
            mainText: s.placePrediction.structuredFormat?.mainText?.text || '',
            secondaryText: s.placePrediction.structuredFormat?.secondaryText?.text || '',
            fullText: s.placePrediction.text?.text || '',
          }))
      )
    } catch (err) {
      console.error('Failed to fetch predictions:', err)
      setPredictions([])
    } finally {
      setIsLoading(false)
    }
  }, [apiKey])

  // Fetch place details when user selects a prediction
  const selectPlace = useCallback(async (prediction: PlacePrediction) => {
    if (!apiKey) return

    setIsLoading(true)
    try {
      const response = await fetch(
        `https://places.googleapis.com/v1/places/${prediction.placeId}?fields=id,displayName,formattedAddress,addressComponents,location`,
        {
          headers: {
            'X-Goog-Api-Key': apiKey,
          },
        }
      )

      if (!response.ok) {
        console.error('Place details error:', response.status)
        return
      }

      const place = await response.json()

      // Extract city and state from address components
      let city = ''
      let state = ''
      place.addressComponents?.forEach((component: any) => {
        if (component.types?.includes('locality')) {
          city = component.longText
        }
        if (component.types?.includes('administrative_area_level_1')) {
          state = component.shortText
        }
      })

      const business: VerifiedBusiness = {
        name: place.displayName?.text || prediction.mainText,
        placeId: prediction.placeId,
        formattedAddress: place.formattedAddress || prediction.secondaryText,
        city,
        state,
        lat: place.location?.latitude,
        lng: place.location?.longitude,
      }

      setInputValue(business.name)
      setIsVerified(true)
      setPredictions([])
      setShowDropdown(false)
      onChange(business)
    } catch (err) {
      console.error('Failed to fetch place details:', err)
    } finally {
      setIsLoading(false)
    }
  }, [apiKey, onChange])

  // Debounced input handler
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value
      setInputValue(newValue)
      setShowDropdown(true)

      // If user types after selection, mark as unverified
      if (isVerified && newValue !== value?.name) {
        setIsVerified(false)
        onChange(null)
      }

      // Debounce API calls
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
      debounceRef.current = setTimeout(() => {
        fetchPredictions(newValue)
      }, 300)
    },
    [isVerified, value, onChange, fetchPredictions]
  )

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (inputRef.current && !inputRef.current.parentElement?.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [])

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor="business-name"
        className="text-sm font-medium text-[var(--text-primary)]"
      >
        Business Name
      </label>
      <div className="relative">
        <input
          ref={inputRef}
          id="business-name"
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => inputValue.length >= 2 && setShowDropdown(true)}
          placeholder={placeholder}
          autoComplete="off"
          className={`
            w-full px-4 py-3 rounded-lg
            bg-[var(--bg-card)]
            border border-[var(--border)]
            text-[var(--text-primary)]
            placeholder:text-[var(--text-muted)]
            focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent
            transition-all duration-200
            pr-10
            ${error ? 'border-red-500 focus:ring-red-500' : ''}
            ${isVerified ? 'border-green-500' : ''}
          `}
        />
        {/* Status indicator */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-[var(--text-muted)] border-t-transparent rounded-full animate-spin" />
          ) : isVerified ? (
            <svg
              className="w-5 h-5 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          ) : inputValue ? (
            <svg
              className="w-5 h-5 text-amber-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          ) : null}
        </div>

        {/* Predictions dropdown */}
        {showDropdown && predictions.length > 0 && (
          <ul className="absolute z-50 w-full mt-1 bg-[var(--bg-card)] border border-[var(--border)] rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {predictions.map((prediction) => (
              <li key={prediction.placeId}>
                <button
                  type="button"
                  onClick={() => selectPlace(prediction)}
                  className="w-full px-4 py-3 text-left hover:bg-[var(--bg-secondary)] transition-colors flex items-start gap-3"
                >
                  <svg
                    className="w-5 h-5 text-[var(--text-muted)] mt-0.5 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <div>
                    <div className="font-medium text-[var(--text-primary)]">
                      {prediction.mainText}
                    </div>
                    <div className="text-sm text-[var(--text-secondary)]">
                      {prediction.secondaryText}
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Helper text */}
      {!isVerified && inputValue && !error && predictions.length === 0 && !isLoading && (
        <p className="text-sm text-amber-500">
          Select your business from the dropdown to verify
        </p>
      )}
      {isVerified && value && (
        <p className="text-sm text-green-600">
          ✓ Verified: {value.city}{value.state ? `, ${value.state}` : ''}
        </p>
      )}
      {error && <p className="text-sm text-red-500">{error}</p>}

      {/* Fallback if no API key */}
      {!apiKey && (
        <p className="text-xs text-[var(--text-muted)]">
          Business verification unavailable. Enter your business name manually.
        </p>
      )}
    </div>
  )
}
