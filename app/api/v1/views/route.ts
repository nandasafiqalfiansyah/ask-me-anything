import { NextResponse } from 'next/server'
import { getPageViewCount, incrementPageViewCount } from '@/lib/pageViews'

const KEY_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

function isValidKey(key: string): boolean {
  return KEY_REGEX.test(key)
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const key = searchParams.get('key')

  if (!key || !isValidKey(key)) {
    return NextResponse.json({ error: 'Invalid key' }, { status: 400 })
  }

  const views = await getPageViewCount(key)

  return NextResponse.json(
    { key, views },
    {
      headers: {
        'Cache-Control': 'no-store'
      }
    }
  )
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as { key?: string }
    const key = payload.key

    if (!key || !isValidKey(key)) {
      return NextResponse.json({ error: 'Invalid key' }, { status: 400 })
    }

    const views = await incrementPageViewCount(key)

    return NextResponse.json(
      { key, views },
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
