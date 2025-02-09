'use client'
import { useEffect, useState, useRef } from 'react'

export default function CertificateCatalog() {
  const [folders, setFolders] = useState<any[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

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

  // Intersection Observer setup for lazy loading images
  const observer = useRef(
    new IntersectionObserver(
      (entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement
            img.src = img.dataset.src as string
            observer.unobserve(img)
          }
        })
      },
      { threshold: 0.1 }
    )
  )

  // Lazy loading images when they are in the viewport
  const handleImageRef = (node: HTMLImageElement) => {
    if (node) {
      observer.current.observe(node)
    }
  }

  // Error handler for images
  const handleImageError = (
    e: React.SyntheticEvent<HTMLImageElement, Event>
  ) => {
    // On error, we can either remove the image or replace it with a placeholder
    e.currentTarget.style.display = 'none' // Hide the image on error
    // Optionally, you can also replace with a placeholder:
    // e.currentTarget.src = 'path_to_placeholder_image.jpg';
  }

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
                        {file.thumbnailLink ? (
                          <img
                            ref={handleImageRef} // Lazy load image
                            data-src={file.thumbnailLink} // Store image source
                            alt={file.id}
                            loading='lazy'
                            className='h-auto w-20 rounded-lg shadow-lg'
                            onClick={() => setSelectedImage(file.thumbnailLink)}
                            onError={handleImageError} // Handle image error
                          />
                        ) : (
                          <span className='text-gray-400'>No thumbnail</span>
                        )}
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
      {/* 🔹 MODAL untuk zoom gambar */}
      {selectedImage && (
        <div
          className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75'
          onClick={() => setSelectedImage(null)}
        >
          <div className='relative'>
            <img
              src={selectedImage}
              alt='Zoomed Image'
              className='max-h-[100vh] max-w-full rounded-lg shadow-lg'
            />
          </div>
        </div>
      )}
    </section>
  )
}
