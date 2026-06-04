import CrudPosts from '../../../components/crud-posts'

export const metadata = {
  title: 'Blog Management'
}

export default function Page() {
  return (
    <div className='p-6'>
      <h1 className='mb-1 text-2xl font-semibold'>Blog Management</h1>
      <p className='mb-6 text-sm text-muted-foreground'>
        Buat, edit, dan kelola semua post blog dari sini.
      </p>
      <CrudPosts />
    </div>
  )
}
