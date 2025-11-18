# 🔧 Supabase Connection Pooler Fix for Vercel

## ⚠️ Important: Use Connection Pooler for Serverless

**Recommended Solution:** Use Supabase's **Connection Pooler** (port 6543) instead of direct connection (port 5432) for serverless environments like Vercel.

## 🎯 Why Connection Pooler?

1. **Designed for Serverless** - Optimized for stateless serverless functions
2. **Better Connection Management** - Handles connection pooling at Supabase level
3. **Prevents Errno 99** - Avoids socket binding errors
4. **IPv4 Compatible** - Better compatibility with serverless platforms

## 📋 How to Get Connection Pooler URL

### Step 1: Go to Supabase Dashboard

1. Visit: https://supabase.com/dashboard
2. Select your project
3. Go to **Database** section (left sidebar)

### Step 2: Find Connection Pooler

1. Look for **"Connect to your project"** button or modal
2. Click it - a modal will open
3. You'll see tabs: **"Connection String"**, **"URI"**, etc.
4. Under the **"Connection String"** tab, look for **"Method"** dropdown
5. In the **"Method"** dropdown, select:
   - **"Transaction pooler"** (recommended for serverless/Vercel)
   - **Description**: "Ideal for stateless applications like serverless functions where each interaction with Postgres is brief and isolated."
6. After selecting "Transaction pooler", the connection string will update automatically
7. Copy the connection string shown

**Connection String Format:**
```
postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
```

**Example Format:**
```
postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
```

### Step 3: Update DATABASE_URL in Vercel

1. Go to **Vercel Dashboard** → **Settings** → **Environment Variables**
2. Find `DATABASE_URL`
3. Update value to use pooler URL (port 6543)
4. **Important:** Keep the format as `postgresql://` (code will convert to `postgresql+asyncpg://`)
5. Set for **Production**, **Preview**, and **Development**
6. Click **Save**

### Step 4: Redeploy

1. Go to **Deployments** tab
2. Click **"..."** on latest deployment
3. Click **"Redeploy"**
4. **Uncheck** "Use existing Build Cache" if option appears

## 📊 Connection URLs Comparison

### Direct Connection (Current - port 5432)
```
postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```
- ❌ Can cause Errno 99 in serverless
- ❌ Connection limits per IP
- ❌ Not optimized for serverless

### Connection Pooler (Recommended - port 6543)
```
postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
```
- ✅ Designed for serverless
- ✅ Better connection management
- ✅ Prevents Errno 99 errors
- ✅ Handles connection pooling at Supabase level

## 🔍 How to Find Your Pooler URL

### Option 1: Supabase Dashboard (RECOMMENDED)
1. Go to **Database** section (left sidebar)
2. Click **"Connect to your project"** button/modal
3. In the **"Method"** dropdown, select **"Transaction pooler"**
4. The connection string will update automatically to use the pooler
5. Copy the connection string shown
6. The password should already be in the connection string (masked with dots)

### Option 2: Connection String Format

If you know your project reference, format is:
```
postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
```

Where:
- `[PROJECT-REF]` = Your Supabase project reference (get from Supabase Dashboard)
- `[YOUR-PASSWORD]` = Your database password (get from Supabase Dashboard)
- `[REGION]` = Your Supabase region (get from Supabase Dashboard)

## ✅ After Updating to Pooler

1. ✅ Update `DATABASE_URL` in Vercel with pooler URL
2. ✅ Redeploy (uncheck build cache)
3. ✅ Wait 2-3 minutes
4. ✅ Check Vercel logs - should see:
   ```
   ✅ Database URL set from environment: postgresql+asyncpg://postgres.[PROJECT-REF]...
   🌐 Serverless/Production environment - using NullPool
   ✅ Database connection successful
   ✅ Database tables created/verified successfully
   ```
5. ✅ Test API:
   ```bash
   curl https://shiny-couscous-tau.vercel.app/api/forms
   # Should return: [] (not 500 error)
   ```

## 📝 Notes

- **Both solutions work:** NullPool + Direct connection OR Connection pooler
- **Pooler is recommended** for better reliability in serverless
- **Code handles both:** The code will work with either connection type
- **NullPool is still needed** even with pooler (for SQLAlchemy)

## 🎯 Summary

**Best Solution for Vercel:**
1. ✅ Use Supabase **Connection Pooler** (port 6543)
2. ✅ Set `ENVIRONMENT=production` in Vercel (forces NullPool)
3. ✅ Set `DATABASE_URL` with pooler URL
4. ✅ Redeploy

This combination (pooler + NullPool) should fix the Errno 99 error completely!

