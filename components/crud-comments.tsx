'use client'

import React, { useCallback, useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatDate } from '@/lib/utils'
import { toast } from 'sonner'
import {
  MessageSquare,
  Pin,
  PinOff,
  Trash2,
  Search,
  ExternalLink,
  X,
  User,
  CheckCircle2
} from 'lucide-react'

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
  const [searchQuery, setSearchQuery] = useState('')
  const [filterMode, setFilterMode] = useState<'all' | 'pinned'>('all')

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

  const pinnedCount = useMemo(() => comments.filter(c => c.isPinned).length, [comments])

  const filteredComments = useMemo(() => {
    return comments.filter(c => {
      const matchPinned = filterMode === 'all' || c.isPinned
      const q = searchQuery.toLowerCase().trim()
      const matchSearch =
        !q ||
        c.authorName.toLowerCase().includes(q) ||
        c.content.toLowerCase().includes(q) ||
        c.postSlug.toLowerCase().includes(q)
      return matchPinned && matchSearch
    })
  }, [comments, filterMode, searchQuery])

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
      toast.success('Komentar berhasil dihapus')
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
      toast.success(data.comment.isPinned ? 'Komentar dipasangi pin' : 'Pin komentar dilepas')
    } catch {
      toast.error('Gagal memperbarui pin')
    }
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <div className='flex items-center gap-2'>
            <h3 className='text-lg font-bold tracking-tight text-foreground sm:text-xl'>
              Moderasi Komentar Blog
            </h3>
            <span className='rounded-md bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary'>
              {comments.length} Komentar
            </span>
            {pinnedCount > 0 && (
              <span className='rounded-md bg-amber-500/10 px-2 py-0.5 text-xs font-bold text-amber-600 dark:text-amber-400'>
                {pinnedCount} Dipin
              </span>
            )}
          </div>
          <p className='text-xs text-muted-foreground mt-0.5'>
            Kelola komentar pengunjung di artikel blog, tandai pin untuk sorotan, atau hapus komentar spam.
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <div className='relative flex-1 max-w-md'>
          <Search className='absolute left-3 top-2.5 h-4 w-4 text-muted-foreground' />
          <Input
            placeholder='Cari nama pengirim, isi komentar, atau slug artikel...'
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className='pl-9 rounded-xl text-xs h-9'
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className='absolute right-3 top-2.5 text-muted-foreground hover:text-foreground'
            >
              <X className='h-4 w-4' />
            </button>
          )}
        </div>

        <div className='flex items-center gap-1 rounded-xl border border-border/80 bg-background/80 p-1'>
          <button
            onClick={() => setFilterMode('all')}
            className={`rounded-lg px-3 py-1 text-xs font-medium transition-all ${
              filterMode === 'all'
                ? 'bg-primary text-primary-foreground font-semibold shadow-2xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Semua ({comments.length})
          </button>
          <button
            onClick={() => setFilterMode('pinned')}
            className={`rounded-lg px-3 py-1 text-xs font-medium transition-all ${
              filterMode === 'pinned'
                ? 'bg-amber-600 text-white font-semibold shadow-2xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Dipin ({pinnedCount})
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className='py-12 text-center'>
          <div className='inline-block h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent' />
          <p className='mt-2 text-xs text-muted-foreground'>Memuat data komentar...</p>
        </div>
      ) : filteredComments.length === 0 ? (
        <div className='rounded-3xl border border-dashed border-border/80 p-10 text-center'>
          <div className='mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground'>
            <MessageSquare className='h-6 w-6 opacity-60' />
          </div>
          <h5 className='mt-3 text-sm font-semibold text-foreground'>
            {searchQuery || filterMode === 'pinned' ? 'Tidak ada komentar yang cocok' : 'Belum Ada Komentar'}
          </h5>
          <p className='mt-1 text-xs text-muted-foreground'>
            {searchQuery ? 'Coba sesuaikan kata kunci pencarian Anda.' : 'Komentar dari pembaca blog akan muncul di sini.'}
          </p>
        </div>
      ) : (
        <div className='grid gap-3'>
          {filteredComments.map(comment => (
            <div
              key={comment.id}
              className={`rounded-2xl border p-4 transition-all duration-200 hover:border-primary/40 hover:shadow-xs ${
                comment.isPinned
                  ? 'border-amber-500/30 bg-amber-500/5'
                  : 'border-border/80 bg-card/70'
              }`}
            >
              <div className='flex items-start justify-between gap-4'>
                <div className='flex items-start gap-3 min-w-0 flex-1'>
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-bold text-xs ${
                    comment.isPinned ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300' : 'bg-primary/10 text-primary'
                  }`}>
                    {comment.authorName.slice(0, 2).toUpperCase()}
                  </div>

                  <div className='min-w-0 flex-1 space-y-1'>
                    <div className='flex flex-wrap items-center gap-2'>
                      <span className='font-bold text-sm text-foreground'>{comment.authorName}</span>
                      {comment.isPinned && (
                        <span className='inline-flex items-center gap-1 rounded-md bg-amber-500/20 px-2 py-0.2 text-[0.68rem] font-bold text-amber-700 dark:text-amber-300'>
                          <Pin className='h-3 w-3 fill-current' />
                          Dipin
                        </span>
                      )}
                      <span className='text-[0.72rem] text-muted-foreground'>
                        {formatDate(comment.createdAt)}
                      </span>
                    </div>

                    <p className='text-xs text-foreground/90 leading-relaxed'>
                      {comment.content}
                    </p>

                    <div className='pt-1'>
                      <Link
                        href={`/posts/${comment.postSlug}`}
                        target='_blank'
                        className='inline-flex items-center gap-1 font-mono text-[0.7rem] text-primary hover:underline'
                      >
                        <span>/posts/{comment.postSlug}</span>
                        <ExternalLink className='h-3 w-3' />
                      </Link>
                    </div>
                  </div>
                </div>

                <div className='flex items-center gap-1 shrink-0'>
                  <Button
                    size='sm'
                    variant='ghost'
                    className={`h-8 w-8 p-0 rounded-xl ${
                      comment.isPinned ? 'text-amber-600 hover:bg-amber-500/20' : 'text-muted-foreground hover:text-foreground'
                    }`}
                    title={comment.isPinned ? 'Lepas Pin' : 'Pasang Pin'}
                    onClick={() => handleTogglePin(comment)}
                  >
                    {comment.isPinned ? <PinOff className='h-4 w-4' /> : <Pin className='h-4 w-4' />}
                  </Button>

                  <Button
                    size='sm'
                    variant='ghost'
                    className='h-8 w-8 p-0 rounded-xl text-red-500 hover:bg-red-500/10'
                    title='Hapus Komentar'
                    onClick={() => handleDelete(comment)}
                  >
                    <Trash2 className='h-4 w-4' />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
