import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Sidebar } from '@/components/dashboard/sidebar';
import { MobileHeader } from '@/components/dashboard/mobile-header';
import type { Profile } from '@/lib/supabase/types';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profileData } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  if (!profileData) {
    await supabase.auth.signOut();
    redirect('/login?error=perfil_incompleto');
  }

  const profile = profileData as Profile;

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar profile={profile} />
      <MobileHeader profile={profile} />
      <main className="flex-1 lg:overflow-y-auto min-h-screen pt-14 lg:pt-0">
        {children}
      </main>
    </div>
  );
}
