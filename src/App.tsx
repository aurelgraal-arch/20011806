import { useEffect, useState } from "react"
import { supabase } from "./supabaseClient"

type PortalUser = {
  profile_id: string
  username: string | null
  is_active: boolean
}

export default function App() {
  const [users, setUsers] = useState<PortalUser[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadUsers = async () => {
      const { data, error } = await supabase
        .from("portal_users")
        .select("*")

      if (error) console.error(error)
      else setUsers(data || [])

      setLoading(false)
    }
    loadUsers()
  }, [])

  if (loading) return <div style={{ padding: 20 }}>Caricamento portale…</div>

  return (
    <div style={{ padding: 20 }}>
      <h1>Portal Network</h1>
      {users.length === 0 ? (
        <p>Nessun utente presente</p>
      ) : (
        <ul>
          {users.map(u => (
            <li key={u.profile_id}>
              {u.username ?? "Anonimo"} — {u.is_active ? "🟢 Attivo" : "⚪ Inattivo"}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
