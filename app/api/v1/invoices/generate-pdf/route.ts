import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import type { Invoice } from '../route'

const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || 'ndav developer'
const LOGO_PATH = '/ndav-logo.png'

function formatCurrency(value: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(value || 0)
}

function formatDate(value: string) {
  if (!value) return '-'
  return new Date(value).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  })
}

async function getInvoiceFromDb(id: number): Promise<Invoice | null> {
  const { data, error } = await supabaseAdmin
    .from('invoices')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (error || !data) {
    return null
  }

  return data as Invoice
}

function wrapText(text: string, maxChars: number): string[] {
  const words = text.split(' ')
  const lines: string[] = []
  let current = ''

  for (const word of words) {
    if ((current + ' ' + word).trim().length <= maxChars) {
      current = (current + ' ' + word).trim()
    } else {
      if (current) lines.push(current)
      current = word
    }
  }

  if (current) {
    lines.push(current)
  }

  return lines.length > 0 ? lines : ['']
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const id = Number(body.id)
    const mode = typeof body.mode === 'string' ? body.mode : 'download'

    if (!Number.isInteger(id)) {
      return NextResponse.json({ error: 'ID invoice tidak valid' }, { status: 400 })
    }

    const invoice = await getInvoiceFromDb(id)

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice tidak ditemukan' }, { status: 404 })
    }

    const pdfDoc = await PDFDocument.create()
    const page = pdfDoc.addPage([595.28, 841.89])
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
    const italicFont = await pdfDoc.embedFont(StandardFonts.HelveticaOblique)

    const MARGIN_LEFT = 48
    const MARGIN_RIGHT = 48
    const USABLE_WIDTH = page.getWidth() - MARGIN_LEFT - MARGIN_RIGHT
    const PRIMARY = rgb(0.16, 0.36, 0.56)
    const ACCENT = rgb(0.2, 0.6, 0.86)
    const BORDER = rgb(0.75, 0.78, 0.86)

    page.drawRectangle({
      x: 0,
      y: 770,
      width: page.getWidth(),
      height: 70,
      color: PRIMARY
    })

    let logoWidth = 0
    let logoHeight = 0
    try {
      const logoBytes = await fetch('http://localhost:3000' + LOGO_PATH).then(res => {
        if (!res.ok) return null
        return res.arrayBuffer()
      })

      if (logoBytes) {
        const logoImage = await pdfDoc.embedPng(logoBytes)
        logoWidth = 50
        logoHeight = 50
        page.drawImage(logoImage, {
          x: MARGIN_LEFT,
          y: 780,
          width: logoWidth,
          height: logoHeight
        })
      }
    } catch {
      // logo optional
    }

    page.drawText(SITE_NAME, {
      x: MARGIN_LEFT + logoWidth + 10,
      y: 820,
      size: 16,
      font: boldFont,
      color: rgb(1, 1, 1)
    })

    page.drawText('INVOICE', {
      x: page.getWidth() - MARGIN_RIGHT,
      y: 820,
      size: 16,
      font: boldFont,
      color: rgb(1, 1, 1)
    })

    page.drawText(`No. ${invoice.invoice_number}`, {
      x: page.getWidth() - MARGIN_RIGHT,
      y: 800,
      size: 10,
      font,
      color: rgb(0.9, 0.92, 0.96)
    })

    const detailsCardY = 688
    page.drawText('Tanggal Issue', {
      x: MARGIN_LEFT,
      y: detailsCardY,
      size: 8,
      font,
      color: rgb(0.4, 0.44, 0.54)
    })
    page.drawText(formatDate(invoice.issue_date), {
      x: MARGIN_LEFT,
      y: detailsCardY - 14,
      size: 10,
      font: boldFont
    })

    page.drawText('Jatuh Tempo', {
      x: MARGIN_LEFT + 180,
      y: detailsCardY,
      size: 8,
      font,
      color: rgb(0.4, 0.44, 0.54)
    })
    page.drawText(formatDate(invoice.due_date), {
      x: MARGIN_LEFT + 180,
      y: detailsCardY - 14,
      size: 10,
      font: boldFont
    })

    const statusMap: Record<string, string> = {
      pending: 'Menunggu Pembayaran',
      paid: 'Lunas',
      cancelled: 'Dibatalkan'
    }
    const statusLabel = statusMap[invoice.status] || invoice.status

    page.drawText('Status', {
      x: page.getWidth() - MARGIN_RIGHT - 220,
      y: detailsCardY,
      size: 8,
      font,
      color: rgb(0.4, 0.44, 0.54)
    })
    page.drawText(statusLabel, {
      x: page.getWidth() - MARGIN_RIGHT,
      y: detailsCardY - 14,
      size: 10,
      font: boldFont,
      color: invoice.status === 'paid' ? rgb(0.18, 0.64, 0.36) : invoice.status === 'cancelled' ? rgb(0.74, 0.22, 0.22) : ACCENT
    })

    const clientY = 640
    page.drawText('Ditujukan Kepada', {
      x: MARGIN_LEFT,
      y: clientY,
      size: 10,
      font: boldFont,
      color: PRIMARY
    })

    page.drawText(invoice.client_name, {
      x: MARGIN_LEFT,
      y: clientY - 18,
      size: 11,
      font: boldFont
    })

    page.drawText(invoice.client_email, {
      x: MARGIN_LEFT,
      y: clientY - 32,
      size: 10,
      font
    })

    let clientAddressY = clientY - 52
    if (invoice.client_address) {
      const splitAddress = wrapText(invoice.client_address, 60)
      for (const line of splitAddress) {
        page.drawText(line, {
          x: MARGIN_LEFT,
          y: clientAddressY,
          size: 10,
          font
        })
        clientAddressY -= 13
      }
    }

    let notesY = clientAddressY - 18
    if (invoice.notes) {
      page.drawText('Catatan:', {
        x: MARGIN_LEFT,
        y: notesY,
        size: 10,
        font: boldFont,
        color: PRIMARY
      })
      notesY -= 14
      const wrappedNotes = wrapText(invoice.notes, 90)
      for (const line of wrappedNotes) {
        page.drawText(line, {
          x: MARGIN_LEFT,
          y: notesY,
          size: 9,
          font
        })
        notesY -= 12
      }
      notesY -= 8
    } else {
      notesY = clientAddressY - 10
    }

    const tableHeaderY = Math.min(notesY, 460)
    const colX = {
      description: MARGIN_LEFT,
      quantity: MARGIN_LEFT + USABLE_WIDTH * 0.62,
      unitPrice: MARGIN_LEFT + USABLE_WIDTH * 0.77,
      total: page.getWidth() - MARGIN_RIGHT
    }

    page.drawRectangle({
      x: MARGIN_LEFT,
      y: tableHeaderY - 18,
      width: USABLE_WIDTH,
      height: 18,
      color: PRIMARY
    })

    page.drawText('Deskripsi', { x: colX.description + 6, y: tableHeaderY, size: 10, font: boldFont, color: rgb(1, 1, 1) })
    page.drawText('Jumlah', { x: colX.quantity + 6, y: tableHeaderY, size: 10, font: boldFont, color: rgb(1, 1, 1) })
    page.drawText('Harga Satuan', { x: colX.unitPrice + 6, y: tableHeaderY, size: 10, font: boldFont, color: rgb(1, 1, 1) })
    page.drawText('Total', { x: colX.total, y: tableHeaderY, size: 10, font: boldFont, color: rgb(1, 1, 1) })

    let cursorY = tableHeaderY - 22

    const items = Array.isArray(invoice.items) ? invoice.items : []
    if (items.length === 0) {
      page.drawText('-', { x: colX.description + 6, y: cursorY, size: 10, font })
      cursorY -= 24
    } else {
      for (const item of items) {
        const quantity = Number(item.quantity) || 0
        const unitPrice = Number(item.unit_price) || 0
        const lineTotal = quantity * unitPrice
        const descLines = wrapText(String(item.description || '-'), 50)

        descLines.forEach((line, index) => {
          const y = cursorY - index * 12
          page.drawText(line, { x: colX.description + 6, y, size: 10, font })
        })

        page.drawText(String(quantity), { x: colX.quantity + 6, y: cursorY, size: 10, font })
        page.drawText(formatCurrency(unitPrice), { x: colX.unitPrice + 6, y: cursorY, size: 10, font })
        page.drawText(formatCurrency(lineTotal), { x: colX.total, y: cursorY, size: 10, font })
        cursorY -= 26
      }
    }

    cursorY -= 10
    page.drawLine({
      start: { x: MARGIN_LEFT, y: cursorY },
      end: { x: page.getWidth() - MARGIN_RIGHT, y: cursorY },
      thickness: 1,
      color: BORDER
    })

    const totalsY = cursorY - 16

    page.drawText('Subtotal', { x: colX.unitPrice + 6, y: totalsY, size: 10, font })
    page.drawText(formatCurrency(invoice.subtotal || 0), { x: colX.total, y: totalsY, size: 10, font })

    const taxY = totalsY - 22
    page.drawText(`Pajak (${invoice.tax_rate}%)`, { x: colX.unitPrice + 6, y: taxY, size: 10, font })
    page.drawText(formatCurrency(invoice.tax_amount || 0), { x: colX.total, y: taxY, size: 10, font })

    const totalY = taxY - 28
    page.drawRectangle({
      x: colX.unitPrice - 12,
      y: totalY,
      width: USABLE_WIDTH - colX.unitPrice + MARGIN_LEFT + 12,
      height: 28,
      color: PRIMARY
    })

    page.drawText('Total', {
      x: colX.unitPrice - 4,
      y: totalY + 6,
      size: 12,
      font: boldFont,
      color: rgb(1, 1, 1)
    })

    page.drawText(formatCurrency(invoice.total || 0), {
      x: colX.total,
      y: totalY + 6,
      size: 12,
      font: boldFont,
      color: rgb(1, 1, 1)
    })

    const footerY = 60
    page.drawLine({
      start: { x: MARGIN_LEFT, y: footerY + 14 },
      end: { x: page.getWidth() - MARGIN_RIGHT, y: footerY + 14 },
      thickness: 1,
      color: BORDER
    })

    page.drawText('Dibuat oleh Nanda Safiq', {
      x: MARGIN_LEFT,
      y: footerY,
      size: 10,
      font: italicFont,
      color: PRIMARY
    })

    page.drawText(`Generated by ${SITE_NAME}`, {
      x: page.getWidth() - MARGIN_RIGHT,
      y: footerY,
      size: 9,
      font,
      color: rgb(0.4, 0.44, 0.54)
    })

    const pdfBytes = await pdfDoc.save()
    const pdfBuffer = Buffer.from(pdfBytes)

    const disposition = mode === 'view' ? 'inline' : `attachment; filename="${invoice.invoice_number}.pdf"`

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': disposition,
        'Cache-Control': 'no-store'
      }
    })
  } catch (err) {
    console.error('POST /api/v1/invoices/generate-pdf:', err)
    return NextResponse.json({ error: 'Gagal generate invoice PDF' }, { status: 500 })
  }
}