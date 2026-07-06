'use client'

import { useEffect, useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import {
  PlusIcon,
  Pencil1Icon,
  TrashIcon,
  DownloadIcon,
  CheckIcon,
  Cross2Icon
} from '@radix-ui/react-icons'

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

export default function CrudInvoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(false)
  const [generatingId, setGeneratingId] = useState<number | null>(null)
  const [view, setView] = useState<View>('list')
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null)
  const [form, setForm] = useState(INITIAL_FORM)

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

  const recalcTotals = useCallback(() => {
    setForm(prev => {
      const subtotal = prev.items.reduce((sum, item) => {
        const qty = Number(item.quantity) || 0
        const price = Number(item.unit_price) || 0
        return sum + qty * price
      }, 0)

      const taxRate = Number(prev.tax_rate) || 0
      const taxAmount = (subtotal * taxRate) / 100
      const total = subtotal + taxAmount

      return {
        ...prev,
        subtotal,
        tax_amount: taxAmount,
        total
      }
    })
  }, [])

  useEffect(() => {
    recalcTotals()
  }, [recalcTotals])

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

      toast.success(editingInvoice ? 'Invoice diperbarui' : 'Invoice dibuat')
      cancelForm()
      await loadInvoices()
    } catch (err: any) {
      toast.error(err?.message || 'Gagal menyimpan invoice')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(invoice: Invoice) {
    if (!confirm(`Hapus invoice ${invoice.invoice_number}?`)) {
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

      toast.success('Invoice dihapus')
      await loadInvoices()
    } catch (err: any) {
      toast.error(err?.message || 'Gagal menghapus invoice')
    } finally {
      setLoading(false)
    }
  }

  async function handleGeneratePdf(invoice: Invoice) {
    setGeneratingId(invoice.id)
    try {
      const res = await fetch('/api/v1/invoices/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: invoice.id })
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

      toast.success('PDF invoice berhasil diunduh')
    } catch (err: any) {
      toast.error(err?.message || 'Gagal generate PDF invoice')
    } finally {
      setGeneratingId(null)
    }
  }

  async function handleViewPdf(invoice: Invoice) {
    try {
      const res = await fetch('/api/v1/invoices/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: invoice.id, mode: 'view' })
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Gagal memuat PDF invoice')
      }

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      window.open(url, '_blank', 'noopener,noreferrer')
      URL.revokeObjectURL(url)
    } catch (err: any) {
      toast.error(err?.message || 'Gagal membuka PDF invoice')
    }
  }

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      paid: 'bg-green-100 text-green-800 border-green-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200'
    }

    return (
      <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${map[status] || 'bg-muted text-muted-foreground'}`}>
        {status}
      </span>
    )
  }

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-lg font-semibold'>Daftar Invoice</h2>
          <p className='text-xs text-muted-foreground'>
            Kelola invoice pelanggan dan generate PDF.
          </p>
        </div>
        {view === 'list' && (
          <Button onClick={openCreate} className='gap-2'>
            <PlusIcon />
            Invoice Baru
          </Button>
        )}
      </div>

      {view === 'form' && (
        <form onSubmit={handleSave} className='space-y-4 rounded-2xl border px-4 py-5'>
          <div className='grid gap-4 sm:grid-cols-2'>
            <div className='space-y-1.5'>
              <label className='text-sm font-medium'>Nama Klien *</label>
              <Input
                value={form.client_name}
                onChange={e => setForm({ ...form, client_name: e.target.value })}
                placeholder='Nama klien / perusahaan'
                disabled={loading}
              />
            </div>
            <div className='space-y-1.5'>
              <label className='text-sm font-medium'>Email Klien *</label>
              <Input
                type='email'
                value={form.client_email}
                onChange={e => setForm({ ...form, client_email: e.target.value })}
                placeholder='email@contoh.com'
                disabled={loading}
              />
            </div>
            <div className='space-y-1.5'>
              <label className='text-sm font-medium'>Alamat Klien</label>
              <Textarea
                value={form.client_address}
                onChange={e => setForm({ ...form, client_address: e.target.value })}
                placeholder='Alamat klien'
                disabled={loading}
              />
            </div>
            <div className='space-y-1.5'>
              <label className='text-sm font-medium'>Catatan</label>
              <Textarea
                value={form.notes}
                onChange={e => setForm({ ...form, notes: e.target.value })}
                placeholder='Catatan tambahan untuk invoice'
                disabled={loading}
              />
            </div>

            <div className='space-y-1.5'>
              <label className='text-sm font-medium'>Tanggal Issue</label>
              <Input
                type='date'
                value={form.issue_date}
                onChange={e => setForm({ ...form, issue_date: e.target.value })}
                disabled={loading}
              />
            </div>
            <div className='space-y-1.5'>
              <label className='text-sm font-medium'>Jatuh Tempo</label>
              <Input
                type='date'
                value={form.due_date}
                onChange={e => setForm({ ...form, due_date: e.target.value })}
                disabled={loading}
              />
            </div>
            <div className='space-y-1.5'>
              <label className='text-sm font-medium'>Status</label>
              <select
                value={form.status}
                onChange={e => setForm({ ...form, status: e.target.value })}
                disabled={loading}
                className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
              >
                <option value='pending'>Pending</option>
                <option value='paid'>Paid</option>
                <option value='cancelled'>Cancelled</option>
              </select>
            </div>
          </div>

          <div className='space-y-2'>
            <div className='flex items-center justify-between'>
              <label className='text-sm font-medium'>Item Invoice</label>
              <Button
                type='button'
                size='sm'
                variant='outline'
                onClick={addItem}
                disabled={loading}
              >
                <PlusIcon className='mr-1 h-4 w-4' />
                Tambah Item
              </Button>
            </div>

            <div className='space-y-2'>
              {form.items.map((item, index) => (
                <div
                  key={index}
                  className='grid gap-2 rounded-lg border bg-muted/30 p-2 sm:grid-cols-[minmax(0,1fr)_120px_120px_auto]'
                >
                  <Input
                    value={item.description}
                    onChange={e => updateItem(index, { description: e.target.value })}
                    placeholder='Deskripsi layanan/produk'
                    disabled={loading}
                  />
                  <Input
                    type='number'
                    min='1'
                    value={item.quantity}
                    onChange={e => updateItem(index, { quantity: Number(e.target.value) || 0 })}
                    disabled={loading}
                  />
                  <Input
                    type='number'
                    min='0'
                    value={item.unit_price}
                    onChange={e => updateItem(index, { unit_price: Number(e.target.value) || 0 })}
                    disabled={loading}
                  />
                  <Button
                    type='button'
                    size='icon'
                    variant='ghost'
                    onClick={() => removeItem(index)}
                    disabled={loading || form.items.length <= 1}
                    title='Hapus item'
                  >
                    <TrashIcon className='h-4 w-4' />
                  </Button>
                </div>
              ))}
            </div>

            <div className='flex flex-col gap-1 rounded-lg border bg-background p-3 sm:w-72 sm:ml-auto'>
              <div className='flex items-center justify-between text-sm'>
                <span>Subtotal</span>
                <span className='font-mono'>
                  {form.subtotal.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}
                </span>
              </div>
              <div className='flex items-center gap-2 text-sm'>
                <span className='shrink-0'>Pajak (%)</span>
                <Input
                  type='number'
                  className='h-8 w-20 text-right'
                  value={form.tax_rate}
                  onChange={e => setForm({ ...form, tax_rate: Number(e.target.value) || 0 })}
                  disabled={loading}
                />
                <span className='font-mono'>
                  {form.tax_amount.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}
                </span>
              </div>
              <div className='flex items-center justify-between text-base font-semibold'>
                <span>Total</span>
                <span className='font-mono'>
                  {form.total.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}
                </span>
              </div>
            </div>
          </div>

          <div className='flex items-center justify-end gap-2 border-t pt-4'>
            <Button
              type='button'
              variant='outline'
              onClick={cancelForm}
              disabled={loading}
            >
              <Cross2Icon className='mr-1 h-4 w-4' />
              Batal
            </Button>
            <Button type='submit' disabled={loading}>
              <CheckIcon className='mr-1 h-4 w-4' />
              {editingInvoice ? 'Simpan Perubahan' : 'Buat Invoice'}
            </Button>
          </div>
        </form>
      )}

      {view === 'list' && (
        <>
          {loading ? (
            <p className='text-sm text-muted-foreground'>Memuat invoice...</p>
          ) : invoices.length === 0 ? (
            <div className='rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground'>
              <span className='mx-auto flex h-8 w-8 items-center justify-center opacity-50'>📄</span>
              Belum ada invoice. Klik tombol <strong>Invoice Baru</strong> untuk membuat invoice pertama.
            </div>
          ) : (
            <ul className='space-y-2'>
              {invoices.map(invoice => (
                <li
                  key={invoice.id}
                  className='flex flex-col gap-2 rounded-lg border bg-background p-3 sm:flex-row sm:items-center'
                >
                  <div className='min-w-0 flex-1'>
                    <div className='flex items-center gap-2'>
                      <p className='truncate font-medium'>
                        {invoice.invoice_number}
                      </p>
                      {statusBadge(invoice.status)}
                    </div>
                    <p className='text-xs text-muted-foreground'>
                      {invoice.client_name} · {invoice.client_email}
                    </p>
                    <p className='text-xs text-muted-foreground'>
                      Issue: {invoice.issue_date} · Jatuh tempo: {invoice.due_date}
                    </p>
                    <p className='text-xs font-medium'>
                      Total:{' '}
                      {invoice.total.toLocaleString('id-ID', {
                        style: 'currency',
                        currency: 'IDR'
                      })}
                    </p>
                  </div>

                  <div className='flex shrink-0 gap-1 self-end sm:self-center'>
                    <Button
                      size='sm'
                      variant='secondary'
                      onClick={() => handleViewPdf(invoice)}
                      disabled={loading}
                    >
                      View
                    </Button>
                    <Button
                      size='sm'
                      variant='secondary'
                      onClick={() => handleGeneratePdf(invoice)}
                      disabled={loading || generatingId === invoice.id}
                    >
                      <DownloadIcon className='mr-1 h-4 w-4' />
                      {generatingId === invoice.id ? 'Generating...' : 'PDF'}
                    </Button>
                    <Button
                      size='sm'
                      variant='secondary'
                      onClick={() => openEdit(invoice)}
                      disabled={loading}
                    >
                      <Pencil1Icon className='mr-1 h-4 w-4' />
                      Edit
                    </Button>
                    <Button
                      size='sm'
                      variant='destructive'
                      onClick={() => handleDelete(invoice)}
                      disabled={loading}
                    >
                      <TrashIcon className='mr-1 h-4 w-4' />
                      Hapus
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  )
}
