import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'

export default function App() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
      setLoading(false)
    })
  }, [])

  if (loading) return <p>Caricamento...</p>

  if (!user) {
    return (
      <div>
        <h1>Accesso al portale</h1>
        <p>Inserisci la tua sequenza per accedere</p>
        {/* qui collegherai il tuo sistema di accesso */}
      </div>
    )
  }

  return (
    <div>
      <h1>Portale</h1>
      <p>Benvenuto {user.email}</p>
    </div>
  )
}
