import { createClient } from '@/lib/supabase/client';

type LogAction =
  | 'project_created'
  | 'project_updated'
  | 'project_submitted'
  | 'project_evaluated'
  | 'status_changed'
  | 'member_added'
  | 'member_removed';

export async function logActivity(
  action: LogAction,
  projectId: string | null,
  metadata?: Record<string, unknown>
) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('activity_logs').insert({
      user_id: user?.id ?? null,
      project_id: projectId,
      action,
      metadata: metadata ?? null,
    });
  } catch {
    // log nunca deve quebrar o fluxo principal
  }
}