import { NextResponse } from 'next/server'
import { getPostViewCount, incrementPostViewCount } from '@/lib/posts'

const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

function isValidSlug(slug: string): boolean {
  return SLUG_REGEX.test(slug)
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const slug = searchParams.get('slug')

  if (!slug || !isValidSlug(slug)) {
    return NextResponse.json({ error: 'Invalid slug' }, { status: 400 })
  }

  const views = await getPostViewCount(slug)

  return NextResponse.json(
    { slug, views },
    {
      headers: {
        'Cache-Control': 'no-store'
      }
    }
  )
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as { slug?: string }
    const slug = payload.slug

    if (!slug || !isValidSlug(slug)) {
      return NextResponse.json({ error: 'Invalid slug' }, { status: 400 })
    }

    const views = await incrementPostViewCount(slug)

    return NextResponse.json(
      { slug, views },
      {
        headers: {
          'Cache-Control': 'no-store'
        }
      }
    )
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
}
