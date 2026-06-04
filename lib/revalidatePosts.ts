import { revalidatePath } from 'next/cache'

export function revalidatePostPaths(slug?: string) {
  try {
    revalidatePath('/posts')
    revalidatePath('/')
    if (slug) {
      revalidatePath(`/posts/${slug}`)
    }
  } catch (error) {
    console.error('revalidatePath failed:', error)
  }
}
