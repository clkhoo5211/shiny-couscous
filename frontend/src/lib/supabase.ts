/**
 * Supabase Client Setup
 * 
 * Creates and exports a Supabase client instance for local development.
 * Follows Supabase React quickstart guide: https://supabase.com/docs/guides/getting-started/quickstarts/reactjs
 */

import { createClient } from '@supabase/supabase-js'

// Get Supabase configuration from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Validate environment variables
if (!supabaseUrl) {
  throw new Error('Missing VITE_SUPABASE_URL environment variable')
}

if (!supabaseAnonKey) {
  throw new Error('Missing VITE_SUPABASE_ANON_KEY environment variable')
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Test connection helper
export async function testSupabaseConnection(): Promise<{ success: boolean; message: string; data?: any }> {
  try {
    // Test connection by querying a simple endpoint
    const { data, error } = await supabase.from('forms').select('count').limit(1)
    
    if (error) {
      // If table doesn't exist, connection still works
      if (error.code === 'PGRST116') {
        return {
          success: true,
          message: '✅ Supabase connection successful! (Table "forms" does not exist yet)',
        }
      }
      
      return {
        success: false,
        message: `❌ Supabase connection error: ${error.message}`,
        data: error,
      }
    }
    
    return {
      success: true,
      message: '✅ Supabase connection successful!',
      data,
    }
  } catch (err: any) {
    return {
      success: false,
      message: `❌ Supabase connection failed: ${err.message}`,
      data: err,
    }
  }
}

