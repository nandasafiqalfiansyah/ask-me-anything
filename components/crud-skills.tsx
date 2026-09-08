'use client'

import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import {
  Code2,
  Plus,
  Search,
  Pencil,
  Trash2,
  Check,
  X,
  Sparkles,
  Layers
} from 'lucide-react'

type Skill = {
  id: number
  name: string
}

export default function SkillCrudComponent() {
  const [skills, setSkills] = useState<Skill[]>([])
  const [newSkill, setNewSkill] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [editingId, setEditingId] = useState<number | null>(null)
  const [editingValue, setEditingValue] = useState('')

  // Fetch initial
  const fetchSkills = useCallback(async () => {
    setLoading(true)
    setError(null)
    const { data, error } = await supabase
      .from('skills')
      .select('id, name')
      .order('id', { ascending: true })

    if (error) {
      setError(error.message)
      toast.error('Gagal mengambil daftar skills')
    }
    if (data) setSkills(data as Skill[])
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchSkills()
  }, [fetchSkills])

  // Filtered skills
  const filteredSkills = useMemo(() => {
    if (!searchQuery.trim()) return skills
    const q = searchQuery.toLowerCase().trim()
    return skills.filter(s => s.name.toLowerCase().includes(q))
  }, [skills, searchQuery])

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

    if (error) {
      setError(error.message)
      toast.error(error.message)
    } else if (data) {
      setSkills(prev => [...prev, data as Skill])
      setNewSkill('')
      toast.success(`Skill "${trimmed}" berhasil ditambahkan`)
    }
    setLoading(false)
  }

  // Delete by id
  const deleteSkill = async (id: number, name: string) => {
    if (!confirm(`Hapus skill "${name}"?`)) return
    setLoading(true)
    setError(null)
    const prev = skills
    setSkills(prev.filter(s => s.id !== id))

    const { error } = await supabase.from('skills').delete().eq('id', id)
    if (error) {
      setError(error.message)
      setSkills(prev) // rollback
      toast.error('Gagal menghapus skill')
    } else {
      toast.success(`Skill "${name}" dihapus`)
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

    const prev = skills
    setSkills(prev.map(s => (s.id === editingId ? { ...s, name: trimmed } : s)))

    const { error } = await supabase
      .from('skills')
      .update({ name: trimmed })
      .eq('id', editingId)

    if (error) {
      setError(error.message)
      setSkills(prev) // rollback
      toast.error('Gagal memperbarui skill')
    } else {
      toast.success(`Skill diperbarui menjadi "${trimmed}"`)
      cancelEdit()
    }
    setLoading(false)
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <div className='flex items-center gap-2'>
            <h3 className='text-lg font-bold tracking-tight text-foreground sm:text-xl'>
              Tech Stack & Keahlian
            </h3>
            <span className='rounded-md bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary'>
              {skills.length} Skills
            </span>
          </div>
          <p className='text-xs text-muted-foreground mt-0.5'>
            Daftar teknologi, bahasa pemrograman, dan tools yang ditampilkan pada portofolio.
          </p>
        </div>
      </div>

      {error && (
        <div className='rounded-2xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive'>
          {error}
        </div>
      )}

      {/* Add & Search Controls */}
      <div className='grid gap-3 sm:grid-cols-[1fr_auto]'>
        {/* Add input */}
        <div className='flex items-center gap-2'>
          <div className='relative flex-1'>
            <Code2 className='absolute left-3 top-2.5 h-4 w-4 text-muted-foreground' />
            <Input
              placeholder='Tambah skill baru (misal: Tailwind CSS, Docker, PostgreSQL)...'
              value={newSkill}
              onChange={e => setNewSkill(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') addSkill()
              }}
              disabled={loading}
              className='pl-9 rounded-xl text-xs h-9'
            />
          </div>
          <Button
            onClick={addSkill}
            disabled={loading || !newSkill.trim()}
            className='h-9 gap-1.5 rounded-xl px-4 text-xs font-semibold shadow-2xs'
          >
            <Plus className='h-4 w-4' />
            <span>Tambah</span>
          </Button>
        </div>

        {/* Search Input */}
        <div className='relative w-full sm:w-64'>
          <Search className='absolute left-3 top-2.5 h-4 w-4 text-muted-foreground' />
          <Input
            placeholder='Cari skill...'
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
      </div>

      {/* Skills Grid / Badges Container */}
      <div className='rounded-3xl border border-border/80 bg-card/50 p-5 shadow-xs backdrop-blur-xs'>
        {loading && skills.length === 0 ? (
          <div className='py-8 text-center'>
            <div className='inline-block h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent' />
            <p className='mt-2 text-xs text-muted-foreground'>Memuat data skills...</p>
          </div>
        ) : filteredSkills.length === 0 ? (
          <div className='py-8 text-center'>
            <p className='text-xs text-muted-foreground'>
              {searchQuery ? `Tidak ada skill dengan kata kunci "${searchQuery}"` : 'Belum ada skill yang ditambahkan.'}
            </p>
          </div>
        ) : (
          <div className='flex flex-wrap gap-2.5'>
            {filteredSkills.map(skill => {
              const isEditing = editingId === skill.id
              return (
                <div
                  key={skill.id}
                  className={`group inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs transition-all duration-150 ${
                    isEditing
                      ? 'border-primary bg-primary/5 shadow-xs ring-2 ring-primary/20'
                      : 'border-border/80 bg-background/80 hover:border-primary/40 hover:bg-background'
                  }`}
                >
                  {isEditing ? (
                    <div className='flex items-center gap-1.5'>
                      <Input
                        className='h-7 w-36 rounded-lg text-xs'
                        value={editingValue}
                        autoFocus
                        onChange={e => setEditingValue(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') saveEdit()
                          if (e.key === 'Escape') cancelEdit()
                        }}
                      />
                      <Button
                        size='icon'
                        variant='ghost'
                        className='h-7 w-7 rounded-lg text-emerald-600 hover:bg-emerald-500/10'
                        onClick={saveEdit}
                        disabled={loading}
                        title='Simpan perubahan'
                      >
                        <Check className='h-3.5 w-3.5' />
                      </Button>
                      <Button
                        size='icon'
                        variant='ghost'
                        className='h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground'
                        onClick={cancelEdit}
                        disabled={loading}
                        title='Batal'
                      >
                        <X className='h-3.5 w-3.5' />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <span className='font-medium text-foreground'>{skill.name}</span>
                      <div className='flex items-center gap-0.5 opacity-60 transition-opacity group-hover:opacity-100'>
                        <button
                          onClick={() => startEdit(skill)}
                          disabled={loading}
                          className='rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground'
                          title='Edit nama skill'
                        >
                          <Pencil className='h-3 w-3' />
                        </button>
                        <button
                          onClick={() => deleteSkill(skill.id, skill.name)}
                          disabled={loading}
                          className='rounded-md p-1 text-red-500 hover:bg-red-500/10'
                          title='Hapus skill'
                        >
                          <Trash2 className='h-3 w-3' />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
