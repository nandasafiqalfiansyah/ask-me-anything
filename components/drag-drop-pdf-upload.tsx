'use client'

import { useState, useCallback } from 'react'

type DragDropPdfUploadProps = {
  onPdfSelect: (file: File) => void
  currentPdfUrl?: string
  disabled?: boolean
  maxSizeMB?: number
}

export default function DragDropPdfUpload({
  onPdfSelect,
  currentPdfUrl,
  disabled = false,
  maxSizeMB = 10
}: DragDropPdfUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)

  const validatePdf = useCallback(
    (file: File): string | null => {
      if (file.type !== 'application/pdf') {
        return 'Invalid file type. Please upload a PDF file.'
      }

      const maxSize = maxSizeMB * 1024 * 1024
      if (file.size > maxSize) {
        return `PDF too large. Maximum size is ${maxSizeMB}MB.`
      }

      return null
    },
    [maxSizeMB]
  )

  const handleFile = useCallback(
    (file: File) => {
      if (disabled) return

      const validationError = validatePdf(file)
      if (validationError) {
        setError(validationError)
        return
      }

      setError(null)
      setSelectedFile(file)
      onPdfSelect(file)
    },
    [disabled, onPdfSelect, validatePdf]
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

  const handleClearSelection = () => {
    if (disabled) return
    setSelectedFile(null)
    setError(null)
  }

  return (
    <div className='space-y-2'>
      <label className='block text-sm font-medium'>Certificate PDF *</label>

      {error && (
        <div className='rounded-md border border-destructive/30 bg-destructive/10 p-2 text-xs text-destructive'>
          {error}
        </div>
      )}

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative flex min-h-[180px] flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 text-center transition-colors ${isDragging ? 'border-primary bg-primary/5' : 'border-border'} ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:border-primary/50'} `}
      >
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
            d='M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z'
          />
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M14 2v6h6M9 15h6M9 18h4'
          />
        </svg>

        <p className='mb-2 text-sm text-muted-foreground'>
          <span className='font-semibold'>Click to upload</span> atau drag and
          drop PDF
        </p>

        {selectedFile ? (
          <p className='text-xs text-muted-foreground'>
            Selected: {selectedFile.name} (
            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
          </p>
        ) : currentPdfUrl ? (
          <a
            href={currentPdfUrl}
            target='_blank'
            rel='noopener noreferrer'
            className='text-xs text-primary hover:underline'
            onClick={e => e.stopPropagation()}
          >
            View current PDF
          </a>
        ) : (
          <p className='text-xs text-muted-foreground'>
            PDF up to {maxSizeMB}MB
          </p>
        )}

        <input
          type='file'
          accept='application/pdf'
          onChange={handleFileInputChange}
          disabled={disabled}
          className='absolute inset-0 cursor-pointer opacity-0'
        />
      </div>

      {selectedFile && !disabled && (
        <button
          type='button'
          onClick={handleClearSelection}
          className='text-xs text-muted-foreground underline hover:text-foreground'
        >
          Clear selected PDF
        </button>
      )}
    </div>
  )
}
