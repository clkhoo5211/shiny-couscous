import React, { useState } from 'react'
import { BaseFieldProps, SelectOption } from '@/types'
import { cn } from '@/lib/utils'

export interface RadioWithOtherFieldProps extends BaseFieldProps {
  fieldType: 'radio-other' | 'radio-with-other'
  options: SelectOption[]
  value?: string | { value: string; other?: string }
  defaultValue?: string | { value: string; other?: string }
  otherValue?: string
  orientation?: 'horizontal' | 'vertical'
}

export function RadioWithOtherField({
  fieldId,
  fieldName,
  fieldType,
  label,
  options,
  value,
  defaultValue,
  onChange,
  onBlur,
  onFocus,
  required,
  disabled,
  readonly,
  hidden,
  helpText,
  tooltip,
  validation,
  error,
  style,
  otherValue: initialOtherValue,
  orientation = 'vertical',
  className,
}: RadioWithOtherFieldProps) {
  // Parse value
  const parsedValue =
    value ?? defaultValue ?? (typeof value === 'object' ? value.value : value) ?? ''
  const parsedOther =
    typeof value === 'object' ? value.other : typeof defaultValue === 'object' ? defaultValue.other : initialOtherValue ?? ''

  const [selectedValue, setSelectedValue] = useState<string>(parsedValue)
  const [otherValue, setOtherValue] = useState<string>(parsedOther)
  const [showOtherInput, setShowOtherInput] = useState<boolean>(selectedValue === 'other')

  // Handle radio change
  const handleRadioChange = (optionValue: string) => {
    if (readonly || disabled) return
    setSelectedValue(optionValue)
    setShowOtherInput(optionValue === 'other')

    if (optionValue === 'other') {
      onChange({ value: 'other', other: otherValue })
    } else {
      onChange(optionValue)
    }
  }

  // Handle other input change
  const handleOtherChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newOtherValue = e.target.value
    setOtherValue(newOtherValue)
    onChange({ value: 'other', other: newOtherValue })
  }

  // Merge styles
  const containerClassName = cn('mb-4', style?.containerClassName)
  const radioGroupClassName = cn(
    'space-y-2',
    orientation === 'horizontal' && 'flex flex-row flex-wrap gap-4',
    style?.className,
    className
  )

  // Add "Other" option if not present
  const optionsWithOther = options.find((opt) => opt.value === 'other')
    ? options
    : [...options, { value: 'other', label: 'Other (Please specify)' }]

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
      <div className={radioGroupClassName} role="radiogroup" aria-label={label}>
        {optionsWithOther.map((option) => (
          <div key={option.value} className="flex items-center">
            <input
              id={`${fieldId}-${option.value}`}
              name={fieldName}
              type="radio"
              value={option.value}
              checked={selectedValue === option.value}
              onChange={() => handleRadioChange(option.value)}
              onBlur={onBlur}
              onFocus={onFocus}
              required={required && !selectedValue}
              disabled={disabled || option.disabled}
              readOnly={readonly}
              className={cn(
                'h-4 w-4 text-primary border-gray-300 focus:ring-primary',
                error && 'border-error',
                disabled && 'opacity-50 cursor-not-allowed'
              )}
              aria-invalid={!!error}
            />
            <label
              htmlFor={`${fieldId}-${option.value}`}
              className={cn(
                'ml-2 text-sm font-medium text-gray-700',
                disabled && 'opacity-50 cursor-not-allowed',
                readonly && 'cursor-default'
              )}
            >
              {option.label}
            </label>
          </div>
        ))}
      </div>
      {showOtherInput && (
        <input
          id={`${fieldId}-other`}
          name={`${fieldName}_other`}
          type="text"
          value={otherValue}
          onChange={handleOtherChange}
          onBlur={onBlur}
          onFocus={onFocus}
          required={required && selectedValue === 'other' && !otherValue}
          disabled={disabled}
          readOnly={readonly}
          placeholder="Please specify..."
          className={cn('input mt-2', error && 'input-error')}
          aria-invalid={!!error}
        />
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

