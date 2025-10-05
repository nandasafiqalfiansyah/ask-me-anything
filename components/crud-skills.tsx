'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function SkillCrudComponent() {
  const [skills, setSkills] = useState<string[]>([])
  const [newSkill, setNewSkill] = useState('')
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editingValue, setEditingValue] = useState('')

  // Fetch skills awal
  useEffect(() => {
    fetchSkills()
  }, [])

  const fetchSkills = async () => {
    const { data, error } = await supabase
      .from('skills')
      .select('id, name')
      .order('id')

    if (!error && data) {
      setSkills(data.map(item => item.name))
    }
  }

  const addSkill = async () => {
    const trimmed = newSkill.trim()
    if (!trimmed) return

    const { error } = await supabase.from('skills').insert({ name: trimmed })
    if (!error) {
      setSkills([...skills, trimmed])
      setNewSkill('')
    }
  }

  const deleteSkill = async (index: number) => {
    const name = skills[index]
    const { error } = await supabase.from('skills').delete().eq('name', name)
    if (!error) {
      setSkills(skills.filter((_, i) => i !== index))
    }
  }

  const startEdit = (index: number) => {
    setEditingIndex(index)
    setEditingValue(skills[index])
  }

  const saveEdit = async () => {
    if (editingIndex === null) return
    const trimmed = editingValue.trim()
    if (!trimmed) return

    const oldName = skills[editingIndex]
    const { error } = await supabase
      .from('skills')
      .update({ name: trimmed })
      .eq('name', oldName)

    if (!error) {
      const updated = [...skills]
      updated[editingIndex] = trimmed
      setSkills(updated)
      setEditingIndex(null)
      setEditingValue('')
    }
  }

  return (
    <div>
      <h1 className='mb-2 text-2xl font-bold'>Tech Stack</h1>

      <div className='mb-4 flex items-center gap-2'>
        <Input
          placeholder='Add new skill'
          value={newSkill}
          onChange={e => setNewSkill(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') addSkill()
          }}
          required
        />
        <Button onClick={addSkill}>Add</Button>
      </div>

      <div className='flex flex-wrap gap-2'>
        {skills.map((skill, index) => (
          <div key={index} className='flex items-center gap-1'>
            {editingIndex === index ? (
              <Input
                value={editingValue}
                onChange={e => setEditingValue(e.target.value)}
              />
            ) : (
              <Badge className='m-1 p-2'>{skill}</Badge>
            )}

            {editingIndex === index ? (
              <Button size='sm' onClick={saveEdit}>
                Save
              </Button>
            ) : (
              <Button
                size='sm'
                onClick={() => startEdit(index)}
                className='px-1 py-0.5 text-[10px]'
              >
                Edit
              </Button>
            )}

            <Button
              onClick={() => deleteSkill(index)}
              className='px-1 py-0.5 text-[10px]'
              variant='destructive'
            >
              Delete
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}
