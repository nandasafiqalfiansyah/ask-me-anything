import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { supabaseAdmin, isSupabaseAdminConfigured } from './supabaseAdmin'

const rootDirectory = path.join(process.cwd(), 'content', 'projects')

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

function getProjectBySlugFromFiles(slug: string): Project | null {
  try {
    const filePath = path.join(rootDirectory, `${slug}.mdx`)
    if (!fs.existsSync(filePath)) return null
    const fileContent = fs.readFileSync(filePath, { encoding: 'utf8' })
    const { data, content } = matter(fileContent)
    return {
      metadata: {
        title: data.title,
        summary: data.summary,
        image: data.image,
        author: data.author,
        tags: data.tags || [],
        publishedAt: data.publishedAt,
        slug
      },
      content
    }
  } catch {
    return null
  }
}

function getProjectsFromFiles(limit?: number): ProjectMetadata[] {
  try {
    if (!fs.existsSync(rootDirectory)) return []
    const files = fs.readdirSync(rootDirectory).filter(file => file.endsWith('.mdx'))
    const projects = files
      .map(file => {
        const slug = file.replace(/\.mdx$/, '')
        const filePath = path.join(rootDirectory, file)
        const fileContent = fs.readFileSync(filePath, { encoding: 'utf8' })
        const { data } = matter(fileContent)
        return {
          title: data.title,
          summary: data.summary,
          image: data.image,
          author: data.author,
          tags: data.tags || [],
          publishedAt: data.publishedAt,
          slug
        } as ProjectMetadata
      })
      .sort((a, b) => {
        if (new Date(a.publishedAt ?? '') < new Date(b.publishedAt ?? '')) return 1
        return -1
      })

    return limit ? projects.slice(0, limit) : projects
  } catch {
    return []
  }
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  if (isSupabaseAdminConfigured()) {
    try {
      const { data: project, error } = await supabaseAdmin
        .from('projects')
        .select('*')
        .eq('slug', slug)
        .single()

      if (!error && project) {
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
      }
    } catch (error) {
      console.error('Error fetching project by slug from Supabase:', error)
    }
  }

  return getProjectBySlugFromFiles(slug)
}

export async function getProjects(limit?: number): Promise<ProjectMetadata[]> {
  if (isSupabaseAdminConfigured()) {
    try {
      let query = supabaseAdmin
        .from('projects')
        .select('*')
        .order('published_at', { ascending: false })

      if (limit) {
        query = query.limit(limit)
      }

      const { data: projects, error } = await query

      if (!error && projects && projects.length > 0) {
        return projects.map(project => ({
          title: project.title,
          summary: project.summary,
          image: project.image_url,
          author: project.author,
          tags: project.tags || [],
          publishedAt: project.published_at,
          slug: project.slug
        }))
      }
    } catch (error) {
      console.error('Error fetching projects from Supabase:', error)
    }
  }

  return getProjectsFromFiles(limit)
}

export function getProjectMetadata(filepath: string): ProjectMetadata {
  const slug = filepath.replace(/\.mdx$/, '')
  const project = getProjectBySlugFromFiles(slug)
  if (!project) {
    throw new Error(`Project not found: ${filepath}`)
  }
  return project.metadata
}
