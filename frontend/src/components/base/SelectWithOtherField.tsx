import React, { useState } from 'react'
import { BaseFieldProps, SelectOption } from '@/types'
import { cn } from '@/lib/utils'

export interface SelectWithOtherFieldProps extends BaseFieldProps {
  fieldType: 'select-other' | 'select-with-other'
  options: SelectOption[]
  value?: string | { value: string; other?: string }
  defaultValue?: string | { value: string; other?: string }
  otherValue?: string
}

export function SelectWithOtherField({
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
  placeholder,
  helpText,
  tooltip,
  validation,
  error,
  style,
  otherValue: initialOtherValue,
  className,
}: SelectWithOtherFieldProps) {
  // Parse value
  const parsedValue =
    value ?? defaultValue ?? (typeof value === 'object' ? value.value : value) ?? ''
  const parsedOther =
    typeof value === 'object' ? value.other : typeof defaultValue === 'object' ? defaultValue.other : initialOtherValue ?? ''

  const [selectedValue, setSelectedValue] = useState<string>(parsedValue)
  const [otherValue, setOtherValue] = useState<string>(parsedOther)
  const [showOtherInput, setShowOtherInput] = useState<boolean>(
    selectedValue === 'other' || !options.find((opt) => opt.value === selectedValue)
  )

  // Handle select change
  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = e.target.value
    setSelectedValue(newValue)
    setShowOtherInput(newValue === 'other')

    if (newValue === 'other') {
      onChange({ value: 'other', other: otherValue })
    } else {
      onChange(newValue)
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
  const selectClassName = cn(
    'input',
    error && 'input-error',
    disabled && 'opacity-50 cursor-not-allowed',
    readonly && 'bg-gray-100 cursor-default',
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
      <select
        id={fieldId}
        name={fieldName}
        value={selectedValue}
        onChange={handleSelectChange}
        onBlur={onBlur}
        onFocus={onFocus}
        required={required && !selectedValue}
        disabled={disabled}
        readOnly={readonly}
        className={selectClassName}
        style={style?.style}
        aria-invalid={!!error}
        aria-describedby={error ? `${fieldId}-error` : helpText ? `${fieldId}-help` : undefined}
      >
        {placeholder && <option value="">{placeholder || 'Select an option...'}</option>}
        {optionsWithOther.map((option) => (
          <option key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </option>
        ))}
      </select>
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

