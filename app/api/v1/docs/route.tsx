import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET() {
  const apiDir = path.join(process.cwd(), 'app/api/v1')
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://ndav.my.id'
  const endpoints: Record<string, { description: string; url: string }> = {}

  try {
    const dirs = fs
      .readdirSync(apiDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name)

    dirs.forEach(dir => {
      const route = `/api/v1/${dir}`
      endpoints[route] = {
        description: `Endpoint for ${dir}`,
        url: `${baseUrl}${route}`
      }
    })

    return NextResponse.json({
      message:
        'Welcome to API v1! This API is designed for use with the official Nanda Safiq Alfiansyah API client.',
      endpoints
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to load API endpoints' },
      { status: 500 }
    )
  }
}
