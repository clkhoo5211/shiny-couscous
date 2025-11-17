import React, { useState } from 'react'
import { BaseFieldProps } from '@/types'
import { cn } from '@/lib/utils'

export interface ColorPaletteFieldProps extends BaseFieldProps {
  fieldType: 'color-palette' | 'color-palette-field'
  value?: string
  defaultValue?: string
  colors?: string[] // Array of hex colors
  allowCustom?: boolean
}

const DEFAULT_COLORS = [
  '#000000',
  '#FFFFFF',
  '#FF0000',
  '#00FF00',
  '#0000FF',
  '#FFFF00',
  '#FF00FF',
  '#00FFFF',
  '#FFA500',
  '#800080',
  '#FFC0CB',
  '#A52A2A',
  '#808080',
  '#C0C0C0',
  '#008000',
  '#000080',
]

export function ColorPaletteField({
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
  helpText,
  tooltip,
  validation,
  error,
  style,
  colors = DEFAULT_COLORS,
  allowCustom = true,
  className,
}: ColorPaletteFieldProps) {
  // Get field value
  const fieldValue = value ?? defaultValue ?? ''
  const [customColor, setCustomColor] = useState<string>('')

  // Handle color selection
  const handleColorClick = (color: string) => {
    if (readonly || disabled) return
    onChange(color)
  }

  // Handle custom color change
  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value
    setCustomColor(newColor)
    onChange(newColor)
  }

  // Merge styles
  const containerClassName = cn('mb-4', style?.containerClassName)

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
      <div className="space-y-3">
        {/* Color Palette */}
        <div className="flex flex-wrap gap-2">
          {colors.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => handleColorClick(color)}
              disabled={disabled || readonly}
              className={cn(
                'w-10 h-10 rounded-md border-2 transition-all hover:scale-110',
                fieldValue === color
                  ? 'border-primary ring-2 ring-primary ring-offset-2'
                  : 'border-gray-300 hover:border-gray-400',
                disabled && 'opacity-50 cursor-not-allowed',
                readonly && 'cursor-default'
              )}
              style={{ backgroundColor: color }}
              title={color}
              aria-label={`Select color ${color}`}
            />
          ))}
        </div>

        {/* Custom Color Input */}
        {allowCustom && (
          <div className="flex items-center gap-3">
            <label htmlFor={`${fieldId}-custom`} className="text-sm text-gray-700">
              Custom:
            </label>
            <input
              id={`${fieldId}-custom`}
              type="color"
              value={customColor || fieldValue || '#000000'}
              onChange={handleCustomColorChange}
              onBlur={onBlur}
              onFocus={onFocus}
              disabled={disabled}
              readOnly={readonly}
              className={cn(
                'h-10 w-20 cursor-pointer rounded border border-gray-300',
                disabled && 'opacity-50 cursor-not-allowed',
                readonly && 'cursor-default'
              )}
            />
            <input
              type="text"
              value={customColor || fieldValue || ''}
              onChange={(e) => {
                setCustomColor(e.target.value)
                onChange(e.target.value)
              }}
              onBlur={onBlur}
              onFocus={onFocus}
              disabled={disabled}
              readOnly={readonly}
              placeholder="#000000"
              className={cn(
                'input flex-1',
                error && 'input-error',
                disabled && 'opacity-50 cursor-not-allowed',
                readonly && 'bg-gray-100 cursor-default'
              )}
              pattern="^#[0-9A-Fa-f]{6}$"
            />
          </div>
        )}

        {/* Selected Color Display */}
        {fieldValue && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div
              className="h-6 w-6 rounded border border-gray-300"
              style={{ backgroundColor: fieldValue }}
            />
            <span>Selected: {fieldValue}</span>
          </div>
        )}
      </div>

      {/* Hidden input for form submission */}
      <input
        type="hidden"
        id={fieldId}
        name={fieldName}
        value={fieldValue}
        required={required && !fieldValue}
        aria-invalid={!!error}
        aria-describedby={error ? `${fieldId}-error` : helpText ? `${fieldId}-help` : undefined}
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

