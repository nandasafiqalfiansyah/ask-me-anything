import { supabaseAdmin } from './supabaseAdmin'

export type DbComment = {
  id: number
  post_slug: string
  author_name: string
  content: string
  is_pinned: boolean
  created_at: string
}

export type CommentItem = {
  id: string
  postSlug: string
  authorName: string
  content: string
  isPinned: boolean
  createdAt: string
}

export function hasCommentsDbConfig(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.SUPABASE_SERVICE_ROLE_KEY
  )
}

export function toCommentItem(row: DbComment): CommentItem {
  return {
    id: String(row.id),
    postSlug: row.post_slug,
    authorName: row.author_name,
    content: row.content,
    isPinned: row.is_pinned,
    createdAt: row.created_at
  }
}

export async function listCommentsBySlug(slug: string): Promise<CommentItem[]> {
  const { data, error } = await supabaseAdmin
    .from('post_comments')
    .select('*')
    .eq('post_slug', slug)
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data as DbComment[]).map(toCommentItem)
}

export async function listAllComments(): Promise<CommentItem[]> {
  const { data, error } = await supabaseAdmin
    .from('post_comments')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data as DbComment[]).map(toCommentItem)
}

export async function createComment(input: {
  postSlug: string
  authorName: string
  content: string
}): Promise<CommentItem> {
  const { data, error } = await supabaseAdmin
    .from('post_comments')
    .insert({
      post_slug: input.postSlug,
      author_name: input.authorName,
      content: input.content
    })
    .select()
    .single()

  if (error) throw error
  return toCommentItem(data as DbComment)
}

export async function deleteComment(id: number): Promise<void> {
  const { error } = await supabaseAdmin
    .from('post_comments')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export async function toggleCommentPin(
  id: number,
  isPinned: boolean
): Promise<CommentItem> {
  const { data, error } = await supabaseAdmin
    .from('post_comments')
    .update({ is_pinned: isPinned })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return toCommentItem(data as DbComment)
}
