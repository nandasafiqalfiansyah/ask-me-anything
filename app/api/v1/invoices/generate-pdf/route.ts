import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import type { Invoice } from '../route'

const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || 'Nanda Safiq'
const SITE_SUBTITLE = 'Full Stack Developer & Digital Creator'
const SITE_EMAIL = 'nandasafiqalfiansyah@gmail.com'
const SITE_URL = 'https://nandasafiqalfiansyah.vercel.app'

function formatCurrency(value: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(value || 0)
}

function formatDate(value: string) {
  if (!value) return '-'
  try {
    return new Date(value).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })
  } catch {
    return value
  }
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
  if (!text) return ['']
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
    // A4 Portrait: 595.28 x 841.89 points
    const page = pdfDoc.addPage([595.28, 841.89])
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
    const italicFont = await pdfDoc.embedFont(StandardFonts.HelveticaOblique)

    const MARGIN_LEFT = 40
    const MARGIN_RIGHT = 40
    const PAGE_WIDTH = page.getWidth()
    const RIGHT_BOUND = PAGE_WIDTH - MARGIN_RIGHT
    const USABLE_WIDTH = RIGHT_BOUND - MARGIN_LEFT

    // Color Palette
    const COLOR_PRIMARY = rgb(0.09, 0.14, 0.24)      // Dark Navy / Slate 900
    const COLOR_PRIMARY_LIGHT = rgb(0.18, 0.28, 0.45)
    const COLOR_TEXT_MAIN = rgb(0.12, 0.16, 0.22)    // Dark Slate
    const COLOR_TEXT_MUTED = rgb(0.42, 0.47, 0.55)   // Slate 500
    const COLOR_BORDER = rgb(0.85, 0.88, 0.92)       // Light Gray Border
    const COLOR_BG_TINT = rgb(0.96, 0.97, 0.99)      // Very soft slate tint
    const COLOR_BG_ZEBRA = rgb(0.98, 0.99, 1.0)
    const COLOR_WHITE = rgb(1, 1, 1)

    // Status colors
    const isPaid = invoice.status === 'paid'
    const isCancelled = invoice.status === 'cancelled'
    const COLOR_STATUS_BG = isPaid
      ? rgb(0.88, 0.97, 0.92)
      : isCancelled
      ? rgb(0.99, 0.90, 0.90)
      : rgb(0.99, 0.95, 0.86)
    const COLOR_STATUS_TXT = isPaid
      ? rgb(0.09, 0.50, 0.27)
      : isCancelled
      ? rgb(0.75, 0.18, 0.18)
      : rgb(0.72, 0.42, 0.05)
    const statusText = isPaid
      ? 'LUNAS / PAID'
      : isCancelled
      ? 'DIBATALKAN'
      : 'MENUNGGU PEMBAYARAN'

    // Helper to draw text right-aligned
    const drawTextRight = (
      text: string,
      rightX: number,
      y: number,
      opts: { font: any; size: number; color: any }
    ) => {
      const w = opts.font.widthOfTextAtSize(text, opts.size)
      page.drawText(text, {
        x: rightX - w,
        y,
        size: opts.size,
        font: opts.font,
        color: opts.color
      })
    }

    // 1. TOP HEADER ACCENT STRIP (Clean 6px accent strip)
    page.drawRectangle({
      x: 0,
      y: 835.89,
      width: PAGE_WIDTH,
      height: 6,
      color: rgb(0.15, 0.45, 0.85) // Crisp modern blue
    })

    // 2. BRAND & INVOICE TITLE HEADER (y: ~760-815)
    const headerY = 800

    // Left: Issuer Details
    page.drawText(SITE_NAME, {
      x: MARGIN_LEFT,
      y: headerY,
      size: 18,
      font: boldFont,
      color: COLOR_PRIMARY
    })
    page.drawText(SITE_SUBTITLE, {
      x: MARGIN_LEFT,
      y: headerY - 16,
      size: 9,
      font,
      color: COLOR_TEXT_MUTED
    })
    page.drawText(`${SITE_EMAIL}  |  ${SITE_URL}`, {
      x: MARGIN_LEFT,
      y: headerY - 29,
      size: 8,
      font,
      color: COLOR_TEXT_MUTED
    })

    // Right: Large INVOICE Display & Invoice Number
    drawTextRight('INVOICE', RIGHT_BOUND, headerY + 2, {
      font: boldFont,
      size: 22,
      color: COLOR_PRIMARY
    })

    const invoiceNumLabel = `NO: ${invoice.invoice_number}`
    drawTextRight(invoiceNumLabel, RIGHT_BOUND, headerY - 17, {
      font: boldFont,
      size: 10,
      color: rgb(0.15, 0.45, 0.85)
    })

    // Divider under header
    page.drawLine({
      start: { x: MARGIN_LEFT, y: 755 },
      end: { x: RIGHT_BOUND, y: 755 },
      thickness: 1,
      color: COLOR_BORDER
    })

    // 3. META HIGHLIGHT BAR (Dates & Status) y: 695 - 745
    const metaCardY = 705
    const metaHeight = 40
    page.drawRectangle({
      x: MARGIN_LEFT,
      y: metaCardY,
      width: USABLE_WIDTH,
      height: metaHeight,
      color: COLOR_BG_TINT,
      borderColor: COLOR_BORDER,
      borderWidth: 1
    })

    const col1X = MARGIN_LEFT + 16
    const col2X = MARGIN_LEFT + 150
    const col3X = MARGIN_LEFT + 290
    const col4Right = RIGHT_BOUND - 16

    // Col 1: Tanggal Terbit
    page.drawText('TANGGAL TERBIT', { x: col1X, y: metaCardY + 24, size: 7.5, font: boldFont, color: COLOR_TEXT_MUTED })
    page.drawText(formatDate(invoice.issue_date), { x: col1X, y: metaCardY + 10, size: 9.5, font: boldFont, color: COLOR_TEXT_MAIN })

    // Col 2: Jatuh Tempo
    page.drawText('JATUH TEMPO', { x: col2X, y: metaCardY + 24, size: 7.5, font: boldFont, color: COLOR_TEXT_MUTED })
    page.drawText(formatDate(invoice.due_date), { x: col2X, y: metaCardY + 10, size: 9.5, font: boldFont, color: COLOR_TEXT_MAIN })

    // Col 3: Status Badge
    page.drawText('STATUS PEMBAYARAN', { x: col3X, y: metaCardY + 24, size: 7.5, font: boldFont, color: COLOR_TEXT_MUTED })
    const badgeW = font.widthOfTextAtSize(statusText, 8) + 16
    page.drawRectangle({
      x: col3X,
      y: metaCardY + 6,
      width: badgeW,
      height: 16,
      color: COLOR_STATUS_BG
    })
    page.drawText(statusText, { x: col3X + 8, y: metaCardY + 11, size: 8, font: boldFont, color: COLOR_STATUS_TXT })

    // 4. BILL TO / CLIENT INFORMATION PANEL (y: 620-690)
    const billToY = 675
    page.drawText('DITAGIHKAN KEPADA (BILL TO)', {
      x: MARGIN_LEFT,
      y: billToY,
      size: 8,
      font: boldFont,
      color: rgb(0.15, 0.45, 0.85)
    })

    page.drawText(invoice.client_name, {
      x: MARGIN_LEFT,
      y: billToY - 16,
      size: 12,
      font: boldFont,
      color: COLOR_PRIMARY
    })

    page.drawText(invoice.client_email, {
      x: MARGIN_LEFT,
      y: billToY - 29,
      size: 9,
      font,
      color: COLOR_TEXT_MUTED
    })

    let clientAddressCursorY = billToY - 42
    if (invoice.client_address) {
      const addressLines = wrapText(invoice.client_address, 65)
      for (const line of addressLines) {
        page.drawText(line, {
          x: MARGIN_LEFT,
          y: clientAddressCursorY,
          size: 8.5,
          font,
          color: COLOR_TEXT_MAIN
        })
        clientAddressCursorY -= 12
      }
    } else {
      clientAddressCursorY += 4
    }

    // 5. TABLE HEADER
    // Column x boundaries:
    // Col 0: No (width 26) -> MARGIN_LEFT
    // Col 1: Deskripsi (width 260) -> MARGIN_LEFT + 28
    // Col 2: Kuantitas (width 50, right bound) -> MARGIN_LEFT + 340
    // Col 3: Harga Satuan (width 85, right bound) -> MARGIN_LEFT + 430
    // Col 4: Total (width 85, right bound) -> RIGHT_BOUND - 10
    const tblHeaderY = Math.min(clientAddressCursorY - 14, 590)
    const tblHeaderH = 22

    page.drawRectangle({
      x: MARGIN_LEFT,
      y: tblHeaderY - tblHeaderH,
      width: USABLE_WIDTH,
      height: tblHeaderH,
      color: COLOR_PRIMARY
    })

    const colNoX = MARGIN_LEFT + 8
    const colDescX = MARGIN_LEFT + 32
    const colQtyRight = MARGIN_LEFT + 320
    const colPriceRight = MARGIN_LEFT + 420
    const colTotalRight = RIGHT_BOUND - 12

    const thTextY = tblHeaderY - 15
    page.drawText('NO', { x: colNoX, y: thTextY, size: 8, font: boldFont, color: COLOR_WHITE })
    page.drawText('DESKRIPSI ITEM / LAYANAN', { x: colDescX, y: thTextY, size: 8, font: boldFont, color: COLOR_WHITE })
    drawTextRight('QTY', colQtyRight, thTextY, { font: boldFont, size: 8, color: COLOR_WHITE })
    drawTextRight('HARGA SATUAN', colPriceRight, thTextY, { font: boldFont, size: 8, color: COLOR_WHITE })
    drawTextRight('TOTAL', colTotalRight, thTextY, { font: boldFont, size: 8, color: COLOR_WHITE })

    // 6. TABLE BODY ITEMS
    let cursorY = tblHeaderY - tblHeaderH
    const items = Array.isArray(invoice.items) && invoice.items.length > 0
      ? invoice.items
      : [{ description: 'Layanan Pengembangan Web', quantity: 1, unit_price: invoice.total || 0 }]

    items.forEach((item, idx) => {
      const qty = Number(item.quantity) || 1
      const unitPrice = Number(item.unit_price) || 0
      const lineTotal = qty * unitPrice

      const descLines = wrapText(String(item.description || '-'), 46)
      const rowHeight = Math.max(26, descLines.length * 13 + 12)

      // Zebra background
      if (idx % 2 === 1) {
        page.drawRectangle({
          x: MARGIN_LEFT,
          y: cursorY - rowHeight,
          width: USABLE_WIDTH,
          height: rowHeight,
          color: COLOR_BG_ZEBRA
        })
      }

      // Bottom row divider line
      page.drawLine({
        start: { x: MARGIN_LEFT, y: cursorY - rowHeight },
        end: { x: RIGHT_BOUND, y: cursorY - rowHeight },
        thickness: 0.5,
        color: COLOR_BORDER
      })

      // Number
      page.drawText(String(idx + 1), {
        x: colNoX,
        y: cursorY - 16,
        size: 9,
        font,
        color: COLOR_TEXT_MUTED
      })

      // Description (multiline)
      descLines.forEach((dLine, dIdx) => {
        page.drawText(dLine, {
          x: colDescX,
          y: cursorY - 16 - dIdx * 12,
          size: 9,
          font: boldFont,
          color: COLOR_TEXT_MAIN
        })
      })

      // Quantity (right aligned)
      drawTextRight(String(qty), colQtyRight, cursorY - 16, {
        font,
        size: 9,
        color: COLOR_TEXT_MAIN
      })

      // Unit Price (right aligned)
      drawTextRight(formatCurrency(unitPrice), colPriceRight, cursorY - 16, {
        font,
        size: 9,
        color: COLOR_TEXT_MAIN
      })

      // Line Total (right aligned)
      drawTextRight(formatCurrency(lineTotal), colTotalRight, cursorY - 16, {
        font: boldFont,
        size: 9,
        color: COLOR_TEXT_MAIN
      })

      cursorY -= rowHeight
    })

    // 7. BOTTOM SECTION: NOTES (LEFT) & TOTALS CARD (RIGHT)
    const bottomSectionY = cursorY - 16

    // Left Box: Notes & Payment Instructions
    const notesBoxW = 260
    const notesBoxH = 95
    page.drawRectangle({
      x: MARGIN_LEFT,
      y: bottomSectionY - notesBoxH,
      width: notesBoxW,
      height: notesBoxH,
      color: COLOR_BG_TINT,
      borderColor: COLOR_BORDER,
      borderWidth: 1
    })

    page.drawText('CATATAN & INSTRUKSI PEMBAYARAN', {
      x: MARGIN_LEFT + 12,
      y: bottomSectionY - 16,
      size: 7.5,
      font: boldFont,
      color: rgb(0.15, 0.45, 0.85)
    })

    const notesContent = invoice.notes
      ? invoice.notes
      : 'Pembayaran dapat ditransfer ke rekening bank resmi. Mohon kirimkan konfirmasi bukti transfer setelah melakukan pembayaran.'
    const notesLines = wrapText(notesContent, 42).slice(0, 4)
    notesLines.forEach((nLine, nIdx) => {
      page.drawText(nLine, {
        x: MARGIN_LEFT + 12,
        y: bottomSectionY - 32 - nIdx * 12,
        size: 8,
        font,
        color: COLOR_TEXT_MUTED
      })
    })

    page.drawText('Terima kasih atas kerja samanya!', {
      x: MARGIN_LEFT + 12,
      y: bottomSectionY - notesBoxH + 10,
      size: 8,
      font: italicFont,
      color: COLOR_PRIMARY_LIGHT
    })

    // Right Box: Financial Totals Breakdown
    const totalsBoxW = 210
    const totalsBoxLeft = RIGHT_BOUND - totalsBoxW
    let sumCursorY = bottomSectionY - 4

    // Subtotal
    page.drawText('Subtotal', {
      x: totalsBoxLeft + 8,
      y: sumCursorY,
      size: 9,
      font,
      color: COLOR_TEXT_MUTED
    })
    drawTextRight(formatCurrency(invoice.subtotal || 0), RIGHT_BOUND - 12, sumCursorY, {
      font: boldFont,
      size: 9,
      color: COLOR_TEXT_MAIN
    })

    // Tax / PPN
    sumCursorY -= 18
    const taxRateStr = invoice.tax_rate ? `Pajak / PPN (${invoice.tax_rate}%)` : 'Pajak / PPN (0%)'
    page.drawText(taxRateStr, {
      x: totalsBoxLeft + 8,
      y: sumCursorY,
      size: 9,
      font,
      color: COLOR_TEXT_MUTED
    })
    drawTextRight(formatCurrency(invoice.tax_amount || 0), RIGHT_BOUND - 12, sumCursorY, {
      font,
      size: 9,
      color: COLOR_TEXT_MAIN
    })

    // Total Highlight Box
    sumCursorY -= 36
    page.drawRectangle({
      x: totalsBoxLeft,
      y: sumCursorY,
      width: totalsBoxW,
      height: 32,
      color: COLOR_PRIMARY
    })

    page.drawText('TOTAL AKHIR', {
      x: totalsBoxLeft + 12,
      y: sumCursorY + 11,
      size: 9.5,
      font: boldFont,
      color: COLOR_WHITE
    })

    drawTextRight(formatCurrency(invoice.total || 0), RIGHT_BOUND - 12, sumCursorY + 10, {
      font: boldFont,
      size: 12,
      color: COLOR_WHITE
    })

    // 8. SIGNATURE / AUTHENTICITY BADGE & BOTTOM FOOTER
    const footerY = 48

    page.drawLine({
      start: { x: MARGIN_LEFT, y: footerY + 18 },
      end: { x: RIGHT_BOUND, y: footerY + 18 },
      thickness: 1,
      color: COLOR_BORDER
    })

    page.drawText('Dokumen ini sah dan diterbitkan secara elektronik oleh sistem portofolio resmi.', {
      x: MARGIN_LEFT,
      y: footerY + 4,
      size: 7.5,
      font: italicFont,
      color: COLOR_TEXT_MUTED
    })

    drawTextRight(`Invoice ${invoice.invoice_number} • Halaman 1 dari 1`, RIGHT_BOUND, footerY + 4, {
      font,
      size: 7.5,
      color: COLOR_TEXT_MUTED
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
