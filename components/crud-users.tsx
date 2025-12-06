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

export default function CrudUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editEmail, setEditEmail] = useState('')

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    // Fetch users from auth.users through admin API
    const { data: { users: authUsers }, error: usersError } = await supabase.auth.admin.listUsers()

    if (usersError) {
      setError(usersError.message)
      setLoading(false)
      return
    }

    if (authUsers) {
      const formattedUsers = authUsers.map(user => ({
        id: user.id,
        email: user.email || 'No email',
        created_at: user.created_at,
        last_sign_in_at: user.last_sign_in_at,
        role: user.role
      }))
      setUsers(formattedUsers)
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

    const { error } = await supabase.auth.admin.deleteUser(id)

    if (error) {
      setError(error.message)
    } else {
      await fetchUsers()
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

    const { error } = await supabase.auth.admin.updateUserById(editingId, {
      email: editEmail.trim()
    })

    if (error) {
      setError(error.message)
    } else {
      setEditingId(null)
      setEditEmail('')
      await fetchUsers()
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
