import React, { useState, useRef } from 'react'
import { BaseFieldProps } from '@/types'
import { cn } from '@/lib/utils'

export interface MarkdownFieldProps extends BaseFieldProps {
  fieldType: 'markdown' | 'markdown-editor'
  value?: string // Markdown content
  defaultValue?: string
  preview?: boolean // Show preview tab
  height?: number
}

export function MarkdownField({
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
  preview = true,
  height = 300,
  className,
}: MarkdownFieldProps) {
  const [markdownValue, setMarkdownValue] = useState(value ?? defaultValue ?? '')
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Simple markdown to HTML converter (basic implementation)
  const markdownToHtml = (md: string): string => {
    return md
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*)\*/gim, '<em>$1</em>')
      .replace(/`([^`]+)`/gim, '<code>$1</code>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2">$1</a>')
      .replace(/^\* (.*$)/gim, '<li>$1</li>')
      .replace(/\n/gim, '<br>')
  }

  // Handle change
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value
    setMarkdownValue(newValue)
    onChange(newValue)
  }

  // Handle tab key for indentation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault()
      const textarea = textareaRef.current
      if (!textarea) return

      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const newValue = markdownValue.substring(0, start) + '  ' + markdownValue.substring(end)
      
      setMarkdownValue(newValue)
      onChange(newValue)
      
      // Reset cursor position
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2
      }, 0)
    }
  }

  // Merge styles
  const containerClassName = cn('mb-4', style?.containerClassName)
  const textareaClassName = cn(
    'input font-mono text-sm',
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

      {/* Tabs */}
      {preview && !readonly && (
        <div className="flex border-b border-gray-300">
          <button
            type="button"
            onClick={() => setActiveTab('edit')}
            className={cn(
              'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
              activeTab === 'edit'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            )}
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={cn(
              'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
              activeTab === 'preview'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            )}
          >
            Preview
          </button>
        </div>
      )}

      {/* Editor or Preview */}
      {activeTab === 'edit' || readonly ? (
        <textarea
          ref={textareaRef}
          id={fieldId}
          name={fieldName}
          value={markdownValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onBlur={onBlur}
          onFocus={onFocus}
          placeholder={placeholder || 'Enter markdown text...'}
          required={required}
          disabled={disabled}
          readOnly={readonly}
          rows={Math.ceil(height / 24)}
          className={textareaClassName}
          style={{ minHeight: `${height}px`, ...style?.style }}
          aria-invalid={!!error}
          aria-describedby={error ? `${fieldId}-error` : helpText ? `${fieldId}-help` : undefined}
        />
      ) : (
        <div
          className={cn(
            'border border-gray-300 rounded-md p-4 overflow-y-auto',
            'prose prose-sm max-w-none',
            style?.className
          )}
          style={{ minHeight: `${height}px`, ...style?.style }}
          dangerouslySetInnerHTML={{ __html: markdownToHtml(markdownValue) }}
        />
      )}

      {/* Help text for markdown syntax */}
      {!readonly && (
        <div className="mt-2 text-xs text-gray-500">
          <span>Markdown syntax: **bold**, *italic*, `code`, # heading, [link](url)</span>
        </div>
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

