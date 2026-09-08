'use client'

import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import MarkdownEditor from '@/components/markdown-editor'
import DragDropImageUpload from '@/components/drag-drop-image-upload'
import Markdown from 'react-markdown'
import { toast } from 'sonner'
import {
  FileText,
  Plus,
  Search,
  Pencil,
  Trash2,
  Eye,
  X,
  Sparkles,
  Image as ImageIcon,
  ArrowLeft,
  ExternalLink,
  Calendar,
  User,
  CheckCircle2,
  Globe,
  RefreshCw,
  FileEdit,
  Clock,
  BookOpen,
  Filter,
  Check
} from 'lucide-react'

export type Post = {
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
  author: 'Nanda Safiq',
  published: true,
  image: ''
}

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
const MAX_UPLOAD_SIZE_MB = 5

function formatDateIndo(dateStr?: string): string {
  if (!dateStr) return '-'
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return dateStr
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  } catch {
    return dateStr
  }
}

function calculateReadingTime(content: string): number {
  if (!content) return 1
  const wordCount = content.trim().split(/\s+/).length
  return Math.max(1, Math.ceil(wordCount / 200))
}

async function safeJson(res: Response): Promise<Record<string, unknown>> {
  const contentType = res.headers.get('content-type') || ''
  if (!contentType.includes('application/json')) {
    const text = await res.text().catch(() => '')
    return {
      __nonJson: true,
      status: res.status,
      error: `Server mengembalikan respons non-JSON (status ${res.status}). ${text.slice(0, 120)}`.trim()
    }
  }
  try {
    return (await res.json()) as Record<string, unknown>
  } catch {
    return { error: `Gagal parse JSON dari server (status ${res.status})` }
  }
}

export default function CrudPosts() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [view, setView] = useState<View>('list')
  const [editingPost, setEditingPost] = useState<Post | null>(null)

  // Filters & search
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all')

  // Form states
  const [title, setTitle] = useState('')
  const [summary, setSummary] = useState('')
  const [content, setContent] = useState('')
  const [author, setAuthor] = useState('Nanda Safiq')
  const [published, setPublished] = useState(true)
  const [image, setImage] = useState('')
  const [uploading, setUploading] = useState(false)
  const [idea, setIdea] = useState('')
  const [generating, setGenerating] = useState(false)
  const [generatingImage, setGeneratingImage] = useState(false)

  const loadPosts = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/v1/posts?includeDrafts=true')
      if (!res.ok) throw new Error('Gagal memuat posts')
      const data = await res.json()
      setPosts(Array.isArray(data) ? data : [])
    } catch {
      toast.error('Gagal memuat daftar post')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadPosts()
  }, [loadPosts])

  // Stats calculation
  const stats = useMemo(() => {
    const total = posts.length
    const publishedCount = posts.filter(p => p.published).length
    const draftCount = posts.filter(p => !p.published).length
    return { total, publishedCount, draftCount }
  }, [posts])

  // Filtered posts
  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      const matchStatus =
        statusFilter === 'all'
          ? true
          : statusFilter === 'published'
          ? post.published
          : !post.published

      const query = searchQuery.toLowerCase().trim()
      const matchQuery =
        !query ||
        post.title.toLowerCase().includes(query) ||
        (post.summary && post.summary.toLowerCase().includes(query)) ||
        (post.author && post.author.toLowerCase().includes(query)) ||
        post.slug.toLowerCase().includes(query)

      return matchStatus && matchQuery
    })
  }, [posts, statusFilter, searchQuery])

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
    setSummary(post.summary || '')
    setContent(post.content || '')
    setAuthor(post.author || 'Nanda Safiq')
    setPublished(Boolean(post.published))
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
      toast.error('Judul artikel tidak boleh kosong')
      return
    }
    setSaving(true)
    try {
      const payload = {
        title: title.trim(),
        summary: summary.trim(),
        content,
        author: author.trim() || 'Nanda Safiq',
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
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Gagal menyimpan artikel')
      }
      toast.success(editingPost ? 'Artikel berhasil diperbarui' : 'Artikel baru berhasil dibuat')
      await loadPosts()
      setView('list')
      setEditingPost(null)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Terjadi kesalahan saat menyimpan')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(post: Post) {
    if (!confirm(`Apakah Anda yakin ingin menghapus artikel "${post.title}"? Tindakan ini tidak bisa dibatalkan.`)) return
    try {
      const res = await fetch(`/api/v1/posts/${post.slug}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Gagal menghapus')
      toast.success('Artikel berhasil dihapus')
      setPosts(prev => prev.filter(p => p.id !== post.id))
    } catch {
      toast.error('Gagal menghapus artikel')
    }
  }

  async function handleGeneratePost() {
    const trimmedIdea = idea.trim()
    if (!trimmedIdea) {
      toast.error('Tuliskan ide atau topik artikel terlebih dahulu')
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
      if (!res.ok) throw new Error(data.error || 'Gagal generate artikel')
      if (data.title) setTitle(data.title)
      if (data.summary) setSummary(data.summary)
      if (data.content) setContent(data.content)
      toast.success('Draf artikel berhasil dibuat oleh Gemini AI!')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Gagal generate artikel')
    } finally {
      setGenerating(false)
    }
  }

  async function handleGenerateImage() {
    if (!title.trim() && !idea.trim()) {
      toast.error('Isi judul atau ide terlebih dahulu untuk membuat banner')
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
      const data = await safeJson(res)
      if (!res.ok) {
        throw new Error(typeof data.error === 'string' ? data.error : 'Gagal membuat gambar banner')
      }
      if (typeof data.image === 'string' && data.image) {
        setImage(data.image)
        toast.success('Banner gambar berhasil digenerate!')
      } else {
        throw new Error('Respons tidak mengandung URL gambar')
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Gagal generate banner')
    } finally {
      setGeneratingImage(false)
    }
  }

  async function uploadBannerFile(file: File) {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      toast.error('Tipe file tidak didukung. Gunakan format JPEG, PNG, GIF, atau WebP.')
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
        toast.success('Gambar banner berhasil diupload!')
      } else {
        toast.error('Respons upload tidak valid')
      }
    } catch {
      toast.error('Gagal mengunggah banner')
    } finally {
      setUploading(false)
    }
  }

  async function handleTogglePublish(post: Post) {
    try {
      const nextStatus = !post.published
      const res = await fetch(`/api/v1/posts/${post.slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ published: nextStatus })
      })
      if (!res.ok) throw new Error()
      toast.success(nextStatus ? 'Artikel berhasil dipublikasikan' : 'Artikel diubah menjadi draft')
      setPosts(prev => prev.map(p => (p.id === post.id ? { ...p, published: nextStatus } : p)))
    } catch {
      toast.error('Gagal memperbarui status artikel')
    }
  }

  // ----------------------------------------------------
  // PREVIEW VIEW
  // ----------------------------------------------------
  if (view === 'preview' && editingPost) {
    const readingTime = calculateReadingTime(editingPost.content)
    return (
      <div className='space-y-6'>
        {/* Top bar navigation */}
        <div className='flex items-center justify-between border-b border-border/80 pb-4'>
          <Button
            type='button'
            variant='ghost'
            onClick={() => setView('list')}
            className='gap-2 rounded-xl text-xs font-medium text-muted-foreground hover:text-foreground'
          >
            <ArrowLeft className='h-4 w-4' /> Kembali ke Daftar Artikel
          </Button>

          <div className='flex items-center gap-2'>
            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={() => openEdit(editingPost)}
              className='gap-1.5 rounded-xl text-xs font-medium'
            >
              <Pencil className='h-3.5 w-3.5' /> Edit Artikel
            </Button>
            <a
              href={`/posts/${editingPost.slug}`}
              target='_blank'
              rel='noopener noreferrer'
              className='inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-2xs hover:bg-primary/90'
            >
              <ExternalLink className='h-3.5 w-3.5' /> Buka di Blog
            </a>
          </div>
        </div>

        {/* Article Preview Card */}
        <div className='rounded-2xl border border-border/80 bg-card p-6 shadow-xs sm:p-8'>
          {/* Banner Image */}
          {editingPost.image && (
            <div className='mb-6 overflow-hidden rounded-xl border border-border/60'>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={editingPost.image}
                alt={editingPost.title}
                className='h-64 w-full object-cover sm:h-80'
                onError={e => {
                  e.currentTarget.style.display = 'none'
                }}
              />
            </div>
          )}

          {/* Meta Info */}
          <div className='flex flex-wrap items-center gap-2 mb-3'>
            {editingPost.published ? (
              <span className='inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400'>
                <span className='h-1.5 w-1.5 rounded-full bg-emerald-500' />
                Dipublikasikan
              </span>
            ) : (
              <span className='inline-flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-600 dark:text-amber-400'>
                <span className='h-1.5 w-1.5 rounded-full bg-amber-500' />
                Draft / Konsep
              </span>
            )}
            <span className='inline-flex items-center gap-1 text-xs text-muted-foreground'>
              <Calendar className='h-3.5 w-3.5' /> {formatDateIndo(editingPost.publishedAt)}
            </span>
            <span>•</span>
            <span className='inline-flex items-center gap-1 text-xs text-muted-foreground'>
              <User className='h-3.5 w-3.5' /> {editingPost.author || 'Admin'}
            </span>
            <span>•</span>
            <span className='inline-flex items-center gap-1 text-xs text-muted-foreground'>
              <Clock className='h-3.5 w-3.5' /> {readingTime} menit baca
            </span>
          </div>

          <h1 className='text-2xl font-bold tracking-tight text-foreground sm:text-3xl'>
            {editingPost.title}
          </h1>

          {editingPost.summary && (
            <div className='mt-3 rounded-xl border border-primary/20 bg-primary/5 p-3.5 text-xs sm:text-sm text-foreground/80 leading-relaxed'>
              <span className='font-semibold text-primary block mb-0.5'>Ringkasan:</span>
              {editingPost.summary}
            </div>
          )}

          <hr className='my-6 border-border/80' />

          {/* Markdown Content */}
          <div className='prose prose-sm sm:prose-base dark:prose-invert max-w-none leading-relaxed'>
            <Markdown>{editingPost.content || '*Belum ada konten tulisan.*'}</Markdown>
          </div>
        </div>
      </div>
    )
  }

  // ----------------------------------------------------
  // FORM VIEW (CREATE / EDIT)
  // ----------------------------------------------------
  if (view === 'form') {
    const uploadDisabled = uploading || saving || generating || generatingImage
    return (
      <form onSubmit={handleSave} className='space-y-6'>
        {/* Header */}
        <div className='flex items-center justify-between border-b border-border/80 pb-4'>
          <div className='flex items-center gap-3'>
            <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary'>
              {editingPost ? <Pencil className='h-5 w-5' /> : <Plus className='h-5 w-5' />}
            </div>
            <div>
              <h2 className='text-lg font-bold text-foreground'>
                {editingPost ? 'Edit Artikel Blog' : 'Tulis Artikel Blog Baru'}
              </h2>
              <p className='text-xs text-muted-foreground'>
                Format konten mendukung Markdown, gambar banner, dan asisten teks AI Gemini.
              </p>
            </div>
          </div>

          <Button
            type='button'
            variant='ghost'
            size='sm'
            onClick={cancelForm}
            className='gap-1 rounded-xl text-xs text-muted-foreground hover:text-foreground'
          >
            <X className='h-4 w-4' /> Batal
          </Button>
        </div>

        {/* Section 1: Main Title & Slug info */}
        <div className='rounded-2xl border border-border/80 bg-card p-5 space-y-4 shadow-2xs'>
          <div className='space-y-1.5'>
            <label className='text-xs font-semibold text-foreground flex items-center justify-between'>
              <span>Judul Artikel <span className='text-destructive'>*</span></span>
              {editingPost && (
                <span className='font-mono font-normal text-[0.7rem] text-muted-foreground'>
                  Slug: {editingPost.slug}
                </span>
              )}
            </label>
            <Input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder='Contoh: Panduan Membangun Website Cepat dengan Next.js & Supabase'
              required
              autoFocus
              className='h-10 rounded-xl text-sm font-medium'
            />
          </div>

          <div className='grid gap-4 sm:grid-cols-2'>
            <div className='space-y-1.5'>
              <label className='text-xs font-semibold text-foreground flex items-center gap-1.5'>
                <User className='h-3.5 w-3.5 text-muted-foreground' />
                Nama Penulis / Author
              </label>
              <Input
                value={author}
                onChange={e => setAuthor(e.target.value)}
                placeholder='Nanda Safiq'
                className='h-9 rounded-xl text-xs'
              />
            </div>

            <div className='space-y-1.5'>
              <label className='text-xs font-semibold text-foreground flex items-center gap-1.5'>
                <Globe className='h-3.5 w-3.5 text-muted-foreground' />
                Status Publikasi
              </label>
              <div className='flex items-center h-9 rounded-xl border border-border/80 bg-muted/30 px-3'>
                <label className='flex items-center gap-2 cursor-pointer text-xs font-medium text-foreground w-full'>
                  <input
                    type='checkbox'
                    checked={published}
                    onChange={e => setPublished(e.target.checked)}
                    className='h-4 w-4 rounded border-border text-primary focus:ring-primary'
                  />
                  <span>{published ? 'Publikasikan ke Blog (Online)' : 'Simpan sebagai Draft (Hanya Admin)'}</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: AI Gemini Content Generator */}
        <div className='rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-card to-card p-5 space-y-3 shadow-2xs'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <div className='flex h-7 w-7 items-center justify-center rounded-lg bg-primary/20 text-primary'>
                <Sparkles className='h-4 w-4' />
              </div>
              <h4 className='text-xs font-bold text-foreground uppercase tracking-wider'>
                Asisten AI Gemini — Pembuat Draf Artikel
              </h4>
            </div>
            <span className='rounded-full bg-primary/10 px-2 py-0.5 text-[0.68rem] font-semibold text-primary'>
              Free Tier AI
            </span>
          </div>

          <p className='text-xs text-muted-foreground'>
            Tulis ide atau topik utama artikel. Gemini AI akan otomatis merumuskan judul terstruktur, ringkasan, dan draf lengkap konten artikel dalam format Markdown.
          </p>

          <Textarea
            value={idea}
            onChange={e => setIdea(e.target.value)}
            placeholder='Tulis ide artikel, misalnya: "Tutorial langkah demi langkah setup Next.js 14 App Router dengan Tailwind CSS, optimasi SEO, dan deployment ke Cloud Run"'
            rows={2}
            disabled={generating || saving || generatingImage}
            className='rounded-xl text-xs resize-y bg-background'
          />

          <div className='flex items-center justify-end'>
            <Button
              type='button'
              size='sm'
              onClick={handleGeneratePost}
              disabled={generating || saving || generatingImage || !idea.trim()}
              className='gap-2 rounded-xl text-xs font-semibold'
            >
              {generating ? (
                <>
                  <RefreshCw className='h-3.5 w-3.5 animate-spin' />
                  <span>Meracik Konten dengan AI...</span>
                </>
              ) : (
                <>
                  <Sparkles className='h-3.5 w-3.5' />
                  <span>Buat Draf dengan AI</span>
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Section 3: Banner Image */}
        <div className='rounded-2xl border border-border/80 bg-card p-5 space-y-4 shadow-2xs'>
          <div className='flex flex-wrap items-center justify-between gap-2'>
            <div>
              <h4 className='text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5'>
                <ImageIcon className='h-3.5 w-3.5 text-primary' />
                Gambar Banner Artikel
              </h4>
              <p className='text-xs text-muted-foreground mt-0.5'>
                Unggah file gambar (maks {MAX_UPLOAD_SIZE_MB}MB), generate via AI, atau masukkan link URL langsung.
              </p>
            </div>

            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={handleGenerateImage}
              disabled={generatingImage || saving || generating || uploading || (!title.trim() && !idea.trim())}
              className='gap-1.5 rounded-xl text-xs font-medium'
            >
              {generatingImage ? (
                <>
                  <RefreshCw className='h-3.5 w-3.5 animate-spin' />
                  <span>Membuat Gambar...</span>
                </>
              ) : (
                <>
                  <Sparkles className='h-3.5 w-3.5 text-primary' />
                  <span>AI Image (Pollinations)</span>
                </>
              )}
            </Button>
          </div>

          <div className='space-y-2'>
            <Input
              value={image}
              onChange={e => setImage(e.target.value)}
              placeholder='https://images.unsplash.com/... atau gunakan upload di bawah'
              className='h-9 rounded-xl text-xs font-mono'
            />
          </div>

          <DragDropImageUpload
            onImageSelect={uploadBannerFile}
            currentImageUrl={image}
            disabled={uploadDisabled}
            maxSizeMB={MAX_UPLOAD_SIZE_MB}
          />
        </div>

        {/* Section 4: Ringkasan Singkat (Summary) */}
        <div className='rounded-2xl border border-border/80 bg-card p-5 space-y-2 shadow-2xs'>
          <label className='text-xs font-semibold text-foreground flex items-center justify-between'>
            <span>Deskripsi Singkat / Ringkasan (Excerpt)</span>
            <span className='text-[0.7rem] font-normal text-muted-foreground'>
              Ditampilkan pada kartu preview blog
            </span>
          </label>
          <Textarea
            value={summary}
            onChange={e => setSummary(e.target.value)}
            placeholder='Ringkasan 1-2 kalimat mengenai isi utama tulisan blog ini...'
            rows={2}
            className='rounded-xl text-xs'
          />
        </div>

        {/* Section 5: Konten Markdown */}
        <div className='rounded-2xl border border-border/80 bg-card p-5 space-y-3 shadow-2xs'>
          <div className='flex items-center justify-between'>
            <label className='text-xs font-semibold text-foreground flex items-center gap-1.5'>
              <BookOpen className='h-3.5 w-3.5 text-primary' />
              Konten Lengkap Artikel (Markdown / MDX)
            </label>
            <span className='text-[0.7rem] text-muted-foreground'>
              Mendukung Heading, List, Bold, Kode, & Gambar
            </span>
          </div>
          <MarkdownEditor value={content} onChange={setContent} />
        </div>

        {/* Action Buttons */}
        <div className='flex items-center justify-end gap-3 border-t border-border/80 pt-4'>
          <Button
            type='button'
            variant='outline'
            onClick={cancelForm}
            disabled={saving}
            className='rounded-xl text-xs font-medium px-4'
          >
            Batal
          </Button>
          <Button
            type='submit'
            disabled={saving || uploading || generating || generatingImage}
            className='gap-2 rounded-xl text-xs font-semibold px-5'
          >
            {saving ? (
              <>
                <RefreshCw className='h-3.5 w-3.5 animate-spin' />
                <span>Menyimpan...</span>
              </>
            ) : (
              <>
                <Check className='h-4 w-4' />
                <span>{editingPost ? 'Simpan Perubahan' : 'Buat Artikel Sekarang'}</span>
              </>
            )}
          </Button>
        </div>
      </form>
    )
  }

  // ----------------------------------------------------
  // LIST VIEW (DEFAULT)
  // ----------------------------------------------------
  return (
    <div className='space-y-6'>
      {/* Header Bar */}
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div className='flex items-center gap-3'>
          <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary'>
            <FileText className='h-5 w-5' />
          </div>
          <div>
            <div className='flex items-center gap-2'>
              <h3 className='text-lg font-bold text-foreground'>Manajemen Artikel & Blog</h3>
              <span className='rounded-md bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary'>
                {posts.length} Post
              </span>
            </div>
            <p className='text-xs text-muted-foreground mt-0.5'>
              Tulis, kelola, publikasikan artikel blog berformat MDX, dan generate konten AI.
            </p>
          </div>
        </div>

        <div className='flex items-center gap-2'>
          <a
            href='/posts'
            target='_blank'
            rel='noopener noreferrer'
            className='inline-flex items-center gap-1.5 rounded-xl border border-border/80 bg-background px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground'
          >
            <ExternalLink className='h-3.5 w-3.5' />
            <span>Kunjungi Blog</span>
          </a>
          <Button onClick={openCreate} className='gap-1.5 rounded-xl text-xs font-semibold'>
            <Plus className='h-4 w-4' />
            <span>Tulis Artikel Baru</span>
          </Button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className='grid gap-3 sm:grid-cols-3'>
        <div className='flex items-center justify-between rounded-2xl border border-border/80 bg-card p-4 shadow-2xs'>
          <div>
            <span className='text-[0.7rem] uppercase tracking-wider font-semibold text-muted-foreground'>
              Total Artikel
            </span>
            <h4 className='text-2xl font-extrabold text-foreground mt-0.5'>{stats.total}</h4>
          </div>
          <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary'>
            <FileText className='h-5 w-5' />
          </div>
        </div>

        <div className='flex items-center justify-between rounded-2xl border border-border/80 bg-card p-4 shadow-2xs'>
          <div>
            <span className='text-[0.7rem] uppercase tracking-wider font-semibold text-muted-foreground'>
              Dipublikasikan
            </span>
            <h4 className='text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5'>
              {stats.publishedCount}
            </h4>
          </div>
          <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500'>
            <CheckCircle2 className='h-5 w-5' />
          </div>
        </div>

        <div className='flex items-center justify-between rounded-2xl border border-border/80 bg-card p-4 shadow-2xs'>
          <div>
            <span className='text-[0.7rem] uppercase tracking-wider font-semibold text-muted-foreground'>
              Draft / Konsep
            </span>
            <h4 className='text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-0.5'>
              {stats.draftCount}
            </h4>
          </div>
          <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500'>
            <FileEdit className='h-5 w-5' />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <div className='relative flex-1 max-w-md'>
          <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
          <Input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder='Cari judul, ringkasan, atau nama penulis...'
            className='h-9 rounded-xl pl-9 pr-8 text-xs'
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className='absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground'
            >
              <X className='h-3.5 w-3.5' />
            </button>
          )}
        </div>

        <div className='flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0'>
          <button
            type='button'
            onClick={() => setStatusFilter('all')}
            className={`inline-flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-medium transition-all ${
              statusFilter === 'all'
                ? 'bg-primary text-primary-foreground shadow-2xs'
                : 'border border-border/80 bg-card text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            <span>Semua</span>
            <span className='ml-1 rounded-full bg-black/10 dark:bg-white/10 px-1.5 py-0.2 text-[0.65rem] font-bold'>
              {stats.total}
            </span>
          </button>

          <button
            type='button'
            onClick={() => setStatusFilter('published')}
            className={`inline-flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-medium transition-all ${
              statusFilter === 'published'
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'border border-border/80 bg-card text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            <span className='h-1.5 w-1.5 rounded-full bg-emerald-400' />
            <span>Dipublikasikan</span>
            <span className='ml-1 rounded-full bg-black/10 dark:bg-white/10 px-1.5 py-0.2 text-[0.65rem] font-bold'>
              {stats.publishedCount}
            </span>
          </button>

          <button
            type='button'
            onClick={() => setStatusFilter('draft')}
            className={`inline-flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-medium transition-all ${
              statusFilter === 'draft'
                ? 'bg-amber-600 text-white shadow-2xs'
                : 'border border-border/80 bg-card text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            <span className='h-1.5 w-1.5 rounded-full bg-amber-400' />
            <span>Draft</span>
            <span className='ml-1 rounded-full bg-black/10 dark:bg-white/10 px-1.5 py-0.2 text-[0.65rem] font-bold'>
              {stats.draftCount}
            </span>
          </button>
        </div>
      </div>

      {/* Post Items */}
      {loading ? (
        <div className='flex flex-col items-center justify-center rounded-2xl border border-border/80 bg-card p-12 text-center'>
          <RefreshCw className='h-6 w-6 animate-spin text-primary' />
          <p className='mt-3 text-xs text-muted-foreground'>Memuat data artikel blog...</p>
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className='flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 bg-card/50 p-12 text-center'>
          <div className='flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground'>
            <FileText className='h-6 w-6 opacity-60' />
          </div>
          <h5 className='mt-3 text-sm font-semibold text-foreground'>
            {searchQuery || statusFilter !== 'all'
              ? 'Tidak ada artikel yang cocok'
              : 'Belum Ada Artikel Blog'}
          </h5>
          <p className='mt-1 max-w-sm text-xs text-muted-foreground'>
            {searchQuery || statusFilter !== 'all'
              ? 'Sesuaikan kata kunci pencarian atau ganti filter status publikasi.'
              : 'Mulai buat artikel blog pertama Anda dengan menekan tombol Tulis Artikel Baru di atas.'}
          </p>
          {searchQuery && (
            <Button
              variant='outline'
              size='sm'
              onClick={() => setSearchQuery('')}
              className='mt-3 h-8 rounded-xl text-xs'
            >
              Reset Pencarian
            </Button>
          )}
        </div>
      ) : (
        <div className='grid gap-3'>
          {filteredPosts.map(post => {
            const readingTime = calculateReadingTime(post.content)
            return (
              <div
                key={post.id}
                className='group relative flex flex-col gap-4 rounded-2xl border border-border/80 bg-card/70 p-4 transition-all duration-200 hover:border-primary/40 hover:bg-card hover:shadow-xs sm:flex-row sm:items-center sm:justify-between'
              >
                {/* Left: Thumbnail & Main Info */}
                <div className='flex items-start gap-3.5 min-w-0 flex-1'>
                  {post.image ? (
                    <div className='relative h-14 w-14 sm:h-16 sm:w-16 shrink-0 overflow-hidden rounded-xl border border-border/80 bg-muted'>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={post.image}
                        alt={post.title}
                        className='h-full w-full object-cover transition-transform duration-300 group-hover:scale-105'
                        onError={e => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                    </div>
                  ) : (
                    <div className='flex h-14 w-14 sm:h-16 sm:w-16 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary'>
                      <FileText className='h-6 w-6 opacity-80' />
                    </div>
                  )}

                  <div className='min-w-0 flex-1 space-y-1'>
                    <div className='flex flex-wrap items-center gap-2'>
                      <h4
                        onClick={() => openPreview(post)}
                        className='font-bold text-sm sm:text-base text-foreground tracking-tight hover:text-primary transition-colors cursor-pointer truncate max-w-md'
                        title={post.title}
                      >
                        {post.title}
                      </h4>

                      {post.published ? (
                        <span className='inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[0.68rem] font-semibold text-emerald-600 dark:text-emerald-400'>
                          <span className='h-1.5 w-1.5 rounded-full bg-emerald-500' />
                          Dipublikasikan
                        </span>
                      ) : (
                        <span className='inline-flex items-center gap-1 rounded-full border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-[0.68rem] font-semibold text-amber-600 dark:text-amber-400'>
                          <span className='h-1.5 w-1.5 rounded-full bg-amber-500' />
                          Draft
                        </span>
                      )}
                    </div>

                    {post.summary && (
                      <p className='text-xs text-muted-foreground line-clamp-1 max-w-xl'>
                        {post.summary}
                      </p>
                    )}

                    <div className='flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[0.72rem] text-muted-foreground'>
                      <span className='flex items-center gap-1'>
                        <User className='h-3 w-3' /> {post.author || 'Admin'}
                      </span>
                      <span>•</span>
                      <span className='flex items-center gap-1'>
                        <Calendar className='h-3 w-3' /> {formatDateIndo(post.publishedAt)}
                      </span>
                      <span>•</span>
                      <span className='flex items-center gap-1'>
                        <Clock className='h-3 w-3' /> {readingTime} mnt
                      </span>
                      <span className='hidden md:inline'>•</span>
                      <span className='hidden md:inline font-mono text-[0.68rem] opacity-75'>
                        /posts/{post.slug}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className='flex items-center gap-1.5 shrink-0 border-t border-border/60 pt-3 sm:border-t-0 sm:pt-0 justify-end'>
                  <Button
                    size='sm'
                    variant='outline'
                    onClick={() => openPreview(post)}
                    className='h-8 gap-1 rounded-xl text-xs font-medium'
                    title='Pratinjau Artikel'
                  >
                    <Eye className='h-3.5 w-3.5' />
                    <span className='hidden md:inline'>Pratinjau</span>
                  </Button>

                  <a
                    href={`/posts/${post.slug}`}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='inline-flex h-8 items-center gap-1 rounded-xl border border-border/80 bg-background px-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground'
                    title='Buka di Halaman Web'
                  >
                    <ExternalLink className='h-3.5 w-3.5' />
                    <span className='hidden lg:inline'>Web</span>
                  </a>

                  <Button
                    size='sm'
                    variant='outline'
                    onClick={() => openEdit(post)}
                    className='h-8 gap-1 rounded-xl text-xs font-medium'
                    title='Edit Artikel'
                  >
                    <Pencil className='h-3.5 w-3.5' />
                    <span className='hidden md:inline'>Edit</span>
                  </Button>

                  <Button
                    size='sm'
                    variant='outline'
                    onClick={() => handleTogglePublish(post)}
                    className={`h-8 gap-1 rounded-xl text-xs font-medium ${
                      post.published
                        ? 'text-amber-600 hover:text-amber-700 dark:text-amber-400'
                        : 'text-emerald-600 hover:text-emerald-700 dark:text-emerald-400'
                    }`}
                    title={post.published ? 'Ubah jadi Draft' : 'Publikasikan Sekarang'}
                  >
                    {post.published ? (
                      <>
                        <FileEdit className='h-3.5 w-3.5' />
                        <span className='hidden lg:inline'>Unpublish</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className='h-3.5 w-3.5' />
                        <span className='hidden lg:inline'>Publish</span>
                      </>
                    )}
                  </Button>

                  <Button
                    size='sm'
                    variant='ghost'
                    onClick={() => handleDelete(post)}
                    className='h-8 w-8 p-0 rounded-xl text-destructive hover:bg-destructive/10 hover:text-destructive'
                    title='Hapus Artikel'
                  >
                    <Trash2 className='h-3.5 w-3.5' />
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
