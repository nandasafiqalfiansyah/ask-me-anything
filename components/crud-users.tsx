'use client'

import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import {
  Users,
  Search,
  Pencil,
  Trash2,
  Check,
  X,
  ShieldCheck,
  Clock,
  Calendar,
  Mail
} from 'lucide-react'

type User = {
  id: string
  email: string
  created_at: string
  last_sign_in_at: string | null
  role?: string
}

export default function CrudUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editEmail, setEditEmail] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        setError('Sesi belum terautentikasi')
        setLoading(false)
        return
      }

      const response = await fetch('/api/v1/users', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Gagal memuat pengguna')
        setLoading(false)
        return
      }

      if (data.users) {
        const formattedUsers = data.users.map((user: any) => ({
          id: user.id,
          email: user.email || 'No email',
          created_at: user.created_at,
          last_sign_in_at: user.last_sign_in_at ?? null,
          role: user.role
        }))
        setUsers(formattedUsers)
      }
    } catch (err: any) {
      setError(err.message || 'Gagal memuat pengguna')
    }

    setLoading(false)
  }, [])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users
    const q = searchQuery.toLowerCase().trim()
    return users.filter(u => u.email.toLowerCase().includes(q) || u.id.toLowerCase().includes(q))
  }, [users, searchQuery])

  const handleDelete = async (id: string, email: string) => {
    if (!confirm(`Hapus pengguna ${email}? Tindakan ini tidak dapat dibatalkan.`)) return

    setLoading(true)
    setError(null)

    try {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        toast.error('Tidak terautentikasi')
        setLoading(false)
        return
      }

      const response = await fetch(`/api/v1/users?id=${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || 'Gagal menghapus pengguna')
      } else {
        toast.success(`Pengguna ${email} berhasil dihapus`)
        await fetchUsers()
      }
    } catch (err: any) {
      toast.error(err.message || 'Gagal menghapus pengguna')
    }

    setLoading(false)
  }

  const handleEdit = (user: User) => {
    setEditingId(user.id)
    setEditEmail(user.email)
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditEmail('')
  }

  const handleSaveEdit = async () => {
    if (!editingId || !editEmail.trim()) return

    setLoading(true)
    setError(null)

    try {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        toast.error('Tidak terautentikasi')
        setLoading(false)
        return
      }

      const response = await fetch('/api/v1/users', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: editingId,
          email: editEmail.trim()
        })
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || 'Gagal memperbarui pengguna')
      } else {
        toast.success('Email pengguna berhasil diperbarui')
        setEditingId(null)
        setEditEmail('')
        await fetchUsers()
      }
    } catch (err: any) {
      toast.error(err.message || 'Gagal memperbarui pengguna')
    }

    setLoading(false)
  }

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return 'Belum pernah'
    try {
      return new Date(dateString).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return dateString
    }
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <div className='flex items-center gap-2'>
            <h3 className='text-lg font-bold tracking-tight text-foreground sm:text-xl'>
              Manajemen Pengguna & Akun Admin
            </h3>
            <span className='rounded-md bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary'>
              {users.length} Akun
            </span>
          </div>
          <p className='text-xs text-muted-foreground mt-0.5'>
            Daftar akun yang terdaftar pada sistem autentikasi Supabase.
          </p>
        </div>
      </div>

      {error && (
        <div className='rounded-2xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive'>
          {error}
        </div>
      )}

      {/* Search Bar */}
      <div className='relative max-w-md'>
        <Search className='absolute left-3 top-2.5 h-4 w-4 text-muted-foreground' />
        <Input
          placeholder='Cari email atau User ID...'
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

      {/* Users List */}
      <div className='space-y-3'>
        {loading && users.length === 0 ? (
          <div className='py-12 text-center'>
            <div className='inline-block h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent' />
            <p className='mt-2 text-xs text-muted-foreground'>Memuat data pengguna...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className='rounded-3xl border border-dashed border-border/80 p-10 text-center'>
            <div className='mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground'>
              <Users className='h-6 w-6 opacity-60' />
            </div>
            <h5 className='mt-3 text-sm font-semibold text-foreground'>
              {searchQuery ? 'Tidak ada pengguna yang cocok' : 'Belum Ada Pengguna'}
            </h5>
            <p className='mt-1 text-xs text-muted-foreground'>
              {searchQuery ? 'Coba sesuaikan kata kunci pencarian Anda.' : 'Pengguna terdaftar akan muncul di sini.'}
            </p>
          </div>
        ) : (
          filteredUsers.map(user => {
            const isEditing = editingId === user.id
            return (
              <div
                key={user.id}
                className='flex flex-col gap-3 rounded-2xl border border-border/80 bg-card/70 p-4 transition-all duration-200 hover:border-primary/40 hover:bg-card hover:shadow-xs sm:flex-row sm:items-center sm:justify-between'
              >
                <div className='flex items-start gap-3.5 min-w-0 flex-1'>
                  <div className='flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary font-bold text-sm uppercase'>
                    {user.email.slice(0, 2)}
                  </div>

                  <div className='min-w-0 flex-1 space-y-1'>
                    {isEditing ? (
                      <div className='space-y-1.5'>
                        <Input
                          type='email'
                          value={editEmail}
                          onChange={e => setEditEmail(e.target.value)}
                          disabled={loading}
                          placeholder='user@example.com'
                          className='rounded-xl text-xs h-8 max-w-sm'
                        />
                      </div>
                    ) : (
                      <>
                        <div className='flex flex-wrap items-center gap-2'>
                          <span className='font-bold text-sm text-foreground truncate'>
                            {user.email}
                          </span>
                          <span className='inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.2 text-[0.68rem] font-bold text-emerald-600 dark:text-emerald-400'>
                            <ShieldCheck className='h-3 w-3' />
                            Admin
                          </span>
                        </div>

                        <div className='flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[0.72rem] text-muted-foreground'>
                          <span>Terdaftar: {formatDateTime(user.created_at)}</span>
                          <span>•</span>
                          <span>Login terakhir: {formatDateTime(user.last_sign_in_at)}</span>
                        </div>

                        <div className='font-mono text-[0.68rem] text-muted-foreground/80 truncate'>
                          ID: {user.id}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className='flex items-center gap-1.5 self-end sm:self-center shrink-0'>
                  {isEditing ? (
                    <>
                      <Button
                        size='sm'
                        onClick={handleSaveEdit}
                        disabled={loading || !editEmail.trim()}
                        className='h-8 gap-1 rounded-xl text-xs font-semibold'
                      >
                        <Check className='h-3.5 w-3.5' />
                        <span>Simpan</span>
                      </Button>
                      <Button
                        size='sm'
                        variant='ghost'
                        onClick={handleCancelEdit}
                        disabled={loading}
                        className='h-8 rounded-xl text-xs'
                      >
                        Batal
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        size='sm'
                        variant='secondary'
                        onClick={() => handleEdit(user)}
                        disabled={loading}
                        className='h-8 gap-1 rounded-xl text-xs font-medium'
                      >
                        <Pencil className='h-3.5 w-3.5' />
                        <span>Edit</span>
                      </Button>
                      <Button
                        size='sm'
                        variant='ghost'
                        onClick={() => handleDelete(user.id, user.email)}
                        disabled={loading}
                        className='h-8 w-8 p-0 rounded-xl text-red-500 hover:bg-red-500/10'
                        title='Hapus pengguna'
                      >
                        <Trash2 className='h-3.5 w-3.5' />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
