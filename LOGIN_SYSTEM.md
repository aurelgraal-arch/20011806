# Sistema di Login Hash-Based

## Panoramica

Il sistema di autenticazione della piattaforma Enterprise utilizza una **sequenza di accesso (hash)** anzichè email/password tradizionali. Questo approccio fornisce:

- ✅ Autenticazione senza password
- ✅ Validazione tramite Edge Function Supabase
- ✅ Accesso dinamico tramite sequenze pre-generate
- ✅ Sicurezza lato backend

## Architettura

### 1. Frontend (React)

**File principale:** `src/app/pages/auth/LoginPage.tsx`

```tsx
// Flusso:
1. Utente inserisce la sequenza di accesso
2. Su submit, chiama authStore.login(hash)
3. authStore chiama authService.loginWithHash(hash)
4. Se valido, salva sessione e reindirizza a /dashboard
```

### 2. Auth Store (Zustand)

**File:** `src/app/core/store/authStore.ts`

Gestisce lo stato globale:
- `user`: Dati utente autenticato
- `isAuthenticated`: Flag di autenticazione
- `isLoading`: Stato di caricamento
- `login()`: Metodo di login

### 3. Auth Service

**File:** `src/app/core/services/authService.ts`

Il servizio `loginWithHash()` esegue:
1. Chiama l'Edge Function `dynamic-task` su Supabase
2. Invia `action: "validate_login_sequence"` e `sequence: userHash`
3. Riceve risposta con `valid`, `user_id`, `session`
4. Se valido, imposta la sessione Supabase
5. Recupera i dati del profilo utente
6. Restituisce `AuthUser` con dati utente

### 4. Edge Function `dynamic-task`

**File:** `supabase/functions/dynamic-task/index.ts`

Esecuzione lato server:

```typescript
// Endpoint: POST https://vayuwijyxnezpusaqjmz.supabase.co/functions/v1/dynamic-task

Request body:
{
  "action": "validate_login_sequence",
  "sequence": "hash_dell_utente"
}

// Response (Success - 200):
{
  "valid": true,
  "user_id": "uuid",
  "session": {
    "access_token": "...",
    "refresh_token": "...",
    "user": {...}
  }
}

// Response (Failure - 401):
{
  "valid": false,
  "message": "Invalid access sequence"
}
```

## Flusso di Autenticazione

```
┌─────────────────────────────────────────────────────────┐
│ UTENTE INSERISCE HASH E CLICCA "Sign In"                │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
         ┌─────────────────────────────┐
         │ LoginPage.tsx               │
         │ handleSubmit()              │
         │ - valida input              │
         │ - chiama store.login(hash)  │
         └──────────────┬──────────────┘
                        │
                        ▼
         ┌─────────────────────────────┐
         │ authStore (Zustand)         │
         │ login(hash)                 │
         │ - imposta isLoading=true    │
         │ - chiama authService        │
         └──────────────┬──────────────┘
                        │
                        ▼
         ┌─────────────────────────────────┐
         │ authService.loginWithHash()     │
         │ - chiama Supabase Functions API │
         │ - invoke("dynamic-task")        │
         └──────────────┬──────────────────┘
                        │
      ┌─────────────────┴─────────────────┐
      │                                   │
      ▼                                   ▼
┌────────────────┐          ┌────────────────────┐
│ EDGE FUNCTION  │          │  issued_hash.txt   │
│ dynamic-task   │ legge    │  hash,email        │
└────────────────┘          │  per linea         │
      │                     └────────────────────┘
      │
      ├─ Valida sequenza in issued_hash.txt
      │
      ├─ Se valido: autentica su Supabase Auth
      │             usando email + hash come password
      │
      ├─ Restituisce: {valid: true, user_id, session}
      │                oppure
      │                {valid: false, message}
      │
      ▼
┌─────────────────────────────────────┐
│ authService processa risposta        │
│ - se valid=true:                    │
│   - imposta Supabase session        │
│   - recupera profilo utente         │
│   - restituisce AuthUser            │
└──────────┬──────────────────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│ authStore aggiorna stato            │
│ - user = AuthUser                   │
│ - isAuthenticated = true            │
│ - isLoading = false                 │
└──────────┬──────────────────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│ LoginPage reindirizza               │
│ navigate('/dashboard')              │
└─────────────────────────────────────┘
```

## Configurazione Supabase

### Variabili di ambiente

**File:** `.env.local`

```dotenv
VITE_SUPABASE_URL=https://vayuwijyxnezpusaqjmz.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Issued Sequences

**File:** `supabase/issued_sequences/issued_hash.txt`

Formato:
```
# Commented lines are ignored
hash1,user1@example.com
hash2,user2@example.com
hash3,user3@example.com
```

Ogni linea contiene:
- `hash`: La sequenza di accesso
- `email`: Email dell'utente su Supabase Auth

### Supabase Auth Setup

1. Creare utenti in Supabase Auth con email
2. **Importante:** La password dell'utente DEVE corrispondere all'hash nella lista `issued_hash.txt`
3. Al primo login, l'utente viene autenticato con `email + hash`

Esempio:
```
Email: user@example.com
Password: abc123xyz (= hash nella liste)
```

## Deploy dell'Edge Function

```bash
# Deploy della funzione dynamic-task
supabase functions deploy dynamic-task

# Verifica che la funzione sia disponibile a:
# https://vayuwijyxnezpusaqjmz.supabase.co/functions/v1/dynamic-task
```

## Gestione degli Errori

### Login fallito

1. **Sequenza non trovata**
   - Messaggio: "Invalid access sequence"
   - Status: 401

2. **Autenticazione fallita su Supabase**
   - Messaggio: Errore da Supabase Auth
   - Possibili cause:
     - Email non esiste in Supabase
     - Password (hash) non corrisponde
     - Account disabilitato

3. **Errore di rete**
   - Messaggio: "NetworkError"
   - Lo store mostra il messaggio all'utente

### Sicurezza

✅ **Non salvare mai la sequenza in chiaro nel frontend**
✅ **Tutta la validazione avviene nel backend (Edge Function)**
✅ **Le sequenze vengono confrontate in file lato Supabase**
✅ **La sessione è gestita da Supabase Auth**

## Usare il Sistema

### 1. Pagina di Login

Percorso: `/auth/login`

```
┌────────────────────────────────┐
│  Enterprise Platform           │
│  Access your account           │
│                                │
│  ┌──────────────────────────┐  │
│  │ Access Sequence          │  │
│  │ [input field            ]│  │
│  └──────────────────────────┘  │
│                                │
│  [Sign In Button             ] │
│                                │
│  Need help? Contact support    │
└────────────────────────────────┘
```

### 2. Demo di Login

```javascript
// Sequenza: abc123xyz
// Email: user@example.com
// Password (conforme): abc123xyz

// Risultato:
// ✅ Login riuscito
// ✅ Reindirizzamento a /dashboard
// ✅ Sessione salvata in localStorage
```

## Troubleshooting

| Problema | Causa | Soluzione |
|----------|-------|-----------|
| "Invalid access sequence" | Sequenza non in issued_hash.txt | Aggiungere hash a issued_hash.txt |
| "Authentication failed" | Email non in Supabase Auth | Creare utente in Supabase |
| "No user returned" | Profilo non esiste | Creare profilo utente in DB |
| "NetworkError" | Errore di connessione | Verificare connettività |
| Session non persiste | Sessione non salvata | Verificare localStorage |

## Sviluppi Futuri

- [ ] Rate limiting per tentativi di login falliti
- [ ] Logging degli accessi
- [ ] Revoca sequenze di accesso
- [ ] Autenticazione multi-dispositivo
- [ ] 2FA (Two-Factor Authentication)
