import { NextResponse } from 'next/server'
import { getAuthUserFromRequest } from '@/lib/authApi'
import {
  deleteComment,
  hasCommentsDbConfig,
  toggleCommentPin
} from '@/lib/commentsDb'
import { validateSlug } from '@/lib/postsDb'

type Params = { params: { slug: string; id: string } }

export async function DELETE(req: Request, { params }: Params) {
  const user = await getAuthUserFromRequest(req)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!hasCommentsDbConfig()) {
    return NextResponse.json({ error: 'Not configured' }, { status: 503 })
  }

  const { slug, id } = params
  if (!validateSlug(slug)) {
    return NextResponse.json({ error: 'Invalid slug' }, { status: 400 })
  }

  const commentId = Number(id)
  if (!Number.isFinite(commentId)) {
    return NextResponse.json({ error: 'Invalid comment id' }, { status: 400 })
  }

  try {
    await deleteComment(commentId)
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Gagal menghapus komentar' }, { status: 500 })
  }
}

export async function PATCH(req: Request, { params }: Params) {
  const user = await getAuthUserFromRequest(req)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!hasCommentsDbConfig()) {
    return NextResponse.json({ error: 'Not configured' }, { status: 503 })
  }

  const { slug, id } = params
  if (!validateSlug(slug)) {
    return NextResponse.json({ error: 'Invalid slug' }, { status: 400 })
  }

  const commentId = Number(id)
  if (!Number.isFinite(commentId)) {
    return NextResponse.json({ error: 'Invalid comment id' }, { status: 400 })
  }

  try {
    const body = await req.json()
    const { isPinned } = body

    if (typeof isPinned !== 'boolean') {
      return NextResponse.json({ error: 'isPinned harus boolean' }, { status: 400 })
    }

    const comment = await toggleCommentPin(commentId, isPinned)
    return NextResponse.json({ comment })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Gagal memperbarui komentar' }, { status: 500 })
  }
}
