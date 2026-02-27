# Setup & Deployment - Sistema di Login Hash-Based

## Quick Start

### 1. Configurazione Ambiente Locale

```bash
# Copia il file di esempio
cp .env.example .env.local

# Modifica .env.local con le credenziali Supabase
VITE_SUPABASE_URL=https://vayuwijyxnezpusaqjmz.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 2. Configura Supabase

#### Step 1: Crea gli utenti in Supabase Auth

In Supabase Dashboard:
1. Vai a **Authentication** → **Users**
2. **New user** per ogni accesso
3. Usa email: `user1@example.com`, password: `abc123`

**Importante:** La password DEVE corrispondere al hash in `issued_hash.txt`

#### Step 2: Crea i profili utente

In SQL Editor di Supabase:

```sql
-- Crea profilo per l'utente
INSERT INTO profiles (id, username, email, role, reputation, level, token_balance, is_frozen)
VALUES (
  'user-uuid-here', -- Copia da Auth → Users → uid colonna
  'user1',
  'user1@example.com',
  'user',
  0,
  1,
  0,
  false
);

-- Crea wallet per l'utente
INSERT INTO wallets (user_id, token_balance, total_earned, total_spent, governance_weight, staking_balance)
VALUES (
  'user-uuid-here',
  0,
  0,
  0,
  0,
  0
);
```

#### Step 3: Configura issued_hash.txt

File: `supabase/issued_sequences/issued_hash.txt`

```
# Format: hash,email,optional_user_id
# Lines starting with # are comments

abc123,user1@example.com
hash456,user2@example.com
test_sequence,testuser@example.com
```

**Regole:**
- Una sequenza per linea
- Formato: `hash,email[,user_id]`
- Righe vuote e commenti (#) vengono ignorate
- Non ci devono essere spazi extra

### 3. Deploy dell'Edge Function

```bash
# 1. Installare Supabase CLI (se necessario)
npm install -g supabase

# 2. Autenticarsi con Supabase
supabase login

# 3. Selezionare il progetto (se necessario)
supabase link --project-ref vayuwijyxnezpusaqjmz

# 4. Deploy della funzione dynamic-task
supabase functions deploy dynamic-task

# Output atteso:
# ✓ Function deployed successfully
# ✓ Available at: https://vayuwijyxnezpusaqjmz.supabase.co/functions/v1/dynamic-task
```

### 4. Sviluppo Locale

```bash
# Installa dipendenze
npm install

# Avvia dev server
npm run dev

# Vai a http://localhost:5173/auth/login
# Inserisci una sequenza da issued_hash.txt
# Es: abc123 o hash456
```

### 5. Verifica Funzionamento

#### Test via cURL

```bash
# Testa la Edge Function
curl -X POST https://vayuwijyxnezpusaqjmz.supabase.co/functions/v1/dynamic-task \
  -H "Content-Type: application/json" \
  -d '{"action":"validate_login_sequence","sequence":"abc123"}'

# Risposta attesa (con sequenza valida):
# {
#   "valid": true,
#   "user_id": "uuid...",
#   "session": {...}
# }
```

#### Test via Browser

1. Apri http://localhost:5173/auth/login
2. Inserisci: `abc123`
3. Clicca "Sign In"
4. Osserva:
   - ✅ Caricamento per 1-2 secondi
   - ✅ Reindirizzamento a /dashboard
   - ✅ Toast di successo

### 6. Build Production

```bash
# Build ottimizzato
npm run build

# Verifica bundle
# dist/ contiene i file pronti per il deploy

# Preview build locale
npm run preview
```

## Troubleshooting

### Errore: "Invalid access sequence"

**Causa:** La sequenza non è in `issued_hash.txt`

**Soluzione:**
1. Verifica il contenuto di `supabase/issued_sequences/issued_hash.txt`
2. Aggiungi la sequenza nel formato: `hash,email`
3. Redeploy la funzione: `supabase functions deploy dynamic-task`

### Errore: "Authentication failed"

**Causa:** L'utente non esiste in Supabase Auth

**Soluzione:**
1. Crea l'utente in Supabase Dashboard
2. **Assicurati che la password = hash in issued_hash.txt**
3. Riprova il login

### Errore: "No user returned"

**Causa:** Profilo utente non esiste nel DB

**Soluzione:**
1. Crea il profilo con SQL:
```sql
INSERT INTO profiles (id, username, email, role, reputation, level, token_balance, is_frozen)
VALUES ('user-uuid', 'username', 'email@example.com', 'user', 0, 1, 0, false);
```

### La funzione non è disponibile

**Causa:** Edge Function non deployata correttamente

**Soluzione:**
```bash
# Ri-deploy
supabase functions deploy dynamic-task

# Verifica logs
supabase functions list
```

### Session non persiste dopo reload

**Causa:** localStorage non è abilitato

**Soluzione:**
1. Verifica browser privacy settings
2. Assicurati che i cookies sono abilitati
3. Controlla console per errori

## Variabili di Ambiente Supportate

| Variabile | Required | Descrizione |
|-----------|----------|------------|
| `VITE_SUPABASE_URL` | ✅ | URL del progetto Supabase |
| `VITE_SUPABASE_ANON_KEY` | ✅ | Chiave anonima di Supabase |

## File Importanti

```
/workspaces/20011806/
├── .env.local                          # Configurazione locale (NON committare)
├── src/
│   ├── app/
│   │   ├── pages/auth/LoginPage.tsx    # UI di login
│   │   ├── core/
│   │   │   ├── store/authStore.ts      # Zustand auth store
│   │   │   └── services/
│   │   │       └── authService.ts      # Logica autenticazione
│   │   └── types/auth.ts               # Tipi TypeScript
│   └── lib/
│       └── supabase.ts           # Client Supabase
├── supabase/
│   ├── functions/
│   │   └── dynamic-task/
│   │       └── index.ts                # Edge Function principale
│   └── issued_sequences/
│       └── issued_hash.txt             # Lista sequenze (CSV)
└── LOGIN_SYSTEM.md                     # Documentazione completa
```

## Checklist di Deploy

- [ ] `.env.local` creato con credenziali Supabase
- [ ] Utenti creati in Supabase Auth
- [ ] Password degli utenti corrispondono a issued_hash.txt
- [ ] Profili utente creati nel database
- [ ] Edge Function `dynamic-task` deployata
- [ ] `issued_hash.txt` contiene le sequenze corrette
- [ ] `npm run build` passa senza errori
- [ ] Login locale funziona via `npm run dev`
- [ ] Redirect a `/dashboard` funziona dopo login
- [ ] Toast di successo appare dopo login

## Supporto

Per domande o problemi:
1. Controlla `LOGIN_SYSTEM.md` per sistema completo
2. Verifica i logs di Supabase in Dashboard
3. Controlla la console del browser per errori JS
4. Usa `npm run build` per catch errori di build
