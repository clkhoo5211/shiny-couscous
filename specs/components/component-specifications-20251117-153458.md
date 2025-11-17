# 🧩 Labuan FSA E-Submission System - Component Specifications

**Project**: Labuan FSA E-Online Submission System  
**Created**: 2025-11-17 15:34:58  
**Status**: Design Phase  
**Version**: 1.0.0

---

## 🎯 COMPONENT OVERVIEW

**Total Components**: 100+  
**Component Categories**: Base Fields, Layout, Composite, Admin

---

## 📐 COMPONENT ARCHITECTURE

### Component Hierarchy
```
src/
├── components/
│   ├── base/              # Base field components
│   │   ├── InputField.tsx
│   │   ├── SelectField.tsx
│   │   ├── ToggleField.tsx
│   │   ├── UploadField.tsx
│   │   └── [85+ field types...]
│   ├── layout/            # Layout components
│   │   ├── FormContainer.tsx
│   │   ├── FormSection.tsx
│   │   ├── FormStep.tsx
│   │   └── FormActions.tsx
│   ├── forms/             # Form components
│   │   ├── DynamicForm.tsx
│   │   └── FormRenderer.tsx
│   ├── admin/             # Admin components
│   │   ├── AdminDashboard.tsx
│   │   ├── SubmissionList.tsx
│   │   └── FormSchemaEditor.tsx
│   └── shared/            # Shared components
│       ├── FieldLabel.tsx
│       ├── FieldValidation.tsx
│       └── FieldGroup.tsx
```

---

## 🔧 BASE FIELD COMPONENTS

### InputField Component

**Purpose**: Render all HTML input types dynamically

**Props Interface**:
```typescript
interface InputFieldProps {
  // Core identification
  fieldId: string;
  fieldName: string;
  fieldType: 'input-text' | 'input-number' | 'input-email' | 'input-password' | 'input-tel' | 'input-url' | 'input-search' | 'input-color';
  inputType?: 'text' | 'number' | 'email' | 'password' | 'tel' | 'url' | 'search' | 'color';
  
  // Content
  label: string;
  placeholder?: string;
  helpText?: string;
  tooltip?: string;
  
  // State
  value?: any;
  defaultValue?: any;
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  hidden?: boolean;
  
  // Validation
  validation?: {
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    pattern?: string;
    errorMessage?: string;
  };
  
  // Styling
  className?: string;
  style?: React.CSSProperties;
  containerClassName?: string;
  containerStyle?: React.CSSProperties;
  labelClassName?: string;
  
  // Events
  onChange: (value: any) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  
  // Conditional display
  conditionalDisplay?: {
    when: string;  // Field name to watch
    equals?: any;
    show: boolean;
  };
}
```

**Implementation**:
- Supports all HTML5 input types
- Real-time validation
- Error message display
- Accessible (ARIA labels, keyboard navigation)
- Responsive design

---

### SelectField Component

**Purpose**: Single/multi-select dropdown with "Other" option

**Props Interface**:
```typescript
interface SelectFieldProps {
  // Core identification
  fieldId: string;
  fieldName: string;
  fieldType: 'select-single' | 'select-multi' | 'select-other';
  
  // Content
  label: string;
  placeholder?: string;
  helpText?: string;
  
  // Options
  options: Array<{
    value: string;
    label: string;
    description?: string;
    disabled?: boolean;
  }>;
  allowOther?: boolean;  // Show "Other" option with text input
  otherOptionLabel?: string;  // Default: "Other"
  otherInputPlaceholder?: string;
  
  // Selection behavior
  multiple?: boolean;
  searchable?: boolean;
  asyncLoad?: boolean;  // Load options from API on demand
  asyncLoadUrl?: string;  // API endpoint for async loading
  
  // State
  value?: string | string[];
  defaultValue?: string | string[];
  required?: boolean;
  disabled?: boolean;
  
  // Validation
  validation?: {
    required?: boolean;
    minSelections?: number;  // For multi-select
    maxSelections?: number;  // For multi-select
    errorMessage?: string;
  };
  
  // Styling (same as InputField)
  className?: string;
  containerClassName?: string;
  // ... other styling props
  
  // Events
  onChange: (value: any) => void;
}
```

**Implementation**:
- Supports single and multi-select
- "Other" option triggers text input display
- Searchable dropdown with filtering
- Async option loading from API
- Grouped options support
- Cascading select support (depends on parent field)

---

### ToggleField Component

**Purpose**: Checkbox, radio buttons, switch/toggle

**Props Interface**:
```typescript
interface ToggleFieldProps {
  // Core identification
  fieldId: string;
  fieldName: string;
  fieldType: 'checkbox' | 'radio' | 'switch' | 'checkbox-group' | 'radio-group';
  
  // Content
  label: string;
  helpText?: string;
  
  // Options (for groups)
  options?: Array<{
    value: string;
    label: string;
    disabled?: boolean;
  }>;
  allowOther?: boolean;  // Show "Other" option
  
  // State
  value?: boolean | string | string[];
  defaultValue?: boolean | string | string[];
  required?: boolean;
  disabled?: boolean;
  
  // Validation
  validation?: {
    required?: boolean;
    minSelections?: number;  // For checkbox-group
    maxSelections?: number;
    errorMessage?: string;
  };
  
  // Events
  onChange: (value: any) => void;
}
```

**Implementation**:
- Single checkbox
- Radio button group
- Checkbox group
- Switch/toggle
- "Other" option support (shows text input)

---

### UploadField Component

**Purpose**: File upload with drag-drop, preview, progress

**Props Interface**:
```typescript
interface UploadFieldProps {
  // Core identification
  fieldId: string;
  fieldName: string;
  fieldType: 'upload-single' | 'upload-multiple' | 'upload-image' | 'upload-document' | 'upload-camera';
  
  // Content
  label: string;
  helpText?: string;
  
  // Upload configuration
  multiple?: boolean;
  accept?: string[];  // File types: ['.pdf', '.jpg', '.png']
  maxSize?: number;  // Max file size in bytes
  maxFiles?: number;  // Max number of files
  
  // Features
  dragDrop?: boolean;  // Enable drag-drop
  preview?: boolean;  // Show file preview
  showProgress?: boolean;  // Show upload progress
  
  // Upload options
  uploadUrl?: string;  // API endpoint for upload
  chunked?: boolean;  // Use chunked upload for large files
  
  // State
  value?: File[];
  defaultValue?: File[];
  required?: boolean;
  disabled?: boolean;
  
  // Validation
  validation?: {
    required?: boolean;
    fileTypes?: string[];
    maxSize?: number;
    maxFiles?: number;
    errorMessage?: string;
  };
  
  // Events
  onChange: (files: File[]) => void;
  onUploadProgress?: (progress: number) => void;
  onUploadComplete?: (fileIds: string[]) => void;
  onUploadError?: (error: Error) => void;
}
```

**Implementation**:
- Drag-drop file upload
- File preview (images, PDF thumbnails)
- Upload progress tracking
- Chunked upload for large files
- File validation (type, size)
- Multiple file upload
- Camera capture (mobile)

---

### DatePickerField Component

**Purpose**: Date, time, datetime selection

**Props Interface**:
```typescript
interface DatePickerFieldProps {
  // Core identification
  fieldId: string;
  fieldName: string;
  fieldType: 'date-picker' | 'time-picker' | 'datetime-picker' | 'date-range' | 'month-picker' | 'year-picker' | 'week-picker' | 'quarter-picker';
  
  // Content
  label: string;
  placeholder?: string;
  helpText?: string;
  
  // Date configuration
  format?: string;  // Date format: 'YYYY-MM-DD', 'DD/MM/YYYY', etc.
  timeFormat?: string;  // Time format: 'HH:mm', 'HH:mm:ss', etc.
  timezone?: string;  // Timezone: 'UTC', 'Asia/Kuala_Lumpur', etc.
  
  // Constraints
  minDate?: Date | string;
  maxDate?: Date | string;
  disabledDates?: (Date | string)[];
  
  // Range picker (for date-range)
  rangeMode?: 'start' | 'end';
  
  // State
  value?: Date | string | { start: Date | string; end: Date | string };
  defaultValue?: Date | string;
  required?: boolean;
  disabled?: boolean;
  
  // Validation
  validation?: {
    required?: boolean;
    minDate?: Date | string;
    maxDate?: Date | string;
    errorMessage?: string;
  };
  
  // Events
  onChange: (value: any) => void;
}
```

**Implementation**:
- Date picker with calendar widget
- Time picker
- DateTime picker
- Date range picker
- Month/Year/Quarter/Week pickers
- Date formatting and timezone support

---

## 🎨 LAYOUT COMPONENTS

### DynamicForm Component

**Purpose**: Main form component that fetches schema and renders dynamically

**Props Interface**:
```typescript
interface DynamicFormProps {
  formId: string;
  mode?: 'view' | 'edit' | 'preview';  // Form mode
  submissionId?: string;  // If editing existing submission
  onSuccess?: (submissionId: string) => void;
  onError?: (error: Error) => void;
  onCancel?: () => void;
}
```

**Implementation**:
- Fetches form schema from API (`GET /api/forms/{formId}/schema`)
- Initializes form state (React Hook Form/Formik)
- Renders FormRenderer with schema
- Handles form submission
- Manages form state (draft saving, validation)

---

### FormRenderer Component

**Purpose**: Recursive renderer that interprets API schema and renders components

**Props Interface**:
```typescript
interface FormRendererProps {
  schema: FormSchema;  // Complete form schema from API
  formState: FormState;  // Form state (values, errors, touched)
  onFieldChange: (fieldId: string, value: any) => void;
  onFieldBlur?: (fieldId: string) => void;
  onFieldFocus?: (fieldId: string) => void;
}
```

**Implementation**:
- Recursively renders form structure (steps → sections → fields)
- Instantiates appropriate field components based on fieldType
- Handles conditional field display
- Manages field dependencies (cascading selects, conditional logic)
- Validates fields based on schema validation rules

**Rendering Logic**:
```typescript
// Pseudocode
function FormRenderer({ schema, formState, onFieldChange }) {
  return schema.steps.map(step => (
    <FormStep key={step.stepId} step={step}>
      {step.fields.map(field => {
        // Determine component based on fieldType
        const Component = getComponentByType(field.fieldType);
        
        // Check conditional display
        if (shouldDisplayField(field, formState.values)) {
          return (
            <Component
              key={field.fieldId}
              {...field}  // Spread all field props from schema
              value={formState.values[field.fieldName]}
              onChange={(value) => onFieldChange(field.fieldName, value)}
              error={formState.errors[field.fieldName]}
            />
          );
        }
        return null;
      })}
    </FormStep>
  ));
}
```

---

### FormContainer Component

**Purpose**: Main form wrapper with API integration

**Props Interface**:
```typescript
interface FormContainerProps {
  formId: string;
  children: React.ReactNode;
  onSaveDraft?: () => void;
  onExit?: () => void;
  showProgress?: boolean;
}
```

**Implementation**:
- Form wrapper with header (form title, save draft, exit)
- Progress indicator for multi-step forms
- Form state management
- API integration (fetch schema, submit form)

---

### FormSection Component

**Purpose**: Section grouping with collapsible and conditional display

**Props Interface**:
```typescript
interface FormSectionProps {
  sectionId: string;
  title: string;
  description?: string;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  conditionalDisplay?: ConditionalRule;
  children: React.ReactNode;
}
```

**Implementation**:
- Visual section grouping
- Collapsible sections
- Conditional display based on form state
- Section-level validation

---

### FormStep Component

**Purpose**: Multi-step form navigation

**Props Interface**:
```typescript
interface FormStepProps {
  stepId: string;
  stepOrder: number;
  totalSteps: number;
  title: string;
  description?: string;
  isActive: boolean;
  isCompleted: boolean;
  isDisabled: boolean;
  onNext?: () => void;
  onPrevious?: () => void;
  children: React.ReactNode;
}
```

**Implementation**:
- Step indicator (progress bar, step numbers)
- Step navigation (Previous/Next buttons)
- Step validation (cannot proceed if invalid)
- Step state management (active, completed, disabled)

---

## 🔗 INTEGRATION PATTERNS

### API Integration Pattern

**API Client** (`src/lib/api-client.ts`):
```typescript
// API client using fetch or axios
class APIClient {
  private baseURL: string;
  private token: string | null = null;

  async getFormSchema(formId: string): Promise<FormSchema> {
    const response = await fetch(`${this.baseURL}/api/forms/${formId}/schema`, {
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  }

  async submitForm(formId: string, data: SubmissionData): Promise<SubmissionResponse> {
    const response = await fetch(`${this.baseURL}/api/forms/${formId}/submit`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    return response.json();
  }

  // ... other API methods
}
```

### Form State Management Pattern

**React Hook Form Integration**:
```typescript
// Dynamic form with React Hook Form
function DynamicForm({ formId }: { formId: string }) {
  const { data: schema } = useQuery(['form-schema', formId], () => 
    apiClient.getFormSchema(formId)
  );
  
  const form = useForm({
    defaultValues: extractDefaultValues(schema),
    resolver: yupResolver(createValidationSchema(schema))
  });

  const onSubmit = async (data: any) => {
    const response = await apiClient.submitForm(formId, data);
    // Handle success
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <FormRenderer
        schema={schema}
        formState={{
          values: form.watch(),
          errors: form.formState.errors,
          touched: form.formState.touchedFields
        }}
        onFieldChange={(fieldName, value) => form.setValue(fieldName, value)}
        onFieldBlur={(fieldName) => form.trigger(fieldName)}
      />
    </form>
  );
}
```

### Conditional Field Display Pattern

**Conditional Logic Engine**:
```typescript
function shouldDisplayField(
  field: FieldSchema,
  formValues: Record<string, any>
): boolean {
  if (!field.conditionalDisplay) return true;

  const { when, equals, show } = field.conditionalDisplay;
  const dependentValue = formValues[when];

  if (equals !== undefined) {
    return dependentValue === equals ? show : !show;
  }

  // More complex conditions (contains, greaterThan, etc.)
  return show;
}
```

### File Upload Integration Pattern

**File Upload Service**:
```typescript
async function uploadFile(
  file: File,
  fieldName: string,
  onProgress?: (progress: number) => void
): Promise<FileUploadResponse> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('fieldName', fieldName);

  return fetch('/api/files/upload', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData,
    onUploadProgress: (progressEvent) => {
      if (onProgress) {
        const progress = (progressEvent.loaded / progressEvent.total) * 100;
        onProgress(progress);
      }
    }
  }).then(response => response.json());
}
```

---

## 📊 COMPONENT SPECIFICATIONS SUMMARY

| Component Category | Component Count | Key Components |
|-------------------|----------------|----------------|
| **Base Fields** | 85+ | InputField, SelectField, ToggleField, UploadField, DatePickerField |
| **Layout** | 10+ | FormContainer, FormSection, FormStep, FormActions |
| **Composite** | 15+ | DynamicForm, FormRenderer, ArrayField, TableField |
| **Admin** | 10+ | AdminDashboard, SubmissionList, FormSchemaEditor |
| **Shared** | 10+ | FieldLabel, FieldValidation, FieldGroup, LoadingSpinner |

**Total**: 130+ components

---

**Document Status**: ✅ Complete  
**Next Phase**: Integration Patterns and Testing Strategy  
**Last Updated**: 2025-11-17 15:34:58

