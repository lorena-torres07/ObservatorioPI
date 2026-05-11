import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ProjectForm } from '@/components/projects/project-form';

export default async function NewProjectPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profileData } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
  if (!profileData) redirect('/login');

  // Get student's enrolled classes
  const { data: studentClasses } = await supabase
    .from('class_students')
    .select('class_id')
    .eq('student_id', user.id);

  const enrolledClassIds = (studentClasses ?? []).map(sc => sc.class_id);

  // For students: only show their enrolled classes; for others: show all active
  let classes;
  if (profileData.role === 'student' && enrolledClassIds.length > 0) {
    const { data } = await supabase
      .from('classes')
      .select('id, name, course, year, semester')
      .in('id', enrolledClassIds)
      .eq('is_active', true)
      .order('year', { ascending: false });
    classes = data ?? [];
  } else {
    const { data } = await supabase
      .from('classes')
      .select('id, name, course, year, semester')
      .eq('is_active', true)
      .order('year', { ascending: false });
    classes = data ?? [];
  }

  // Auto-select first class if student has exactly one enrolled class
  const isSingleClass = profileData.role === 'student' && enrolledClassIds.length === 1;
  const defaultClassId = isSingleClass ? enrolledClassIds[0] : undefined;

  return (
    <div className="p-6 sm:p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Novo Projeto</h1>
        <p className="text-muted-foreground mt-1 text-sm">Preencha as informacoes do seu projeto integrador.</p>
      </div>
      <ProjectForm classes={classes ?? []} mode="create" defaultClassId={defaultClassId} singleClass={isSingleClass} />
    </div>
  );
}
