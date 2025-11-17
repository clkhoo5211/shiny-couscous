import React, { useState } from 'react'
import { BaseFieldProps, SelectOption } from '@/types'
import { cn } from '@/lib/utils'

export interface CheckboxWithOtherFieldProps extends BaseFieldProps {
  fieldType: 'checkbox-other' | 'checkbox-with-other'
  options: SelectOption[]
  value?: string[] | { values: string[]; other?: string }
  defaultValue?: string[] | { values: string[]; other?: string }
  otherValue?: string
  orientation?: 'horizontal' | 'vertical'
}

export function CheckboxWithOtherField({
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
}: CheckboxWithOtherFieldProps) {
  // Parse value
  const parsedValues = Array.isArray(value)
    ? value
    : typeof value === 'object' && value.values
      ? value.values
      : Array.isArray(defaultValue)
        ? defaultValue
        : typeof defaultValue === 'object' && defaultValue.values
          ? defaultValue.values
          : []
  const parsedOther =
    typeof value === 'object' && value.other
      ? value.other
      : typeof defaultValue === 'object' && defaultValue.other
        ? defaultValue.other
        : initialOtherValue ?? ''

  const [selectedValues, setSelectedValues] = useState<string[]>(parsedValues)
  const [otherValue, setOtherValue] = useState<string>(parsedOther)
  const [showOtherInput, setShowOtherInput] = useState<boolean>(selectedValues.includes('other'))

  // Handle checkbox change
  const handleCheckboxChange = (optionValue: string, checked: boolean) => {
    if (readonly || disabled) return

    let newValues: string[]
    if (checked) {
      newValues = [...selectedValues, optionValue]
    } else {
      newValues = selectedValues.filter((v) => v !== optionValue)
    }

    setSelectedValues(newValues)
    setShowOtherInput(newValues.includes('other'))

    if (newValues.includes('other')) {
      onChange({ values: newValues, other: otherValue })
    } else {
      onChange(newValues)
    }
  }

  // Handle other input change
  const handleOtherChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newOtherValue = e.target.value
    setOtherValue(newOtherValue)
    onChange({ values: selectedValues, other: newOtherValue })
  }

  // Merge styles
  const containerClassName = cn('mb-4', style?.containerClassName)
  const checkboxGroupClassName = cn(
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
      <div className={checkboxGroupClassName} role="group" aria-label={label}>
        {optionsWithOther.map((option) => (
          <div key={option.value} className="flex items-center">
            <input
              id={`${fieldId}-${option.value}`}
              name={`${fieldName}[]`}
              type="checkbox"
              value={option.value}
              checked={selectedValues.includes(option.value)}
              onChange={(e) => handleCheckboxChange(option.value, e.target.checked)}
              onBlur={onBlur}
              onFocus={onFocus}
              required={required && selectedValues.length === 0}
              disabled={disabled || option.disabled}
              readOnly={readonly}
              className={cn(
                'h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary',
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
          required={required && selectedValues.includes('other') && !otherValue}
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

