# 🔗 Labuan FSA E-Submission System - Integration Patterns

**Project**: Labuan FSA E-Online Submission System  
**Created**: 2025-11-17 15:34:58  
**Status**: Design Phase  
**Version**: 1.0.0

---

## 🎯 INTEGRATION OVERVIEW

**Integration Categories**: API, File Storage, Secrets Management, Payment Gateway, Email Service  
**Total Integrations**: 10+

---

## 🔌 API INTEGRATION PATTERNS

### RESTful API Client Pattern

**Base API Client** (`src/lib/api-client.ts`):
```typescript
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

class APIClient {
  private client: AxiosInstance;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.client = axios.create({
      baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Request interceptor for auth token
    this.client.interceptors.request.use((config) => {
      if (this.token) {
        config.headers.Authorization = `Bearer ${this.token}`;
      }
      return config;
    });

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Handle unauthorized - redirect to login
          this.handleUnauthorized();
        }
        return Promise.reject(error);
      }
    );
  }

  setToken(token: string) {
    this.token = token;
  }

  async getFormSchema(formId: string): Promise<FormSchema> {
    const response = await this.client.get(`/api/forms/${formId}/schema`);
    return response.data;
  }

  async submitForm(formId: string, data: SubmissionData): Promise<SubmissionResponse> {
    const response = await this.client.post(`/api/forms/${formId}/submit`, data);
    return response.data;
  }

  // ... other API methods
}

export const apiClient = new APIClient(process.env.REACT_APP_API_URL || '/api');
```

### React Query Integration Pattern

**API Hooks** (`src/hooks/useFormApi.ts`):
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Query: Get form schema
export function useFormSchema(formId: string) {
  return useQuery({
    queryKey: ['form-schema', formId],
    queryFn: () => apiClient.getFormSchema(formId),
    staleTime: 5 * 60 * 1000,  // Cache for 5 minutes
    enabled: !!formId
  });
}

// Mutation: Submit form
export function useSubmitForm(formId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SubmissionData) => apiClient.submitForm(formId, data),
    onSuccess: (response) => {
      // Invalidate submissions list
      queryClient.invalidateQueries({ queryKey: ['submissions'] });
      // Show success notification
      toast.success(`Form submitted successfully. ID: ${response.submissionId}`);
    },
    onError: (error) => {
      // Show error notification
      toast.error('Submission failed. Please try again.');
    }
  });
}
```

---

## 📤 FILE STORAGE INTEGRATION

### Local Storage Pattern (Development)

**Local File Upload** (`src/services/file-service.ts`):
```typescript
class FileService {
  async uploadFile(
    file: File,
    fieldName: string,
    onProgress?: (progress: number) => void
  ): Promise<FileUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('fieldName', fieldName);

    return axios.post('/api/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = (progressEvent.loaded / progressEvent.total) * 100;
          onProgress(progress);
        }
      }
    }).then(response => response.data);
  }
}
```

### Cloud Storage Integration Pattern (Production)

**AWS S3 Upload**:
```typescript
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

class S3FileService {
  private s3Client: S3Client;
  private bucketName: string;

  async uploadFile(file: File): Promise<string> {
    const key = `${Date.now()}-${file.name}`;
    
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: file,
      ContentType: file.type
    });

    await this.s3Client.send(command);
    return `s3://${this.bucketName}/${key}`;
  }

  async getSignedUrl(key: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key
    });
    return getSignedUrl(this.s3Client, command, { expiresIn: 3600 });
  }
}
```

**Alternative: Azure Blob Storage**:
```typescript
import { BlobServiceClient } from '@azure/storage-blob';

class AzureFileService {
  private blobServiceClient: BlobServiceClient;
  private containerName: string;

  async uploadFile(file: File): Promise<string> {
    const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
    const blobName = `${Date.now()}-${file.name}`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    await blockBlobClient.uploadData(file, {
      blobHTTPHeaders: { blobContentType: file.type }
    });

    return blockBlobClient.url;
  }
}
```

---

## 🔐 SECRETS MANAGEMENT INTEGRATION

### AWS Secrets Manager Integration

**Backend** (`src/labuan_fsa/config.py`):
```python
import boto3
from botocore.exceptions import ClientError

class SecretsManager:
    def __init__(self, region_name: str = 'us-east-1'):
        self.client = boto3.client('secretsmanager', region_name=region_name)
    
    def get_secret(self, secret_name: str) -> Optional[str]:
        try:
            response = self.client.get_secret_value(SecretId=secret_name)
            return response['SecretString']
        except ClientError as e:
            if e.response['Error']['Code'] == 'ResourceNotFoundException':
                return None
            raise
```

### Azure Key Vault Integration

```python
from azure.identity import DefaultAzureCredential
from azure.keyvault.secrets import SecretClient

class AzureKeyVault:
    def __init__(self, vault_url: str):
        credential = DefaultAzureCredential()
        self.client = SecretClient(vault_url=vault_url, credential=credential)
    
    def get_secret(self, secret_name: str) -> Optional[str]:
        try:
            secret = self.client.get_secret(secret_name)
            return secret.value
        except Exception:
            return None
```

### GCP Secret Manager Integration

```python
from google.cloud import secretmanager

class GCPSecretManager:
    def __init__(self, project_id: str):
        self.client = secretmanager.SecretManagerServiceClient()
        self.project_id = project_id
    
    def get_secret(self, secret_name: str) -> Optional[str]:
        name = f"projects/{self.project_id}/secrets/{secret_name}/versions/latest"
        try:
            response = self.client.access_secret_version(request={"name": name})
            return response.payload.data.decode("UTF-8")
        except Exception:
            return None
```

---

## 💳 PAYMENT GATEWAY INTEGRATION

### Stripe Integration Pattern

**Backend** (`src/labuan_fsa/services/payment_service.py`):
```python
import stripe

class StripePaymentService:
    def __init__(self, secret_key: str):
        stripe.api_key = secret_key
    
    def create_payment_intent(self, amount: int, currency: str = 'myr'):
        return stripe.PaymentIntent.create(
            amount=amount,  # Amount in cents
            currency=currency,
            payment_method_types=['card']
        )
    
    def confirm_payment(self, payment_intent_id: str, payment_method_id: str):
        return stripe.PaymentIntent.confirm(
            payment_intent_id,
            payment_method=payment_method_id
        )
```

**Frontend** (`src/components/PaymentField.tsx`):
```typescript
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY!);

function PaymentField({ amount, onSuccess, onError }: PaymentFieldProps) {
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements) return;

    const cardElement = elements.getElement(CardElement);
    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: cardElement!
    });

    if (error) {
      onError(error);
      return;
    }

    // Call backend to create payment intent
    const response = await apiClient.createPaymentIntent(amount, paymentMethod.id);
    // Handle payment confirmation
  };

  return (
    <Elements stripe={stripePromise}>
      <form onSubmit={handleSubmit}>
        <CardElement />
        <button type="submit">Pay</button>
      </form>
    </Elements>
  );
}
```

### PayPal Integration Pattern

**Frontend** (`src/components/PayPalPaymentField.tsx`):
```typescript
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';

function PayPalPaymentField({ amount, onSuccess, onError }: PaymentFieldProps) {
  return (
    <PayPalScriptProvider options={{
      'client-id': process.env.REACT_APP_PAYPAL_CLIENT_ID!,
      currency: 'MYR'
    }}>
      <PayPalButtons
        createOrder={(data, actions) => {
          return actions.order.create({
            purchase_units: [{
              amount: {
                value: amount.toString()
              }
            }]
          });
        }}
        onApprove={(data, actions) => {
          return actions.order!.capture().then((details) => {
            onSuccess(details);
          });
        }}
        onError={(error) => {
          onError(error);
        }}
      />
    </PayPalScriptProvider>
  );
}
```

---

## 📧 EMAIL SERVICE INTEGRATION

### SendGrid Integration Pattern

**Backend** (`src/labuan_fsa/services/email_service.py`):
```python
import sendgrid
from sendgrid.helpers.mail import Mail, Email, To, Content

class EmailService:
    def __init__(self, api_key: str):
        self.sg = sendgrid.SendGridAPIClient(api_key=api_key)
    
    def send_email(self, to: str, subject: str, html_content: str):
        message = Mail(
            from_email=Email('noreply@labuanfsa.gov.my'),
            to_emails=To(to),
            subject=subject,
            html_content=Content('text/html', html_content)
        )
        response = self.sg.send(message)
        return response
```

### AWS SES Integration Pattern

```python
import boto3

class SESEmailService:
    def __init__(self, region_name: str = 'us-east-1'):
        self.client = boto3.client('ses', region_name=region_name)
    
    def send_email(self, to: str, subject: str, html_content: str):
        return self.client.send_email(
            Source='noreply@labuanfsa.gov.my',
            Destination={'ToAddresses': [to]},
            Message={
                'Subject': {'Data': subject},
                'Body': {'Html': {'Data': html_content}}
            }
        )
```

---

## 🔄 REAL-TIME UPDATES PATTERN

### WebSocket Integration (Optional)

**Backend** (`src/labuan_fsa/main.py`):
```python
from fastapi import WebSocket

@app.websocket("/ws/submissions/{submission_id}")
async def websocket_endpoint(websocket: WebSocket, submission_id: str):
    await websocket.accept()
    try:
        while True:
            # Send submission status updates
            status = await get_submission_status(submission_id)
            await websocket.send_json({"status": status})
            await asyncio.sleep(5)  # Poll every 5 seconds
    except WebSocketDisconnect:
        pass
```

**Frontend** (`src/hooks/useSubmissionStatus.ts`):
```typescript
export function useSubmissionStatus(submissionId: string) {
  const [status, setStatus] = useState<string>('submitted');

  useEffect(() => {
    const ws = new WebSocket(`ws://localhost:8000/ws/submissions/${submissionId}`);
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setStatus(data.status);
    };

    return () => ws.close();
  }, [submissionId]);

  return status;
}
```

---

## 📊 MONITORING & LOGGING INTEGRATION

### Application Monitoring Pattern

**Structured Logging** (`src/labuan_fsa/utils/logger.py`):
```python
import logging
import json
from datetime import datetime

class StructuredLogger:
    def __init__(self, name: str):
        self.logger = logging.getLogger(name)
    
    def log_submission(self, submission_id: str, action: str, **kwargs):
        self.logger.info(json.dumps({
            'timestamp': datetime.utcnow().isoformat(),
            'event': 'submission',
            'submission_id': submission_id,
            'action': action,
            **kwargs
        }))
```

### Error Tracking Pattern

**Sentry Integration** (`src/labuan_fsa/main.py`):
```python
import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration

sentry_sdk.init(
    dsn=settings.SENTRY_DSN,
    integrations=[FastApiIntegration()],
    traces_sample_rate=0.1
)
```

---

## 🔐 AUTHENTICATION INTEGRATION PATTERN

### JWT Token Management

**Token Storage** (`src/lib/auth.ts`):
```typescript
class AuthService {
  private tokenKey = 'access_token';
  private refreshTokenKey = 'refresh_token';

  setTokens(accessToken: string, refreshToken: string) {
    localStorage.setItem(this.tokenKey, accessToken);
    localStorage.setItem(this.refreshTokenKey, refreshToken);
  }

  getAccessToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.refreshTokenKey);
  }

  async refreshAccessToken(): Promise<string | null> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) return null;

    try {
      const response = await apiClient.refreshToken(refreshToken);
      this.setTokens(response.accessToken, refreshToken);
      return response.accessToken;
    } catch (error) {
      this.logout();
      return null;
    }
  }

  logout() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.refreshTokenKey);
  }
}
```

---

## 📋 INTEGRATION SUMMARY

| Integration Type | Service | Integration Pattern |
|-----------------|---------|---------------------|
| **API Client** | FastAPI Backend | RESTful API with axios/fetch |
| **File Storage** | AWS S3 / Azure / GCP | Direct upload or signed URLs |
| **Secrets Management** | AWS Secrets Manager / Azure Key Vault / GCP Secret Manager | Secure secret retrieval |
| **Payment Gateway** | Stripe / PayPal | Client-side SDK + Backend API |
| **Email Service** | SendGrid / AWS SES | SMTP API |
| **Monitoring** | Sentry / LogRocket | Error tracking SDK |
| **Logging** | Structured Logging | JSON logs with metadata |

---

**Document Status**: ✅ Complete  
**Next Phase**: Testing Strategy and Deployment  
**Last Updated**: 2025-11-17 15:34:58

