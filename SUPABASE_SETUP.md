# Supabase Configuration for Hash-Based Login

## Quick Start Checklist

- [ ] Create user in Supabase Auth
- [ ] Add hash to issued_sequences/issued_hash.txt
- [ ] Deploy Edge Function: `supabase functions deploy dynamic-task`
- [ ] Test login with `npm run dev`

## Step 1: Create User in Supabase Auth

### In Supabase Dashboard:

1. Go to: **Authentication** → **Users**
2. Click **+ New user**
3. Fill in:
   - **Email:** `user@example.com`
   - **Password:** `abc123` ⚠️ IMPORTANT: This must match the hash in issued_hash.txt
   - **Confirm password:** `abc123`
4. Click **Create User**

### Example Users:

```
Email               Password/Hash
user1@example.com   abc123
user2@example.com   hash456
testuser@example.com test_sequence
```

## Step 2: Add Hash to issued_sequences

### File: `supabase/issued_sequences/issued_hash.txt`

```
# Format: hash,email
# Each hash MUST match a Supabase Auth user's password

abc123,user1@example.com
hash456,user2@example.com
test_sequence,testuser@example.com
```

**Important Rules:**
- Hash (first column) = Password in Supabase Auth
- Email (second column) = Email in Supabase Auth
- One per line
- Lines starting with # are comments
- No trailing spaces

### Example Mapping:

| User Created In Auth | Email | Password | Hash File |
|---|---|---|---|
| User 1 | user1@example.com | abc123 | abc123,user1@example.com |
| User 2 | user2@example.com | hash456 | hash456,user2@example.com |

## Step 3: Deploy Edge Function

The function `supabase/functions/dynamic-task/index.ts` should already be in the repo.

### Deploy:

```bash
# Option 1: Using Supabase CLI
supabase functions deploy dynamic-task

# Option 2: Verify it's deployed
supabase functions list
```

### Expected Output:

```
✓ Function deployed successfully
✓ Available at: https://vayuwijyxnezpusaqjmz.supabase.co/functions/v1/dynamic-task
```

## Step 4: Test Login

### Start Dev Server:

```bash
npm run dev
```

Navigate to: http://localhost:5173/auth/login

### Test with Valid Hash:

1. Enter: `abc123`
2. Click "Sign In"
3. Check for:
   - ✅ Redirect to `/dashboard` = Success
   - ❌ Error message = Issue with setup

### Check Browser Console:

Press **F12** → **Console** to see detailed logs:

```
[auth] Starting hash login with sequence: abc123
[auth] Invoking dynamic-task function...
[auth] Function response: {valid: true, user_id: "...", session: {...}}
[auth] User fetched: abc123...
```

## Step 5: Troubleshooting

### Error: "Invalid access sequence"

**Cause:** Hash not found in issued_hash.txt

**Fix:**
1. Add hash to `supabase/issued_sequences/issued_hash.txt`
2. Ensure no extra spaces
3. Redeploy: `supabase functions deploy dynamic-task`

### Error: "Failed to send a request to Edge Function"

**Cause:** Edge Function not deployed or unreachable

**Fix:**
```bash
# Check if deployed
supabase functions list

# Deploy if missing
supabase functions deploy dynamic-task

# Check logs
supabase functions logs dynamic-task
```

### Error: "No user returned after authentication"

**Cause:** User exists in issued_hash.txt but not in Supabase Auth

**Fix:**
1. Go to Supabase Dashboard → Authentication → Users
2. Create user with:
   - Email = email in issued_hash.txt
   - Password = hash in issued_hash.txt

### Login hangs, then shows error

**Cause:** Password in Supabase Auth doesn't match hash in issued_hash.txt

**Fix:**
1. User in Auth: email=`user1@example.com`, password=`abc123`
2. Hash file: `abc123,user1@example.com`
3. They MUST match exactly

## Environment Variables

### .env.local (Already Configured)

```dotenv
VITE_SUPABASE_URL=https://vayuwijyxnezpusaqjmz.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

✅ Do NOT change these - they're already correct

## Complete Example Setup

### 1. Create User in Supabase Auth

```
Email: test@example.com
Password: mysequence123
```

### 2. Update issued_hash.txt

```
# format: hash,email
mysequence123,test@example.com
```

### 3. Deploy Edge Function

```bash
supabase functions deploy dynamic-task
```

### 4. Test Login

1. `npm run dev`
2. Go to http://localhost:5173/auth/login
3. Enter: `mysequence123`
4. Click Sign In
5. Should redirect to dashboard ✅

## Architecture

```
User enters: mysequence123
    ↓
Frontend → POST to dynamic-task
    body: {
      action: "validate_login_sequence",
      sequence: "mysequence123"
    }
    ↓
Edge Function:
    1. Load issued_hash.txt (file system)
    2. Find: mysequence123,test@example.com
    3. Extract: email=test@example.com, hash=mysequence123
    4. Call Supabase Auth token endpoint
    5. Auth checks: email=test@example.com, password=mysequence123
    6. Auth returns: access_token, user_id
    ↓
Frontend:
    1. Receive {valid: true, session: {...}}
    2. Set session with supabase.auth.setSession()
    3. Fetch user data
    4. Save to auth store
    5. Redirect to /dashboard
    ↓
✅ User authenticated
```

## Files Involved

| File | Purpose |
|------|---------|
| `.env.local` | Supabase credentials (client-side) |
| `src/lib/supabase.ts` | Initialize Supabase SDK |
| `src/app/pages/auth/LoginPage.tsx` | Login form UI |
| `src/app/core/services/authService.ts` | Edge Function call logic |
| `src/app/core/store/authStore.ts` | Auth state management |
| `supabase/functions/dynamic-task/index.ts` | Backend validation logic |
| `supabase/issued_sequences/issued_hash.txt` | Hash list (backend) |

## Important Notes

⚠️ **Security:**
- Hashes are validated server-side (Edge Function)
- Never store hashes in plain text in frontend
- Supabase Auth handles password security

⚠️ **Testing:**
- Use test hashes like `abc123`, `test123`, etc.
- Don't use real passwords

⚠️ **Production:**
- Replace test hashes with real sequences
- Keep issued_hash.txt secure (server-side only)
- Enable HTTPS
- Use strong sequence hashes

## Commands Reference

```bash
# Start development
npm run dev

# Build production
npm run build

# Deploy Edge Function
supabase functions deploy dynamic-task

# Check Edge Function logs
supabase functions logs dynamic-task

# List all functions
supabase functions list
```

## Support

If login still fails after setup:
1. Check `DEBUG_LOGIN.md` for detailed logs
2. Check browser console (F12) for error messages
3. Check Supabase Dashboard → Logs for Edge Function errors
4. Verify issued_hash.txt syntax (no extra spaces)
5. Verify Supabase Auth user email matches issued_hash.txt
