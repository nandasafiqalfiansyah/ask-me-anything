import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { revalidatePostPaths } from '@/lib/revalidatePosts'
import {
  createUniqueSlug,
  hasSupabaseServerConfig,
  listPostsFromDb,
  toApiPost,
  toUserFacingDbError,
  type DbPost
} from '@/lib/postsDb'

// GET /api/v1/posts — list all posts (dashboard: termasuk draft)
export async function GET() {
  if (!hasSupabaseServerConfig()) {
    return NextResponse.json(
      { error: 'Supabase belum dikonfigurasi' },
      { status: 503 }
    )
  }

  try {
    const posts = await listPostsFromDb({ includeDrafts: true })
    return NextResponse.json(posts)
  } catch (err) {
    console.error(err)
    const message =
      err && typeof err === 'object' && 'message' in err
        ? toUserFacingDbError(err as { message?: string; code?: string })
        : 'Gagal memuat daftar post'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// POST /api/v1/posts — create new post
export async function POST(req: Request) {
  if (!hasSupabaseServerConfig()) {
    return NextResponse.json(
      { error: 'Supabase belum dikonfigurasi' },
      { status: 503 }
    )
  }

  try {
    const body = await req.json()
    const { title, summary, content, author, published, image } = body

    if (!title || typeof title !== 'string') {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    const slug = await createUniqueSlug(title)
    const publishedAt = new Date().toISOString().split('T')[0]

    const { data, error } = await supabaseAdmin
      .from('posts')
      .insert({
        slug,
        title: title.trim(),
        summary: summary?.trim() || null,
        content: content ?? '',
        author: author ?? 'Admin',
        image_url: image?.trim() || null,
        published_at: publishedAt,
        published: published === true
      })
      .select()
      .single()

    if (error) {
      console.error('POST /api/v1/posts:', error)
      return NextResponse.json(
        { error: toUserFacingDbError(error) },
        { status: 500 }
      )
    }

    revalidatePostPaths(slug)

    return NextResponse.json(toApiPost(data as DbPost), { status: 201 })
  } catch (err) {
    console.error('POST /api/v1/posts:', err)
    const message =
      err && typeof err === 'object' && 'message' in err
        ? toUserFacingDbError(err as { message?: string; code?: string })
        : 'Gagal membuat post'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
