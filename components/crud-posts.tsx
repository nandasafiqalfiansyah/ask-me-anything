'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import MarkdownEditor from '@/components/markdown-editor'
import DragDropImageUpload from '@/components/drag-drop-image-upload'
import { toast } from 'sonner'
import {
  PlusIcon,
  Pencil1Icon,
  TrashIcon,
  EyeOpenIcon,
  Cross2Icon,
  LightningBoltIcon,
  ImageIcon,
  ArrowLeftIcon
} from '@radix-ui/react-icons'

type Post = {
  id: string
  slug: string
  title: string
  summary: string
  content: string
  author: string
  publishedAt: string
  published: boolean
  image?: string
}

type View = 'list' | 'form' | 'preview'

const EMPTY_POST: Omit<Post, 'id' | 'slug' | 'publishedAt'> = {
  title: '',
  summary: '',
  content: '',
  author: 'Admin',
  published: false,
  image: ''
}

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
const MAX_UPLOAD_SIZE_MB = 5

export default function CrudPosts() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [view, setView] = useState<View>('list')
  const [editingPost, setEditingPost] = useState<Post | null>(null)

  const [title, setTitle] = useState('')
  const [summary, setSummary] = useState('')
  const [content, setContent] = useState('')
  const [author, setAuthor] = useState('Admin')
  const [published, setPublished] = useState(false)
  const [image, setImage] = useState('')
  const [uploading, setUploading] = useState(false)
  const [idea, setIdea] = useState('')
  const [generating, setGenerating] = useState(false)
  const [generatingImage, setGeneratingImage] = useState(false)

  const loadPosts = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/v1/posts')
      if (!res.ok) throw new Error('Gagal memuat posts')
      const data = await res.json()
      setPosts(data || [])
    } catch {
      toast.error('Gagal memuat daftar post')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadPosts()
  }, [loadPosts])

  function openCreate() {
    setEditingPost(null)
    setTitle(EMPTY_POST.title)
    setSummary(EMPTY_POST.summary)
    setContent(EMPTY_POST.content)
    setAuthor(EMPTY_POST.author)
    setPublished(EMPTY_POST.published)
    setImage(EMPTY_POST.image ?? '')
    setIdea('')
    setView('form')
  }

  function openEdit(post: Post) {
    setEditingPost(post)
    setTitle(post.title)
    setSummary(post.summary)
    setContent(post.content)
    setAuthor(post.author || 'Admin')
    setPublished(post.published)
    setImage(post.image || '')
    setIdea('')
    setView('form')
  }

  function openPreview(post: Post) {
    setEditingPost(post)
    setView('preview')
  }

  function cancelForm() {
    setView('list')
    setEditingPost(null)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) {
      toast.error('Judul tidak boleh kosong')
      return
    }
    setSaving(true)
    try {
      const payload = {
        title: title.trim(),
        summary: summary.trim(),
        content,
        author,
        published,
        image: image.trim() || null
      }
      const method = editingPost ? 'PUT' : 'POST'
      const url = editingPost ? `/api/v1/posts/${editingPost.slug}` : '/api/v1/posts'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Gagal menyimpan')
      }
      toast.success(editingPost ? 'Post berhasil diperbarui' : 'Post berhasil dibuat')
      await loadPosts()
      setView('list')
      setEditingPost(null)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Terjadi kesalahan')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(post: Post) {
    if (!confirm(`Hapus post "${post.title}"? Tindakan ini tidak bisa dibatalkan.`)) return
    try {
      const res = await fetch(`/api/v1/posts/${post.slug}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Gagal menghapus')
      toast.success('Post berhasil dihapus')
      setPosts(prev => prev.filter(p => p.id !== post.id))
    } catch {
      toast.error('Gagal menghapus post')
    }
  }

  async function handleGeneratePost() {
    const trimmedIdea = idea.trim()
    if (!trimmedIdea) {
      toast.error('Tulis ide blog dulu')
      return
    }
    setGenerating(true)
    try {
      const res = await fetch('/api/v1/posts/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea: trimmedIdea })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Gagal generate post')
      setTitle(data.title || '')
      setSummary(data.summary || '')
      setContent(data.content || '')
      toast.success('Konten berhasil dibuat AI (Gemini)')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Gagal generate post')
    } finally {
      setGenerating(false)
    }
  }

  async function handleGenerateImage() {
    if (!title.trim() && !idea.trim()) {
      toast.error('Isi judul atau ide dulu untuk generate gambar')
      return
    }
    setGeneratingImage(true)
    try {
      const res = await fetch('/api/v1/posts/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          idea: idea.trim() || summary.trim()
        })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Gagal generate image')
      if (data.image) {
        setImage(data.image)
        toast.success('Banner image berhasil dibuat (Pollinations)')
      } else {
        throw new Error('Response tidak mengandung URL gambar')
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Gagal generate image')
    } finally {
      setGeneratingImage(false)
    }
  }

  /**
   * Upload file banner ke endpoint `/api/v1/posts/upload`.
   * Dipakai oleh komponen DragDropImageUpload saat user drop/pilih file.
   */
  async function uploadBannerFile(file: File) {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      toast.error('Tipe file tidak didukung. Gunakan JPEG, PNG, GIF, atau WebP.')
      return
    }
    if (file.size > MAX_UPLOAD_SIZE_MB * 1024 * 1024) {
      toast.error(`Ukuran file terlalu besar. Maksimal ${MAX_UPLOAD_SIZE_MB}MB.`)
      return
    }
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/v1/posts/upload', {
        method: 'POST',
        body: formData
      })
      const data = await res.json()
      if (data.error) {
        toast.error(data.error)
      } else if (data.url) {
        setImage(data.url)
        toast.success('Banner berhasil diupload')
      } else {
        toast.error('Response upload tidak valid')
      }
    } catch {
      toast.error('Gagal upload banner')
    } finally {
      setUploading(false)
    }
  }

  async function handleTogglePublish(post: Post) {
    try {
      const res = await fetch(`/api/v1/posts/${post.slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ published: !post.published })
      })
      if (!res.ok) throw new Error()
      toast.success(post.published ? 'Post disembunyikan' : 'Post dipublikasikan')
      setPosts(prev => prev.map(p => (p.id === post.id ? { ...p, published: !post.published } : p)))
    } catch {
      toast.error('Gagal mengubah status')
    }
  }

  if (view === 'preview' && editingPost) {
    return (
      <div className='space-y-4'>
        <button
          type='button'
          onClick={() => setView('list')}
          className='inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground'
        >
          <ArrowLeftIcon /> Kembali ke daftar
        </button>
        <div className='rounded-xl border p-6'>
          <h2 className='title text-2xl font-bold'>{editingPost.title}</h2>
          {editingPost.summary && <p className='mt-2 text-muted-foreground'>{editingPost.summary}</p>}
          <p className='mt-1 text-xs text-muted-foreground'>
            {editingPost.author} · {editingPost.publishedAt}
          </p>
          <hr className='my-6' />
          <pre className='prose whitespace-pre-wrap font-sans text-sm dark:prose-invert'>
            {editingPost.content}
          </pre>
        </div>
      </div>
    )
  }

  if (view === 'form') {
    const uploadDisabled = uploading || saving || generating || generatingImage
    return (
      <form onSubmit={handleSave} className='space-y-5'>
        <div className='flex items-center justify-between'>
          <h2 className='text-lg font-semibold'>{editingPost ? 'Edit Post' : 'Buat Post Baru'}</h2>
          <button
            type='button'
            onClick={cancelForm}
            className='rounded-md p-1.5 hover:bg-accent'
            title='Batal'
          >
            <Cross2Icon className='h-4 w-4' />
          </button>
        </div>

        <div className='space-y-1.5'>
          <label className='text-sm font-medium'>
            Judul <span className='text-destructive'>*</span>
          </label>
          <Input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder='Masukkan judul post...'
            required
            autoFocus
          />
        </div>

        <div className='space-y-2 rounded-xl border bg-muted/20 p-4'>
          <div className='space-y-1.5'>
            <label className='text-sm font-medium'>Generate Konten dengan AI (Gemini Text)</label>
            <textarea
              value={idea}
              onChange={e => setIdea(e.target.value)}
              placeholder='Tulis ide blog, misalnya: cara membuat portfolio Next.js dengan Supabase...'
              rows={3}
              disabled={generating || saving || generatingImage}
              className='w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50'
            />
          </div>
          <div className='flex flex-wrap items-center justify-between gap-2'>
            <p className='text-xs text-muted-foreground'>
              Hasil AI akan mengisi judul, deskripsi, dan konten (tanpa gambar).
            </p>
            <Button
              type='button'
              variant='outline'
              onClick={handleGeneratePost}
              disabled={generating || saving || generatingImage}
              className='gap-2'
            >
              {generating ? (
                <>
                  <span className='h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent' />
                  Generate...
                </>
              ) : (
                <>
                  <LightningBoltIcon />
                  Generate Konten
                </>
              )}
            </Button>
          </div>
        </div>

        <div className='space-y-1.5'>
          <label className='text-sm font-medium'>
            Deskripsi Singkat
            <span className='ml-1 text-xs text-muted-foreground'>(opsional)</span>
          </label>
          <Input
            value={summary}
            onChange={e => setSummary(e.target.value)}
            placeholder='Ringkasan singkat yang muncul di daftar post...'
          />
        </div>

        <div className='space-y-2 rounded-xl border bg-muted/20 p-4'>
          <div className='flex flex-wrap items-center justify-between gap-2'>
            <label className='text-sm font-medium'>Banner Image</label>
            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={handleGenerateImage}
              disabled={generatingImage || saving || generating || uploading}
              className='gap-2'
            >
              {generatingImage ? (
                <>
                  <span className='h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent' />
                  Generating...
                </>
              ) : (
                <>
                  <ImageIcon />
                  Generate Image
                </>
              )}
            </Button>
          </div>
          <p className='text-xs text-muted-foreground'>
            Drag & drop gambar, klik area di bawah, atau gunakan URL. Maks {MAX_UPLOAD_SIZE_MB}MB (JPEG/PNG/GIF/WebP).
          </p>
          <Input
            value={image}
            onChange={e => setImage(e.target.value)}
            placeholder='URL gambar banner (opsional)...'
          />
          <DragDropImageUpload
            onImageSelect={uploadBannerFile}
            currentImageUrl={image}
            disabled={uploadDisabled}
            maxSizeMB={MAX_UPLOAD_SIZE_MB}
          />
        </div>

        <div className='space-y-1.5'>
          <label className='text-sm font-medium'>
            Konten (Markdown)
          </label>
          <MarkdownEditor value={content} onChange={setContent} />
        </div>

        <div className='space-y-1.5'>
          <label className='text-sm font-medium'>Author</label>
          <Input
            value={author}
            onChange={e => setAuthor(e.target.value)}
            placeholder='Nama author...'
          />
        </div>

        <div className='flex items-center gap-2'>
          <input
            id='published'
            type='checkbox'
            checked={published}
            onChange={e => setPublished(e.target.checked)}
            className='h-4 w-4 rounded border-input text-primary focus:ring-primary'
          />
          <label htmlFor='published' className='text-sm font-medium'>
            Publikasikan post
          </label>
        </div>

        <div className='flex items-center justify-end gap-2 border-t pt-4'>
          <Button
            type='button'
            variant='outline'
            onClick={cancelForm}
            disabled={saving}
          >
            Batal
          </Button>
          <Button type='submit' disabled={saving || uploading || generating || generatingImage}>
            {saving ? 'Menyimpan...' : editingPost ? 'Perbarui Post' : 'Buat Post'}
          </Button>
        </div>
      </form>
    )
  }

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <h2 className='text-lg font-semibold'>Daftar Post</h2>
        <Button onClick={openCreate} className='gap-2'>
          <PlusIcon />
          Post Baru
        </Button>
      </div>

      {loading ? (
        <p className='text-sm text-muted-foreground'>Memuat post...</p>
      ) : posts.length === 0 ? (
        <p className='text-sm text-muted-foreground'>Belum ada post.</p>
      ) : (
        <ul className='space-y-2'>
          {posts.map(post => (
            <li
              key={post.id}
              className='flex items-center justify-between rounded-md border p-3'
            >
              <div className='min-w-0 flex-1'>
                <p className='truncate font-medium'>{post.title}</p>
                <p className='text-xs text-muted-foreground'>
                  {post.author} · {post.publishedAt} ·{' '}
                  {post.published ? 'Dipublikasikan' : 'Draft'}
                </p>
              </div>
              <div className='flex items-center gap-1'>
                <Button
                  type='button'
                  variant='ghost'
                  size='icon'
                  onClick={() => openPreview(post)}
                  title='Preview'
                >
                  <EyeOpenIcon className='h-4 w-4' />
                </Button>
                <Button
                  type='button'
                  variant='ghost'
                  size='icon'
                  onClick={() => openEdit(post)}
                  title='Edit'
                >
                  <Pencil1Icon className='h-4 w-4' />
                </Button>
                <Button
                  type='button'
                  variant='ghost'
                  size='icon'
                  onClick={() => handleTogglePublish(post)}
                  title={post.published ? 'Sembunyikan' : 'Publikasikan'}
                >
                  {post.published ? 'Unpublish' : 'Publish'}
                </Button>
                <Button
                  type='button'
                  variant='ghost'
                  size='icon'
                  onClick={() => handleDelete(post)}
                  title='Hapus'
                >
                  <TrashIcon className='h-4 w-4' />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
