'use client'

import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import {
  Plus,
  Pencil,
  Trash2,
  Download,
  Eye,
  Check,
  X,
  Search,
  Receipt,
  Building,
  Mail,
  Calendar,
  DollarSign,
  FileText,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  RotateCcw,
  Sparkles
} from 'lucide-react'

type Invoice = {
  id: number
  invoice_number: string
  client_name: string
  client_email: string
  client_address: string | null
  issue_date: string
  due_date: string
  items: Array<{
    description: string
    quantity: number
    unit_price: number
  }>
  subtotal: number
  tax_rate: number
  tax_amount: number
  total: number
  notes: string | null
  status: string
  created_at: string
  updated_at: string
}

type View = 'list' | 'form'

const EMPTY_ITEM = {
  description: '',
  quantity: 1,
  unit_price: 0
}

const INITIAL_FORM = {
  client_name: '',
  client_email: '',
  client_address: '',
  issue_date: '',
  due_date: '',
  items: [{ ...EMPTY_ITEM }],
  subtotal: 0,
  tax_rate: 0,
  tax_amount: 0,
  total: 0,
  notes: '',
  status: 'pending'
}

function formatRupiah(val: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(val || 0)
}

function formatDateIndo(dateStr: string) {
  if (!dateStr) return '-'
  try {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  } catch {
    return dateStr
  }
}

export default function CrudInvoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(false)
  const [generatingId, setGeneratingId] = useState<number | null>(null)
  const [view, setView] = useState<View>('list')
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null)
  const [form, setForm] = useState(INITIAL_FORM)

  // Filter & Search
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'pending' | 'cancelled'>('all')

  // Live PDF preview state
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null)
  const [previewPdfUrl, setPreviewPdfUrl] = useState<string | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)

  const loadInvoices = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/v1/invoices')
      if (!res.ok) throw new Error('Gagal memuat invoices')
      const data = await res.json()
      setInvoices(data.invoices || [])
    } catch {
      toast.error('Gagal memuat daftar invoice')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadInvoices()
  }, [loadInvoices])

  // Stats calculation
  const stats = useMemo(() => {
    const totalCount = invoices.length
    const paidInvoices = invoices.filter(i => i.status === 'paid')
    const pendingInvoices = invoices.filter(i => i.status === 'pending')
    const cancelledInvoices = invoices.filter(i => i.status === 'cancelled')

    const getInvoiceAmount = (inv: Invoice) => {
      if (inv.total && inv.total > 0) return inv.total
      const subtotal = (inv.items || []).reduce((s, it) => s + (Number(it.quantity) || 0) * (Number(it.unit_price) || 0), 0)
      const taxRate = Number(inv.tax_rate) || 0
      return subtotal + (subtotal * taxRate) / 100
    }

    const totalPaidAmount = paidInvoices.reduce((acc, curr) => acc + getInvoiceAmount(curr), 0)
    const totalPendingAmount = pendingInvoices.reduce((acc, curr) => acc + getInvoiceAmount(curr), 0)

    return {
      totalCount,
      paidCount: paidInvoices.length,
      pendingCount: pendingInvoices.length,
      cancelledCount: cancelledInvoices.length,
      totalPaidAmount,
      totalPendingAmount
    }
  }, [invoices])

  // Filtered invoices
  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => {
      const matchStatus = statusFilter === 'all' || inv.status === statusFilter
      const query = searchQuery.toLowerCase().trim()
      const matchQuery =
        !query ||
        inv.invoice_number.toLowerCase().includes(query) ||
        inv.client_name.toLowerCase().includes(query) ||
        inv.client_email.toLowerCase().includes(query)
      return matchStatus && matchQuery
    })
  }, [invoices, statusFilter, searchQuery])

  function openCreate() {
    setEditingInvoice(null)
    const today = new Date().toISOString().split('T')[0]
    const due = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    setForm({
      ...INITIAL_FORM,
      issue_date: today,
      due_date: due
    })
    setView('form')
  }

  function openEdit(invoice: Invoice) {
    setEditingInvoice(invoice)
    setForm({
      client_name: invoice.client_name || '',
      client_email: invoice.client_email || '',
      client_address: invoice.client_address || '',
      issue_date: invoice.issue_date || '',
      due_date: invoice.due_date || '',
      items: invoice.items && invoice.items.length > 0 ? invoice.items : [{ ...EMPTY_ITEM }],
      subtotal: invoice.subtotal || 0,
      tax_rate: invoice.tax_rate || 0,
      tax_amount: invoice.tax_amount || 0,
      total: invoice.total || 0,
      notes: invoice.notes || '',
      status: invoice.status || 'pending'
    })
    setView('form')
  }

  function cancelForm() {
    setView('list')
    setEditingInvoice(null)
  }

  function addItem() {
    setForm(prev => ({
      ...prev,
      items: [...prev.items, { ...EMPTY_ITEM }]
    }))
  }

  function updateItem(index: number, patch: Partial<typeof EMPTY_ITEM>) {
    setForm(prev => {
      const items = prev.items.map((item, i) => (i === index ? { ...item, ...patch } : item))
      return { ...prev, items }
    })
  }

  function removeItem(index: number) {
    setForm(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }))
  }

  // Reactive subtotal, tax amount, and total calculations
  const calculatedSubtotal = useMemo(() => {
    return form.items.reduce((sum, item) => {
      const qty = Number(item.quantity) || 0
      const price = Number(item.unit_price) || 0
      return sum + qty * price
    }, 0)
  }, [form.items])

  const calculatedTaxRate = Number(form.tax_rate) || 0
  const calculatedTaxAmount = useMemo(() => {
    return (calculatedSubtotal * calculatedTaxRate) / 100
  }, [calculatedSubtotal, calculatedTaxRate])

  const calculatedTotal = useMemo(() => {
    return calculatedSubtotal + calculatedTaxAmount
  }, [calculatedSubtotal, calculatedTaxAmount])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()

    if (!form.client_name.trim()) {
      toast.error('Nama klien wajib diisi')
      return
    }
    if (!form.client_email.trim()) {
      toast.error('Email klien wajib diisi')
      return
    }
    if (!form.items.length) {
      toast.error('Minimal satu item wajib diisi')
      return
    }

    setLoading(true)

    try {
      const method = editingInvoice ? 'PUT' : 'POST'
      const url = editingInvoice ? `/api/v1/invoices/${editingInvoice.id}` : '/api/v1/invoices'

      const payload = {
        ...form,
        client_name: form.client_name.trim(),
        client_email: form.client_email.trim(),
        client_address: form.client_address.trim() || null,
        subtotal: calculatedSubtotal,
        tax_rate: calculatedTaxRate,
        tax_amount: calculatedTaxAmount,
        total: calculatedTotal,
        notes: form.notes.trim() || null
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Gagal menyimpan invoice')
      }

      toast.success(editingInvoice ? 'Invoice berhasil diperbarui' : 'Invoice baru berhasil dibuat')
      cancelForm()
      await loadInvoices()
    } catch (err: any) {
      toast.error(err?.message || 'Gagal menyimpan invoice')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(invoice: Invoice) {
    if (!confirm(`Hapus invoice ${invoice.invoice_number} secara permanen?`)) {
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`/api/v1/invoices/${invoice.id}`, {
        method: 'DELETE'
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Gagal menghapus invoice')
      }

      toast.success('Invoice berhasil dihapus')
      await loadInvoices()
    } catch (err: any) {
      toast.error(err?.message || 'Gagal menghapus invoice')
    } finally {
      setLoading(false)
    }
  }

  async function handleDownloadPdf(invoice: Invoice) {
    setGeneratingId(invoice.id)
    try {
      const res = await fetch('/api/v1/invoices/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: invoice.id, mode: 'download' })
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Gagal generate PDF invoice')
      }

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${invoice.invoice_number}.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)

      toast.success(`PDF Invoice ${invoice.invoice_number} berhasil diunduh`)
    } catch (err: any) {
      toast.error(err?.message || 'Gagal mengunduh PDF invoice')
    } finally {
      setGeneratingId(null)
    }
  }

  async function handleOpenPdfPreview(invoice: Invoice) {
    setPreviewInvoice(invoice)
    setPreviewLoading(true)
    if (previewPdfUrl) {
      URL.revokeObjectURL(previewPdfUrl)
      setPreviewPdfUrl(null)
    }

    try {
      const res = await fetch('/api/v1/invoices/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: invoice.id, mode: 'view' })
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Gagal memuat pratinjau PDF')
      }

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      setPreviewPdfUrl(url)
    } catch (err: any) {
      toast.error(err?.message || 'Gagal membuka pratinjau PDF')
      setPreviewInvoice(null)
    } finally {
      setPreviewLoading(false)
    }
  }

  function closePreview() {
    if (previewPdfUrl) {
      URL.revokeObjectURL(previewPdfUrl)
    }
    setPreviewInvoice(null)
    setPreviewPdfUrl(null)
  }

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return (
          <span className='inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400'>
            <span className='h-1.5 w-1.5 rounded-full bg-emerald-500' />
            Lunas
          </span>
        )
      case 'cancelled':
        return (
          <span className='inline-flex items-center gap-1.5 rounded-full border border-red-500/20 bg-red-500/10 px-2.5 py-0.5 text-xs font-semibold text-red-600 dark:text-red-400'>
            <span className='h-1.5 w-1.5 rounded-full bg-red-500' />
            Batal
          </span>
        )
      default:
        return (
          <span className='inline-flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-600 dark:text-amber-400'>
            <span className='h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse' />
            Pending
          </span>
        )
    }
  }

  return (
    <div className='space-y-6'>
      {/* Top Header Card / Action Bar */}
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <div className='flex items-center gap-2'>
            <h3 className='text-lg font-bold tracking-tight text-foreground sm:text-xl'>
              Manajemen Invoice & Pembayaran
            </h3>
            <span className='rounded-md bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary'>
              {invoices.length} Total
            </span>
          </div>
          <p className='text-xs text-muted-foreground mt-0.5'>
            Kelola tagihan proyek klien, generate PDF rapi dan profesional berstandar korporat.
          </p>
        </div>

        {view === 'list' && (
          <Button
            onClick={openCreate}
            className='gap-2 rounded-xl shadow-xs'
          >
            <Plus className='h-4 w-4' />
            <span>Buat Invoice Baru</span>
          </Button>
        )}
      </div>

      {/* KPI Stats Bar (Only in list view) */}
      {view === 'list' && (
        <div className='grid grid-cols-2 gap-3 sm:grid-cols-4'>
          <div className='rounded-2xl border border-border/80 bg-background/60 p-4 shadow-2xs backdrop-blur-xs'>
            <div className='flex items-center justify-between text-muted-foreground'>
              <span className='text-xs font-medium'>Total Invoice</span>
              <Receipt className='h-4 w-4 text-blue-500' />
            </div>
            <p className='mt-2 text-xl font-bold tracking-tight text-foreground'>
              {stats.totalCount}
            </p>
            <p className='text-[0.72rem] text-muted-foreground'>Semua invoice tercatat</p>
          </div>

          <div className='rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 shadow-2xs backdrop-blur-xs'>
            <div className='flex items-center justify-between text-emerald-600 dark:text-emerald-400'>
              <span className='text-xs font-medium'>Pendapatan Lunas</span>
              <DollarSign className='h-4 w-4' />
            </div>
            <p className='mt-2 text-xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400'>
              {formatRupiah(stats.totalPaidAmount)}
            </p>
            <p className='text-[0.72rem] text-muted-foreground'>{stats.paidCount} invoice selesai</p>
          </div>

          <div className='rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 shadow-2xs backdrop-blur-xs'>
            <div className='flex items-center justify-between text-amber-600 dark:text-amber-400'>
              <span className='text-xs font-medium'>Menunggu (Pending)</span>
              <AlertCircle className='h-4 w-4' />
            </div>
            <p className='mt-2 text-xl font-bold tracking-tight text-amber-600 dark:text-amber-400'>
              {formatRupiah(stats.totalPendingAmount)}
            </p>
            <p className='text-[0.72rem] text-muted-foreground'>{stats.pendingCount} invoice aktif</p>
          </div>

          <div className='rounded-2xl border border-border/80 bg-background/60 p-4 shadow-2xs backdrop-blur-xs'>
            <div className='flex items-center justify-between text-muted-foreground'>
              <span className='text-xs font-medium'>Dibatalkan</span>
              <X className='h-4 w-4 text-muted-foreground' />
            </div>
            <p className='mt-2 text-xl font-bold tracking-tight text-foreground'>
              {stats.cancelledCount}
            </p>
            <p className='text-[0.72rem] text-muted-foreground'>Invoice non-aktif</p>
          </div>
        </div>
      )}

      {/* VIEW: CREATE / EDIT FORM */}
      {view === 'form' && (
        <form onSubmit={handleSave} className='space-y-6 rounded-3xl border border-border/80 bg-background/90 p-5 sm:p-8 shadow-sm backdrop-blur-md'>
          <div className='flex items-center justify-between border-b border-border/70 pb-4'>
            <div>
              <h4 className='text-base font-bold text-foreground sm:text-lg'>
                {editingInvoice ? `Edit Invoice #${editingInvoice.invoice_number}` : 'Buat Invoice Baru'}
              </h4>
              <p className='text-xs text-muted-foreground'>
                Lengkapi rincian klien, jadwal penagihan, dan item layanan.
              </p>
            </div>
            <Button
              type='button'
              variant='ghost'
              size='sm'
              onClick={cancelForm}
              className='gap-1.5 rounded-xl text-xs font-medium'
            >
              <X className='h-4 w-4' />
              <span>Batal</span>
            </Button>
          </div>

          {/* Section 1: Informasi Klien & Penagihan */}
          <div className='space-y-4'>
            <div className='flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary'>
              <Building className='h-3.5 w-3.5' />
              <span>1. Informasi Klien & Kontak</span>
            </div>
            <div className='grid gap-4 sm:grid-cols-2'>
              <div className='space-y-1.5'>
                <label className='text-xs font-semibold text-foreground'>Nama Klien / Perusahaan *</label>
                <div className='relative'>
                  <Building className='absolute left-3 top-2.5 h-4 w-4 text-muted-foreground' />
                  <Input
                    className='pl-9 rounded-xl'
                    value={form.client_name}
                    onChange={e => setForm({ ...form, client_name: e.target.value })}
                    placeholder='PT Maju Bersama / John Doe'
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              <div className='space-y-1.5'>
                <label className='text-xs font-semibold text-foreground'>Email Klien *</label>
                <div className='relative'>
                  <Mail className='absolute left-3 top-2.5 h-4 w-4 text-muted-foreground' />
                  <Input
                    type='email'
                    className='pl-9 rounded-xl'
                    value={form.client_email}
                    onChange={e => setForm({ ...form, client_email: e.target.value })}
                    placeholder='finance@client.com'
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              <div className='space-y-1.5 sm:col-span-2'>
                <label className='text-xs font-semibold text-foreground'>Alamat Lengkap Klien</label>
                <Textarea
                  className='rounded-xl min-h-[60px]'
                  value={form.client_address}
                  onChange={e => setForm({ ...form, client_address: e.target.value })}
                  placeholder='Gedung Cyber 2 Lantai 15, Jl. H.R. Rasuna Said, Jakarta Selatan'
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {/* Section 2: Jadwal & Status */}
          <div className='space-y-4 border-t border-border/70 pt-5'>
            <div className='flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary'>
              <Calendar className='h-3.5 w-3.5' />
              <span>2. Periode & Status Tagihan</span>
            </div>
            <div className='grid gap-4 sm:grid-cols-3'>
              <div className='space-y-1.5'>
                <label className='text-xs font-semibold text-foreground'>Tanggal Issue (Terbit) *</label>
                <Input
                  type='date'
                  className='rounded-xl'
                  value={form.issue_date}
                  onChange={e => setForm({ ...form, issue_date: e.target.value })}
                  disabled={loading}
                  required
                />
              </div>

              <div className='space-y-1.5'>
                <label className='text-xs font-semibold text-foreground'>Tanggal Jatuh Tempo *</label>
                <Input
                  type='date'
                  className='rounded-xl'
                  value={form.due_date}
                  onChange={e => setForm({ ...form, due_date: e.target.value })}
                  disabled={loading}
                  required
                />
              </div>

              <div className='space-y-1.5'>
                <label className='text-xs font-semibold text-foreground'>Status Pembayaran</label>
                <select
                  value={form.status}
                  onChange={e => setForm({ ...form, status: e.target.value })}
                  disabled={loading}
                  className='flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
                >
                  <option value='pending'>Pending (Menunggu)</option>
                  <option value='paid'>Paid (Lunas)</option>
                  <option value='cancelled'>Cancelled (Batal)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Item Invoice & Penghitungan */}
          <div className='space-y-4 border-t border-border/70 pt-5'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary'>
                <DollarSign className='h-3.5 w-3.5' />
                <span>3. Rincian Layanan / Item Tagihan</span>
              </div>
              <Button
                type='button'
                size='sm'
                variant='outline'
                onClick={addItem}
                disabled={loading}
                className='h-8 gap-1.5 rounded-xl text-xs font-medium'
              >
                <Plus className='h-3.5 w-3.5' />
                <span>Tambah Baris Item</span>
              </Button>
            </div>

            <div className='space-y-2.5'>
              {form.items.map((item, index) => {
                const lineTotal = (Number(item.quantity) || 0) * (Number(item.unit_price) || 0)
                return (
                  <div
                    key={index}
                    className='grid gap-2 rounded-2xl border border-border/70 bg-card/60 p-3 sm:grid-cols-[minmax(0,1.8fr)_90px_140px_130px_40px] sm:items-center'
                  >
                    <div>
                      <span className='mb-1 block text-[0.7rem] font-medium text-muted-foreground sm:hidden'>
                        Deskripsi Item #{index + 1}
                      </span>
                      <Input
                        className='rounded-xl text-sm'
                        value={item.description}
                        onChange={e => updateItem(index, { description: e.target.value })}
                        placeholder='Contoh: Pembuatan UI/UX Dashboard Admin'
                        disabled={loading}
                        required
                      />
                    </div>

                    <div>
                      <span className='mb-1 block text-[0.7rem] font-medium text-muted-foreground sm:hidden'>
                        Kuantitas
                      </span>
                      <Input
                        type='number'
                        min='1'
                        className='rounded-xl text-sm text-center'
                        value={item.quantity}
                        onChange={e => updateItem(index, { quantity: Number(e.target.value) || 0 })}
                        disabled={loading}
                      />
                    </div>

                    <div>
                      <span className='mb-1 block text-[0.7rem] font-medium text-muted-foreground sm:hidden'>
                        Harga Satuan (Rp)
                      </span>
                      <Input
                        type='number'
                        min='0'
                        step='1000'
                        className='rounded-xl text-sm'
                        value={item.unit_price}
                        onChange={e => updateItem(index, { unit_price: Number(e.target.value) || 0 })}
                        disabled={loading}
                      />
                    </div>

                    <div className='flex items-center justify-between sm:justify-end px-2'>
                      <span className='text-xs text-muted-foreground sm:hidden'>Subtotal:</span>
                      <span className='font-mono text-xs font-bold text-foreground'>
                        {formatRupiah(lineTotal)}
                      </span>
                    </div>

                    <div className='flex justify-end'>
                      <Button
                        type='button'
                        size='icon'
                        variant='ghost'
                        onClick={() => removeItem(index)}
                        disabled={loading || form.items.length <= 1}
                        className='h-8 w-8 rounded-xl text-red-500 hover:bg-red-500/10'
                        title='Hapus baris ini'
                      >
                        <Trash2 className='h-4 w-4' />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Calculations Box */}
            <div className='flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 rounded-2xl border border-border/80 bg-muted/20 p-4'>
              <div className='flex-1 space-y-1.5'>
                <label className='text-xs font-semibold text-foreground'>
                  Catatan & Instruksi Pembayaran (Muncul di PDF)
                </label>
                <Textarea
                  className='rounded-xl min-h-[85px] text-xs'
                  value={form.notes}
                  onChange={e => setForm({ ...form, notes: e.target.value })}
                  placeholder='Transfer ke Bank BCA 1234567890 a.n Nanda Safiq. Konfirmasi via WhatsApp setelah transfer.'
                  disabled={loading}
                />
              </div>

              <div className='w-full sm:w-80 space-y-2 rounded-xl border border-border/80 bg-card p-4 shadow-2xs'>
                <div className='flex items-center justify-between text-xs text-muted-foreground'>
                  <span>Subtotal Item</span>
                  <span className='font-mono font-semibold text-foreground'>
                    {formatRupiah(calculatedSubtotal)}
                  </span>
                </div>

                <div className='flex items-center justify-between gap-2 text-xs'>
                  <div className='flex items-center gap-1.5 text-muted-foreground'>
                    <span>Pajak / PPN:</span>
                    <Input
                      type='number'
                      min='0'
                      max='100'
                      className='h-7 w-16 rounded-lg text-center text-xs'
                      value={form.tax_rate}
                      onChange={e => setForm({ ...form, tax_rate: Number(e.target.value) || 0 })}
                      disabled={loading}
                    />
                    <span>%</span>
                  </div>
                  <span className='font-mono text-muted-foreground'>
                    {formatRupiah(calculatedTaxAmount)}
                  </span>
                </div>

                <div className='border-t border-border/80 pt-2 flex items-center justify-between text-sm font-bold text-foreground'>
                  <span>Total Tagihan</span>
                  <span className='font-mono text-base text-primary'>
                    {formatRupiah(calculatedTotal)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className='flex items-center justify-end gap-2.5 border-t border-border/70 pt-4'>
            <Button
              type='button'
              variant='outline'
              onClick={cancelForm}
              disabled={loading}
              className='rounded-xl text-xs'
            >
              Batal
            </Button>
            <Button
              type='submit'
              disabled={loading}
              className='gap-1.5 rounded-xl text-xs font-semibold'
            >
              <Check className='h-4 w-4' />
              <span>{editingInvoice ? 'Simpan Perubahan Invoice' : 'Terbitkan Invoice'}</span>
            </Button>
          </div>
        </form>
      )}

      {/* VIEW: INVOICE LIST */}
      {view === 'list' && (
        <div className='space-y-4'>
          {/* Search & Filter Toolbars */}
          <div className='flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between'>
            {/* Search Input */}
            <div className='relative flex-1 max-w-md'>
              <Search className='absolute left-3 top-2.5 h-4 w-4 text-muted-foreground' />
              <Input
                placeholder='Cari nomor invoice, nama klien, atau email...'
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className='pl-9 rounded-xl h-9 text-xs'
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

            {/* Filter Pills */}
            <div className='flex items-center gap-1 overflow-x-auto scrollbar-none rounded-xl border border-border/80 bg-background/80 p-1'>
              <button
                onClick={() => setStatusFilter('all')}
                className={`rounded-lg px-3 py-1 text-xs font-medium transition-all ${
                  statusFilter === 'all'
                    ? 'bg-primary text-primary-foreground font-semibold shadow-2xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Semua ({invoices.length})
              </button>
              <button
                onClick={() => setStatusFilter('paid')}
                className={`rounded-lg px-3 py-1 text-xs font-medium transition-all ${
                  statusFilter === 'paid'
                    ? 'bg-emerald-600 text-white font-semibold shadow-2xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Lunas ({stats.paidCount})
              </button>
              <button
                onClick={() => setStatusFilter('pending')}
                className={`rounded-lg px-3 py-1 text-xs font-medium transition-all ${
                  statusFilter === 'pending'
                    ? 'bg-amber-600 text-white font-semibold shadow-2xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Pending ({stats.pendingCount})
              </button>
              <button
                onClick={() => setStatusFilter('cancelled')}
                className={`rounded-lg px-3 py-1 text-xs font-medium transition-all ${
                  statusFilter === 'cancelled'
                    ? 'bg-red-600 text-white font-semibold shadow-2xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Batal ({stats.cancelledCount})
              </button>
            </div>
          </div>

          {/* List Content */}
          {loading ? (
            <div className='py-12 text-center'>
              <div className='inline-block h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent' />
              <p className='mt-2 text-xs text-muted-foreground'>Memuat data invoice...</p>
            </div>
          ) : filteredInvoices.length === 0 ? (
            <div className='rounded-3xl border border-dashed border-border/80 p-10 text-center'>
              <div className='mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground'>
                <Receipt className='h-6 w-6 opacity-60' />
              </div>
              <h5 className='mt-3 text-sm font-semibold text-foreground'>
                {searchQuery || statusFilter !== 'all' ? 'Tidak ada invoice yang cocok' : 'Belum Ada Invoice'}
              </h5>
              <p className='mt-1 text-xs text-muted-foreground max-w-sm mx-auto'>
                {searchQuery || statusFilter !== 'all'
                  ? 'Coba sesuaikan kata kunci pencarian atau filter status tagihan Anda.'
                  : 'Mulai buat invoice pertama untuk klien Anda dengan tombol di atas.'}
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
              {filteredInvoices.map(invoice => (
                <div
                  key={invoice.id}
                  className='group relative flex flex-col gap-4 rounded-2xl border border-border/80 bg-card/70 p-4 transition-all duration-200 hover:border-primary/40 hover:bg-card hover:shadow-xs sm:flex-row sm:items-center sm:justify-between'
                >
                  {/* Left info */}
                  <div className='flex items-start gap-3.5 min-w-0 flex-1'>
                    <div className='flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary'>
                      <Receipt className='h-5 w-5' />
                    </div>

                    <div className='min-w-0 flex-1 space-y-1'>
                      <div className='flex flex-wrap items-center gap-2'>
                        <span className='font-mono font-bold text-sm tracking-tight text-foreground'>
                          {invoice.invoice_number}
                        </span>
                        {renderStatusBadge(invoice.status)}
                      </div>

                      <div className='flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-xs text-muted-foreground'>
                        <span className='font-medium text-foreground'>{invoice.client_name}</span>
                        <span>•</span>
                        <span>{invoice.client_email}</span>
                      </div>

                      <div className='flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[0.72rem] text-muted-foreground'>
                        <span>Terbit: {formatDateIndo(invoice.issue_date)}</span>
                        <span>•</span>
                        <span>Jatuh Tempo: {formatDateIndo(invoice.due_date)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Amount & Actions */}
                  <div className='flex flex-row sm:flex-col items-center sm:items-end justify-between gap-3 shrink-0 border-t border-border/60 pt-3 sm:border-t-0 sm:pt-0'>
                    <div className='text-left sm:text-right'>
                      <span className='block text-[0.7rem] uppercase tracking-wider text-muted-foreground font-medium'>
                        Total Tagihan
                      </span>
                      <span className='font-mono text-base font-bold text-foreground'>
                        {formatRupiah(
                          invoice.total && invoice.total > 0
                            ? invoice.total
                            : (invoice.items || []).reduce(
                                (s, it) =>
                                  s + (Number(it.quantity) || 0) * (Number(it.unit_price) || 0),
                                0
                              ) * (1 + (Number(invoice.tax_rate) || 0) / 100)
                        )}
                      </span>
                    </div>

                    <div className='flex items-center gap-1.5'>
                      {/* Preview PDF */}
                      <Button
                        size='sm'
                        variant='outline'
                        onClick={() => handleOpenPdfPreview(invoice)}
                        className='h-8 gap-1 rounded-xl text-xs font-medium'
                        title='Lihat Pratinjau PDF'
                      >
                        <Eye className='h-3.5 w-3.5' />
                        <span className='hidden md:inline'>Pratinjau</span>
                      </Button>

                      {/* Download PDF */}
                      <Button
                        size='sm'
                        variant='secondary'
                        onClick={() => handleDownloadPdf(invoice)}
                        disabled={generatingId === invoice.id}
                        className='h-8 gap-1 rounded-xl text-xs font-medium'
                        title='Unduh Dokumen PDF'
                      >
                        {generatingId === invoice.id ? (
                          <span className='inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary border-t-transparent' />
                        ) : (
                          <Download className='h-3.5 w-3.5' />
                        )}
                        <span>PDF</span>
                      </Button>

                      {/* Edit */}
                      <Button
                        size='sm'
                        variant='ghost'
                        onClick={() => openEdit(invoice)}
                        className='h-8 w-8 p-0 rounded-xl text-muted-foreground hover:text-foreground'
                        title='Edit data invoice'
                      >
                        <Pencil className='h-3.5 w-3.5' />
                      </Button>

                      {/* Delete */}
                      <Button
                        size='sm'
                        variant='ghost'
                        onClick={() => handleDelete(invoice)}
                        className='h-8 w-8 p-0 rounded-xl text-red-500 hover:bg-red-500/10'
                        title='Hapus invoice'
                      >
                        <Trash2 className='h-3.5 w-3.5' />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* LIVE PDF PREVIEW MODAL */}
      {previewInvoice && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 sm:p-6 backdrop-blur-xs'>
          <div className='relative flex flex-col h-[92vh] w-full max-w-4xl overflow-hidden rounded-3xl border border-border/80 bg-background shadow-2xl'>
            {/* Modal Header */}
            <div className='flex items-center justify-between border-b border-border/70 bg-card/80 px-5 py-3.5'>
              <div className='flex items-center gap-2.5'>
                <div className='flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary'>
                  <FileText className='h-4 w-4' />
                </div>
                <div>
                  <h4 className='text-sm font-bold text-foreground sm:text-base'>
                    Pratinjau Dokumen PDF • {previewInvoice.invoice_number}
                  </h4>
                  <p className='text-xs text-muted-foreground'>
                    Klien: {previewInvoice.client_name} ({formatRupiah(previewInvoice.total)})
                  </p>
                </div>
              </div>

              <div className='flex items-center gap-2'>
                <Button
                  size='sm'
                  onClick={() => handleDownloadPdf(previewInvoice)}
                  disabled={generatingId === previewInvoice.id}
                  className='h-8 gap-1.5 rounded-xl text-xs font-semibold'
                >
                  <Download className='h-3.5 w-3.5' />
                  <span>Unduh PDF</span>
                </Button>
                <Button
                  size='icon'
                  variant='ghost'
                  onClick={closePreview}
                  className='h-8 w-8 rounded-xl text-muted-foreground hover:text-foreground'
                >
                  <X className='h-4 w-4' />
                </Button>
              </div>
            </div>

            {/* Modal Body / PDF Viewer Frame */}
            <div className='relative flex-1 bg-muted/30 p-2 sm:p-4'>
              {previewLoading ? (
                <div className='flex h-full flex-col items-center justify-center gap-3'>
                  <div className='h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent' />
                  <p className='text-xs font-medium text-muted-foreground'>
                    Sedang merender pratinjau PDF berformat rapi...
                  </p>
                </div>
              ) : previewPdfUrl ? (
                <iframe
                  src={`${previewPdfUrl}#toolbar=0&navpanes=0`}
                  title={`Invoice ${previewInvoice.invoice_number}`}
                  className='h-full w-full rounded-2xl border border-border shadow-xs'
                />
              ) : (
                <div className='flex h-full items-center justify-center text-xs text-muted-foreground'>
                  Gagal memuat pratinjau PDF.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
