import { NextResponse } from 'next/server'
import { getAuthUserFromRequest } from '@/lib/authApi'
import { hasCommentsDbConfig, listAllComments } from '@/lib/commentsDb'

export async function GET(req: Request) {
  const user = await getAuthUserFromRequest(req)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!hasCommentsDbConfig()) {
    return NextResponse.json({ comments: [] })
  }

  try {
    const comments = await listAllComments()
    return NextResponse.json({ comments })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Gagal memuat komentar' }, { status: 500 })
  }
}
