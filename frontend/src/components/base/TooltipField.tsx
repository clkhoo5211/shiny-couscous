import React, { useState } from 'react'
import { BaseFieldProps } from '@/types'
import { cn } from '@/lib/utils'

export interface TooltipFieldProps extends BaseFieldProps {
  fieldType: 'tooltip' | 'tooltip-field'
  content: string // Tooltip content
  trigger?: 'hover' | 'click' | 'focus'
  placement?: 'top' | 'bottom' | 'left' | 'right'
  targetId?: string // ID of element to attach tooltip to
}

export function TooltipField({
  fieldId,
  fieldName,
  fieldType,
  label,
  content,
  trigger = 'hover',
  placement = 'top',
  targetId,
  helpText,
  tooltip,
  error,
  style,
  hidden,
  className,
}: TooltipFieldProps) {
  const [isVisible, setIsVisible] = useState(false)

  // Event handlers
  const handleMouseEnter = () => {
    if (trigger === 'hover') setIsVisible(true)
  }

  const handleMouseLeave = () => {
    if (trigger === 'hover') setIsVisible(false)
  }

  const handleClick = () => {
    if (trigger === 'click') setIsVisible(!isVisible)
  }

  const handleFocus = () => {
    if (trigger === 'focus') setIsVisible(true)
  }

  const handleBlur = () => {
    if (trigger === 'focus') setIsVisible(false)
  }

  // Merge styles
  const containerClassName = cn('mb-4 relative inline-block', style?.containerClassName)
  const tooltipClassName = cn(
    'absolute z-50 px-3 py-2 text-sm text-white bg-gray-900 rounded-md shadow-lg whitespace-nowrap',
    placement === 'top' && 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
    placement === 'bottom' && 'top-full left-1/2 transform -translate-x-1/2 mt-2',
    placement === 'left' && 'right-full top-1/2 transform -translate-y-1/2 mr-2',
    placement === 'right' && 'left-full top-1/2 transform -translate-y-1/2 ml-2',
    !isVisible && 'hidden',
    style?.className,
    className
  )

  // Arrow
  const arrowClassName = cn(
    'absolute w-2 h-2 bg-gray-900 transform rotate-45',
    placement === 'top' && 'top-full left-1/2 -translate-x-1/2 -translate-y-1/2',
    placement === 'bottom' && 'bottom-full left-1/2 -translate-x-1/2 translate-y-1/2',
    placement === 'left' && 'left-full top-1/2 -translate-y-1/2 -translate-x-1/2',
    placement === 'right' && 'right-full top-1/2 -translate-y-1/2 translate-x-1/2'
  )

  if (hidden || !content) {
    return null
  }

  // If targetId is provided, attach tooltip to that element
  if (targetId) {
    // This would require React refs and DOM manipulation
    // For now, return a wrapper that can be positioned relative to target
    return (
      <div
        id={fieldId}
        className={tooltipClassName}
        role="tooltip"
        aria-live="polite"
        style={style?.style}
      >
        {content}
        <div className={arrowClassName} />
      </div>
    )
  }

  // Standalone tooltip trigger
  return (
    <div
      className={containerClassName}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      onFocus={handleFocus}
      onBlur={handleBlur}
    >
      {label && (
        <label
          htmlFor={fieldId}
          className={cn('label cursor-help', style?.labelClassName)}
        >
          {label}
          <span className="ml-1 text-gray-400">{tooltip || 'ℹ️'}</span>
        </label>
      )}
      <div id={fieldId} className={tooltipClassName} role="tooltip" aria-live="polite">
        {content}
        <div className={arrowClassName} />
      </div>
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

