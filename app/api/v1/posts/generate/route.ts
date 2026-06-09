import { NextResponse } from 'next/server'

type GeminiPart = {
  text?: string
}

type GeneratedPost = {
  title: string
  summary: string
  content: string
}

// Model text Gemini gratis (free tier). Bisa dioverride via env GEMINI_TEXT_MODEL.
const TEXT_MODEL = process.env.GEMINI_TEXT_MODEL || 'gemini-2.5-flash'

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

function parseGeneratedPost(rawText: string): GeneratedPost {
  const parsed = JSON.parse(rawText) as Partial<GeneratedPost>

  return {
    title: String(parsed.title || '').trim(),
    summary: String(parsed.summary || '').trim(),
    content: String(parsed.content || '').trim()
  }
}

export async function POST(req: Request) {
  const apiKey = getGeminiApiKey()

  if (!apiKey) {
    return NextResponse.json(
      { error: 'GEMINI_API_KEY belum dikonfigurasi di environment' },
      { status: 503 }
    )
  }

  try {
    const body = await req.json()
    const idea = typeof body.idea === 'string' ? body.idea.trim() : ''

    if (!idea) {
      return NextResponse.json({ error: 'Ide blog wajib diisi' }, { status: 400 })
    }

    const textData = await callGemini({
      model: TEXT_MODEL,
      apiKey,
      body: {
        contents: [
          {
            parts: [
              {
                text: `Buat draft post blog berbahasa Indonesia dari ide berikut: "${idea}".

Gaya: informatif, natural, ramah dibaca, cocok untuk blog portofolio/developer.
Konten harus Markdown, gunakan heading ##, paragraf pendek, dan contoh bila relevan.
Jangan pakai frontmatter. Jangan menyertakan gambar dalam Markdown.
Hanya kembalikan JSON sesuai schema yang diminta.`
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.75,
          responseMimeType: 'application/json',
          responseSchema: {
            type: 'object',
            properties: {
              title: { type: 'string' },
              summary: { type: 'string' },
              content: { type: 'string' }
            },
            required: ['title', 'summary', 'content']
          }
        }
      }
    })

    const rawText = getTextFromGeminiResponse(textData)
    if (!rawText) throw new Error('Gemini tidak mengembalikan draft konten')

    const generatedPost = parseGeneratedPost(rawText)
    if (!generatedPost.title || !generatedPost.content) {
      throw new Error('Draft konten dari Gemini tidak lengkap')
    }

    return NextResponse.json(generatedPost)
  } catch (err) {
    console.error('POST /api/v1/posts/generate:', err)
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : 'Gagal generate konten'
      },
      { status: 500 }
    )
  }
}
