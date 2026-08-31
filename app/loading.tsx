export default function Loading() {
  return (
    <div className='flex min-h-[65vh] w-full items-center justify-center px-4'>
      <div className='flex flex-col items-center gap-4 text-center'>
        <div className='relative flex h-14 w-14 items-center justify-center'>
          <div className='absolute h-full w-full animate-spin rounded-full border-3 border-border border-t-foreground' />
          <div className='h-3 w-3 rounded-full bg-primary/80 animate-pulse' />
        </div>
        <div className='space-y-1'>
          <p className='font-mono text-xs uppercase tracking-widest text-muted-foreground'>
            Memuat Data...
          </p>
          <p className='text-xs text-muted-foreground/70'>
            Mohon tunggu sebentar
          </p>
        </div>
      </div>
    </div>
  )
}
