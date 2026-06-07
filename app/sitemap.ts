import type { MetadataRoute } from 'next'

import { getPosts } from '@/lib/posts'
import { getProjects } from '@/lib/projects'
import { getSiteUrl } from '@/lib/site'

export const dynamic = 'force-dynamic'

const staticRoutes: Array<{
  path: string
  changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency']
  priority: number
}> = [
  { path: '/', changeFrequency: 'weekly', priority: 1 },
  { path: '/posts', changeFrequency: 'daily', priority: 0.9 },
  { path: '/projects', changeFrequency: 'weekly', priority: 0.9 },
  { path: '/certificate', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/contact', changeFrequency: 'yearly', priority: 0.6 },
  { path: '/privacy', changeFrequency: 'yearly', priority: 0.3 }
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl()
  const [posts, projects] = await Promise.all([getPosts(), getProjects()])

  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map(route => ({
    url: `${siteUrl}${route.path}`,
    lastModified: new Date(),
    changeFrequency: route.changeFrequency,
    priority: route.priority
  }))

  const postEntries: MetadataRoute.Sitemap = posts.map(post => ({
    url: `${siteUrl}/posts/${post.slug}`,
    lastModified: post.publishedAt ? new Date(post.publishedAt) : new Date(),
    changeFrequency: 'weekly',
    priority: 0.8
  }))

  const projectEntries: MetadataRoute.Sitemap = projects.map(project => ({
    url: `${siteUrl}/projects/${project.slug}`,
    lastModified: project.publishedAt
      ? new Date(project.publishedAt)
      : new Date(),
    changeFrequency: 'monthly',
    priority: 0.8
  }))

  return [...staticEntries, ...postEntries, ...projectEntries]
}
