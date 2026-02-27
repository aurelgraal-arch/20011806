import React from 'react'

export const Search: React.FC = () => {
  const [query, setQuery] = React.useState('')
  const [results, setResults] = React.useState<any[]>([])

  React.useEffect(() => {
    if (!query) {
      setResults([])
      return
    }
    const fetch = async () => {
      const { data } = await supabase
        .from('users')
        .select('user_id,public_name')
        .ilike('public_name', `%${query}%`)
      setResults(data || [])
    }
    fetch()
  }, [query])

  return (
    <div className="pt-20 pl-64 pr-64 pb-4">
      <h1 className="text-accent2 text-2xl">Ricerca</h1>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Cerca utente"
        className="w-full mb-4 px-3 py-2 bg-[#111] border border-accent2 rounded"
      />
      {results.length === 0 ? (
        <p className="text-accent2/40">Nessun risultato</p>
      ) : (
        <ul className="space-y-2">
          {results.map((r) => (
            <li key={r.user_id} className="text-accent2">
              {r.public_name || r.user_id}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}