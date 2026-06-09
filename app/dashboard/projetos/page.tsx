import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Search } from 'lucide-react';
import { ProjectsClient } from './projects-client';
import type { Project, Profile } from '@/lib/supabase/types';

export default async function ProjectsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profileData } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();
  if (!profileData) redirect('/login');
  const profile = profileData as Profile;

  // Fetch classes based on role
  let classes: { id: string; name: string; course: string; year: number; semester: string }[] = [];

  if (profile.role === 'admin' || profile.role === 'partner') {
    const { data } = await supabase
      .from('classes')
      .select('id, name, course, year, semester')
      .order('year', { ascending: false });
    classes = data ?? [];
  } else if (profile.role === 'professor') {
    const { data: assignments } = await supabase
      .from('class_professors')
      .select('class_id')
      .eq('professor_id', user.id);
    const classIds = (assignments ?? []).map(a => a.class_id);
    if (classIds.length > 0) {
      const { data } = await supabase
        .from('classes')
        .select('id, name, course, year, semester')
        .in('id', classIds)
        .order('year', { ascending: false });
      classes = data ?? [];
    }
  }

  // Professor sem turmas
  if (profile.role === 'professor' && classes.length === 0) {
    return (
      <div className="p-6 sm:p-8 max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Projetos</h1>
          <p className="text-muted-foreground mt-1 text-sm">Nenhuma turma atribuída</p>
        </div>
        <div className="bg-card rounded-2xl border border-border p-16 text-center">
          <div className="w-14 h-14 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Search className="w-7 h-7 text-muted-foreground/50" />
          </div>
          <h3 className="font-semibold text-foreground text-lg mb-2">Nenhuma turma atribuída</h3>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            Solicite ao administrador que atribua turmas para que você possa visualizar os projetos.
          </p>
        </div>
      </div>
    );
  }

  // Busca email do admin (só para partner)
  let adminEmail = '';
  if (profile.role === 'partner') {
    const { data: adminData } = await supabase
      .from('profiles')
      .select('email')
      .eq('role', 'admin')
      .limit(1)
      .maybeSingle();
    adminEmail = adminData?.email ?? '';
  }

  // Fetch projects
  let query = supabase
    .from('projects')
    .select('*, profiles!owner_id(email, full_name)')
    .order('updated_at', { ascending: false });

  if (profile.role === 'student') {
    query = query.eq('owner_id', user.id);
  } else if (profile.role === 'professor') {
    const classIds = classes.map(c => c.id);
    query = query.in('class_id', classIds);
  } else if (profile.role === 'partner') {
    query = query.in('status', ['approved', 'featured']);
  }

  const { data: projects } = await query;

  // Busca email do professor por turma (só para partner)
  let professorEmailsByClassId: Record<string, string> = {};
  if (profile.role === 'partner' && projects && projects.length > 0) {
    const classIds = [...new Set(projects.map((p: any) => p.class_id).filter(Boolean))];
    if (classIds.length > 0) {
      const { data: cpData } = await supabase
        .from('class_professors')
        .select('class_id, profiles!professor_id(email)')
        .in('class_id', classIds);
      (cpData ?? []).forEach((cp: any) => {
        if (cp.class_id && cp.profiles?.email) {
          professorEmailsByClassId[cp.class_id] = cp.profiles.email;
        }
      });
    }
  }

  const typedProjects = (projects ?? []).map((p: any) => ({
    ...p,
    student_email: p.profiles?.email ?? '',
    professor_email: professorEmailsByClassId[p.class_id] ?? '',
    admin_email: adminEmail,
    profiles: p.profiles ? { full_name: p.profiles.full_name } : null,
  }));

  return (
    <div className="p-6 sm:p-8 max-w-6xl mx-auto">
      <ProjectsClient
        role={profile.role}
        classes={classes}
        projects={typedProjects}
      />
    </div>
  );
}