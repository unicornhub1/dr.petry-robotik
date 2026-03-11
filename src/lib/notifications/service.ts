import { createAdminClient } from '@/lib/supabase/admin'

interface CreateNotificationParams {
  userId: string
  type: string
  title: string
  body?: string
  link?: string
}

// Uses service role client to bypass RLS (inserting for other users)
export async function createNotification(params: CreateNotificationParams) {
  const supabase = createAdminClient()
  await supabase.from('notifications').insert({
    user_id: params.userId,
    type: params.type,
    title: params.title,
    body: params.body ?? null,
    link: params.link ?? null,
    is_read: false,
  })
}

export async function createAdminNotification(params: Omit<CreateNotificationParams, 'userId'>) {
  const supabase = createAdminClient()
  // Find all admin users
  const { data: admins } = await supabase
    .from('profiles')
    .select('id')
    .eq('is_admin', true)

  if (admins && admins.length > 0) {
    await Promise.all(
      admins.map(admin => createNotification({ ...params, userId: admin.id }))
    )
  }
}
