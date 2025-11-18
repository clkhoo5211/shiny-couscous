# Supabase Local Development Setup

## Overview

This guide explains how to set up Supabase for local development with React/Vite, following the [Supabase React quickstart guide](https://supabase.com/docs/guides/getting-started/quickstarts/reactjs).

## Configuration

### 1. Environment Variables

Create `.env.local` in the `frontend/` directory:

```env
# Supabase Configuration for Local Development
# These are public keys safe for client-side use (anon key is public-facing)

VITE_SUPABASE_URL=https://mwvyldzcutztjenscbyr.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im13dnlsZHpjdXR6dGplbnNjYnlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0MzE4ODIsImV4cCI6MjA3OTAwNzg4Mn0.gfkcwbLAmnLnnUsbNd7Q1hs2TmM0oBDCn-kRkkWUSP0
```

**Note:** The `.env.local` file is ignored by git (in `.gitignore`) to prevent committing credentials.

### 2. Supabase Client

The Supabase client is initialized in `src/lib/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

### 3. Test Page

A test page is available at `/test/supabase` to verify the connection:

- **URL**: http://localhost:3000/test/supabase
- **Features**:
  - Shows environment variables (masked for security)
  - Tests Supabase connection
  - Displays connection status
  - Shows Supabase client information

## Testing the Connection

### Method 1: Use the Test Page

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Visit: http://localhost:3000/test/supabase

3. Check the connection status:
   - ✅ Green box = Connection successful
   - ❌ Red box = Connection failed

### Method 2: Use the Supabase Client Directly

```typescript
import { supabase } from '@/lib/supabase'

// Test connection
const { data, error } = await supabase.from('your_table').select('*').limit(1)

if (error) {
  console.error('Supabase error:', error)
} else {
  console.log('Supabase data:', data)
}
```

## Usage Examples

### Query Data

```typescript
import { supabase } from '@/lib/supabase'

// Get all records from a table
const { data, error } = await supabase
  .from('forms')
  .select('*')

// Get a single record
const { data, error } = await supabase
  .from('forms')
  .select('*')
  .eq('id', 'form-id-123')
  .single()

// Filter and limit
const { data, error } = await supabase
  .from('forms')
  .select('id, name, status')
  .eq('status', 'active')
  .limit(10)
```

### Insert Data

```typescript
import { supabase } from '@/lib/supabase'

const { data, error } = await supabase
  .from('forms')
  .insert([
    { name: 'New Form', status: 'draft' }
  ])
  .select()
```

### Update Data

```typescript
import { supabase } from '@/lib/supabase'

const { data, error } = await supabase
  .from('forms')
  .update({ status: 'active' })
  .eq('id', 'form-id-123')
  .select()
```

### Delete Data

```typescript
import { supabase } from '@/lib/supabase'

const { error } = await supabase
  .from('forms')
  .delete()
  .eq('id', 'form-id-123')
```

## Troubleshooting

### Connection Fails

1. **Check environment variables:**
   - Verify `.env.local` exists in `frontend/` directory
   - Ensure variables start with `VITE_` prefix
   - Restart dev server after changing `.env.local`

2. **Check Supabase URL:**
   - Verify URL is correct: `https://mwvyldzcutztjenscbyr.supabase.co`
   - Ensure no trailing slash

3. **Check Anon Key:**
   - Verify key is correct
   - Ensure it's the "anon" key (public key), not service role key

4. **Check CORS:**
   - Supabase should allow requests from `http://localhost:3000`
   - Check Supabase Dashboard → Settings → API → CORS settings

### Table Not Found Error

If you see `PGRST116: relation "public.forms" does not exist`:

1. This is normal if the table doesn't exist yet
2. Create the table in Supabase Dashboard → Table Editor
3. Or create it via SQL Editor:
   ```sql
   CREATE TABLE forms (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     name TEXT NOT NULL,
     status TEXT NOT NULL,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   ```

### RLS (Row Level Security) Errors

If you see permission errors:

1. Check if RLS is enabled on the table:
   ```sql
   ALTER TABLE forms ENABLE ROW LEVEL SECURITY;
   ```

2. Create a policy to allow anonymous reads (if needed):
   ```sql
   CREATE POLICY "Allow anonymous reads"
   ON forms FOR SELECT
   TO anon
   USING (true);
   ```

## Next Steps

1. **Create Tables**: Set up your database schema in Supabase Dashboard
2. **Configure RLS**: Set up Row Level Security policies for your tables
3. **Use in Components**: Import `supabase` from `@/lib/supabase` in your React components
4. **Authentication**: Set up Supabase Auth for user authentication (optional)

## References

- [Supabase React Quickstart](https://supabase.com/docs/guides/getting-started/quickstarts/reactjs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)

