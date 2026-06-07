import { NextResponse } from 'next/server'
import {
  createComment,
  hasCommentsDbConfig,
  listCommentsBySlug
} from '@/lib/commentsDb'
import { validateSlug } from '@/lib/postsDb'

type Params = { params: { slug: string } }

export async function GET(_req: Request, { params }: Params) {
  if (!hasCommentsDbConfig()) {
    return NextResponse.json({ comments: [] })
  }

  const { slug } = params
  if (!validateSlug(slug)) {
    return NextResponse.json({ error: 'Invalid slug' }, { status: 400 })
  }

  try {
    const comments = await listCommentsBySlug(slug)
    return NextResponse.json({ comments })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Gagal memuat komentar' }, { status: 500 })
  }
}

export async function POST(req: Request, { params }: Params) {
  if (!hasCommentsDbConfig()) {
    return NextResponse.json(
      { error: 'Komentar belum dikonfigurasi' },
      { status: 503 }
    )
  }

  const { slug } = params
  if (!validateSlug(slug)) {
    return NextResponse.json({ error: 'Invalid slug' }, { status: 400 })
  }

  try {
    const body = await req.json()
    const { content, authorName } = body

    if (!content || typeof content !== 'string' || !content.trim()) {
      return NextResponse.json({ error: 'Komentar tidak boleh kosong' }, { status: 400 })
    }

    if (content.trim().length > 2000) {
      return NextResponse.json(
        { error: 'Komentar maksimal 2000 karakter' },
        { status: 400 }
      )
    }

    const name =
      authorName && typeof authorName === 'string' && authorName.trim()
        ? authorName.trim().slice(0, 50)
        : 'Anonymous'

    const comment = await createComment({
      postSlug: slug,
      authorName: name,
      content: content.trim()
    })

    return NextResponse.json({ comment }, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Gagal menambah komentar' }, { status: 500 })
  }
}
