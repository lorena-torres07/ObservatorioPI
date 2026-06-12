import { createClient } from '@/lib/supabase/server';

export async function createNotification({
  userId,
  type,
  title,
  message,
  projectId,
}: {
  userId: string;
  type: string;
  title: string;
  message: string;
  projectId?: string;
}) {
  const supabase = createClient();
  await supabase.from('notifications').insert({
    user_id: userId,
    type,
    title,
    message,
    project_id: projectId ?? null,
  });
}