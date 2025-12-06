'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'

type DragDropImageUploadProps = {
  onImageSelect: (file: File) => void
  currentImageUrl?: string
  disabled?: boolean
  maxSizeMB?: number
}

export default function DragDropImageUpload({
  onImageSelect,
  currentImageUrl,
  disabled = false,
  maxSizeMB = 5
}: DragDropImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [preview, setPreview] = useState<string | null>(currentImageUrl || null)
  const [error, setError] = useState<string | null>(null)

  const validateImage = useCallback((file: File): string | null => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return 'Invalid file type. Please upload an image (JPEG, PNG, GIF, or WebP).'
    }

    const maxSize = maxSizeMB * 1024 * 1024
    if (file.size > maxSize) {
      return `File too large. Maximum size is ${maxSizeMB}MB.`
    }

    return null
  }, [maxSizeMB])

  const handleFile = useCallback(
    (file: File) => {
      if (disabled) return

      const validationError = validateImage(file)
      if (validationError) {
        setError(validationError)
        return
      }

      setError(null)
      onImageSelect(file)

      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    },
    [disabled, onImageSelect, validateImage]
  )

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    if (!disabled) {
      setIsDragging(true)
    }
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    if (disabled) return

    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      handleFile(files[0])
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFile(files[0])
    }
  }

  const handleRemove = () => {
    setPreview(null)
    setError(null)
  }

  return (
    <div className='space-y-2'>
      <label className='block text-sm font-medium'>
        Image Upload (Drag & Drop)
      </label>

      {error && (
        <div className='rounded-md border border-destructive/30 bg-destructive/10 p-2 text-xs text-destructive'>
          {error}
        </div>
      )}

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative flex min-h-[200px] cursor-pointer flex-col items-center justify-center
          rounded-lg border-2 border-dashed p-6 text-center transition-colors
          ${isDragging ? 'border-primary bg-primary/5' : 'border-border'}
          ${disabled ? 'cursor-not-allowed opacity-50' : 'hover:border-primary/50'}
        `}
      >
        {preview ? (
          <div className='relative w-full'>
            <img
              src={preview}
              alt='Preview'
              className='mx-auto max-h-[180px] rounded object-contain'
            />
            {!disabled && (
              <Button
                type='button'
                variant='destructive'
                size='sm'
                className='absolute right-2 top-2'
                onClick={handleRemove}
              >
                Remove
              </Button>
            )}
          </div>
        ) : (
          <>
            <svg
              className='mb-3 h-10 w-10 text-muted-foreground'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12'
              />
            </svg>
            <p className='mb-2 text-sm text-muted-foreground'>
              <span className='font-semibold'>Click to upload</span> or drag and
              drop
            </p>
            <p className='text-xs text-muted-foreground'>
              PNG, JPG, GIF, WebP up to {maxSizeMB}MB
            </p>
          </>
        )}

        <input
          type='file'
          accept='image/*'
          onChange={handleFileInputChange}
          disabled={disabled}
          className='absolute inset-0 cursor-pointer opacity-0'
        />
      </div>
    </div>
  )
}
