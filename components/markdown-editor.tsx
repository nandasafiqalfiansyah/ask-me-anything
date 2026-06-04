'use client'

import React, { useRef, useCallback } from 'react'
import { cn } from '@/lib/utils'

type ToolbarAction = {
  label: string
  title: string
  action: (selected: string) => { before: string; after: string }
}

const TOOLBAR_ACTIONS: ToolbarAction[] = [
  {
    label: 'B',
    title: 'Bold',
    action: sel => ({ before: `**${sel || 'bold text'}**`, after: '' })
  },
  {
    label: 'I',
    title: 'Italic',
    action: sel => ({ before: `*${sel || 'italic text'}*`, after: '' })
  },
  {
    label: 'H1',
    title: 'Heading 1',
    action: sel => ({ before: `\n# ${sel || 'Heading 1'}`, after: '' })
  },
  {
    label: 'H2',
    title: 'Heading 2',
    action: sel => ({ before: `\n## ${sel || 'Heading 2'}`, after: '' })
  },
  {
    label: 'H3',
    title: 'Heading 3',
    action: sel => ({ before: `\n### ${sel || 'Heading 3'}`, after: '' })
  },
  {
    label: '• List',
    title: 'Bullet List',
    action: sel => ({
      before: sel
        ? sel
            .split('\n')
            .map(l => `- ${l}`)
            .join('\n')
        : '\n- Item 1\n- Item 2\n- Item 3',
      after: ''
    })
  },
  {
    label: '1. List',
    title: 'Numbered List',
    action: sel => ({
      before: sel
        ? sel
            .split('\n')
            .map((l, i) => `${i + 1}. ${l}`)
            .join('\n')
        : '\n1. Item 1\n2. Item 2\n3. Item 3',
      after: ''
    })
  },
  {
    label: '> Quote',
    title: 'Blockquote',
    action: sel => ({ before: `\n> ${sel || 'quote'}`, after: '' })
  },
  {
    label: '</>',
    title: 'Inline Code',
    action: sel => ({ before: `\`${sel || 'code'}\``, after: '' })
  },
  {
    label: 'Code Block',
    title: 'Code Block',
    action: sel => ({
      before: `\n\`\`\`\n${sel || '// your code here'}\n\`\`\``,
      after: ''
    })
  },
  {
    label: 'Link',
    title: 'Insert Link',
    action: sel => ({
      before: `[${sel || 'link text'}](https://)`,
      after: ''
    })
  },
  {
    label: '---',
    title: 'Horizontal Rule',
    action: () => ({ before: '\n\n---\n', after: '' })
  }
]

type Props = {
  value: string
  onChange: (val: string) => void
  placeholder?: string
  className?: string
  rows?: number
}

export default function MarkdownEditor({
  value,
  onChange,
  placeholder = 'Tulis konten di sini...',
  className,
  rows = 18
}: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const insertText = useCallback(
    (action: ToolbarAction) => {
      const ta = textareaRef.current
      if (!ta) return

      const start = ta.selectionStart
      const end = ta.selectionEnd
      const selected = value.slice(start, end)

      const { before } = action.action(selected)

      const newValue = value.slice(0, start) + before + value.slice(end)
      onChange(newValue)

      // Restore cursor position after React re-render
      requestAnimationFrame(() => {
        ta.focus()
        const newCursor = start + before.length
        ta.setSelectionRange(newCursor, newCursor)
      })
    },
    [value, onChange]
  )

  return (
    <div className={cn('flex flex-col rounded-md border border-input', className)}>
      {/* Toolbar */}
      <div className='flex flex-wrap gap-1 border-b border-input bg-muted/40 p-2'>
        {TOOLBAR_ACTIONS.map(action => (
          <button
            key={action.title}
            type='button'
            title={action.title}
            onClick={() => insertText(action)}
            className={cn(
              'rounded px-2 py-1 text-xs font-medium transition-colors',
              'hover:bg-accent hover:text-accent-foreground',
              'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
              action.label === 'B' && 'font-bold',
              action.label === 'I' && 'italic'
            )}
          >
            {action.label}
          </button>
        ))}
      </div>

      {/* Textarea */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className={cn(
          'w-full resize-y bg-transparent px-3 py-2 text-sm font-mono',
          'placeholder:text-muted-foreground',
          'focus-visible:outline-none',
          'disabled:cursor-not-allowed disabled:opacity-50'
        )}
        spellCheck
      />

      {/* Footer hint */}
      <div className='border-t border-input px-3 py-1.5 text-xs text-muted-foreground'>
        Mendukung Markdown — gunakan toolbar di atas atau ketik langsung
      </div>
    </div>
  )
}
