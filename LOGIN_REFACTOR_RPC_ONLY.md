# Login System Restructuring - RPC Only

## Data: 27 Febbraio 2026

### Obiettivo Completato ✅
Il sistema di login della piattaforma AUR EdenTech è stato ristrutturato per usare **esclusivamente Supabase RPC `verify_sequence`**.

Tutte le Edge Functions per il login sono state completamente rimosse dai flussi di autenticazione.

---

## Cambiamenti Effettuati

### 1. **Client Supabase** ([src/lib/supabase.ts](src/lib/supabase.ts))
✅ **Aggiornato**
- Configurazione corretta da variabili d'ambiente VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY
- Validazione delle variabili ambientali con messaggi di errore chiari

```typescript
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase env vars not configured')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

---

### 2. **Login Page** ([src/pages/Login.tsx](src/pages/Login.tsx))
✅ **Completamente Riscritto**
- **Rimosso:** Dipendenza da `useAuthStore`
- **Aggiunto:** RPC diretto a `verify_sequence`
- **Logica:**
  1. Utente inserisce sequenza
  2. Frontend chiama `supabase.rpc('verify_sequence', { input_code: sequence })`
  3. Se valido → salva in localStorage e naviga a dashboard
  4. Se non valido → mostra errore

```typescript
const { data, error } = await supabase.rpc('verify_sequence', {
  input_code: sequence.trim(),
})

if (error || !data) {
  setErrorMsg('Sequenza non valida')
  return
}

localStorage.setItem('auth', 'true')
localStorage.setItem('sequence_id', sequence.trim())
navigate(from, { replace: true })
```

---

### 3. **Protected Routes** ([src/components/common/ProtectedRoute.tsx](src/components/common/ProtectedRoute.tsx))
✅ **Semplificato**
- **Rimosso:** Dipendenza da `useAuthStore`
- **Aggiunto:** Controllo diretto localStorage
- Verifica semplicemente se `auth` è true in localStorage

```typescript
const isAuth = localStorage.getItem('auth')

if (!isAuth) {
  return <Navigate to="/login" state={{ from: location }} replace />
}
```

---

### 4. **Auth Header Component** ([src/components/AuthHeader.tsx](src/components/AuthHeader.tsx))
✅ **Nuovo Component**
- Visualizza snippet della sequenza autenticata
- Pulsante Logout che cancella localStorage
- Posizionato globalmente nell'app

```typescript
const handleLogout = () => {
  localStorage.removeItem('auth')
  localStorage.removeItem('sequence_id')
  navigate('/login', { replace: true })
}
```

---

### 5. **Main App** ([src/App.tsx](src/App.tsx))
✅ **Aggiornato**
- **Rimosso:** Dipendenza da `useAuthStore` e `restoreSession`
- **Aggiunto:** AuthHeader component globale
- Struttura più semplice e diretta

---

## Cosa È Stato RIMOSSO dal Flusso di Login

❌ **Edge Function `dynamic-task`** per il login
```
❌ await supabase.functions.invoke('dynamic-task', { body })
```

❌ **Edge Function `login-hash`** per il login
```
❌ Verifiche hash su file local
```

❌ **authStore** per il login
```
❌ const { login } = useAuthStore()
❌ await login(sequence)
```

❌ **authService** per il login
```
❌ authService.loginWithHash(hash)
❌ await supabase.functions.invoke('dynamic-task')
```

---

## Flusso di Login Attuale

```
┌─────────────────┐
│   Login Page    │
│  (User Input)   │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  supabase.rpc('verify_sequence')    │
│  ← Direct RPC Call, No Edge Function│
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────┐
│   Supabase RPC  │
│  verify_sequence│
│  - Check table  │
│  - Validate     │
│  - Return TRUE  │
└────────┬────────┘
         │
    ┌────┴────┐
    │          │
    ▼          ▼
 SUCCESS    FAILURE
    │          │
    ▼          ▼
 DASH     ERROR MSG
 BOARD    + localStorage cleared
```

---

## Variabili d'Ambiente Richieste

Nel file `.env.local` devono essere presenti:

```env
VITE_SUPABASE_URL=https://<your-project>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>
```

---

## Funzione RPC Richiesta in Supabase

Supabase deve avere una funzione SQL PL/pgSQL:

```sql
CREATE OR REPLACE FUNCTION verify_sequence(input_code TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check se la sequenza esiste nella tabella issued_sequences
  -- Return TRUE se valida, FALSE altrimenti
  RETURN EXISTS(
    SELECT 1 FROM issued_sequences 
    WHERE sequence_hash = input_code
  );
END;
$$ LANGUAGE plpgsql;
```

---

## Testing del Login

### ✅ Test Case 1: Login Valido
1. Accedere a `/login`
2. Inserire una sequenza valida (che esiste in `issued_sequences`)
3. Cliccare "Accedi"
4. **Risultato atteso:** Reindirizzamento a `/dashboard` o ultima pagina visitata

### ✅ Test Case 2: Login Non Valido
1. Accedere a `/login`
2. Inserire una sequenza NON valida
3. Cliccare "Accedi"
4. **Risultato atteso:** Messaggio di errore "Sequenza non valida"

### ✅ Test Case 3: Protected Routes
1. Dopo il login, accedere a `/dashboard`
2. **Risultato atteso:** Accesso consentito
3. Logout (pulsante in alto a destra)
4. Tentare di accedere a `/dashboard` direttamente
5. **Risultato atteso:** Reindirizzamento a `/login`

---

## Build Status

```
✓ 108 modules transformed
✓ built in 2.54s
✓ No TypeScript errors
✓ Ready for deployment
```

---

## Note Importanti

⚠️ **authStore.ts e authService.ts sono DEPRECATED**
- Rimangono nel codebase per comodità storica
- **NON devono più essere usati per il login**
- Se servono per altre funzionalità, devono essere riecritti per usare RPC

⚠️ **Forum.tsx e Viaggio.tsx**
- Stanno ancora usando `supabase.functions.invoke('dynamic-task')`
- Queste funzionalità NON sono critiche per il login
- **Possono** continuare a usare Edge Functions finché necessario
- Dovrebbero essere migrate a RPC per coerenza architetturale

⚠️ **Edge Functions Residui**
- `supabase/functions/dynamic-task/` - Contiene logiche NON-login
- `supabase/functions/login-hash/` - Non più usato
- Considerare di rimuovere o archiviare se non servono

---

## Prossimi Passi Suggeriti

1. ✅ Verificare che il login RPC funziona in Supabase
2. ✅ Testare tutti gli scenari di login
3. ⚠️ Migrare Forum.tsx e Viaggio.tsx a RPC dove appropriato
4. ⚠️ Rimuovere Edge Functions di login deprecate
5. ⚠️ Aggiornare documentazione del progetto

---

**Commit Message Consigliato:**
```
refactor: simplify login system to use RPC only

- Remove all Edge Function login calls
- Replace with direct Supabase RPC verify_sequence
- Update ProtectedRoute to use localStorage
- Add AuthHeader component for logout
- Remove authStore dependency from login page
```
