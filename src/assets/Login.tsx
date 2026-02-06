import React, { useState } from 'react'

interface LoginProps {
  onLogin: (sequence: string) => void
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [sequence, setSequence] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (sequence.trim().length > 0) {
      onLogin(sequence)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-3xl mb-6">Accedi alla piattaforma</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="Inserisci la sequenza"
          value={sequence}
          onChange={(e) => setSequence(e.target.value)}
          className="p-2 rounded text-black"
        />
        <button
          type="submit"
          className="bg-white text-blue-500 font-bold py-2 px-4 rounded"
        >
          Accedi
        </button>
      </form>
    </div>
  )
}

export default Login
