import { supabaseAdmin } from './supabaseAdmin'

export type Project = {
  metadata: ProjectMetadata
  content: string
}

export type ProjectMetadata = {
  title?: string
  summary?: string
  image?: string
  author?: string
  tags?: string[]
  publishedAt?: string
  slug: string
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  try {
    const { data: project, error } = await supabaseAdmin
      .from('projects')
      .select('*')
      .eq('slug', slug)
      .single()

    if (error || !project) {
      return null
    }

    return {
      metadata: {
        title: project.title,
        summary: project.summary,
        image: project.image_url,
        author: project.author,
        tags: project.tags || [],
        publishedAt: project.published_at,
        slug: project.slug
      },
      content: project.content
    }
  } catch (error) {
    console.error('Error fetching project by slug:', error)
    return null
  }
}

export async function getProjects(limit?: number): Promise<ProjectMetadata[]> {
  try {
    let query = supabaseAdmin
      .from('projects')
      .select('*')
      .order('published_at', { ascending: false })

    if (limit) {
      query = query.limit(limit)
    }

    const { data: projects, error } = await query

    if (error) {
      console.error('Error fetching projects:', error)
      return []
    }

    return (projects || []).map(project => ({
      title: project.title,
      summary: project.summary,
      image: project.image_url,
      author: project.author,
      tags: project.tags || [],
      publishedAt: project.published_at,
      slug: project.slug
    }))
  } catch (error) {
    console.error('Error fetching projects:', error)
    return []
  }
}

export function getProjectMetadata(filepath: string): ProjectMetadata {
  // This function is deprecated and kept for backward compatibility
  // In the new system, use getProjectBySlug or getProjects instead
  throw new Error('getProjectMetadata is deprecated, use getProjects or getProjectBySlug instead')
}
