import { redirect, notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ProjectDetail } from '@/components/projects/project-detail';
import type { Project, Profile } from '@/lib/supabase/types';

export default async function ProjectDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: projectData } = await supabase
    .from('projects')
    .select('*')
    .eq('id', params.id)
    .maybeSingle();

  if (!projectData) notFound();
  const project = projectData as Project;

  const { data: profileData } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
  if (!profileData) redirect('/login');
  const profile = profileData as Profile;

  const isOwner = project.owner_id === user.id;
  const isAdmin = profile.role === 'admin';
  const isProfessor = profile.role === 'professor';
  const canEdit = isOwner && ['draft', 'submitted', 'rejected'].includes(project.status);

  const { data: classes } = await supabase
    .from('classes')
    .select('id, name, course, year, semester')
    .eq('is_active', true)
    .order('year', { ascending: false });

  const { data: members } = await supabase
    .from('project_members')
    .select('id, user_id, role, profiles(full_name, email, course)')
    .eq('project_id', project.id);

  const { data: evaluations } = await supabase
    .from('evaluations')
    .select('id, overall_score, feedback, strengths, improvements, status, evaluated_at, professor_id')
    .eq('project_id', project.id);

  const { data: ownerProfile } = await supabase
    .from('profiles')
    .select('full_name, email, course')
    .eq('id', project.owner_id)
    .maybeSingle();

  const { data: classData } = project.class_id ? await supabase
    .from('classes')
    .select('name, semester, year')
    .eq('id', project.class_id)
    .maybeSingle() : { data: null };

  const { data: classProfessor } = project.class_id ? await supabase
    .from('class_professors')
    .select('professor_id')
    .eq('class_id', project.class_id)
    .maybeSingle() : { data: null };

  const { data: professorProfile } = classProfessor?.professor_id ? await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', classProfessor.professor_id)
    .maybeSingle() : { data: null };

  const classInfo = classData ? {
    name: classData.name,
    semester: `${classData.semester}/${classData.year}`,
    professorName: professorProfile?.full_name ?? '',
  } : null;

  const { data: versions } = await supabase
    .from('project_versions')
    .select('id, version_number, change_summary, created_at, user_id, profiles(full_name)')
    .eq('project_id', project.id)
    .order('version_number', { ascending: false });

  return (
    <div className="p-6 sm:p-8 max-w-4xl mx-auto">
      <ProjectDetail
        project={project}
        canEdit={canEdit}
        isOwner={isOwner}
        role={profile.role}
        classes={classes ?? []}
        members={(members ?? []) as unknown as { id: string; user_id: string; role: string; profiles: { full_name: string | null; email: string | null; course: string | null } | null; }[]}
        evaluations={(evaluations ?? []) as unknown as import('@/components/projects/project-detail').EvaluationData[]}
        ownerProfile={ownerProfile as { full_name: string; email: string; course: string } | null}
        isAdmin={isAdmin}
        isProfessor={isProfessor} 
        classInfo={classInfo}
        versions={(versions ?? []) as unknown as import('@/components/projects/project-detail').VersionData[]}
      />
    </div>
  );
}