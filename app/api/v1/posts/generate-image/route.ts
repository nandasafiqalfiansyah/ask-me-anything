import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

type GeminiPart = {
  text?: string
}

type GeneratedPrompt = {
  imagePrompt: string
}

const TEXT_MODEL = process.env.GEMINI_TEXT_MODEL || 'gemini-2.5-flash'
const POLLINATION_API_KEY = process.env.POOLINATION_API_KEY
const POLLINATION_BASE_URL =
  process.env.POOLINATION_BASE_URL || 'https://image.pollinations.ai'

// Default: model 'flux' (sesuai permintaan). Bisa dioverride via env.
// Contoh: POOLINATION_MODELS="flux" (default) atau "kontext,flux" untuk fallback.
const POLLINATION_MODELS = (process.env.POOLINATION_MODELS || 'flux')
  .split(',')
  .map(m => m.trim())
  .filter(Boolean)

// Jumlah retry per model kalau dapat 402 (queue full / pollen habis).
// Pollinations free tier membatasi max 1 antrian per IP, jadi kita retry
// dengan jeda agar antrian sempat kosong.
const MAX_RETRIES = Number(process.env.POOLINATION_MAX_RETRIES || 4)
const RETRY_BASE_DELAY_MS = Number(process.env.POOLINATION_RETRY_DELAY_MS || 3000)

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function getGeminiApiKey() {
  return process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY
}

function getTextFromGeminiResponse(data: unknown) {
  const parts = (data as { candidates?: { content?: { parts?: GeminiPart[] } }[] })
    ?.candidates?.[0]?.content?.parts
  return parts?.find(part => part.text)?.text
}

async function callGemini({
  model,
  apiVersion = 'v1beta',
  apiKey,
  body
}: {
  model: string
  apiVersion?: 'v1' | 'v1beta'
  apiKey: string
  body: Record<string, unknown>
}) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/${apiVersion}/models/${model}:generateContent`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey
      },
      body: JSON.stringify(body)
    }
  )
  const data = await res.json()
  if (!res.ok) {
    const message =
      data?.error?.message || `Gemini request failed with status ${res.status}`
    throw new Error(message)
  }
  return data
}

function parseImagePrompt(rawText: string): GeneratedPrompt {
  const parsed = JSON.parse(rawText) as Partial<GeneratedPrompt>
  return {
    imagePrompt: String(parsed.imagePrompt || '').trim()
  }
}

/**
 * Build Pollinations URL.
 * Autentikasi pakai header `Authorization: Bearer <key>` (bukan query `token`).
 */
function buildPollinationUrl(prompt: string, model: string) {
  const encoded = encodeURIComponent(prompt)
  const params = new URLSearchParams({
    width: '1280',
    height: '720',
    model,
    nologo: 'true',
    enhance: 'true'
  })
  return `${POLLINATION_BASE_URL}/prompt/${encoded}?${params.toString()}`
}

type PollinationSuccess = {
  ok: true
  buffer: Buffer
  contentType: string
  model: string
}

type PollinationFailure = {
  ok: false
  status: number
  body: string
  model: string
}

async function tryPollinationOnce(
  prompt: string,
  model: string
): Promise<PollinationSuccess | PollinationFailure> {
  const headers: Record<string, string> = {
    Accept: 'image/*',
    'User-Agent': 'ask-me-anything/1.0'
  }
  if (POLLINATION_API_KEY) {
    headers['Authorization'] = `Bearer ${POLLINATION_API_KEY}`
  }

  const url = buildPollinationUrl(prompt, model)
  const res = await fetch(url, { method: 'GET', headers, cache: 'no-store' })

  if (res.ok) {
    const contentType = res.headers.get('content-type') || 'image/jpeg'
    if (contentType.startsWith('image/')) {
      const arrayBuffer = await res.arrayBuffer()
      return {
        ok: true,
        buffer: Buffer.from(arrayBuffer),
        contentType,
        model
      }
    }
    const text = await res.text()
    return { ok: false, status: res.status, body: text.slice(0, 300), model }
  }

  const text = await res.text().catch(() => '')
  return { ok: false, status: res.status, body: text.slice(0, 300), model }
}

async function fetchPollinationImage(
  prompt: string
): Promise<{ buffer: Buffer; contentType: string; model: string }> {
  let lastFailure: PollinationFailure | null = null
  const queueFullHints = ['Queue full', 'x402Version', 'max: 1']

  for (const model of POLLINATION_MODELS) {
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      const result = await tryPollinationOnce(prompt, model)

      if (result.ok) {
        return {
          buffer: result.buffer,
          contentType: result.contentType,
          model: result.model
        }
      }

      lastFailure = result
      const isQueueFull =
        result.status === 402 &&
        queueFullHints.some(h => result.body.includes(h))
      const isAuthError = result.status === 401 || result.status === 403

      // Auth error: stop total, key invalid.
      if (isAuthError) {
        throw new Error(
          `Pollinations [${model}] unauthorized (${result.status}). ${
            result.body ? `Detail: ${result.body}` : ''
          }`.trim()
        )
      }

      // Queue full / 402: retry dengan backoff (3s, 6s, 12s, 24s)
      if (isQueueFull && attempt < MAX_RETRIES) {
        const delay = RETRY_BASE_DELAY_MS * Math.pow(2, attempt - 1)
        console.warn(
          `[pollinations] ${model} attempt ${attempt}/${MAX_RETRIES} -> 402 queue full, retry in ${delay}ms`
        )
        await sleep(delay)
        continue
      }

      // 402 lain atau bukan queue-full: stop retry untuk model ini
      break
    }

    // Lanjut ke model berikutnya setelah fallback list
  }

  const detail = lastFailure
    ? `Pollinations [${
        lastFailure.model
      }] gagal (status ${lastFailure.status}). Antrian penuh/quota habis. ${
        lastFailure.body ? `Detail: ${lastFailure.body}` : ''
      }`.trim()
    : 'Pollinations: tidak ada model yang berhasil'

  throw new Error(detail)
}

function getExtensionFromMimeType(mimeType: string) {
  if (mimeType.includes('jpeg') || mimeType.includes('jpg')) return 'jpg'
  if (mimeType.includes('webp')) return 'webp'
  if (mimeType.includes('png')) return 'png'
  return 'jpg'
}

async function uploadGeneratedImage({
  buffer,
  mimeType,
  title
}: {
  buffer: Buffer
  mimeType: string
  title: string
}) {
  const extension = getExtensionFromMimeType(mimeType)
  const safeTitle = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 48)
  const fileName = `posts/generated/${Date.now()}-${safeTitle || 'blog-banner'}.${extension}`

  const { error } = await supabaseAdmin.storage
    .from('project-images')
    .upload(fileName, buffer, {
      contentType: mimeType,
      cacheControl: '3600',
      upsert: false
    })

  if (error) {
    throw new Error('Gagal upload gambar hasil AI ke storage')
  }

  const {
    data: { publicUrl }
  } = supabaseAdmin.storage.from('project-images').getPublicUrl(fileName)

  return publicUrl
}

export async function POST(req: Request) {
  const geminiKey = getGeminiApiKey()

  if (!geminiKey) {
    return NextResponse.json(
      { error: 'GEMINI_API_KEY belum dikonfigurasi di environment' },
      { status: 503 }
    )
  }

  if (!POLLINATION_API_KEY) {
    return NextResponse.json(
      { error: 'POOLINATION_API_KEY belum dikonfigurasi di environment' },
      { status: 503 }
    )
  }

  try {
    const body = await req.json()
    const idea = typeof body.idea === 'string' ? body.idea.trim() : ''
    const title = typeof body.title === 'string' ? body.title.trim() : ''

    if (!idea && !title) {
      return NextResponse.json(
        { error: 'Ide atau judul post wajib diisi' },
        { status: 400 }
      )
    }

    const source = title || idea
    const context = idea && title ? `${title}. ${idea}` : source

    // 1) Generate English image prompt via Gemini text model (free)
    const promptData = await callGemini({
      model: TEXT_MODEL,
      apiKey: geminiKey,
      body: {
        contents: [
          {
            parts: [
              {
                text: `Buat image prompt dalam bahasa Inggris untuk banner blog dari konteks berikut: "${context}".

Aturan:
- Landscape 16:9, gaya editorial modern, warna harmonis.
- TANPA teks, tulisan, logo, watermark, atau UI elemen.
- Fokus pada visual/mood yang cocok untuk header artikel blog teknologi/developer.
- Output HANYA JSON sesuai schema.`
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.85,
          responseMimeType: 'application/json',
          responseSchema: {
            type: 'object',
            properties: {
              imagePrompt: { type: 'string' }
            },
            required: ['imagePrompt']
          }
        }
      }
    })

    const rawText = getTextFromGeminiResponse(promptData)
    if (!rawText) throw new Error('Gemini tidak mengembalikan image prompt')

    const { imagePrompt } = parseImagePrompt(rawText)
    if (!imagePrompt) throw new Error('Image prompt dari Gemini kosong')

    // 2) Generate image via Pollinations (model: flux, dengan retry)
    const { buffer, contentType, model: usedModel } = await fetchPollinationImage(
      imagePrompt
    )

    // 3) Upload to Supabase storage and return public URL
    const imageUrl = await uploadGeneratedImage({
      buffer,
      mimeType: contentType,
      title: title || idea
    })

    return NextResponse.json({
      imagePrompt,
      image: imageUrl,
      model: usedModel
    })
  } catch (err) {
    console.error('POST /api/v1/posts/generate-image:', err)
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : 'Gagal generate gambar'
      },
      { status: 500 }
    )
  }
}
