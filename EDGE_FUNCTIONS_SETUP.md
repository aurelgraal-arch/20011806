# Edge Functions Setup & TypeScript Configuration

## Overview

Supabase Edge Functions are serverless Deno-powered functions deployed to Supabase's global edge network. This project includes two main Edge Functions:

- **`dynamic-task`** - Main authentication and validation handler
- **`login-hash`** - Legacy hash-based authentication (deprecated, kept for backward compatibility)

## TypeScript Errors in VS Code

### ⚠️ Known Issue: TypeScript Resolution Errors

You may see TypeScript errors in VS Code for files in `supabase/functions/`:

```
Cannot find module 'https://deno.land/std@0.192.0/http/server.ts'
Cannot find name 'Deno'
Library 'deno.ns' not found
```

### ✅ Why This Is Normal

These errors occur because:

1. **Root Project Configuration**: The main `tsconfig.json` is configured for **Node.js/React/Vite** (not Deno)
2. **Different Runtime**: Edge Functions run in **Deno runtime**, not Node.js
3. **VS Code Language Server**: Uses the root TypeScript config for type checking
4. **Correct Separation**: The `supabase/` directory is excluded from the main build process

### ✅ These Errors Do NOT Affect:

- ✅ The `npm run build` command (Edge Functions are excluded)
- ✅ The React platform deployment
- ✅ Supabase Edge Function deployment (uses Deno runtime)
- ✅ Production functionality

### 🔧 How to Resolve in VS Code

#### Option 1: Install Deno Extension (Recommended)

1. Install **"Deno"** extension by **Denoland** from VS Code Marketplace
2. VS Code will detect `deno.json` and properly resolve Deno modules
3. TypeScript errors will disappear

#### Option 2: Suppress Errors (If Not Using Deno Extension)

Add this to `supabase/functions/dynamic-task/index.ts`:

```typescript
// @deno-types="https://deno.land/std@0.192.0/http/server.ts"
import { serve } from "https://deno.land/std@0.192.0/http/server.ts"
```

#### Option 3: Use VS Code Settings

The project includes `.vscode/settings.json` that configures Deno support. Make sure:
1. Deno extension is installed
2. VS Code has reloaded the workspace

## File Structure

```
/workspaces/20011806/
├── deno.json                          # Root Deno configuration
├── supabase/
│   ├── deno.json                      # Supabase-specific Deno config
│   └── functions/
│       ├── dynamic-task/
│       │   └── index.ts               # Main handler
│       └── login-hash/
│           └── index.ts               # Legacy handler
└── tsconfig.app.json                  # React/Vite TypeScript config
```

## Build & Deployment

### Development

```bash
# Build React platform (Edge Functions excluded)
npm run build

# Start dev server
npm run dev
```

### Deployment

#### Edge Function: `dynamic-task`

```bash
# Deploy with Supabase CLI
supabase functions deploy dynamic-task

# Verify deployment
supabase functions list
```

#### Full Stack Deployment

```bash
# 1. Deploy backend
supabase db push
supabase functions deploy dynamic-task

# 2. Build frontend
npm run build

# 3. Deploy frontend to hosting
# (Configure your hosting platform)
```

## TypeScript Configuration

### Root `tsconfig.app.json`

```jsonc
{
  "include": ["src"],                    // Only include React source
  "exclude": ["supabase/**", ...]        // Exclude Deno functions
}
```

### `deno.json` (Root)

```json
{
  "imports": {
    "std/http/server": "https://deno.land/std@0.192.0/http/server.ts"
  },
  "compilerOptions": {
    "lib": ["deno.window", "deno.unstable"]
  }
}
```

### `supabase/deno.json`

```json
{
  "imports": {
    "std/": "https://deno.land/std@0.192.0/"
  },
  "compilerOptions": {
    "lib": ["deno.window", "deno.unstable"],
    "target": "ES2020",
    "strict": true
  }
}
```

## Edge Function API

### Request Structure

```typescript
interface EdgeFunctionRequest {
  action: string         // "validate_login_sequence"
  sequence: string       // User's access hash
}
```

### Response Structure

```typescript
interface EdgeFunctionResponse {
  valid: boolean
  user_id?: string
  message?: string
  session?: {
    access_token: string
    refresh_token: string
    user: any
  }
}
```

## Testing Edge Functions Locally

While Edge Functions cannot be tested locally through Supabase CLI in VS Code, you can:

1. **Test via Production**: Deploy and test against live Supabase instance
2. **Mock Testing**: Create unit tests for validation logic
3. **Manual Testing**: Use the LoginPage UI to test end-to-end

Example test:

```bash
curl -X POST https://<project>.supabase.co/functions/v1/dynamic-task \
  -H "Content-Type: application/json" \
  -d '{"action":"validate_login_sequence","sequence":"abc123"}'
```

## Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| TypeScript errors in Edge Functions | Deno extension not installed | Install "Deno" extension from marketplace |
| Build fails | Edge Functions not excluded from build | Check `tsconfig.app.json` exclude pattern |
| Deployment error | Invalid Deno syntax | Run `deno check supabase/functions/` |
| Function returns 500 | Edge Function error | Check Supabase logs in Dashboard |

## Resources

- [Supabase Edge Functions Docs](https://supabase.com/docs/guides/functions)
- [Deno Documentation](https://deno.land/manual)
- [Deno Standard Library](https://deno.land/std)
- [VS Code Deno Extension](https://marketplace.visualstudio.com/items?itemName=denoland.vscode-deno)
