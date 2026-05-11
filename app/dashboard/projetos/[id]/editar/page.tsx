import { redirect, notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ProjectForm } from '@/components/projects/project-form';

export default async function EditProjectPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('id', params.id)
    .maybeSingle();

  if (!project) notFound();

  if (project.owner_id !== user.id) redirect('/dashboard/projetos');
  if (!['draft', 'submitted', 'rejected'].includes(project.status)) redirect(`/dashboard/projetos/${params.id}`);

  const { data: classes } = await supabase
    .from('classes')
    .select('id, name, course, year, semester')
    .eq('is_active', true)
    .order('year', { ascending: false });

  return (
    <div className="p-6 sm:p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Editar Projeto</h1>
        <p className="text-muted-foreground mt-1 text-sm">Atualize as informações do seu projeto.</p>
      </div>
      <ProjectForm classes={classes ?? []} mode="edit" project={project} />
    </div>
  );
}
