import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { revalidatePath } from 'next/cache'

const postsDir = path.join(process.cwd(), 'content', 'posts')

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function ensurePostsDir() {
  if (!fs.existsSync(postsDir)) {
    fs.mkdirSync(postsDir, { recursive: true })
  }
}

// GET /api/v1/posts — list all posts
export async function GET() {
  try {
    ensurePostsDir()
    const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.mdx'))

    const posts = files.map(file => {
      const slug = file.replace(/\.mdx$/, '')
      const raw = fs.readFileSync(path.join(postsDir, file), 'utf8')
      const { data, content } = matter(raw)
      return {
        id: slug,
        slug,
        title: data.title ?? slug,
        summary: data.summary ?? '',
        author: data.author ?? '',
        publishedAt: data.publishedAt ?? '',
        published: data.published !== false,
        content
      }
    })

    // Sort newest first
    posts.sort(
      (a, b) =>
        new Date(b.publishedAt || 0).getTime() -
        new Date(a.publishedAt || 0).getTime()
    )

    return NextResponse.json(posts)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to list posts' }, { status: 500 })
  }
}

// POST /api/v1/posts — create new post
export async function POST(req: Request) {
  try {
    ensurePostsDir()
    const body = await req.json()
    const { title, summary, content, author, published } = body

    if (!title || typeof title !== 'string') {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    let slug = slugify(title)
    // Avoid conflicts
    let counter = 0
    let filePath = path.join(postsDir, `${slug}.mdx`)
    while (fs.existsSync(filePath)) {
      counter++
      filePath = path.join(postsDir, `${slug}-${counter}.mdx`)
    }
    if (counter > 0) slug = `${slug}-${counter}`

    const publishedAt = new Date().toISOString().split('T')[0]

    const frontmatter = {
      title,
      summary: summary ?? '',
      author: author ?? 'Admin',
      publishedAt,
      published: published !== false
    }

    const fileContent = matter.stringify(content ?? '', frontmatter)
    fs.writeFileSync(filePath, fileContent, 'utf8')

    revalidatePath('/posts')
    revalidatePath('/')

    return NextResponse.json({ id: slug, slug, ...frontmatter, content: content ?? '' }, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 })
  }
}
