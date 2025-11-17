import React, { useState } from 'react'
import { BaseFieldProps, SelectOption } from '@/types'
import { cn } from '@/lib/utils'

export interface TagSelectFieldProps extends BaseFieldProps {
  fieldType: 'tag-select' | 'tag-select-field'
  options: SelectOption[]
  value?: string[]
  defaultValue?: string[]
  multiple?: boolean
  allowAddNew?: boolean
  maxTags?: number
}

export function TagSelectField({
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
  multiple = true,
  allowAddNew = false,
  maxTags,
  className,
}: TagSelectFieldProps) {
  const [selectedTags, setSelectedTags] = useState<string[]>(
    value ?? defaultValue ?? []
  )
  const [inputValue, setInputValue] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const [newTagValue, setNewTagValue] = useState('')

  // Filter available options (exclude selected)
  const availableOptions = options.filter(
    (opt) => !selectedTags.includes(opt.value)
  )

  // Filter options based on input
  const filteredOptions = availableOptions.filter((opt) =>
    opt.label.toLowerCase().includes(inputValue.toLowerCase())
  )

  // Handle tag selection
  const handleSelectTag = (optionValue: string) => {
    if (readonly || disabled) return
    if (maxTags && selectedTags.length >= maxTags) {
      alert(`Maximum ${maxTags} tags allowed`)
      return
    }
    const newTags = multiple ? [...selectedTags, optionValue] : [optionValue]
    setSelectedTags(newTags)
    onChange(newTags)
    setInputValue('')
    setShowDropdown(false)
  }

  // Handle tag removal
  const handleRemoveTag = (tagValue: string) => {
    if (readonly || disabled) return
    const newTags = selectedTags.filter((v) => v !== tagValue)
    setSelectedTags(newTags)
    onChange(newTags)
  }

  // Handle add new tag
  const handleAddNewTag = () => {
    if (!newTagValue.trim()) return
    if (maxTags && selectedTags.length >= maxTags) {
      alert(`Maximum ${maxTags} tags allowed`)
      return
    }
    const newTags = [...selectedTags, newTagValue.trim()]
    setSelectedTags(newTags)
    onChange(newTags)
    setNewTagValue('')
    setShowDropdown(false)
  }

  // Get tag label
  const getTagLabel = (tagValue: string): string => {
    const option = options.find((opt) => opt.value === tagValue)
    return option?.label || tagValue
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

      {/* Selected Tags */}
      {selectedTags.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2">
          {selectedTags.map((tagValue) => (
            <span
              key={tagValue}
              className="inline-flex items-center gap-1 px-3 py-1 bg-primary text-white text-sm rounded-full"
            >
              {getTagLabel(tagValue)}
              {!readonly && (
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tagValue)}
                  disabled={disabled}
                  className="ml-1 hover:text-gray-200 font-bold"
                  aria-label={`Remove ${getTagLabel(tagValue)}`}
                >
                  ×
                </button>
              )}
            </span>
          ))}
        </div>
      )}

      {/* Input and Dropdown */}
      <div className="relative">
        <input
          id={fieldId}
          name={fieldName}
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value)
            setShowDropdown(true)
          }}
          onFocus={(e) => {
            onFocus?.()
            setShowDropdown(true)
          }}
          onBlur={(e) => {
            // Delay to allow click on dropdown item
            setTimeout(() => {
              onBlur?.()
              setShowDropdown(false)
            }, 200)
          }}
          disabled={disabled || readonly}
          placeholder={placeholder || 'Type to search or add tags...'}
          className={inputClassName}
          style={style?.style}
          aria-invalid={!!error}
          aria-describedby={error ? `${fieldId}-error` : helpText ? `${fieldId}-help` : undefined}
        />

        {/* Dropdown */}
        {showDropdown && (filteredOptions.length > 0 || allowAddNew) && !readonly && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
            {filteredOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelectTag(option.value)}
                disabled={option.disabled}
                className={cn(
                  'w-full text-left px-4 py-2 hover:bg-gray-100 text-sm',
                  option.disabled && 'opacity-50 cursor-not-allowed'
                )}
              >
                {option.label}
                {option.description && (
                  <div className="text-xs text-gray-500 mt-1">{option.description}</div>
                )}
              </button>
            ))}
            {allowAddNew && inputValue.trim() && !filteredOptions.find((opt) => opt.label.toLowerCase() === inputValue.toLowerCase()) && (
              <button
                type="button"
                onClick={handleAddNewTag}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm border-t border-gray-200 text-primary font-medium"
              >
                + Add "{inputValue.trim()}"
              </button>
            )}
          </div>
        )}
      </div>

      {/* Hidden input for form submission */}
      <input
        type="hidden"
        name={fieldName}
        value={JSON.stringify(selectedTags)}
        required={required && selectedTags.length === 0}
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

