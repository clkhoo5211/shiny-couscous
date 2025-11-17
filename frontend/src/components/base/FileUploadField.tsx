import React, { useState, useRef, useCallback } from 'react'
import { BaseFieldProps } from '@/types'
import { cn, formatFileSize } from '@/lib/utils'
import apiClient from '@/api/client'

export interface FileUploadFieldProps extends BaseFieldProps {
  fieldType: 'upload-document' | 'upload-image' | 'upload-file'
  multiple?: boolean
  accept?: string[]
  maxSize?: number // in bytes
  maxFiles?: number
  dragDrop?: boolean
  preview?: boolean
  progress?: boolean
}

export function FileUploadField({
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
  multiple = false,
  accept = [],
  maxSize = 10 * 1024 * 1024, // 10MB default
  maxFiles = 1,
  dragDrop = true,
  preview = true,
  progress = true,
  className,
}: FileUploadFieldProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({})
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Get current files (from value or defaultValue)
  const currentFiles = value ?? defaultValue ?? (multiple ? [] : null)
  const fileList = Array.isArray(currentFiles) ? currentFiles : currentFiles ? [currentFiles] : []

  // Handle file selection
  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    const fileArray = Array.from(files)

    // Validate number of files
    if (!multiple && fileArray.length > 1) {
      alert(`Please select only one file`)
      return
    }

    if (fileArray.length + fileList.length > maxFiles) {
      alert(`Maximum ${maxFiles} file(s) allowed`)
      return
    }

    // Validate file types and sizes
    const validFiles: File[] = []
    for (const file of fileArray) {
      // Check file type
      if (accept.length > 0) {
        const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
        if (!accept.includes(fileExtension)) {
          alert(`File ${file.name} type not allowed. Allowed types: ${accept.join(', ')}`)
          continue
        }
      }

      // Check file size
      if (file.size > maxSize) {
        alert(`File ${file.name} is too large. Maximum size: ${formatFileSize(maxSize)}`)
        continue
      }

      validFiles.push(file)
    }

    if (validFiles.length === 0) return

    // Upload files
    setUploading(true)
    const uploadedFiles: any[] = []

    for (const file of validFiles) {
      try {
        const fileId = `${Date.now()}-${file.name}`
        setUploadProgress((prev) => ({ ...prev, [fileId]: 0 }))

        const uploadResponse = await apiClient.uploadFile(
          file,
          fieldName,
          (progress) => {
            setUploadProgress((prev) => ({ ...prev, [fileId]: progress }))
          }
        )

        uploadedFiles.push({
          fileId: uploadResponse.id || uploadResponse.fileId,
          fileName: file.name,
          fileSize: file.size,
          fileUrl: uploadResponse.storageUrl || uploadResponse.file_path,
        })

        setUploadProgress((prev) => {
          const newPrev = { ...prev }
          delete newPrev[fileId]
          return newPrev
        })
      } catch (error) {
        console.error('File upload error:', error)
        alert(`Failed to upload ${file.name}`)
      }
    }

    // Update value
    if (multiple) {
      onChange([...fileList, ...uploadedFiles])
    } else {
      onChange(uploadedFiles[0] || null)
    }

    setUploading(false)
    if (onBlur) onBlur()
  }

  // Handle drag and drop
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setDragActive(false)

      if (disabled || readonly) return

      const files = e.dataTransfer.files
      handleFileSelect(files)
    },
    [disabled, readonly]
  )

  // Handle file input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files)
  }

  // Handle remove file
  const handleRemoveFile = (index: number) => {
    if (multiple) {
      const newFiles = [...fileList]
      newFiles.splice(index, 1)
      onChange(newFiles)
    } else {
      onChange(null)
    }
  }

  // Handle click on upload area
  const handleClick = () => {
    if (!disabled && !readonly && fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  // Merge styles
  const containerClassName = cn('mb-4', style?.containerClassName)
  const uploadAreaClassName = cn(
    'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors',
    dragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary hover:bg-gray-50',
    disabled && 'opacity-50 cursor-not-allowed',
    readonly && 'bg-gray-100 cursor-default'
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

      {/* File input (hidden) */}
      <input
        ref={fileInputRef}
        id={fieldId}
        name={fieldName}
        type="file"
        multiple={multiple}
        accept={accept.join(',')}
        onChange={handleInputChange}
        onBlur={onBlur}
        onFocus={onFocus}
        required={required && fileList.length === 0}
        disabled={disabled || readonly}
        className="hidden"
        aria-invalid={!!error}
        aria-describedby={error ? `${fieldId}-error` : helpText ? `${fieldId}-help` : undefined}
      />

      {/* Upload area */}
      {dragDrop ? (
        <div
          className={uploadAreaClassName}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={handleClick}
        >
          <div className="space-y-2">
            <div className="text-4xl">📎</div>
            <div>
              <span className="text-primary font-medium">Click to upload</span> or drag and drop
            </div>
            <div className="text-sm text-gray-500">
              {accept.length > 0 && `Allowed types: ${accept.join(', ')}`}
              {maxSize && ` • Max size: ${formatFileSize(maxSize)}`}
              {multiple && maxFiles > 1 && ` • Max files: ${maxFiles}`}
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={handleClick}
          disabled={disabled || readonly}
          className={cn(
            'btn btn-secondary',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          Choose File{multiple ? 's' : ''}
        </button>
      )}

      {/* Upload progress */}
      {uploading && progress && Object.keys(uploadProgress).length > 0 && (
        <div className="mt-4 space-y-2">
          {Object.entries(uploadProgress).map(([fileId, progress]) => (
            <div key={fileId}>
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Uploading...</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* File list with preview */}
      {fileList.length > 0 && (
        <div className="mt-4 space-y-2">
          {fileList.map((file: any, index: number) => (
            <div
              key={file.fileId || index}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
            >
              <div className="flex items-center space-x-3">
                {preview && file.fileName && (
                  <div className="text-2xl">
                    {file.fileName.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? '🖼️' : '📄'}
                  </div>
                )}
                <div>
                  <div className="text-sm font-medium text-gray-900">{file.fileName}</div>
                  {file.fileSize && (
                    <div className="text-xs text-gray-500">{formatFileSize(file.fileSize)}</div>
                  )}
                </div>
              </div>
              {!readonly && (
                <button
                  type="button"
                  onClick={() => handleRemoveFile(index)}
                  disabled={disabled}
                  className="text-error hover:text-red-700 text-sm font-medium"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
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

