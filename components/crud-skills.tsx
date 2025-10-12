'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type Skill = {
  id: number
  name: string
}

export default function SkillCrudComponent() {
  const [skills, setSkills] = useState<Skill[]>([])
  const [newSkill, setNewSkill] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [editingId, setEditingId] = useState<number | null>(null)
  const [editingValue, setEditingValue] = useState('')

  // Fetch awal
  const fetchSkills = useCallback(async () => {
    setLoading(true)
    setError(null)
    const { data, error } = await supabase
      .from('skills')
      .select('id, name')
      .order('id', { ascending: true })

    if (error) setError(error.message)
    if (data) setSkills(data as Skill[])
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchSkills()
  }, [fetchSkills])

  // Create
  const addSkill = async () => {
    const trimmed = newSkill.trim()
    if (!trimmed) return
    setLoading(true)
    setError(null)

    const { data, error } = await supabase
      .from('skills')
      .insert({ name: trimmed })
      .select('id, name')
      .single()

    if (error) setError(error.message)
    if (data) {
      setSkills(prev => [...prev, data as Skill])
      setNewSkill('')
    }
    setLoading(false)
  }

  // Delete by id
  const deleteSkill = async (id: number) => {
    setLoading(true)
    setError(null)
    // Optimistic UI
    const prev = skills
    setSkills(prev.filter(s => s.id !== id))

    const { error } = await supabase.from('skills').delete().eq('id', id)
    if (error) {
      setError(error.message)
      setSkills(prev) // rollback
    }
    setLoading(false)
  }

  // Start Edit
  const startEdit = (skill: Skill) => {
    setEditingId(skill.id)
    setEditingValue(skill.name)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditingValue('')
  }

  // Save Edit by id
  const saveEdit = async () => {
    if (editingId == null) return
    const trimmed = editingValue.trim()
    if (!trimmed) return

    setLoading(true)
    setError(null)

    // Optimistic UI
    const prev = skills
    setSkills(prev.map(s => (s.id === editingId ? { ...s, name: trimmed } : s)))

    const { error } = await supabase
      .from('skills')
      .update({ name: trimmed })
      .eq('id', editingId)

    if (error) {
      setError(error.message)
      setSkills(prev) // rollback
    } else {
      cancelEdit()
    }
    setLoading(false)
  }

  return (
    <div className='space-y-4'>
      <div className='flex items-end justify-between gap-3'>
        <div>
          <h3 className='title text-left text-3xl font-bold sm:text-3xl'>
            Tech Stack
          </h3>
          <p className='mt-3 text-muted-foreground *:text-sm'>
            Tambah, edit, hapus skill with vibes ✨
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

      {/* Add */}
      <div className='flex items-center gap-2'>
        <Input
          placeholder='Add new skill'
          value={newSkill}
          onChange={e => setNewSkill(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') addSkill()
          }}
          disabled={loading}
        />
        <Button onClick={addSkill} disabled={loading || !newSkill.trim()}>
          Add
        </Button>
      </div>

      {/* List */}
      <div className='flex flex-wrap gap-2'>
        {skills.map(skill => {
          const isEditing = editingId === skill.id
          return (
            <div
              key={skill.id}
              className='flex items-center gap-2 rounded-lg border px-2 py-1'
            >
              {isEditing ? (
                <Input
                  className='h-8 w-40'
                  value={editingValue}
                  autoFocus
                  onChange={e => setEditingValue(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') saveEdit()
                    if (e.key === 'Escape') cancelEdit()
                  }}
                />
              ) : (
                <Badge className='m-0'>{skill.name}</Badge>
              )}

              {isEditing ? (
                <>
                  <Button
                    size='sm'
                    className='h-8'
                    onClick={saveEdit}
                    disabled={loading}
                  >
                    Save
                  </Button>
                  <Button
                    size='sm'
                    variant='secondary'
                    className='h-8'
                    onClick={cancelEdit}
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
                    className='h-8'
                    onClick={() => startEdit(skill)}
                    disabled={loading}
                  >
                    Edit
                  </Button>
                  <Button
                    size='sm'
                    variant='destructive'
                    className='h-8'
                    onClick={() => deleteSkill(skill.id)}
                    disabled={loading}
                  >
                    Delete
                  </Button>
                </>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
