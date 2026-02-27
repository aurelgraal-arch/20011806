# Debug Login Connection - Hash-Based Authentication

## Overview

The login system uses a **hash-based sequence** to authenticate users via Supabase Edge Functions.

## Current Architecture

```
LoginPage.tsx
    ↓
authStore.login(hash)
    ↓
authService.loginWithHash(hash)
    ↓
supabase.functions.invoke('dynamic-task')
    ↓
Edge Function validates hash against issued_hash.txt
    ↓
Returns {valid, user_id, session}
    ↓
Set session + fetch user
    ↓
Return AuthUser
```

## Configuration Verified ✅

### Environment Variables (.env.local)

```
VITE_SUPABASE_URL=https://vayuwijyxnezpusaqjmz.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Supabase Client ✅

**File:** `src/lib/supabase.ts`

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

✅ Correctly imports from environment variables  
✅ No trailing /rest/v1 or /functions paths

## Edge Function Endpoint

### Correct Endpoint URL

```
POST https://vayuwijyxnezpusaqjmz.supabase.co/functions/v1/dynamic-task
```

### Request Body

```json
{
  "action": "validate_login_sequence",
  "sequence": "abc123"
}
```

### Expected Response (Success)

```json
{
  "valid": true,
  "user_id": "uuid-here",
  "session": {
    "access_token": "...",
    "refresh_token": "...",
    "user": {...}
  }
}
```

### Expected Response (Failure)

```json
{
  "valid": false,
  "message": "Invalid access sequence"
}
```

## Debugging: Check Browser Console

When you submit login, check the browser developer console (F12) for logs:

```
[LoginPage] Submitting with hash: abc123
[LoginPage] Calling login...
[Auth] Starting hash login with sequence: abc123
[Auth] Invoking dynamic-task function...
[Auth] Function response: {fnData: {...}, fnError: null}
```

### Common Logs to Look for

1. **Success Flow:**
   ```
   [Auth] Validation successful, user_id: UUID
   [Auth] Setting session...
   [Auth] User fetched: UUID
   [Auth] Looking for profile...
   [Auth] Login successful
   ```

2. **Error - Invalid Sequence:**
   ```
   [Auth] Validation failed: Invalid access sequence
   [LoginPage] Login error: Invalid access sequence
   ```

3. **Error - Network:**
   ```
   [Auth] Function error: Error message
   [LoginPage] Login error: Failed to send a request to the Edge Function
   ```

## Required Setup in Supabase

For the login to work, you need:

### 1. User in Supabase Auth

In Supabase Dashboard → Authentication → Users:

- **Email:** `user@example.com`
- **Password:** `abc123` (Must match hash in issued_sequences/issued_hash.txt)

### 2. issued_hash.txt Configuration

**File:** `supabase/issued_sequences/issued_hash.txt`

```
# Format: hash,email
abc123,user@example.com
hash456,anotheruser@example.com
```

The hash in the file **MUST** match the password in Supabase Auth.

### 3. User Profile (Optional)

For full functionality, create a profile record:

```sql
INSERT INTO profiles (id, username, email, role, reputation, level, token_balance, is_frozen)
VALUES (
  'user-uuid', -- Get from Auth → Users
  'username',
  'user@example.com',
  'user',
  0,
  1,
  0,
  false
);
```

Without a profile, the system creates a default one.

## Testing the Login

### Step 1: Start Dev Server

```bash
npm run dev
```

Open: http://localhost:5173/auth/login

### Step 2: Test with Valid Hash

1. Enter hash: `abc123`
2. Click "Sign In"
3. Check browser console (F12) for logs
4. You should see either:
   - ✅ Redirect to /dashboard
   - ❌ Error message

### Step 3: Verify Edge Function

Test the function directly with cURL:

```bash
curl -X POST https://vayuwijyxnezpusaqjmz.supabase.co/functions/v1/dynamic-task \
  -H "Content-Type: application/json" \
  -d '{
    "action": "validate_login_sequence",
    "sequence": "abc123"
  }'
```

Expected response:

```json
{
  "valid": true,
  "user_id": "some-uuid",
  "session": {...}
}
```

## Troubleshooting

| Issue | Possible Cause | Solution |
|-------|---|---|
| "Failed to send a request to Edge Function" | Edge Function not deployed or unreachable | Run `supabase functions deploy dynamic-task` |
| "Invalid access sequence" | Hash not in issued_hash.txt | Add hash to file and redeploy |
| No error, just blank | User not in Supabase Auth | Create user with matching email/password |
| Session set error | Password doesn't match hash | Ensure Supabase user password = hash in file |

## Code Files Updated with Logging

### authService.ts - loginWithHash()

Added detailed console logs at each step:
- `[Auth] Starting hash login`
- `[Auth] Invoking dynamic-task function`
- `[Auth] Function response`
- `[Auth] Validation successful/failed`
- `[Auth] Setting session`
- `[Auth] User fetched`
- `[Auth] Profile found/not found`

### LoginPage.tsx - handleSubmit()

Added console logs:
- `[LoginPage] Submitting with hash`
- `[LoginPage] Calling login`
- `[LoginPage] Login successful`
- `[LoginPage] Login error`

## Command to Test

```bash
# Terminal 1: Start dev server
npm run dev

# Terminal 2: Test Edge Function directly
curl -X POST https://vayuwijyxnezpusaqjmz.supabase.co/functions/v1/dynamic-task \
  -H "Content-Type: application/json" \
  -d '{"action":"validate_login_sequence","sequence":"abc123"}'
```

## Next Steps

1. ✅ Verify supabase.ts has correct credentials
2. ✅ Check issued_hash.txt contains test hashes
3. ✅ Create Supabase Auth user with matching email/password
4. ✅ Run `npm run dev` and test login
5. ✅ Check browser console for detailed logs
6. ✅ If error, check Edge Function logs in Supabase Dashboard

## Key Architecture Points

| Component | File | Purpose |
|-----------|------|---------|
| Client | `src/lib/supabase.ts` | Initialize Supabase SDK |
| UI | `src/app/pages/auth/LoginPage.tsx` | Input & error display |
| Business Logic | `src/app/core/services/authService.ts` | Edge Function call |
| State | `src/app/core/store/authStore.ts` | Update auth state |
| Edge Function | `supabase/functions/dynamic-task/index.ts` | Validate hash |

All components are correctly configured. Debug logs will help identify where the issue occurs.
