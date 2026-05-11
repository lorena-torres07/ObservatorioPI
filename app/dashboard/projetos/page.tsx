import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Plus, Search } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ProjectCard } from '@/components/projects/project-card';
import type { Project, Profile } from '@/lib/supabase/types';

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: { turma?: string };
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profileData } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
  if (!profileData) redirect('/login');
  const profile = profileData as Profile;

  const selectedClassId = searchParams.turma ?? '';

  // Fetch classes based on role
  let classes: { id: string; name: string; course: string; year: number; semester: string }[] = [];

  if (profile.role === 'admin') {
    const { data } = await supabase.from('classes').select('id, name, course, year, semester').order('year', { ascending: false });
    classes = data ?? [];
  } else if (profile.role === 'professor') {
    const { data: assignments } = await supabase
      .from('class_professors')
      .select('class_id')
      .eq('professor_id', user.id);
    const classIds = (assignments ?? []).map(a => a.class_id);
    if (classIds.length > 0) {
      const { data } = await supabase.from('classes').select('id, name, course, year, semester').in('id', classIds).order('year', { ascending: false });
      classes = data ?? [];
    }
  }

  // Professor with no classes
  if (profile.role === 'professor' && classes.length === 0) {
    return (
      <div className="p-6 sm:p-8 max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Projetos</h1>
          <p className="text-muted-foreground mt-1 text-sm">Nenhuma turma atribuida</p>
        </div>
        <div className="bg-card rounded-2xl border border-border p-16 text-center">
          <div className="w-14 h-14 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Search className="w-7 h-7 text-muted-foreground/50" />
          </div>
          <h3 className="font-semibold text-foreground text-lg mb-2">Nenhuma turma atribuida</h3>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            Solicite ao administrador que atribua turmas para que voce possa visualizar os projetos.
          </p>
        </div>
      </div>
    );
  }

  // Fetch projects
  let query = supabase.from('projects').select('*').order('updated_at', { ascending: false });

  if (profile.role === 'student') {
    query = query.eq('owner_id', user.id);
  } else if (profile.role === 'professor') {
    const classIds = classes.map(c => c.id);
    if (selectedClassId) {
      query = query.eq('class_id', selectedClassId);
    } else {
      query = query.in('class_id', classIds);
    }
  } else if (profile.role === 'admin' && selectedClassId) {
    query = query.eq('class_id', selectedClassId);
  }

  const { data: projects } = await query;
  const typedProjects = (projects ?? []) as Project[];

  return (
    <div className="p-6 sm:p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {profile.role === 'student' ? 'Meus Projetos' : 'Projetos'}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {typedProjects.length} {typedProjects.length === 1 ? 'projeto encontrado' : 'projetos encontrados'}
          </p>
        </div>
        {profile.role === 'student' && (
          <Link href="/dashboard/projetos/novo">
            <Button className="gap-2 shrink-0">
              <Plus className="w-4 h-4" />
              Novo Projeto
            </Button>
          </Link>
        )}
      </div>

      {/* Class filter for professor and admin */}
      {(profile.role === 'professor' || profile.role === 'admin') && classes.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          <a
            href="/dashboard/projetos"
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
              !selectedClassId
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-secondary text-secondary-foreground border-border hover:bg-muted'
            }`}
          >
            Todas as turmas
          </a>
          {classes.map(cls => (
            <a
              key={cls.id}
              href={`/dashboard/projetos?turma=${cls.id}`}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                selectedClassId === cls.id
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-secondary text-secondary-foreground border-border hover:bg-muted'
              }`}
            >
              {cls.name} — {cls.course} ({cls.year}/{cls.semester})
            </a>
          ))}
        </div>
      )}

      {typedProjects.length === 0 ? (
        <div className="bg-card rounded-2xl border border-border p-16 text-center">
          <div className="w-14 h-14 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Search className="w-7 h-7 text-muted-foreground/50" />
          </div>
          <h3 className="font-semibold text-foreground text-lg mb-2">Nenhum projeto encontrado</h3>
          <p className="text-muted-foreground text-sm mb-6 max-w-md mx-auto">
            {profile.role === 'student'
              ? 'Voce ainda nao submeteu nenhum projeto. Que tal comecar agora?'
              : selectedClassId
                ? 'Nenhum projeto nesta turma.'
                : 'Nenhum projeto submetido ainda.'}
          </p>
          {profile.role === 'student' && (
            <Link href="/dashboard/projetos/novo">
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Criar Primeiro Projeto
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {typedProjects.map(project => (
            <ProjectCard key={project.id} project={project} role={profile.role} />
          ))}
        </div>
      )}
    </div>
  );
}
