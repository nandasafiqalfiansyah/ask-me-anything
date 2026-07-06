import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import type { Invoice } from '../route'

type UpdateInvoiceBody = {
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

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id)

  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: 'ID invoice tidak valid' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('invoices')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (error) {
    console.error('GET /api/v1/invoices/[id]:', error)
    return NextResponse.json({ error: 'Gagal memuat invoice' }, { status: 500 })
  }

  if (!data) {
    return NextResponse.json({ error: 'Invoice tidak ditemukan' }, { status: 404 })
  }

  return NextResponse.json({ invoice: data as Invoice })
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id)

  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: 'ID invoice tidak valid' }, { status: 400 })
  }

  try {
    const body = (await req.json()) as UpdateInvoiceBody

    const { data: existing, error: fetchError } = await supabaseAdmin
      .from('invoices')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (fetchError) {
      console.error('PUT /api/v1/invoices/[id]:', fetchError)
      return NextResponse.json({ error: 'Gagal memuat invoice' }, { status: 500 })
    }

    if (!existing) {
      return NextResponse.json({ error: 'Invoice tidak ditemukan' }, { status: 404 })
    }

    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString()
    }

    if (body.client_name !== undefined) updates.client_name = body.client_name.trim()
    if (body.client_email !== undefined) updates.client_email = body.client_email.trim()
    if (body.client_address !== undefined) updates.client_address = body.client_address?.trim() || null
    if (body.issue_date !== undefined) updates.issue_date = body.issue_date
    if (body.due_date !== undefined) updates.due_date = body.due_date
    if (body.items !== undefined) updates.items = Array.isArray(body.items) ? body.items : []
    if (body.subtotal !== undefined) updates.subtotal = Number(body.subtotal) || 0
    if (body.tax_rate !== undefined) updates.tax_rate = Number(body.tax_rate) || 0
    if (body.tax_amount !== undefined) updates.tax_amount = Number(body.tax_amount) || 0
    if (body.total !== undefined) updates.total = Number(body.total) || 0
    if (body.notes !== undefined) updates.notes = body.notes || null
    if (body.status !== undefined) {
      updates.status = body.status === 'paid' || body.status === 'cancelled' ? body.status : existing.status
    }

    const { data, error } = await supabaseAdmin
      .from('invoices')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('PUT /api/v1/invoices/[id]:', error)
      return NextResponse.json({ error: 'Gagal memperbarui invoice' }, { status: 500 })
    }

    return NextResponse.json({ invoice: data as Invoice })
  } catch (err) {
    console.error('PUT /api/v1/invoices/[id]:', err)
    return NextResponse.json({ error: 'Gagal memperbarui invoice' }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id)

  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: 'ID invoice tidak valid' }, { status: 400 })
  }

  const { data: existing } = await supabaseAdmin
    .from('invoices')
    .select('id')
    .eq('id', id)
    .maybeSingle()

  if (!existing) {
    return NextResponse.json({ error: 'Invoice tidak ditemukan' }, { status: 404 })
  }

  const { error } = await supabaseAdmin
    .from('invoices')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('DELETE /api/v1/invoices/[id]:', error)
    return NextResponse.json({ error: 'Gagal menghapus invoice' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
