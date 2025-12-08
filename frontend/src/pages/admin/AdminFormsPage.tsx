import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '@/api/client'
import type { FormResponse } from '@/types'
import { cn } from '@/lib/utils'
import { useToast } from '@/components/ui/ToastProvider'
import { useConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Loading, LoadingSpinner } from '@/components/ui/Loading'

export function AdminFormsPage() {
  const navigate = useNavigate()
  const { showSuccess, showError } = useToast()
  const { showConfirm } = useConfirmDialog()
  const queryClient = useQueryClient()
  const [forms, setForms] = useState<FormResponse[]>([])
  const [loadedForms, setLoadedForms] = useState<FormResponse[]>([]) // Forms confirmed loaded (200/304)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [togglingFormId, setTogglingFormId] = useState<string | null>(null)
  const [deletingFormId, setDeletingFormId] = useState<string | null>(null)

  // Load forms
  useEffect(() => {
    loadForms()
  }, [])

  const loadForms = async () => {
    setLoading(true)
    setLoadedForms([])
    
    try {
      // Use centralized apiClient - GitHub API loads sequentially internally (forms.0.json, forms.1.json, etc.)
      const loadStartTime = performance.now()
      console.log(`[AdminFormsPage] 🚀 Starting form loading at ${new Date().toISOString()}`)
      console.log(`[AdminFormsPage] 📡 API client will load forms sequentially from GitHub endpoints`)
      
      // Load forms - apiClient handles sequential loading internally
      const data = await apiClient.getForms({ includeInactive: true })
      
      const loadEndTime = performance.now()
      const totalTime = (loadEndTime - loadStartTime).toFixed(2)
      console.log(`[AdminFormsPage] ✅ All forms confirmed loaded from endpoints (200/304 status): ${data.length} forms in ${totalTime}ms`)
      console.log(`[AdminFormsPage] 📊 Forms breakdown:`, {
        total: data.length,
        active: data.filter(f => f.isActive).length,
        inactive: data.filter(f => !f.isActive).length
      })
      
      // Set all forms (this ensures fallback if progressive animation fails)
      setForms(data)
      
      // Progressive display animation - show forms in batches after they're verified loaded
      if (data.length > 0) {
        console.log(`[AdminFormsPage] 🎬 Starting progressive display animation for ${data.length} verified forms`)
        setLoading(false) // Allow UI to start displaying
        try {
          await displayFormsProgressively(data)
        } catch (animationError) {
          // If progressive animation fails, fallback to showing all forms immediately
          console.warn(`[AdminFormsPage] ⚠️ Progressive animation failed, falling back to display all forms:`, animationError)
          setLoadedForms(data)
        }
      } else {
        console.log(`[AdminFormsPage] ⚠️ No forms found`)
        setLoadedForms([])
        setLoading(false)
      }
    } catch (error) {
      console.error(`[AdminFormsPage] ❌ Error loading forms:`, error)
      showError('Failed to load forms', 'Error')
      setLoading(false)
    }
  }

  const displayFormsProgressively = async (allForms: FormResponse[]) => {
    const BATCH_SIZE = 6 // Display 6 forms at a time (2 rows in grid)
    const BATCH_DELAY = 100 // Delay between batches in ms
    const displayStartTime = performance.now()
    
    console.log(`[AdminFormsPage] 🎨 Rendering ${allForms.length} forms progressively in batches of ${BATCH_SIZE}`)
    
    for (let i = 0; i < allForms.length; i += BATCH_SIZE) {
      const batch = allForms.slice(i, i + BATCH_SIZE)
      const batchStartTime = performance.now()
      
      // Update loaded forms state to trigger render
      setLoadedForms((prev) => {
        const updated = [...prev, ...batch]
        const batchEndTime = performance.now()
        const batchTime = (batchEndTime - batchStartTime).toFixed(2)
        console.log(`[AdminFormsPage] ✨ Batch ${Math.floor(i / BATCH_SIZE) + 1}: Displayed ${batch.length} forms (${i + 1}-${Math.min(i + BATCH_SIZE, allForms.length)}/${allForms.length}) in ${batchTime}ms`)
        return updated
      })
      
      // Small delay for smooth animation between batches
      if (i + BATCH_SIZE < allForms.length) {
        await new Promise(resolve => setTimeout(resolve, BATCH_DELAY))
      }
    }
    
    const displayEndTime = performance.now()
    const displayTime = (displayEndTime - displayStartTime).toFixed(2)
    
    // Ensure all forms are set in loadedForms (safety check)
    setLoadedForms((prev) => {
      if (prev.length === allForms.length) {
        console.log(`[AdminFormsPage] ✅ Progressive display complete: ${allForms.length} forms rendered with animation in ${displayTime}ms`)
        return prev
      } else {
        console.warn(`[AdminFormsPage] ⚠️ Progressive display incomplete: ${prev.length}/${allForms.length} forms. Setting all forms.`)
        return allForms
      }
    })
  }

  // Toggle form active status mutation
  const toggleActiveMutation = useMutation({
    mutationFn: async ({ formId, isActive }: { formId: string; isActive: boolean }) => {
      return await apiClient.updateForm(formId, { is_active: isActive })
    },
    onSuccess: (updatedForm) => {
      // Update local state
      setForms((prevForms) =>
        prevForms.map((form) =>
          form.formId === updatedForm.formId ? updatedForm : form
        )
      )
      queryClient.invalidateQueries({ queryKey: ['forms'] })
      showSuccess(
        `Form ${updatedForm.isActive ? 'activated' : 'deactivated'} successfully`,
        'Status Updated'
      )
      setTogglingFormId(null)
    },
    onError: (error: any) => {
      showError(
        error.response?.data?.detail || error.message || 'Failed to update form status',
        'Update Failed'
      )
      setTogglingFormId(null)
    },
  })

  const handleToggleActive = (form: FormResponse) => {
    setTogglingFormId(form.formId)
    toggleActiveMutation.mutate({
      formId: form.formId,
      isActive: !form.isActive,
    })
  }

  // Delete form mutation
  const deleteFormMutation = useMutation({
    mutationFn: async (formId: string) => {
      return await apiClient.deleteForm(formId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forms'] })
      loadForms() // Reload forms list
      showSuccess('Form deleted successfully', 'Form Deleted')
      setDeletingFormId(null)
    },
    onError: (error: any) => {
      showError(
        error.response?.data?.detail || error.message || 'Failed to delete form',
        'Delete Failed'
      )
      setDeletingFormId(null)
    },
  })

  const handleDelete = (form: FormResponse) => {
    showConfirm({
      title: 'Delete Form',
      message: `Are you sure you want to delete "${form.name}"? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      confirmButtonClass: 'bg-red-600 hover:bg-red-700',
      onConfirm: () => {
        setDeletingFormId(form.formId)
        deleteFormMutation.mutate(form.formId)
      },
    })
  }

  const filteredForms = React.useMemo(() => {
    // Use loadedForms for progressive display, always fallback to forms if loadedForms is empty
    // This ensures forms are always displayed even if progressive animation fails
    const formsToFilter = loadedForms.length > 0 ? loadedForms : forms
    
    if (!searchTerm.trim()) {
      return formsToFilter
    }
    
    const searchLower = searchTerm.toLowerCase().trim()
    return formsToFilter.filter(
    (form) =>
        (form.name && form.name.toLowerCase().includes(searchLower)) ||
        (form.formId && form.formId.toLowerCase().includes(searchLower)) ||
        (form.description && form.description.toLowerCase().includes(searchLower)) ||
        (form.category && form.category.toLowerCase().includes(searchLower))
  )
  }, [loadedForms, forms, searchTerm])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Forms</h1>
          <p className="text-gray-600">Manage form schemas and configurations</p>
        </div>
        <button onClick={() => navigate('/admin/forms/create')} className="btn btn-primary">
          + Create New Form
        </button>
      </div>

      {/* Search */}
      <div className="bg-white shadow rounded-lg p-6">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => {
            const value = e.target.value
            setSearchTerm(value)
          }}
          placeholder="Search forms..."
          className="input w-full"
          autoComplete="off"
        />
        {searchTerm && (
          <div className="mt-2 text-sm text-gray-500">
            Showing {filteredForms.length} of {forms.length} forms
          </div>
        )}
      </div>

      {/* Forms Grid */}
      {loading && loadedForms.length === 0 ? (
        <Loading message="Loading forms..." />
      ) : filteredForms.length === 0 && !loading ? (
        <div className="text-center py-12 text-gray-500">No forms found</div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredForms.map((form, index) => (
            <div 
              key={form.id} 
              className="bg-white shadow rounded-lg p-6 hover:shadow-lg transition-shadow animate-fadeIn"
              style={{
                animationDelay: `${Math.min(index * 50, 500)}ms`,
                animationFillMode: 'both',
                opacity: 0
              }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{form.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">ID: {form.formId}</p>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  {togglingFormId === form.formId ? (
                    <div className="flex items-center gap-2">
                      <LoadingSpinner size="sm" />
                      <span className="text-xs text-gray-500">Saving...</span>
                    </div>
                  ) : (
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.isActive}
                        onChange={() => handleToggleActive(form)}
                        disabled={togglingFormId === form.formId}
                        className="sr-only"
                      />
                      <div
                        className={cn(
                          'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                          form.isActive ? 'bg-green-500' : 'bg-gray-300'
                        )}
                      >
                        <span
                          className={cn(
                            'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                            form.isActive ? 'translate-x-6' : 'translate-x-1'
                          )}
                        />
                      </div>
                      <span className="ml-2 text-xs text-gray-600">
                        {form.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </label>
                  )}
                </div>
              </div>

              {form.description && (
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{form.description}</p>
              )}

              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <span>Version: {form.version}</span>
                {form.category && <span>{form.category}</span>}
              </div>

              <div className="flex space-x-2">
                <Link
                  to={`/admin/forms/${form.formId}/schema`}
                  className="btn btn-secondary btn-sm flex-1 text-center"
                >
                  Edit Schema
                </Link>
                <Link
                  to={`/admin/forms/${form.formId}/schema?tab=preview`}
                  className="btn btn-primary btn-sm flex-1 text-center"
                >
                  Preview
                </Link>
                <button
                  onClick={() => handleDelete(form)}
                  disabled={deletingFormId === form.formId}
                  className={cn(
                    'btn bg-red-600 hover:bg-red-700 text-white btn-sm',
                    deletingFormId === form.formId && 'opacity-50 cursor-not-allowed'
                  )}
                  title="Delete form"
                >
                  {deletingFormId === form.formId ? 'Deleting...' : '🗑️'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

