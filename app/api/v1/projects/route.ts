import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const projectsDir = path.join(process.cwd(), 'content', 'projects')
const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

function validateSlug(slug: string): boolean {
  return SLUG_REGEX.test(slug)
}

// GET all projects
export async function GET() {
  try {
    const files = fs.readdirSync(projectsDir)
    const projects = files
      .filter(file => file.endsWith('.mdx'))
      .map(file => {
        const slug = file.replace(/\.mdx$/, '')
        const filePath = path.join(projectsDir, file)
        const fileContent = fs.readFileSync(filePath, { encoding: 'utf8' })
        const { data, content } = matter(fileContent)
        return {
          slug,
          metadata: data,
          content
        }
      })
      .sort((a, b) => {
        const dateA = new Date(a.metadata.publishedAt ?? '')
        const dateB = new Date(b.metadata.publishedAt ?? '')
        return dateB.getTime() - dateA.getTime()
      })

    return NextResponse.json({ projects })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to load projects' },
      { status: 500 }
    )
  }
}

// POST create new project
export async function POST(request: Request) {
  try {
    const { slug, metadata, content } = await request.json()

    if (!slug || !metadata || content === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: slug, metadata, content' },
        { status: 400 }
      )
    }

    // Validate slug format (kebab-case)
    if (!validateSlug(slug)) {
      return NextResponse.json(
        { error: 'Invalid slug format. Use lowercase letters, numbers, and hyphens only.' },
        { status: 400 }
      )
    }

    const filePath = path.join(projectsDir, `${slug}.mdx`)

    // Check if file already exists
    if (fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: 'Project with this slug already exists' },
        { status: 409 }
      )
    }

    // Create MDX content with frontmatter
    const mdxContent = matter.stringify(content, metadata)
    fs.writeFileSync(filePath, mdxContent, 'utf8')

    return NextResponse.json({ 
      success: true, 
      message: 'Project created successfully',
      slug 
    })
  } catch (error) {
    console.error('Error creating project:', error)
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    )
  }
}

// PUT update existing project
export async function PUT(request: Request) {
  try {
    const { slug, newSlug, metadata, content } = await request.json()

    if (!slug || !metadata || content === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: slug, metadata, content' },
        { status: 400 }
      )
    }

    const oldFilePath = path.join(projectsDir, `${slug}.mdx`)

    // Check if original file exists
    if (!fs.existsSync(oldFilePath)) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    // If slug is changing, validate new slug
    if (newSlug && newSlug !== slug) {
      if (!validateSlug(newSlug)) {
        return NextResponse.json(
          { error: 'Invalid slug format. Use lowercase letters, numbers, and hyphens only.' },
          { status: 400 }
        )
      }

      const newFilePath = path.join(projectsDir, `${newSlug}.mdx`)
      
      // Check if new slug already exists
      if (fs.existsSync(newFilePath)) {
        return NextResponse.json(
          { error: 'A project with the new slug already exists' },
          { status: 409 }
        )
      }

      // Create new file and delete old one
      const mdxContent = matter.stringify(content, metadata)
      fs.writeFileSync(newFilePath, mdxContent, 'utf8')
      fs.unlinkSync(oldFilePath)

      return NextResponse.json({ 
        success: true, 
        message: 'Project updated and renamed successfully',
        slug: newSlug 
      })
    } else {
      // Just update the existing file
      const mdxContent = matter.stringify(content, metadata)
      fs.writeFileSync(oldFilePath, mdxContent, 'utf8')

      return NextResponse.json({ 
        success: true, 
        message: 'Project updated successfully',
        slug 
      })
    }
  } catch (error) {
    console.error('Error updating project:', error)
    return NextResponse.json(
      { error: 'Failed to update project' },
      { status: 500 }
    )
  }
}

// DELETE remove project
export async function DELETE(request: Request) {
  try {
    const { slug } = await request.json()

    if (!slug) {
      return NextResponse.json(
        { error: 'Missing required field: slug' },
        { status: 400 }
      )
    }

    const filePath = path.join(projectsDir, `${slug}.mdx`)

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    // Delete the file
    fs.unlinkSync(filePath)

    return NextResponse.json({ 
      success: true, 
      message: 'Project deleted successfully' 
    })
  } catch (error) {
    console.error('Error deleting project:', error)
    return NextResponse.json(
      { error: 'Failed to delete project' },
      { status: 500 }
    )
  }
}
