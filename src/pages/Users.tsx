import React from 'react'
import { supabase } from '../lib/supabase'

export const Users: React.FC = () => {
  const [users, setUsers] = React.useState<any[]>([])

  React.useEffect(() => {
    fetchUsers()
    const sub = supabase
      .from('users')
      .on('*', () => fetchUsers())
      .subscribe()
    return () => {
      supabase.removeSubscription(sub)
    }
  }, [])

  const fetchUsers = async () => {
    const { data } = await supabase.from('users').select('user_id,public_name')
    setUsers(data || [])
  }

  return (
    <div className="pt-20 px-6 pb-4">
      <h1 className="text-accent2 text-2xl">Utenti Attivi</h1>
      {users.length === 0 ? (
        <p className="text-accent2/40">Nessun utente</p>
      ) : (
        <ul className="space-y-2">
          {users.map((u) => (
            <li key={u.user_id} className="text-accent2">
              {u.public_name || u.user_id}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
