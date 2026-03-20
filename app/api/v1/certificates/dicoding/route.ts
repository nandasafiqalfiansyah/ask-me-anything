import { NextResponse } from 'next/server'

type DicodingImportResponse = {
  title: string
  company: string
  issued_date: string | null
  certificate_url: string
  pdf_url: string | null
  description: string | null
}

function decodeHtml(value: string): string {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim()
}

function extractMetaContent(html: string, key: string): string | null {
  const patterns = [
    new RegExp(
      `<meta[^>]*property=["']${key}["'][^>]*content=["']([^"']+)["'][^>]*>`,
      'i'
    ),
    new RegExp(
      `<meta[^>]*content=["']([^"']+)["'][^>]*property=["']${key}["'][^>]*>`,
      'i'
    ),
    new RegExp(
      `<meta[^>]*name=["']${key}["'][^>]*content=["']([^"']+)["'][^>]*>`,
      'i'
    ),
    new RegExp(
      `<meta[^>]*content=["']([^"']+)["'][^>]*name=["']${key}["'][^>]*>`,
      'i'
    )
  ]

  for (const pattern of patterns) {
    const match = html.match(pattern)
    if (match?.[1]) {
      return decodeHtml(match[1])
    }
  }

  return null
}

function extractTitle(html: string): string | null {
  const ogTitle = extractMetaContent(html, 'og:title')
  if (ogTitle) return ogTitle

  const twitterTitle = extractMetaContent(html, 'twitter:title')
  if (twitterTitle) return twitterTitle

  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
  return titleMatch?.[1] ? decodeHtml(titleMatch[1]) : null
}

function extractCourseTitle(description: string | null): string | null {
  if (!description) return null

  const fromIndo = description.match(/pada kelas\s+(.+?)(?:\.|$)/i)
  if (fromIndo?.[1]) return fromIndo[1].trim()

  const fromEnglish = description.match(/class\s+(.+?)(?:\.|$)/i)
  if (fromEnglish?.[1]) return fromEnglish[1].trim()

  return null
}

function normalizeTitle(
  rawTitle: string | null,
  description: string | null
): string {
  const courseTitle = extractCourseTitle(description)

  if (!rawTitle) {
    return courseTitle || 'Dicoding Certificate'
  }

  const normalized = rawTitle
    .replace(/\s*\|\s*Dicoding.*$/i, '')
    .replace(/\s*-\s*Dicoding.*$/i, '')
    .trim()

  const isGenericTitle =
    !normalized || /sertifikat kompetensi|certificate/i.test(normalized)

  if (isGenericTitle && courseTitle) {
    return courseTitle
  }

  return normalized || 'Dicoding Certificate'
}

const monthMap: Record<string, string> = {
  jan: '01',
  january: '01',
  feb: '02',
  february: '02',
  mar: '03',
  march: '03',
  apr: '04',
  april: '04',
  mei: '05',
  may: '05',
  jun: '06',
  june: '06',
  jul: '07',
  july: '07',
  agu: '08',
  agustus: '08',
  aug: '08',
  august: '08',
  sep: '09',
  sept: '09',
  september: '09',
  okt: '10',
  oktober: '10',
  oct: '10',
  october: '10',
  nov: '11',
  november: '11',
  des: '12',
  desember: '12',
  dec: '12',
  december: '12'
}

function normalizeDateValue(value: string): string | null {
  const cleaned = value.replace(/,/g, ' ').replace(/\s+/g, ' ').trim()

  if (/^\d{4}-\d{2}-\d{2}$/.test(cleaned)) {
    return cleaned
  }

  const slashDate = cleaned.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  if (slashDate?.[1] && slashDate[2] && slashDate[3]) {
    return `${slashDate[3]}-${slashDate[2]}-${slashDate[1]}`
  }

  const monthFirst = cleaned.match(/^([A-Za-z]+)\s+(\d{1,2})\s+(\d{4})$/)
  if (monthFirst?.[1] && monthFirst[2] && monthFirst[3]) {
    const month = monthMap[monthFirst[1].toLowerCase()]
    if (!month) return null
    return `${monthFirst[3]}-${month}-${monthFirst[2].padStart(2, '0')}`
  }

  const dayFirst = cleaned.match(/^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})$/)
  if (dayFirst?.[1] && dayFirst[2] && dayFirst[3]) {
    const month = monthMap[dayFirst[2].toLowerCase()]
    if (!month) return null
    return `${dayFirst[3]}-${month}-${dayFirst[1].padStart(2, '0')}`
  }

  return null
}

function extractDateWithPatterns(
  html: string,
  patterns: RegExp[]
): string | null {
  for (const pattern of patterns) {
    const match = html.match(pattern)
    if (!match?.[1]) continue

    const normalizedDate = normalizeDateValue(match[1])
    if (normalizedDate) return normalizedDate
  }

  return null
}

function extractIssuedDate(html: string): string | null {
  const patterns = [
    /(?:Diberikan pada|Tanggal terbit|Issued on|Issued at)\s*[:\-]?\s*(\d{4}-\d{2}-\d{2})/i,
    /(?:Diberikan pada|Tanggal terbit|Issued on|Issued at)\s*[:\-]?\s*(\d{2}\/\d{2}\/\d{4})/i,
    /(?:Diberikan pada|Tanggal terbit|Issued on|Issued at)\s*[:\-]?\s*([A-Za-z]+\s+\d{1,2},\s*\d{4})/i,
    /(?:Diberikan pada|Tanggal terbit|Issued on|Issued at)\s*[:\-]?\s*(\d{1,2}\s+[A-Za-z]+\s+\d{4})/i,
    /Diberikan pada<\/small><br>\s*<b>([^<]+)<\/b>/i,
    /datetime=["'](\d{4}-\d{2}-\d{2})/i
  ]

  return extractDateWithPatterns(html, patterns)
}

function extractExpiryDate(html: string): string | null {
  const patterns = [
    /(?:Berlaku sampai|Expiry date|Expired at|Valid until)\s*[:\-]?\s*(\d{4}-\d{2}-\d{2})/i,
    /(?:Berlaku sampai|Expiry date|Expired at|Valid until)\s*[:\-]?\s*(\d{2}\/\d{2}\/\d{4})/i,
    /(?:Berlaku sampai|Expiry date|Expired at|Valid until)\s*[:\-]?\s*([A-Za-z]+\s+\d{1,2},\s*\d{4})/i,
    /(?:Berlaku sampai|Expiry date|Expired at|Valid until)\s*[:\-]?\s*(\d{1,2}\s+[A-Za-z]+\s+\d{4})/i,
    /Berlaku sampai<\/small><br>\s*<b>([^<]+)<\/b>/i
  ]

  return extractDateWithPatterns(html, patterns)
}

function extractPdfUrl(html: string): string | null {
  const sharedDataMatch = html.match(/certificateUrl\s*:\s*['"]([^'"]+)['"]/i)
  if (!sharedDataMatch?.[1]) return null

  return decodeHtml(sharedDataMatch[1])
}

function validateDicodingCertificateUrl(input: string): URL | null {
  try {
    const parsed = new URL(input)
    const isDicodingHost =
      parsed.hostname === 'www.dicoding.com' ||
      parsed.hostname === 'dicoding.com'

    if (!isDicodingHost) return null
    if (!parsed.pathname.startsWith('/certificates/')) return null

    return parsed
  } catch {
    return null
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const certificateUrl = typeof body?.url === 'string' ? body.url.trim() : ''

    if (!certificateUrl) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    const parsedUrl = validateDicodingCertificateUrl(certificateUrl)
    if (!parsedUrl) {
      return NextResponse.json(
        { error: 'Invalid Dicoding certificate URL' },
        { status: 400 }
      )
    }

    const response = await fetch(parsedUrl.toString(), {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; CertificateImporter/1.0)',
        Accept: 'text/html'
      },
      cache: 'no-store'
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch Dicoding certificate page' },
        { status: 502 }
      )
    }

    const html = await response.text()
    const rawTitle = extractTitle(html)
    const description =
      extractMetaContent(html, 'og:description') ||
      extractMetaContent(html, 'description')
    const expiryDate = extractExpiryDate(html)

    const result: DicodingImportResponse = {
      title: normalizeTitle(rawTitle, description),
      company: 'Dicoding',
      issued_date: expiryDate || extractIssuedDate(html),
      certificate_url: parsedUrl.toString(),
      pdf_url: extractPdfUrl(html),
      description: description || null
    }

    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error('Error importing Dicoding certificate:', error)
    return NextResponse.json(
      { error: 'Failed to import Dicoding certificate' },
      { status: 500 }
    )
  }
}
