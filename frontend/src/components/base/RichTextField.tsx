import React, { useRef, useEffect, useState } from 'react'
import { BaseFieldProps } from '@/types'
import { cn } from '@/lib/utils'

export interface RichTextFieldProps extends BaseFieldProps {
  fieldType: 'rich-text' | 'wysiwyg'
  value?: string // HTML content
  defaultValue?: string
  toolbar?: string[] // Toolbar buttons to show
  height?: number
}

export function RichTextField({
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
  toolbar = ['bold', 'italic', 'underline', '|', 'unorderedList', 'orderedList', '|', 'link'],
  height = 200,
  className,
}: RichTextFieldProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const [content, setContent] = useState(value ?? defaultValue ?? '')

  // Get field value
  const fieldValue = value ?? defaultValue ?? ''

  // Initialize contenteditable div
  useEffect(() => {
    if (editorRef.current && fieldValue) {
      editorRef.current.innerHTML = fieldValue
    }
  }, [fieldValue])

  // Handle content change
  const handleContentChange = () => {
    if (editorRef.current) {
      const htmlContent = editorRef.current.innerHTML
      setContent(htmlContent)
      onChange(htmlContent)
    }
  }

  // Handle format command
  const executeCommand = (command: string, value: string | null = null) => {
    if (disabled || readonly) return
    document.execCommand(command, false, value || undefined)
    editorRef.current?.focus()
    handleContentChange()
  }

  // Toolbar buttons configuration
  const toolbarButtons = {
    bold: { icon: 'B', label: 'Bold', command: 'bold' },
    italic: { icon: 'I', label: 'Italic', command: 'italic' },
    underline: { icon: 'U', label: 'Underline', command: 'underline' },
    unorderedList: { icon: '•', label: 'Bullet List', command: 'insertUnorderedList' },
    orderedList: { icon: '1.', label: 'Numbered List', command: 'insertOrderedList' },
    link: { icon: '🔗', label: 'Link', command: 'createLink', prompt: true },
  }

  // Handle link insertion
  const handleLink = () => {
    const url = prompt('Enter URL:')
    if (url) {
      executeCommand('createLink', url)
    }
  }

  // Merge styles
  const containerClassName = cn('mb-4', style?.containerClassName)
  const editorClassName = cn(
    'border border-gray-300 rounded-md p-4 overflow-y-auto focus:outline-none focus:ring-2 focus:ring-primary',
    error && 'border-error',
    disabled && 'opacity-50 cursor-not-allowed bg-gray-50',
    readonly && 'bg-gray-50 cursor-default',
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

      {/* Toolbar */}
      {!readonly && (
        <div className="flex items-center gap-1 p-2 border border-gray-300 border-b-0 rounded-t-md bg-gray-50">
          {toolbar.map((item, index) => {
            if (item === '|') {
              return <div key={index} className="w-px h-6 bg-gray-300 mx-1" />
            }

            const button = toolbarButtons[item as keyof typeof toolbarButtons]
            if (!button) return null

            return (
              <button
                key={index}
                type="button"
                onClick={() => (item === 'link' ? handleLink() : executeCommand(button.command))}
                disabled={disabled}
                className={cn(
                  'px-3 py-1 text-sm font-medium rounded hover:bg-gray-200 transition-colors',
                  disabled && 'opacity-50 cursor-not-allowed'
                )}
                title={button.label}
              >
                {button.icon}
              </button>
            )
          })}
        </div>
      )}

      {/* Editor */}
      <div
        ref={editorRef}
        id={fieldId}
        contentEditable={!disabled && !readonly}
        onInput={handleContentChange}
        onBlur={() => {
          handleContentChange()
          if (onBlur) onBlur()
        }}
        onFocus={onFocus}
        className={editorClassName}
        style={{ minHeight: `${height}px`, ...style?.style }}
        dangerouslySetInnerHTML={{ __html: content }}
        aria-invalid={!!error}
        aria-describedby={error ? `${fieldId}-error` : helpText ? `${fieldId}-help` : undefined}
        suppressContentEditableWarning
      />

      {/* Hidden input for form submission */}
      <input type="hidden" name={fieldName} value={content} required={required} />

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

