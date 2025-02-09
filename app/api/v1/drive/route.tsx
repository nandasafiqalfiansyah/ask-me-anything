import { NextResponse } from 'next/server'
import axios from 'axios'

const API_KEY = process.env.GOOGLE_API_KEY
const FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID

const driveApi = axios.create({
  baseURL: 'https://www.googleapis.com/drive/v3',
  params: { key: API_KEY }
})

async function getFilesFromFolder(folderId: string) {
  try {
    const { data } = await driveApi.get('/files', {
      params: {
        q: `'${folderId}' in parents`,
        fields: 'files(id, name, thumbnailLink, mimeType)'
      }
    })
    return data.files
  } catch {
    return []
  }
}

export async function GET() {
  try {
    const { data } = await driveApi.get('/files', {
      params: {
        q: `'${FOLDER_ID}' in parents and mimeType='application/vnd.google-apps.folder'`,
        fields: 'files(id, name)'
      }
    })

    const allFiles = await Promise.all(
      data.files.map(async (folder: { name: any; id: string }) => ({
        folderName: folder.name,
        files: await getFilesFromFolder(folder.id)
      }))
    )

    return NextResponse.json(allFiles)
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch files' },
      { status: 500 }
    )
  }
}
