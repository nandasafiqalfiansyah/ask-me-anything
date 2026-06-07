'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'
import { toast } from 'sonner'
import { PinTopIcon, TrashIcon } from '@radix-ui/react-icons'

type Comment = {
  id: string
  postSlug: string
  authorName: string
  content: string
  isPinned: boolean
  createdAt: string
}

export default function CrudComments() {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)

  const getAuthHeaders = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return null
    return { Authorization: `Bearer ${session.access_token}` }
  }, [])

  const loadComments = useCallback(async () => {
    setLoading(true)
    try {
      const headers = await getAuthHeaders()
      if (!headers) {
        toast.error('Tidak terautentikasi')
        return
      }

      const res = await fetch('/api/v1/comments', { headers })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setComments(data.comments || [])
    } catch {
      toast.error('Gagal memuat komentar')
    } finally {
      setLoading(false)
    }
  }, [getAuthHeaders])

  useEffect(() => {
    loadComments()
  }, [loadComments])

  async function handleDelete(comment: Comment) {
    if (!confirm(`Hapus komentar dari ${comment.authorName}?`)) return

    try {
      const headers = await getAuthHeaders()
      if (!headers) return

      const res = await fetch(
        `/api/v1/posts/${comment.postSlug}/comments/${comment.id}`,
        { method: 'DELETE', headers }
      )
      if (!res.ok) throw new Error()
      setComments(prev => prev.filter(c => c.id !== comment.id))
      toast.success('Komentar dihapus')
    } catch {
      toast.error('Gagal menghapus komentar')
    }
  }

  async function handleTogglePin(comment: Comment) {
    try {
      const headers = await getAuthHeaders()
      if (!headers) return

      const res = await fetch(
        `/api/v1/posts/${comment.postSlug}/comments/${comment.id}`,
        {
          method: 'PATCH',
          headers: { ...headers, 'Content-Type': 'application/json' },
          body: JSON.stringify({ isPinned: !comment.isPinned })
        }
      )
      const data = await res.json()
      if (!res.ok) throw new Error()

      setComments(prev =>
        prev.map(c =>
          c.id === comment.id ? { ...c, isPinned: data.comment.isPinned } : c
        )
      )
      toast.success(data.comment.isPinned ? 'Komentar dipin' : 'Pin dilepas')
    } catch {
      toast.error('Gagal memperbarui pin')
    }
  }

  return (
    <div className='space-y-5'>
      <div>
        <h2 className='text-lg font-semibold'>Komentar Blog</h2>
        <p className='text-sm text-muted-foreground'>
          {comments.length} komentar · kelola pin & hapus
        </p>
      </div>

      {loading ? (
        <div className='flex justify-center py-16'>
          <span className='h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent' />
        </div>
      ) : comments.length === 0 ? (
        <p className='py-16 text-center text-muted-foreground'>Belum ada komentar.</p>
      ) : (
        <div className='divide-y rounded-xl border'>
          {comments.map(comment => (
            <div key={comment.id} className='flex items-start justify-between gap-4 px-4 py-4'>
              <div className='min-w-0 flex-1'>
                <div className='flex flex-wrap items-center gap-2'>
                  <span className='font-medium'>{comment.authorName}</span>
                  {comment.isPinned && (
                    <Badge variant='secondary' className='text-xs'>
                      Pinned
                    </Badge>
                  )}
                  <span className='text-xs text-muted-foreground'>
                    {formatDate(comment.createdAt)}
                  </span>
                </div>
                <p className='mt-1 line-clamp-2 text-sm text-muted-foreground'>
                  {comment.content}
                </p>
                <Link
                  href={`/posts/${comment.postSlug}`}
                  className='mt-1 inline-block text-xs text-primary hover:underline'
                >
                  /posts/{comment.postSlug}
                </Link>
              </div>

              <div className='flex shrink-0 gap-1'>
                <Button
                  size='icon'
                  variant='ghost'
                  className='h-8 w-8'
                  title={comment.isPinned ? 'Lepas pin' : 'Pin'}
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
                  title='Hapus'
                  onClick={() => handleDelete(comment)}
                >
                  <TrashIcon className='h-4 w-4' />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
