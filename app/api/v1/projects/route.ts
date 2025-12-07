import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

function validateSlug(slug: string): boolean {
  return SLUG_REGEX.test(slug)
}

// GET all projects
export async function GET() {
  try {
    const { data: projects, error } = await supabaseAdmin
      .from('projects')
      .select('*')
      .order('published_at', { ascending: false })

    if (error) {
      console.error('Error fetching projects:', error)
      return NextResponse.json(
        { error: 'Failed to load projects' },
        { status: 500 }
      )
    }

    // Transform to match frontend expectations
    const transformedProjects = (projects || []).map(project => ({
      slug: project.slug,
      metadata: {
        title: project.title,
        summary: project.summary,
        image: project.image_url,
        author: project.author,
        tags: project.tags || [],
        publishedAt: project.published_at
      },
      content: project.content
    }))

    return NextResponse.json({ projects: transformedProjects })
  } catch (error) {
    console.error('Error in GET /api/v1/projects:', error)
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

    if (!metadata.title || !metadata.publishedAt) {
      return NextResponse.json(
        { error: 'Title and publishedAt are required in metadata' },
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

    // Check if slug already exists
    const { data: existingProject } = await supabaseAdmin
      .from('projects')
      .select('slug')
      .eq('slug', slug)
      .single()

    if (existingProject) {
      return NextResponse.json(
        { error: 'Project with this slug already exists' },
        { status: 409 }
      )
    }

    // Get the highest sort_order to append new project at the end
    const { data: maxSortOrder } = await supabaseAdmin
      .from('projects')
      .select('sort_order')
      .order('sort_order', { ascending: false })
      .limit(1)
      .single()

    const nextSortOrder = (maxSortOrder?.sort_order ?? -1) + 1

    // Insert into database
    const { data: newProject, error } = await supabaseAdmin
      .from('projects')
      .insert({
        slug,
        title: metadata.title,
        summary: metadata.summary || null,
        image_url: metadata.image || null,
        author: metadata.author || 'ndav',
        tags: metadata.tags || [],
        published_at: metadata.publishedAt,
        content,
        sort_order: nextSortOrder
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating project:', error)
      return NextResponse.json(
        { error: 'Failed to create project in database' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Project created successfully',
      slug,
      project: newProject
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

    if (!metadata.title || !metadata.publishedAt) {
      return NextResponse.json(
        { error: 'Title and publishedAt are required in metadata' },
        { status: 400 }
      )
    }

    // Check if original project exists
    const { data: existingProject } = await supabaseAdmin
      .from('projects')
      .select('*')
      .eq('slug', slug)
      .single()

    if (!existingProject) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    // If slug is changing, validate new slug
    const finalSlug = newSlug && newSlug !== slug ? newSlug : slug
    
    if (newSlug && newSlug !== slug) {
      if (!validateSlug(newSlug)) {
        return NextResponse.json(
          { error: 'Invalid slug format. Use lowercase letters, numbers, and hyphens only.' },
          { status: 400 }
        )
      }

      // Check if new slug already exists
      const { data: duplicateProject } = await supabaseAdmin
        .from('projects')
        .select('slug')
        .eq('slug', newSlug)
        .single()

      if (duplicateProject) {
        return NextResponse.json(
          { error: 'A project with the new slug already exists' },
          { status: 409 }
        )
      }
    }

    // Update the project
    const { data: updatedProject, error } = await supabaseAdmin
      .from('projects')
      .update({
        slug: finalSlug,
        title: metadata.title,
        summary: metadata.summary || null,
        image_url: metadata.image || null,
        author: metadata.author || 'ndav',
        tags: metadata.tags || [],
        published_at: metadata.publishedAt,
        content,
        updated_at: new Date().toISOString()
      })
      .eq('slug', slug)
      .select()
      .single()

    if (error) {
      console.error('Error updating project:', error)
      return NextResponse.json(
        { error: 'Failed to update project in database' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      message: newSlug && newSlug !== slug 
        ? 'Project updated and renamed successfully' 
        : 'Project updated successfully',
      slug: finalSlug,
      project: updatedProject
    })
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

    // Check if project exists
    const { data: existingProject } = await supabaseAdmin
      .from('projects')
      .select('id, image_url')
      .eq('slug', slug)
      .single()

    if (!existingProject) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    // If there's an image stored in Supabase storage, delete it
    if (existingProject.image_url && existingProject.image_url.includes('supabase')) {
      try {
        const urlParts = existingProject.image_url.split('/')
        const fileName = urlParts[urlParts.length - 1]
        await supabaseAdmin.storage.from('project-images').remove([fileName])
      } catch (storageError) {
        console.error('Error deleting image from storage:', storageError)
        // Continue with project deletion even if image deletion fails
      }
    }

    // Delete the project
    const { error } = await supabaseAdmin
      .from('projects')
      .delete()
      .eq('slug', slug)

    if (error) {
      console.error('Error deleting project:', error)
      return NextResponse.json(
        { error: 'Failed to delete project from database' },
        { status: 500 }
      )
    }

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
