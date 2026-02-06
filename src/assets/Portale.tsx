import React, { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'

interface PortalProps {
  userSequence: string
}

interface User {
  id: string
  username: string
  status: string
}

interface Message {
  id: string
  content: string
  author: string
}

const Portal: React.FC<PortalProps> = ({ userSequence }) => {
  const [users, setUsers] = useState<User[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')

  useEffect(() => {
    // Recupera utenti
    supabase
      .from('portal_users')
      .select('*')
      .then(({ data }) => {
        if (data) setUsers(data)
      })

    // Recupera messaggi
    supabase
      .from('messages')
      .select('*')
      .then(({ data }) => {
        if (data) setMessages(data)
      })
  }, [])

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return
    const { data } = await supabase
      .from('messages')
      .insert([{ content: newMessage, author: userSequence }])
      .select()
    if (data) {
      setMessages([...messages, ...data])
      setNewMessage('')
    }
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen p-4 gap-4">
      {/* Sidebar profilo */}
      <div className="md:w-1/4 bg-blue-600 p-4 rounded">
        <h2 className="text-xl font-bold mb-2">{userSequence}</h2>
        <p>Stato: Online</p>
      </div>

      {/* Feed */}
      <div className="md:w-2/4 bg-blue-700 p-4 rounded flex flex-col gap-4">
        <h2 className="text-xl font-bold mb-2">Feed utenti</h2>
        {messages.map((msg) => (
          <div key={msg.id} className="p-2 bg-blue-500 rounded">
            <strong>{msg.author}</strong>: {msg.content}
          </div>
        ))}
        <div className="flex gap-2 mt-4">
          <input
            className="flex-1 p-2 rounded text-black"
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Scrivi un messaggio..."
          />
          <button
            onClick={handleSendMessage}
            className="bg-white text-blue-500 font-bold px-4 rounded"
          >
            Invia
          </button>
        </div>
      </div>

      {/* Sidebar interazioni */}
      <div className="md:w-1/4 bg-blue-600 p-4 rounded">
        <h2 className="text-xl font-bold mb-2">Utenti</h2>
        {users.map((u) => (
          <p key={u.id}>
            {u.username} - {u.status || 'Offline'}
          </p>
        ))}
      </div>
    </div>
  )
}

export default Portal
