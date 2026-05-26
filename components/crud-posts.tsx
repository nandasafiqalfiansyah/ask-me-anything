'use client'

import React, { useEffect, useState } from 'react'

type Post = {
  id?: string
  title: string
  slug: string
  published?: boolean
}

export default function CrudPosts() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(false)
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [published, setPublished] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  useEffect(() => {
    loadPosts()
  }, [])

  async function loadPosts() {
    setLoading(true)
    try {
      const res = await fetch('/api/v1/posts')
      if (!res.ok) throw new Error('Failed to fetch posts')
      const data = await res.json()
      setPosts(data || [])
    } catch (err) {
      console.error(err)
      alert('Error loading posts')
    } finally {
      setLoading(false)
    }
  }

  function resetForm() {
    setTitle('')
    setSlug('')
    setPublished(false)
    setEditingId(null)
  }

  async function handleSave(e?: React.FormEvent) {
    e?.preventDefault()
    const payload = { title, slug, published }
    try {
      const method = editingId ? 'PUT' : 'POST'
      const url = editingId ? `/api/v1/posts/${editingId}` : '/api/v1/posts'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (!res.ok) throw new Error('Save failed')
      await loadPosts()
      resetForm()
    } catch (err) {
      console.error(err)
      alert('Error saving post')
    }
  }

  async function handleEdit(p: Post) {
    setEditingId(p.id || null)
    setTitle(p.title)
    setSlug(p.slug)
    setPublished(!!p.published)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function handleDelete(id?: string) {
    if (!id) return
    if (!confirm('Delete this post?')) return
    try {
      const res = await fetch(`/api/v1/posts/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Delete failed')
      setPosts(s => s.filter(x => x.id !== id))
    } catch (err) {
      console.error(err)
      alert('Error deleting post')
    }
  }

  return (
    <div className='space-y-6'>
      <form onSubmit={handleSave} className='space-y-4'>
        <div>
          <label className='block text-sm font-medium'>Title</label>
          <input
            className='mt-1 block w-full rounded border px-3 py-2'
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
          />
        </div>

        <div>
          <label className='block text-sm font-medium'>Slug</label>
          <input
            className='mt-1 block w-full rounded border px-3 py-2'
            value={slug}
            onChange={e => setSlug(e.target.value)}
            required
          />
        </div>

        <div className='flex items-center gap-3'>
          <label className='flex items-center gap-2'>
            <input
              type='checkbox'
              checked={published}
              onChange={e => setPublished(e.target.checked)}
            />
            <span className='text-sm'>Published</span>
          </label>
          <div className='ml-auto'>
            <button
              type='submit'
              className='rounded bg-blue-600 px-4 py-2 text-white'
            >
              {editingId ? 'Update' : 'Create'}
            </button>
            {editingId && (
              <button
                type='button'
                onClick={resetForm}
                className='ml-2 rounded border px-3 py-2'
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </form>

      <div>
        <h2 className='text-lg font-medium'>Posts</h2>
        {loading ? (
          <p>Loading…</p>
        ) : posts.length === 0 ? (
          <p className='text-sm text-muted-foreground'>No posts yet.</p>
        ) : (
          <div className='mt-3 overflow-x-auto'>
            <table className='w-full table-auto border-collapse'>
              <thead>
                <tr className='text-left'>
                  <th className='pb-2'>Title</th>
                  <th className='pb-2'>Slug</th>
                  <th className='pb-2'>Published</th>
                  <th className='pb-2'>Actions</th>
                </tr>
              </thead>
              <tbody>
                {posts.map(p => (
                  <tr key={p.id} className='odd:bg-slate-50'>
                    <td className='py-2 pr-4'>{p.title}</td>
                    <td className='py-2 pr-4 text-sm text-slate-600'>
                      {p.slug}
                    </td>
                    <td className='py-2 pr-4'>{p.published ? 'Yes' : 'No'}</td>
                    <td className='py-2'>
                      <div className='flex gap-2'>
                        <button
                          onClick={() => handleEdit(p)}
                          className='rounded border px-2 py-1 text-sm'
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          className='rounded border px-2 py-1 text-sm text-red-600'
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
