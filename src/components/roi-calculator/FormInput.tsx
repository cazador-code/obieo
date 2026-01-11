'use client'

interface Props {
  id: string
  label: string
  type?: 'text' | 'email' | 'number'
  value: string | number
  onChange: (value: string) => void
  placeholder?: string
  helper?: string
  error?: string
  prefix?: string
  suffix?: string
  optional?: boolean
}

export function FormInput({
  id,
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  helper,
  error,
  prefix,
  suffix,
  optional = false,
}: Props) {
  const hasError = Boolean(error)

  return (
    <div className="space-y-1">
      <label
        htmlFor={id}
        className="block text-sm font-medium text-[var(--text-primary)]"
      >
        {label}
        {optional && (
          <span className="text-[var(--text-muted)]"> (optional)</span>
        )}
      </label>
      <div className="relative">
        {prefix && (
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
            {prefix}
          </span>
        )}
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`
            w-full px-4 py-3 rounded-lg
            bg-[var(--bg-primary)]
            border border-[var(--border)]
            text-[var(--text-primary)]
            placeholder:text-[var(--text-muted)]
            focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent
            transition-all duration-200
            ${prefix ? 'pl-8' : ''}
            ${suffix ? 'pr-10' : ''}
            ${hasError ? 'border-red-500 focus:ring-red-500' : ''}
          `}
        />
        {suffix && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
            {suffix}
          </span>
        )}
      </div>
      {error ? (
        <p className="text-sm text-red-500">{error}</p>
      ) : helper ? (
        <p className="text-sm text-[var(--text-muted)]">{helper}</p>
      ) : null}
    </div>
  )
}
