import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export type Invoice = {
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

type CreateInvoiceBody = {
  client_name?: string
  client_email?: string
  client_address?: string | null
  issue_date?: string
  due_date?: string
  items?: Invoice['items']
  subtotal?: number
  tax_rate?: number
  tax_amount?: number
  total?: number
  notes?: string | null
  status?: string
}

function toNumber(value: unknown, fallback = 0): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function generateInvoiceNumber(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const random = Math.floor(1000 + Math.random() * 9000)
  return `INV/${year}/${month}/${random}`
}

async function getUnusedInvoiceNumber(): Promise<string> {
  for (let attempt = 0; attempt < 10; attempt++) {
    const candidate = generateInvoiceNumber()
    const { data, error } = await supabaseAdmin
      .from('invoices')
      .select('id')
      .eq('invoice_number', candidate)
      .maybeSingle()

    if (error) {
      throw error
    }

    if (!data) {
      return candidate
    }
  }

  return `${generateInvoiceNumber()}-${Date.now()}`
}

async function listInvoicesFromDb(): Promise<Invoice[]> {
  const { data, error } = await supabaseAdmin
    .from('invoices')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  return (data || []) as Invoice[]
}

export async function GET() {
  try {
    const invoices = await listInvoicesFromDb()
    return NextResponse.json({ invoices })
  } catch (err) {
    console.error('GET /api/v1/invoices', err)
    return NextResponse.json(
      { error: 'Gagal memuat daftar invoice' },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as CreateInvoiceBody

    if (!body.client_name?.trim()) {
      return NextResponse.json({ error: 'Nama klien wajib diisi' }, { status: 400 })
    }

    if (!body.client_email?.trim()) {
      return NextResponse.json({ error: 'Email klien wajib diisi' }, { status: 400 })
    }

    const invoiceNumber = await getUnusedInvoiceNumber()
    const issueDate = body.issue_date?.trim() || new Date().toISOString().split('T')[0]

    const payload = {
      invoice_number: invoiceNumber,
      client_name: body.client_name.trim(),
      client_email: body.client_email.trim(),
      client_address: body.client_address?.trim() || null,
      issue_date: issueDate,
      due_date: body.due_date?.trim() || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      items: Array.isArray(body.items) ? body.items : [],
      subtotal: toNumber(body.subtotal, 0),
      tax_rate: toNumber(body.tax_rate, 0),
      tax_amount: toNumber(body.tax_amount, 0),
      total: toNumber(body.total, 0),
      notes: body.notes || null,
      status: body.status === 'paid' || body.status === 'cancelled' ? body.status : 'pending'
    }

    const { data, error } = await supabaseAdmin
      .from('invoices')
      .insert(payload)
      .select()
      .single()

    if (error) {
      console.error('POST /api/v1/invoices:', error)
      return NextResponse.json(
        { error: 'Gagal membuat invoice' },
        { status: 500 }
      )
    }

    return NextResponse.json({ invoice: data as Invoice }, { status: 201 })
  } catch (err) {
    console.error('POST /api/v1/invoices:', err)
    return NextResponse.json(
      { error: 'Gagal membuat invoice' },
      { status: 500 }
    )
  }
}
