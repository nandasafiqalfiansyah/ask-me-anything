import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { revalidatePostPaths } from '@/lib/revalidatePosts'
import {
  getPostFromDb,
  hasSupabaseServerConfig,
  toApiPost,
  toUserFacingDbError,
  validateSlug,
  type DbPost
} from '@/lib/postsDb'

type Params = { params: { slug: string } }

// GET /api/v1/posts/[slug]
export async function GET(_req: Request, { params }: Params) {
  if (!hasSupabaseServerConfig()) {
    return NextResponse.json(
      { error: 'Supabase belum dikonfigurasi' },
      { status: 503 }
    )
  }

  const { slug } = params

  if (!validateSlug(slug)) {
    return NextResponse.json({ error: 'Invalid slug' }, { status: 400 })
  }

  try {
    const post = await getPostFromDb(slug, { includeDrafts: true })
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }
    return NextResponse.json(post)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Gagal memuat post' }, { status: 500 })
  }
}

// PUT /api/v1/posts/[slug]
export async function PUT(req: Request, { params }: Params) {
  if (!hasSupabaseServerConfig()) {
    return NextResponse.json(
      { error: 'Supabase belum dikonfigurasi' },
      { status: 503 }
    )
  }

  try {
    const { slug } = params

    if (!validateSlug(slug)) {
      return NextResponse.json({ error: 'Invalid slug' }, { status: 400 })
    }

    const { data: existing, error: fetchError } = await supabaseAdmin
      .from('posts')
      .select('*')
      .eq('slug', slug)
      .maybeSingle()

    if (fetchError) {
      console.error(fetchError)
      return NextResponse.json(
        { error: toUserFacingDbError(fetchError) },
        { status: 500 }
      )
    }

    if (!existing) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    const body = await req.json()
    const { title, summary, content, author, published, publishedAt, image } = body

    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString()
    }

    if (title !== undefined) updates.title = title
    if (summary !== undefined) updates.summary = summary || null
    if (content !== undefined) updates.content = content
    if (author !== undefined) updates.author = author
    if (published !== undefined) updates.published = published
    if (publishedAt !== undefined) updates.published_at = publishedAt
    if (image !== undefined) updates.image_url = image?.trim() || null

    const { data, error } = await supabaseAdmin
      .from('posts')
      .update(updates)
      .eq('slug', slug)
      .select()
      .single()

    if (error) {
      console.error(error)
      return NextResponse.json(
        { error: toUserFacingDbError(error) },
        { status: 500 }
      )
    }

    revalidatePostPaths(slug)

    return NextResponse.json(toApiPost(data as DbPost))
  } catch (err) {
    console.error(err)
    const message =
      err && typeof err === 'object' && 'message' in err
        ? toUserFacingDbError(err as { message?: string; code?: string })
        : 'Gagal memperbarui post'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// DELETE /api/v1/posts/[slug]
export async function DELETE(_req: Request, { params }: Params) {
  if (!hasSupabaseServerConfig()) {
    return NextResponse.json(
      { error: 'Supabase belum dikonfigurasi' },
      { status: 503 }
    )
  }

  try {
    const { slug } = params

    if (!validateSlug(slug)) {
      return NextResponse.json({ error: 'Invalid slug' }, { status: 400 })
    }

    const { data: existing } = await supabaseAdmin
      .from('posts')
      .select('slug')
      .eq('slug', slug)
      .maybeSingle()

    if (!existing) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    const { error } = await supabaseAdmin.from('posts').delete().eq('slug', slug)

    if (error) {
      console.error(error)
      return NextResponse.json(
        { error: toUserFacingDbError(error) },
        { status: 500 }
      )
    }

    revalidatePostPaths(slug)

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(err)
    const message =
      err && typeof err === 'object' && 'message' in err
        ? toUserFacingDbError(err as { message?: string; code?: string })
        : 'Gagal menghapus post'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
