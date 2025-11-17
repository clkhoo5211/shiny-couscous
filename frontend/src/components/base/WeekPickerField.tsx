import React, { useState } from 'react'
import { BaseFieldProps } from '@/types'
import { cn } from '@/lib/utils'

export interface WeekPickerFieldProps extends BaseFieldProps {
  fieldType: 'week' | 'week-picker'
  value?: string // Format: YYYY-Www (e.g., 2025-W01)
  defaultValue?: string
  min?: string
  max?: string
}

export function WeekPickerField({
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
  min,
  max,
  className,
}: WeekPickerFieldProps) {
  // Get field value
  const fieldValue = value ?? defaultValue ?? ''

  // Handle change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value)
  }

  // Format week display
  const formatWeekDisplay = (weekValue: string): string => {
    if (!weekValue) return ''
    const match = weekValue.match(/^(\d{4})-W(\d{2})$/i)
    if (match) {
      const [, year, week] = match
      return `Week ${week}, ${year}`
    }
    return weekValue
  }

  // Merge styles
  const containerClassName = cn('mb-4', style?.containerClassName)
  const inputClassName = cn(
    'input',
    error && 'input-error',
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
      <input
        id={fieldId}
        name={fieldName}
        type="week"
        value={fieldValue}
        onChange={handleChange}
        onBlur={onBlur}
        onFocus={onFocus}
        required={required}
        disabled={disabled}
        readOnly={readonly}
        min={min}
        max={max}
        placeholder={placeholder}
        className={inputClassName}
        style={style?.style}
        aria-invalid={!!error}
        aria-describedby={error ? `${fieldId}-error` : helpText ? `${fieldId}-help` : undefined}
      />
      {fieldValue && (
        <p className="text-sm text-gray-600 mt-1">{formatWeekDisplay(fieldValue)}</p>
      )}
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

