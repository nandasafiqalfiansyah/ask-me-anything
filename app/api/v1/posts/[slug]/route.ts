import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { revalidatePath } from 'next/cache'

const postsDir = path.join(process.cwd(), 'content', 'posts')

type Params = { params: { slug: string } }

// GET /api/v1/posts/[slug]
export async function GET(_req: Request, { params }: Params) {
  const { slug } = params
  const filePath = path.join(postsDir, `${slug}.mdx`)

  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 })
  }

  const raw = fs.readFileSync(filePath, 'utf8')
  const { data, content } = matter(raw)

  return NextResponse.json({ id: slug, slug, ...data, content })
}

// PUT /api/v1/posts/[slug]
export async function PUT(req: Request, { params }: Params) {
  try {
    const { slug } = params
    const filePath = path.join(postsDir, `${slug}.mdx`)

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    const body = await req.json()
    const { title, summary, content, author, published, publishedAt } = body

    const existing = matter(fs.readFileSync(filePath, 'utf8'))

    const frontmatter = {
      title: title ?? existing.data.title,
      summary: summary ?? existing.data.summary ?? '',
      author: author ?? existing.data.author ?? 'Admin',
      publishedAt: publishedAt ?? existing.data.publishedAt,
      published: published !== undefined ? published : existing.data.published !== false
    }

    const fileContent = matter.stringify(content ?? existing.content, frontmatter)
    fs.writeFileSync(filePath, fileContent, 'utf8')

    revalidatePath('/posts')
    revalidatePath(`/posts/${slug}`)
    revalidatePath('/')

    return NextResponse.json({ id: slug, slug, ...frontmatter, content: content ?? existing.content })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to update post' }, { status: 500 })
  }
}

// DELETE /api/v1/posts/[slug]
export async function DELETE(_req: Request, { params }: Params) {
  try {
    const { slug } = params
    const filePath = path.join(postsDir, `${slug}.mdx`)

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    fs.unlinkSync(filePath)

    revalidatePath('/posts')
    revalidatePath('/')

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 })
  }
}
