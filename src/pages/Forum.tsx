import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'

interface Post {
  id: string
  title: string
  problem_reflection: string
  solution_intention: string
  context_description: string
  // media urls etc
}

export const Forum: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([])

  useEffect(() => {
    // subscribe to realtime forum_posts
    const channel = supabase
      .channel('forum-posts-channel')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'forum_posts' },
        (payload) => {
          setPosts((p) => [payload.new as Post, ...p])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  // form state
  const [title, setTitle] = React.useState('')
  const [problem, setProblem] = React.useState('')
  const [solution, setSolution] = React.useState('')
  const [description, setDescription] = React.useState('')
  const [mediaFile, setMediaFile] = React.useState<File | null>(null)
  const [uploading, setUploading] = React.useState(false)

  const user = useAuthStore((s) => s.user)

  const submitPost = async () => {
    if (!user) return
    setUploading(true)
    try {
      let media_url = ''
      let media_type = ''
      if (mediaFile) {
        const filename = `${crypto.randomUUID()}_${mediaFile.name}`
        const { error: uploadError } = await supabase.storage
          .from('posts-media')
          .upload(filename, mediaFile)
        if (uploadError) {
          console.error('Upload error', uploadError)
        } else {
          const { data: urlData } = await supabase.storage.from('posts-media').getPublicUrl(filename)
          media_url = urlData?.publicUrl || ''
          media_type = mediaFile.type || ''
        }
      }

      await supabase.from('forum_posts').insert([
        {
          user_id: user.id,
          title,
          problem,
          solution,
          description,
          media_url,
          media_type,
        },
      ])

      setTitle('')
      setProblem('')
      setSolution('')
      setDescription('')
      setMediaFile(null)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="pt-20 px-6 pb-4">
      <h1 className="text-accent2 text-2xl mb-4">Forum</h1>
      {/* creation form */}
      <div className="bg-card border border-accent2 p-4 rounded-lg mb-6">
        <h2 className="text-accent2 font-semibold mb-2">Nuovo post</h2>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Titolo"
          className="w-full mb-2 px-3 py-2 bg-[#111] border border-accent2 rounded"
        />
        <textarea
          value={problem}
          onChange={(e) => setProblem(e.target.value)}
          placeholder="Problema / Conseguenza"
          className="w-full mb-2 px-3 py-2 bg-[#111] border border-accent2 rounded"
        />
        <textarea
          value={solution}
          onChange={(e) => setSolution(e.target.value)}
          placeholder="Soluzione / Azione"
          className="w-full mb-2 px-3 py-2 bg-[#111] border border-accent2 rounded"
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Descrizione"
          className="w-full mb-2 px-3 py-2 bg-[#111] border border-accent2 rounded"
        />
        <input
          type="file"
          accept="image/*,video/*"
          onChange={(e) => setMediaFile(e.target.files ? e.target.files[0] : null)}
          className="w-full mb-2"
        />
        <button
          onClick={submitPost}
          disabled={uploading}
          className="bg-accent text-black px-4 py-2 rounded hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? 'Caricamento…' : 'Pubblica'}
        </button>
      </div>
      {posts.length === 0 ? (
        <p className="text-accent2/40">Nessun post al momento.</p>
      ) : (
        posts.map((p) => (
          <div
            key={p.id}
            className="bg-card border border-accent2 rounded-lg p-4 mb-4 shadow-lg hover:shadow-emerald transition"
          >
            <h2 className="text-accent2 font-semibold">{p.title}</h2>
            <p className="text-accent2/70 text-sm mt-2">
              {p.problem_reflection}
            </p>
          </div>
        ))
      )}
    </div>
  )
}
