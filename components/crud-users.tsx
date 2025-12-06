'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type User = {
  id: string
  email: string
  created_at: string
  last_sign_in_at: string | null
  role?: string
}

/**
 * CrudUsers component for managing user accounts.
 * 
 * SECURITY NOTE: This component uses Supabase admin API methods which require
 * proper authentication and authorization. Ensure:
 * 1. This component is only rendered within an authenticated dashboard
 * 2. Supabase RLS policies restrict admin operations to authorized users
 * 3. Service role key is properly secured and not exposed to clients
 */
export default function CrudUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editEmail, setEditEmail] = useState('')

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Get current session for auth token
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        setError('Not authenticated')
        setLoading(false)
        return
      }

      // Fetch users through API route
      const response = await fetch('/api/v1/users', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to fetch users')
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
      setError(err.message || 'Failed to fetch users')
    }
    
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const handleDelete = async (id: string, email: string) => {
    if (!confirm(`Are you sure you want to delete user: ${email}?`)) return

    setLoading(true)
    setError(null)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        setError('Not authenticated')
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
        setError(data.error || 'Failed to delete user')
      } else {
        await fetchUsers()
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete user')
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
        setError('Not authenticated')
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
        setError(data.error || 'Failed to update user')
      } else {
        setEditingId(null)
        setEditEmail('')
        await fetchUsers()
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update user')
    }

    setLoading(false)
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never'
    return new Date(dateString).toLocaleString()
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-end justify-between gap-3'>
        <div>
          <h3 className='title text-left text-2xl font-bold sm:text-3xl'>
            User Management
          </h3>
          <p className='mt-3 text-sm text-muted-foreground'>
            Manage registered users - view, edit, and delete user accounts ✨
          </p>
        </div>
        {loading && (
          <span className='text-xs text-muted-foreground'>Loading…</span>
        )}
      </div>

      {error && (
        <div className='rounded-md border border-destructive/30 bg-destructive/10 p-2 text-sm text-destructive'>
          {error}
        </div>
      )}

      {/* User List */}
      <div className='space-y-2'>
        <h4 className='font-semibold'>User List</h4>
        <div className='space-y-2'>
          {users.map(user => {
            const isEditing = editingId === user.id
            return (
              <div
                key={user.id}
                className='flex flex-col gap-3 rounded-lg border bg-background p-4 sm:flex-row sm:items-center'
              >
                <div className='flex-1 min-w-0'>
                  {isEditing ? (
                    <div className='space-y-2'>
                      <label className='text-sm font-medium'>Email</label>
                      <Input
                        type='email'
                        value={editEmail}
                        onChange={e => setEditEmail(e.target.value)}
                        disabled={loading}
                        placeholder='user@example.com'
                      />
                    </div>
                  ) : (
                    <>
                      <div className='font-semibold truncate'>{user.email}</div>
                      <div className='text-xs text-muted-foreground'>
                        ID: {user.id}
                      </div>
                      <div className='text-xs text-muted-foreground'>
                        Created: {formatDate(user.created_at)}
                      </div>
                      <div className='text-xs text-muted-foreground'>
                        Last sign in: {formatDate(user.last_sign_in_at)}
                      </div>
                    </>
                  )}
                </div>

                <div className='flex gap-2 flex-shrink-0'>
                  {isEditing ? (
                    <>
                      <Button
                        size='sm'
                        onClick={handleSaveEdit}
                        disabled={loading || !editEmail.trim()}
                      >
                        Save
                      </Button>
                      <Button
                        size='sm'
                        variant='secondary'
                        onClick={handleCancelEdit}
                        disabled={loading}
                      >
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        size='sm'
                        variant='secondary'
                        onClick={() => handleEdit(user)}
                        disabled={loading}
                      >
                        Edit
                      </Button>
                      <Button
                        size='sm'
                        variant='destructive'
                        onClick={() => handleDelete(user.id, user.email)}
                        disabled={loading}
                      >
                        Delete
                      </Button>
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {users.length === 0 && !loading && (
          <p className='py-4 text-center text-sm text-muted-foreground'>
            No users found.
          </p>
        )}
      </div>
    </div>
  )
}
