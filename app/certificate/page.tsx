'use client'

import { useEffect, useState, useRef } from 'react'

export default function CertificateCatalog() {
  const [folders, setFolders] = useState<any[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  useEffect(() => {
    async function loadFiles() {
      try {
        const res = await fetch('/api/v1/drive')
        const data = await res.json()
        setFolders(data)
      } catch (error) {
        console.error('Error fetching files:', error)
      } finally {
        setLoading(false)
      }
    }
    loadFiles()
  }, [])

  return (
    <section className='pb-24 pt-40'>
      <div className='container max-w-3xl'>
        <h2 className='title mb-12 font-bold'>List&apos; Certificate</h2>
        {loading ? (
          <p>Loading...</p>
        ) : folders.length > 0 ? (
          folders.map(folder => (
            <div
              key={folder.folderName}
              className='my-4 rounded-lg border p-4 shadow-md'
            >
              <h3 className='title text-2xl font-semibold'>
                {folder.folderName}
              </h3>
              <ul className='mt-2'>
                {folder.files.length > 0 ? (
                  folder.files.map(
                    (file: {
                      id: string
                      name: string
                      thumbnailLink: string
                    }) => (
                      <li key={file.id} className='flex items-center gap-4 p-2'>
                        <a
                          href={`https://drive.google.com/file/d/${file.id}/view`}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='text-blue-500 hover:underline'
                        >
                          {file.name.replace(/\.pdf$/i, '')}
                        </a>
                      </li>
                    )
                  )
                ) : (
                  <p className='text-gray-500'>No Certificate available.</p>
                )}
              </ul>
            </div>
          ))
        ) : (
          <p>No Certificate found.</p>
        )}
      </div>
    </section>
  )
}
