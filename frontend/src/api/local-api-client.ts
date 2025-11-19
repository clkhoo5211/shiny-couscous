/**
 * Local API Client - Uses backend API to serve JSON files from local backend/data directory
 * 
 * This client is used when GitHub API credentials are not configured,
 * allowing local development without needing GitHub tokens.
 */

import axios, { AxiosInstance } from 'axios'
import type {
  FormResponse,
  FormSchemaResponse,
  SubmissionResponse,
} from '@/types'

/**
 * Local API Client Class
 * Uses backend API endpoints that serve JSON files from backend/data/
 */
export class LocalAPIClient {
  private client: AxiosInstance
  private baseURL: string

  constructor(baseURL: string = 'http://localhost:8000') {
    this.baseURL = baseURL
    this.client = axios.create({
      baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }

  /**
   * Read JSON file from backend API
   */
  async readJsonFile(filePath: string): Promise<{ data: any; sha?: string }> {
    try {
      // Backend serves JSON files via API endpoints
      // Map file paths to API endpoints
      const endpoint = this.getEndpointForFile(filePath)
      const response = await this.client.get(endpoint)
      return { data: response.data }
    } catch (error: any) {
      if (error.response?.status === 404) {
        // File doesn't exist yet, return empty data
        return { data: this.getDefaultDataForFile(filePath) }
      }
      throw error
    }
  }

  /**
   * Write JSON file via backend API
   */
  async writeJsonFile(filePath: string, content: any, sha?: string): Promise<void> {
    const endpoint = this.getEndpointForFile(filePath)
    const method = sha ? 'put' : 'post'
    
    await this.client[method](endpoint, content)
  }

  /**
   * Delete JSON file via backend API
   */
  async deleteJsonFile(filePath: string): Promise<void> {
    const endpoint = this.getEndpointForFile(filePath)
    await this.client.delete(endpoint)
  }

  /**
   * Map file path to backend API endpoint
   */
  private getEndpointForFile(filePath: string): string {
    // Map backend/data/*.json files to API endpoints
    const fileMap: { [key: string]: string } = {
      'backend/data/forms.json': '/api/forms',
      'backend/data/users_auth.json': '/api/auth/users',
      'backend/data/admins_auth.json': '/api/auth/admins',
      'backend/data/admin_roles.json': '/api/admin/roles',
      'backend/data/submissions.json': '/api/submissions',
      'backend/data/sessions.json': '/api/sessions',
      'backend/data/settings.json': '/api/admin/settings',
      'backend/data/files.json': '/api/files',
      'backend/data/database.json': '/api/database',
    }

    // Try exact match first
    if (fileMap[filePath]) {
      return fileMap[filePath]
    }

    // Try matching by filename
    const fileName = filePath.split('/').pop() || ''
    for (const [path, endpoint] of Object.entries(fileMap)) {
      if (path.endsWith(fileName)) {
        return endpoint
      }
    }

    // Default: try to construct endpoint from filename
    const nameWithoutExt = fileName.replace('.json', '')
    return `/api/${nameWithoutExt}`
  }

  /**
   * Get default data structure for a file
   */
  private getDefaultDataForFile(filePath: string): any {
    if (filePath.includes('forms.json')) {
      return { version: '1.0.0', lastUpdated: new Date().toISOString(), items: [] }
    }
    if (filePath.includes('_auth.json')) {
      return []
    }
    if (filePath.includes('submissions.json')) {
      return { version: '1.0.0', lastUpdated: new Date().toISOString(), items: [] }
    }
    return {}
  }
}

/**
 * Create local API client instance
 */
export function createLocalAPIClient(): LocalAPIClient {
  const apiURL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
  return new LocalAPIClient(apiURL)
}

