import React from 'react'

export function ProjectsSkeleton() {
  return (
    <div className='scroll-mt-24 pb-16 sm:pb-24'>
      <div className='flex items-end justify-between gap-4 pb-8'>
        <div className='space-y-2'>
          <div className='h-4 w-28 rounded bg-muted/60 animate-pulse' />
          <div className='h-7 w-48 rounded bg-muted/70 animate-pulse' />
          <div className='h-4 w-72 max-w-full rounded bg-muted/40 animate-pulse' />
        </div>
      </div>
      <div className='grid grid-cols-1 gap-6 sm:grid-cols-2'>
        {[1, 2].map(i => (
          <div
            key={i}
            className='flex flex-col overflow-hidden rounded-xl border border-border/60 bg-card/60 p-4 space-y-4'
          >
            <div className='aspect-video w-full rounded-lg bg-muted/50 animate-pulse' />
            <div className='space-y-2'>
              <div className='h-5 w-3/4 rounded bg-muted/70 animate-pulse' />
              <div className='h-3.5 w-full rounded bg-muted/40 animate-pulse' />
              <div className='h-3.5 w-2/3 rounded bg-muted/40 animate-pulse' />
            </div>
            <div className='flex gap-2 pt-2'>
              <div className='h-5 w-14 rounded bg-muted/40 animate-pulse' />
              <div className='h-5 w-14 rounded bg-muted/40 animate-pulse' />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function PostsSkeleton() {
  return (
    <div className='pb-16 sm:pb-24'>
      <div className='flex items-end justify-between gap-4 pb-8'>
        <div className='space-y-2'>
          <div className='h-7 w-44 rounded bg-muted/70 animate-pulse' />
          <div className='h-4 w-64 max-w-full rounded bg-muted/40 animate-pulse' />
        </div>
      </div>
      <div className='space-y-4'>
        {[1, 2, 3].map(i => (
          <div
            key={i}
            className='flex items-center justify-between rounded-lg border border-border/50 bg-card/40 p-4'
          >
            <div className='space-y-2 flex-1 pr-4'>
              <div className='h-4 w-2/3 rounded bg-muted/70 animate-pulse' />
              <div className='h-3 w-1/3 rounded bg-muted/40 animate-pulse' />
            </div>
            <div className='h-3 w-16 rounded bg-muted/30 animate-pulse' />
          </div>
        ))}
      </div>
    </div>
  )
}
