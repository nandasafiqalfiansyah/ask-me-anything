import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

type GeminiPart = {
  text?: string
  inlineData?: {
    mimeType?: string
    mime_type?: string
    data?: string
  }
  inline_data?: {
    mimeType?: string
    mime_type?: string
    data?: string
  }
}

type GeneratedPost = {
  title: string
  summary: string
  content: string
  imagePrompt: string
}

const TEXT_MODEL = process.env.GEMINI_TEXT_MODEL || 'gemini-2.5-flash'
const IMAGE_MODEL = process.env.GEMINI_IMAGE_MODEL || 'gemini-3.1-flash-image'

function getGeminiApiKey() {
  return process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY
}

function getTextFromGeminiResponse(data: unknown) {
  const parts = (data as { candidates?: { content?: { parts?: GeminiPart[] } }[] })
    ?.candidates?.[0]?.content?.parts
  return parts?.find(part => part.text)?.text
}

function getImageFromGeminiResponse(data: unknown) {
  const parts = (data as { candidates?: { content?: { parts?: GeminiPart[] } }[] })
    ?.candidates?.[0]?.content?.parts
  const imagePart = parts?.find(part => part.inlineData || part.inline_data)
  const inlineData = imagePart?.inlineData || imagePart?.inline_data

  if (!inlineData?.data) return null

  return {
    data: inlineData.data,
    mimeType: inlineData.mimeType || inlineData.mime_type || 'image/png'
  }
}

function getExtensionFromMimeType(mimeType: string) {
  if (mimeType.includes('jpeg') || mimeType.includes('jpg')) return 'jpg'
  if (mimeType.includes('webp')) return 'webp'
  return 'png'
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
    content: String(parsed.content || '').trim(),
    imagePrompt: String(parsed.imagePrompt || '').trim()
  }
}

async function uploadGeneratedImage({
  base64,
  mimeType,
  title
}: {
  base64: string
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
  const buffer = Buffer.from(base64, 'base64')

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
imagePrompt harus berupa prompt bahasa Inggris untuk banner blog modern, tanpa teks/tulisan/logo/watermark.`
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
              content: { type: 'string' },
              imagePrompt: { type: 'string' }
            },
            required: ['title', 'summary', 'content', 'imagePrompt']
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

    const imageData = await callGemini({
      model: IMAGE_MODEL,
      apiVersion: 'v1',
      apiKey,
      body: {
        contents: [
          {
            parts: [
              {
                text: `${generatedPost.imagePrompt}. Landscape 16:9 blog hero image, polished editorial style, no text, no watermark.`
              }
            ]
          }
        ]
      }
    })

    const image = getImageFromGeminiResponse(imageData)
    if (!image) throw new Error('Gemini tidak mengembalikan gambar')

    const imageUrl = await uploadGeneratedImage({
      base64: image.data,
      mimeType: image.mimeType,
      title: generatedPost.title
    })

    return NextResponse.json({
      ...generatedPost,
      image: imageUrl
    })
  } catch (err) {
    console.error('POST /api/v1/posts/generate:', err)
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : 'Gagal generate konten dan gambar'
      },
      { status: 500 }
    )
  }
}
