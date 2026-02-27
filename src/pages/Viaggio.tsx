import React from 'react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'

export const Viaggio: React.FC = () => {
  const user = useAuthStore((s) => s.user)
  const [trips, setTrips] = React.useState<any[]>([])
  const [title, setTitle] = React.useState('')
  const [itinerary, setItinerary] = React.useState('')
  const [description, setDescription] = React.useState('')

  React.useEffect(() => {
    fetchTrips()
    const sub = supabase
      .channel('journeys-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'journeys' },
        () => fetchTrips()
      )
      .subscribe()
    return () => {
      supabase.removeChannel(sub)
    }
  }, [])

  const fetchTrips = async () => {
    const { data } = await supabase.from('journey_steps').select('*').order('created_at', { ascending: false })
    setTrips(data || [])
  }

  const createTrip = async () => {
    if (!user) return
    await supabase.functions.invoke('dynamic-task', {
      body: {
        sequence_id: user.sequence_id,
        action: 'create_journey_step',
        title,
        itinerary,
        description,
        timestamp: new Date().toISOString(),
      },
    })
    setTitle('')
    setItinerary('')
    setDescription('')
  }

  const toggleJoin = async (tripId: string, joined: boolean) => {
    if (!user) return
    await supabase.functions.invoke('dynamic-task', {
      body: {
        sequence_id: user.sequence_id,
        action: joined ? 'leave_trip' : 'join_trip',
        trip_id: tripId,
        timestamp: new Date().toISOString(),
      },
    })
  }

  return (
    <div className="pt-20 pl-64 pr-64 pb-4">
      <h1 className="text-accent2 text-2xl mb-4">Viaggio</h1>
      <div className="bg-card border border-accent2 p-4 rounded-lg mb-6">
        <h2 className="text-accent2 font-semibold mb-2">Nuovo viaggio</h2>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Titolo"
          className="w-full mb-2 px-3 py-2 bg-[#111] border border-accent2 rounded"
        />
        <textarea
          value={itinerary}
          onChange={(e) => setItinerary(e.target.value)}
          placeholder="Itinerario"
          className="w-full mb-2 px-3 py-2 bg-[#111] border border-accent2 rounded"
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Descrizione"
          className="w-full mb-2 px-3 py-2 bg-[#111] border border-accent2 rounded"
        />
        <button
          onClick={createTrip}
          className="bg-accent text-black px-4 py-2 rounded hover:bg-accent/90"
        >
          Crea
        </button>
      </div>
      {trips.length === 0 ? (
        <p className="text-accent2/40">Nessun viaggio al momento.</p>
      ) : (
        trips.map((t) => {
          const joined = t.participants?.includes(user?.id)
          return (
            <div
              key={t.id}
              className="bg-card border border-accent2 rounded-lg p-4 mb-4 shadow-lg hover:shadow-emerald transition"
            >
              <h2 className="text-accent2 font-semibold">{t.title}</h2>
              <p className="text-accent2/70 text-sm mt-2">{t.itinerary}</p>
              <p className="text-accent2/70 text-sm mt-1">
                {t.description}
              </p>
              <button
                onClick={() => toggleJoin(t.id, !!joined)}
                className="mt-2 bg-accent text-black px-3 py-1 rounded hover:bg-accent/90"
              >
                {joined ? 'Lascia' : 'Unisciti'}
              </button>
            </div>
          )
        })
      )}
    </div>
  )
}