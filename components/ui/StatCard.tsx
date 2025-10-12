export function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className='rounded-xl border p-4'>
      <div className='text-xs uppercase text-muted-foreground'>{label}</div>
      <div className='mt-1 text-2xl font-semibold'>{value}</div>
    </div>
  )
}
