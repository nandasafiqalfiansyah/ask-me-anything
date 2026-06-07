'use client'

import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'
import { toast } from 'sonner'
import { PinTopIcon, TrashIcon } from '@radix-ui/react-icons'

type Comment = {
  id: string
  authorName: string
  content: string
  isPinned: boolean
  createdAt: string
}

export default function PostComments({ slug }: { slug: string }) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [authorName, setAuthorName] = useState('')
  const [content, setContent] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)

  const loadComments = useCallback(async () => {
    try {
      const res = await fetch(`/api/v1/posts/${slug}/comments`)
      const data = await res.json()
      setComments(data.comments || [])
    } catch {
      toast.error('Gagal memuat komentar')
    } finally {
      setLoading(false)
    }
  }, [slug])

  useEffect(() => {
    loadComments()
    supabase.auth.getSession().then(({ data }) => {
      setIsAdmin(!!data.session)
    })
  }, [loadComments])

  async function getAuthHeaders(): Promise<HeadersInit> {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return {}
    return { Authorization: `Bearer ${session.access_token}` }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim()) {
      toast.error('Komentar tidak boleh kosong')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch(`/api/v1/posts/${slug}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: content.trim(),
          authorName: authorName.trim() || undefined
        })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Gagal mengirim komentar')

      setComments(prev => {
        const next = [data.comment, ...prev]
        return next.sort((a, b) => {
          if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        })
      })
      setContent('')
      toast.success('Komentar berhasil dikirim')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal mengirim komentar')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(commentId: string) {
    if (!confirm('Hapus komentar ini?')) return

    try {
      const res = await fetch(`/api/v1/posts/${slug}/comments/${commentId}`, {
        method: 'DELETE',
        headers: await getAuthHeaders()
      })
      if (!res.ok) throw new Error()
      setComments(prev => prev.filter(c => c.id !== commentId))
      toast.success('Komentar dihapus')
    } catch {
      toast.error('Gagal menghapus komentar')
    }
  }

  async function handleTogglePin(comment: Comment) {
    try {
      const res = await fetch(`/api/v1/posts/${slug}/comments/${comment.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(await getAuthHeaders())
        },
        body: JSON.stringify({ isPinned: !comment.isPinned })
      })
      const data = await res.json()
      if (!res.ok) throw new Error()

      setComments(prev => {
        const next = prev.map(c =>
          c.id === comment.id ? { ...c, isPinned: data.comment.isPinned } : c
        )
        return next.sort((a, b) => {
          if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        })
      })
      toast.success(data.comment.isPinned ? 'Komentar dipin' : 'Pin dilepas')
    } catch {
      toast.error('Gagal memperbarui pin')
    }
  }

  return (
    <section className='mt-16 border-t pt-10'>
      <h2 className='font-serif text-2xl font-bold'>
        Komentar {comments.length > 0 && `(${comments.length})`}
      </h2>

      <form onSubmit={handleSubmit} className='mt-6 space-y-3'>
        <Input
          value={authorName}
          onChange={e => setAuthorName(e.target.value)}
          placeholder='Nama (opsional, kosongkan untuk anonim)'
          maxLength={50}
        />
        <Textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder='Tulis komentar...'
          rows={4}
          maxLength={2000}
          required
        />
        <Button type='submit' disabled={submitting}>
          {submitting ? 'Mengirim...' : 'Kirim Komentar'}
        </Button>
      </form>

      <div className='mt-8 space-y-4'>
        {loading ? (
          <p className='text-sm text-muted-foreground'>Memuat komentar...</p>
        ) : comments.length === 0 ? (
          <p className='text-sm text-muted-foreground'>
            Belum ada komentar. Jadilah yang pertama!
          </p>
        ) : (
          comments.map(comment => (
            <article
              key={comment.id}
              className={`rounded-lg border p-4 ${
                comment.isPinned ? 'border-primary/40 bg-primary/5' : 'border-border'
              }`}
            >
              <div className='flex items-start justify-between gap-3'>
                <div className='min-w-0 flex-1'>
                  <div className='flex flex-wrap items-center gap-2'>
                    <span className='text-sm font-medium'>{comment.authorName}</span>
                    {comment.isPinned && (
                      <Badge variant='secondary' className='text-xs'>
                        Pinned
                      </Badge>
                    )}
                    <span className='text-xs text-muted-foreground'>
                      {formatDate(comment.createdAt)}
                    </span>
                  </div>
                  <p className='mt-2 whitespace-pre-wrap text-sm leading-relaxed'>
                    {comment.content}
                  </p>
                </div>

                {isAdmin && (
                  <div className='flex shrink-0 gap-1'>
                    <Button
                      size='icon'
                      variant='ghost'
                      className='h-8 w-8'
                      title={comment.isPinned ? 'Lepas pin' : 'Pin komentar'}
                      onClick={() => handleTogglePin(comment)}
                    >
                      <PinTopIcon
                        className={`h-4 w-4 ${comment.isPinned ? 'text-primary' : ''}`}
                      />
                    </Button>
                    <Button
                      size='icon'
                      variant='ghost'
                      className='h-8 w-8 text-destructive hover:text-destructive'
                      title='Hapus komentar'
                      onClick={() => handleDelete(comment.id)}
                    >
                      <TrashIcon className='h-4 w-4' />
                    </Button>
                  </div>
                )}
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  )
}
