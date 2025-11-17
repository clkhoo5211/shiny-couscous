import React, { useState } from 'react'
import { BaseFieldProps } from '@/types'
import { cn } from '@/lib/utils'

export interface JSONFieldProps extends BaseFieldProps {
  fieldType: 'json' | 'json-editor'
  value?: any // JSON object or string
  defaultValue?: any
  height?: number
  formatOnBlur?: boolean
}

export function JSONField({
  fieldId,
  fieldName,
  fieldType,
  label,
  value,
  defaultValue,
  onChange,
  onBlur,
  onFocus,
  required,
  disabled,
  readonly,
  hidden,
  placeholder,
  helpText,
  tooltip,
  validation,
  error,
  style,
  height = 300,
  formatOnBlur = true,
  className,
}: JSONFieldProps) {
  // Get field value
  const jsonValue = value ?? defaultValue ?? {}

  // Convert value to JSON string
  const getJsonString = (val: any): string => {
    if (typeof val === 'string') {
      try {
        JSON.parse(val)
        return val
      } catch {
        return JSON.stringify(val, null, 2)
      }
    }
    return JSON.stringify(val, null, 2)
  }

  const [jsonString, setJsonString] = useState(getJsonString(jsonValue))
  const [isValid, setIsValid] = useState(true)

  // Handle change
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newString = e.target.value
    setJsonString(newString)

    // Validate JSON
    try {
      const parsed = JSON.parse(newString)
      setIsValid(true)
      onChange(parsed)
    } catch {
      setIsValid(false)
      // Still allow editing even if invalid
      onChange(newString)
    }
  }

  // Handle blur - format JSON if valid
  const handleBlur = () => {
    if (formatOnBlur && isValid) {
      try {
        const parsed = JSON.parse(jsonString)
        const formatted = JSON.stringify(parsed, null, 2)
        setJsonString(formatted)
        onChange(parsed)
      } catch {
        // Keep as is if invalid
      }
    }
    if (onBlur) onBlur()
  }

  // Merge styles
  const containerClassName = cn('mb-4', style?.containerClassName)
  const textareaClassName = cn(
    'input font-mono text-sm',
    error && 'input-error',
    !isValid && 'border-error',
    disabled && 'opacity-50 cursor-not-allowed',
    readonly && 'bg-gray-100 cursor-default',
    style?.className,
    className
  )

  if (hidden) {
    return null
  }

  return (
    <div className={containerClassName}>
      <label
        htmlFor={fieldId}
        className={cn('label', required && 'label-required', style?.labelClassName)}
      >
        {label}
        {tooltip && (
          <span className="ml-1 text-gray-400" title={tooltip}>
            ℹ️
          </span>
        )}
      </label>

      <textarea
        id={fieldId}
        name={fieldName}
        value={jsonString}
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={onFocus}
        placeholder={placeholder || '{\n  "key": "value"\n}'}
        required={required}
        disabled={disabled}
        readOnly={readonly}
        rows={Math.ceil(height / 24)}
        className={textareaClassName}
        style={{ minHeight: `${height}px`, ...style?.style }}
        spellCheck={false}
        aria-invalid={!!error || !isValid}
        aria-describedby={error ? `${fieldId}-error` : helpText ? `${fieldId}-help` : undefined}
      />

      {/* Validation status */}
      {!isValid && (
        <p className="text-sm text-error mt-1">Invalid JSON format</p>
      )}

      {/* Hidden input for form submission */}
      <input
        type="hidden"
        name={fieldName}
        value={typeof jsonValue === 'string' ? jsonValue : JSON.stringify(jsonValue)}
        required={required}
      />

      {error && (
        <p id={`${fieldId}-error`} className="error-message mt-1" role="alert">
          {error}
        </p>
      )}
      {helpText && !error && (
        <p id={`${fieldId}-help`} className="help-text">
          {helpText}
        </p>
      )}
    </div>
  )
}

