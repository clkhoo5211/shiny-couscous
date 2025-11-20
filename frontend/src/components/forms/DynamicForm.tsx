import React, { useState, useEffect } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { FormSchemaResponse, SubmissionData, ValidationResponse } from '@/types'
import apiClient from '@/api/client'
import { FormRenderer } from './FormRenderer'
import { shouldDisplayField } from '@/lib/utils'
import { useToast } from '@/components/ui/ToastProvider'

interface DynamicFormProps {
  formId: string
  onSubmit: (data: SubmissionData) => Promise<void>
  onSaveDraft?: (data: SubmissionData) => Promise<void>
  initialData?: SubmissionData
}

/**
 * DynamicForm - Main form component that fetches schema and renders form dynamically
 */
export function DynamicForm({
  formId,
  onSubmit,
  onSaveDraft,
  initialData,
}: DynamicFormProps) {
  const { showError, showWarning } = useToast()
  const [formData, setFormData] = useState<SubmissionData>(initialData || {})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [currentStep, setCurrentStep] = useState(0)

  // Update formData when initialData changes (e.g., when draft loads)
  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setFormData(initialData)
    }
  }, [initialData])

  // Fetch form schema
  const { data: schema, isLoading, error } = useQuery<FormSchemaResponse>({
    queryKey: ['form-schema', formId],
    queryFn: () => apiClient.getFormSchema(formId),
    enabled: !!formId,
  })

  // Validation mutation
  const validateMutation = useMutation<ValidationResponse, Error, SubmissionData>({
    mutationFn: (data) => apiClient.validateSubmission(formId, data),
    onSuccess: (response) => {
      if (!response.valid) {
        const errorMap: Record<string, string> = {}
        response.errors.forEach((err) => {
          const key = err.stepId ? `${err.stepId}.${err.fieldName}` : err.fieldName
          errorMap[key] = err.error
        })
        setErrors(errorMap)
      } else {
        setErrors({})
      }
    },
  })

  // Handle field change
  const handleFieldChange = (stepId: string, fieldName: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [stepId]: {
        ...prev[stepId],
        [fieldName]: value,
      },
    }))
    // Clear error for this field
    const errorKey = `${stepId}.${fieldName}`
    if (errors[errorKey]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[errorKey]
        return newErrors
      })
    }
  }

  // Handle field blur (validate on blur)
  const handleFieldBlur = (stepId: string, fieldName: string) => {
    // Optionally validate individual field
    // For now, just validate on submit
  }

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // DEBUG: Log formData before submission
    console.log('Form submission - formData:', JSON.stringify(formData, null, 2))

    try {
      // Validate form
      const validationResult = await validateMutation.mutateAsync(formData)
      if (!validationResult.valid) {
        // Show error notification
        const errorCount = validationResult.errors?.length || 0
        showWarning(
          `Please fix ${errorCount} error${errorCount > 1 ? 's' : ''} before submitting. The form has been scrolled to the first error.`,
          'Validation Failed'
        )
        
        // Find first step with errors and navigate to it
        if (validationResult.errors && validationResult.errors.length > 0) {
          const firstError = validationResult.errors[0]
          if (firstError.stepId && schema) {
            const stepIndex = schema.steps.findIndex(step => step.stepId === firstError.stepId)
            if (stepIndex !== -1) {
              setCurrentStep(stepIndex)
              // Scroll to first error field after step change
              setTimeout(() => {
                const errorElement = document.querySelector(`[data-field-id="${firstError.fieldName}"]`) ||
                                    document.querySelector(`[id="${firstError.fieldName}"]`) ||
                                    document.querySelector(`input[name="${firstError.fieldName}"], select[name="${firstError.fieldName}"], textarea[name="${firstError.fieldName}"]`)
                if (errorElement) {
                  errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
                }
              }, 200)
            }
          }
        }
        return
      }

      // Submit form
      await onSubmit(formData)
    } catch (error) {
      console.error('Form submission error:', error)
      // Error is already handled by mutation onError
    }
  }

  // Handle save draft
  const handleSaveDraft = async () => {
    if (onSaveDraft) {
      try {
        await onSaveDraft(formData)
      } catch (error) {
        console.error('Save draft error:', error)
      }
    }
  }

  // Validate current step's required fields
  const validateCurrentStep = (): boolean => {
    if (!schema) return false
    
    const currentStepData = schema.steps[currentStep]
    const stepId = currentStepData.stepId
    
    const stepFormData = formData[stepId] || {}
    const stepErrors: Record<string, string> = {}
    let isValid = true

    // Check all required fields in current step
    currentStepData.fields.forEach((field) => {
      // Skip hidden or conditionally hidden fields
      if (field.hidden || (field.conditionalDisplay && !shouldDisplayField(field.conditionalDisplay, formData))) {
        return
      }

      if (field.required) {
        let fieldValue = stepFormData[field.fieldName]
        const errorKey = `${stepId}.${field.fieldName}`
        let isEmpty = false
        
        // For select fields, check DOM value if formData value is missing (handles default selected values)
        if ((field.fieldType === 'select' || field.fieldType === 'select-single' || 
             field.fieldType === 'select-multi' || field.fieldType === 'select-other') &&
            (fieldValue === undefined || fieldValue === null || fieldValue === '')) {
          const selectElement = document.querySelector(`select[name="${field.fieldName}"]`) as HTMLSelectElement
          if (selectElement && selectElement.value && selectElement.value !== '') {
            fieldValue = selectElement.value // Use DOM value as fallback
          }
        }
        
        // Special handling for supportingDocuments: skip initial empty check if checklist is complete
        let shouldSkipValidation = false
        if (field.fieldName === 'supportingDocuments' && (field.fieldType === 'file-upload' || field.fieldType === 'upload')) {
          const checklistField = currentStepData.fields.find((f: any) => 
            (f.fieldType === 'document-checklist' || f.fieldType === 'labuan-document-checklist')
          )
          if (checklistField) {
            const checklistValue = stepFormData[checklistField.fieldName]
            if (checklistValue && typeof checklistValue === 'object') {
              const documents = checklistField.documents || []
              const requiredDocuments = documents.filter((doc: any) => doc.required === true)
              if (requiredDocuments.length > 0) {
                shouldSkipValidation = requiredDocuments.every((doc: any) => {
                  const docStatus = checklistValue[doc.id]
                  return docStatus && docStatus.uploaded === true
                })
              }
            }
          }
        }

        // Check if field is empty based on field type (skip if supportingDocuments and checklist is complete)
        if (!shouldSkipValidation) {
          if (fieldValue === undefined || fieldValue === null || fieldValue === '') {
            isEmpty = true
          } else if (Array.isArray(fieldValue) && fieldValue.length === 0) {
            isEmpty = true
          } else if (typeof fieldValue === 'object' && Object.keys(fieldValue).length === 0) {
            isEmpty = true
          }
        }
        
        if (field.fieldType === 'checkbox' || field.fieldType === 'checkbox-group') {
          // For checkboxes, false or empty array means not checked
          if (fieldValue === false || (Array.isArray(fieldValue) && fieldValue.length === 0)) {
            isEmpty = true
          }
        } else if (field.fieldType === 'radio' || field.fieldType === 'radio-group') {
          // For radios, empty string or undefined means not selected
          if (fieldValue === '' || fieldValue === undefined || fieldValue === null) {
            isEmpty = true
          }
        } else if (field.fieldType === 'select' || field.fieldType === 'select-single' || 
                   field.fieldType === 'select-multi' || field.fieldType === 'select-other') {
          // For select fields, empty string or undefined means not selected
          if (fieldValue === '' || fieldValue === undefined || fieldValue === null) {
            isEmpty = true
          } else if (Array.isArray(fieldValue) && fieldValue.length === 0) {
            isEmpty = true
          }
        } else if (field.fieldType === 'file-upload' || field.fieldType === 'upload') {
          // For file uploads, empty array or no files means not uploaded
          // Special case: If there's a complete document-checklist in the same step, 
          // the supportingDocuments file-upload field is optional
          
          // Check if this is the supportingDocuments field and if checklist is complete
          if (field.fieldName === 'supportingDocuments') {
            // Check if there's a document-checklist field in this step that is complete
            let hasCompleteChecklist = false
            
            const checklistField = currentStepData.fields.find((f: any) => 
              (f.fieldType === 'document-checklist' || f.fieldType === 'labuan-document-checklist')
            )
            
            if (checklistField) {
              const checklistValue = stepFormData[checklistField.fieldName]
              if (checklistValue && typeof checklistValue === 'object') {
                const documents = checklistField.documents || []
                const requiredDocuments = documents.filter((doc: any) => doc.required === true)
                
                if (requiredDocuments.length > 0) {
                  // Check if all required documents are uploaded
                  hasCompleteChecklist = requiredDocuments.every((doc: any) => {
                    const docStatus = checklistValue[doc.id]
                    return docStatus && docStatus.uploaded === true
                  })
                }
              }
            }
            
            // If checklist is complete, skip validation for supportingDocuments (make it optional)
            if (hasCompleteChecklist) {
              isEmpty = false // Don't require supportingDocuments if checklist is complete
            } else if (!shouldSkipValidation) {
              // Checklist not complete, so supportingDocuments is still required
              if (!fieldValue || (Array.isArray(fieldValue) && fieldValue.length === 0)) {
                isEmpty = true
              }
            }
          } else if (!shouldSkipValidation) {
            // For other file-upload fields, check if empty
            if (!fieldValue || (Array.isArray(fieldValue) && fieldValue.length === 0)) {
              isEmpty = true
            }
          }
        } else if (field.fieldType === 'document-checklist' || field.fieldType === 'labuan-document-checklist') {
          // For document checklist, check if all required documents are uploaded
          // Value is Record<string, { uploaded: boolean; fileId?: string }>
          // Field has documents array with required flag
          if (!fieldValue || typeof fieldValue !== 'object') {
            isEmpty = true
          } else {
            // Check if field has documents configuration
            const documents = field.documents || []
            const requiredDocuments = documents.filter((doc: any) => doc.required === true)
            
            if (requiredDocuments.length > 0) {
              // Check if all required documents are uploaded
              const allRequiredUploaded = requiredDocuments.every((doc: any) => {
                const docStatus = fieldValue[doc.id]
                return docStatus && docStatus.uploaded === true
              })
              
              if (!allRequiredUploaded) {
                isEmpty = true
              }
            } else if (field.required) {
              // If field is required but no documents config, check if any document is uploaded
              const hasAnyUpload = Object.values(fieldValue).some((doc: any) => doc && doc.uploaded === true)
              if (!hasAnyUpload) {
                isEmpty = true
              }
            }
          }
        } else if (field.fieldType === 'signature') {
          // For signature, empty string or no data means not signed
          if (!fieldValue || fieldValue === '' || (typeof fieldValue === 'object' && !fieldValue.dataUrl)) {
            isEmpty = true
          }
        }
        
        if (isEmpty) {
          stepErrors[errorKey] = `${field.label} is required`
          isValid = false
        }
      }
    })

    // Update errors
    if (Object.keys(stepErrors).length > 0) {
      setErrors((prev) => ({ ...prev, ...stepErrors }))
      // Scroll to first error
      const firstErrorKey = Object.keys(stepErrors)[0]
      const [stepIdForError, fieldNameForError] = firstErrorKey.split('.')
      const errorElement = document.querySelector(`[data-field-id="${fieldNameForError}"]`) ||
                          document.querySelector(`[id="${fieldNameForError}"]`) ||
                          document.querySelector(`input[name="${fieldNameForError}"], select[name="${fieldNameForError}"], textarea[name="${fieldNameForError}"]`)
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }

    return isValid
  }


  // Handle next step
  const handleNext = async () => {
    if (!schema || currentStep >= schema.steps.length - 1) return

    // Validate current step's required fields before allowing navigation
    const isValid = validateCurrentStep()
    if (!isValid) {
      // Validation failed - errors are already set, don't navigate
      return
    }

    // Validation passed - proceed to next step
    setCurrentStep(currentStep + 1)
    
    // Scroll to top of form on step change
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Handle previous step
  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-4 text-sm text-gray-500">Loading form...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-sm text-red-800">Error loading form: {error.message}</p>
      </div>
    )
  }

  if (!schema) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
        <p className="text-sm text-yellow-800">Form schema not found</p>
      </div>
    )
  }

  const steps = schema.steps
  const isMultiStep = steps.length > 1
  const currentStepData = steps[currentStep]

  return (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
      {/* Step indicator (for multi-step forms) - Enhanced */}
      {isMultiStep && (
        <div className="mb-6 sm:mb-8">
          {/* Desktop Step Indicator - Modern Design */}
          <div className="hidden sm:block bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.stepId} className="flex items-center flex-1 last:flex-none">
                  <div className="flex flex-col items-center">
                    <div
                      className={`relative flex items-center justify-center w-12 h-12 lg:w-14 lg:h-14 rounded-2xl text-sm lg:text-base font-black transition-all duration-300 shadow-lg ${
                        index === currentStep
                          ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white scale-110 ring-4 ring-blue-200'
                          : index < currentStep
                          ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white'
                          : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      {index < currentStep ? (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <span>{index + 1}</span>
                      )}
                    </div>
                    <p className={`mt-2 text-xs lg:text-sm font-bold text-center max-w-[100px] ${
                      index === currentStep ? 'text-blue-600' : index < currentStep ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      {step.stepName}
                    </p>
                  </div>
                  {index < steps.length - 1 && (
                    <div className="flex-1 px-4">
                      <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`absolute inset-y-0 left-0 rounded-full transition-all duration-500 ${
                            index < currentStep ? 'bg-gradient-to-r from-green-500 to-emerald-500 w-full' : 'w-0'
                          }`}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          {/* Mobile Step Indicator - Modern Dots */}
          <div className="sm:hidden bg-white rounded-xl shadow-lg border-2 border-gray-100 p-5">
            <div className="flex items-center justify-center gap-3 mb-3">
              {steps.map((step, index) => (
                <div
                  key={step.stepId}
                  className={`transition-all duration-300 rounded-full ${
                    index === currentStep
                      ? 'w-8 h-3 bg-gradient-to-r from-blue-600 to-indigo-600'
                      : index < currentStep
                      ? 'w-3 h-3 bg-gradient-to-r from-green-500 to-emerald-500'
                      : 'w-3 h-3 bg-gray-300'
                  }`}
                />
              ))}
            </div>
            <div className="text-center">
              <p className="text-sm font-bold text-gray-900">
                Step {currentStep + 1} of {steps.length}
              </p>
              <p className="text-xs text-gray-600 mt-1 font-semibold">{currentStepData.stepName}</p>
            </div>
          </div>
        </div>
      )}

      {/* Form fields */}
      <FormRenderer
        steps={isMultiStep ? [currentStepData] : steps}
        formData={formData}
        errors={errors}
        onChange={handleFieldChange}
        onBlur={handleFieldBlur}
      />

      {/* Form actions - Enhanced */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 sm:gap-5 pt-6 sm:pt-8 border-t-2 border-gray-200 p-6">
        <div className="w-full sm:w-auto">
          {isMultiStep && currentStep > 0 && (
            <button
              type="button"
              onClick={handlePrevious}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm sm:text-base font-bold text-gray-700 bg-white border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-x-1"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Previous
            </button>
          )}
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
          {onSaveDraft && (
            <button
              type="button"
              onClick={handleSaveDraft}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm sm:text-base font-bold text-gray-700 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-300 order-2 sm:order-1"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              Save Draft
            </button>
          )}
          {isMultiStep && currentStep < steps.length - 1 ? (
            <button
              type="button"
              onClick={handleNext}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 text-sm sm:text-base font-black text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:via-indigo-700 hover:to-blue-800 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:translate-x-1 order-1 sm:order-2"
            >
              Next
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ) : (
            <button
              type="submit"
              disabled={validateMutation.isPending}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 text-sm sm:text-base font-black text-white bg-gradient-to-r from-green-600 via-emerald-600 to-green-700 hover:from-green-700 hover:via-emerald-700 hover:to-green-800 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed order-1 sm:order-2"
            >
              {validateMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {schema.submitButton?.label || 'Submit'}
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </form>
  )
}

