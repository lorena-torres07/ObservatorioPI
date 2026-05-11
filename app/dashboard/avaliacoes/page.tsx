import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Award, Star, Clock, CircleCheck as CheckCircle } from 'lucide-react';
import type { Profile } from '@/lib/supabase/types';

export default async function EvaluationsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profileData } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
  if (!profileData) redirect('/login');
  const profile = profileData as Profile;

  let evaluations;

  if (profile.role === 'student') {
    // Student sees evaluations of their own projects
    const { data: myProjects } = await supabase.from('projects').select('id').eq('owner_id', user.id);
    const projectIds = (myProjects ?? []).map((p: { id: string }) => p.id);

    if (projectIds.length > 0) {
      const { data } = await supabase
        .from('evaluations')
        .select('id, overall_score, feedback, strengths, improvements, status, evaluated_at, project_id, projects(title)')
        .in('project_id', projectIds)
        .order('created_at', { ascending: false });
      evaluations = data;
    }
  } else if (profile.role === 'professor') {
    // Professor sees their own evaluations
    const { data } = await supabase
      .from('evaluations')
      .select('id, overall_score, feedback, strengths, improvements, status, evaluated_at, project_id, projects(title)')
      .eq('professor_id', user.id)
      .order('created_at', { ascending: false });
    evaluations = data;
  } else if (profile.role === 'admin') {
    // Admin sees all evaluations
    const { data } = await supabase
      .from('evaluations')
      .select('id, overall_score, feedback, strengths, improvements, status, evaluated_at, project_id, projects(title)')
      .order('created_at', { ascending: false });
    evaluations = data;
  }

  type EvalRow = {
    id: string;
    overall_score: number | null;
    feedback: string;
    strengths: string;
    improvements: string;
    status: string;
    evaluated_at: string | null;
    project_id: string;
    projects: { title: string } | null;
  };

  const typedEvals = (evaluations ?? []) as unknown as EvalRow[];

  return (
    <div className="p-6 sm:p-8 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          {profile.role === 'student' ? 'Minhas Avaliações' : profile.role === 'professor' ? 'Avaliações Realizadas' : 'Todas as Avaliações'}
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {profile.role === 'student'
            ? 'Acompanhe o feedback dos professores nos seus projetos.'
            : profile.role === 'professor'
            ? 'Histórico de avaliações que você realizou.'
            : 'Visão geral de todas as avaliações da plataforma.'}
        </p>
      </div>

      {typedEvals.length === 0 ? (
        <div className="bg-card rounded-2xl border border-border p-16 text-center">
          <Award className="w-14 h-14 text-muted-foreground/40 mx-auto mb-4" />
          <h3 className="font-semibold text-foreground text-lg mb-2">Nenhuma avaliação</h3>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            {profile.role === 'student'
              ? 'As avaliações aparecerão aqui após a revisão dos seus projetos pelos professores.'
              : profile.role === 'professor'
              ? 'Você ainda não avaliou nenhum projeto.'
              : 'Nenhuma avaliação foi registrada ainda.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {typedEvals.map(ev => (
            <div key={ev.id} className="bg-card rounded-2xl border border-border p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">
                    {ev.projects?.title ?? 'Projeto'}
                  </h3>
                  {ev.overall_score !== null && (
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                      <span className="font-bold text-foreground">{ev.overall_score.toFixed(1)}</span>
                      <span className="text-muted-foreground text-sm">/ 10</span>
                    </div>
                  )}
                  {ev.feedback && (
                    <p className="text-muted-foreground text-sm mt-3 leading-relaxed">{ev.feedback}</p>
                  )}
                  {ev.strengths && (
                    <div className="mt-3">
                      <p className="text-xs font-medium text-green-700 mb-0.5">Pontos Fortes</p>
                      <p className="text-sm text-muted-foreground leading-relaxed">{ev.strengths}</p>
                    </div>
                  )}
                  {ev.improvements && (
                    <div className="mt-3">
                      <p className="text-xs font-medium text-amber-700 mb-0.5">Melhorias Sugeridas</p>
                      <p className="text-sm text-muted-foreground leading-relaxed">{ev.improvements}</p>
                    </div>
                  )}
                </div>
                <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${
                  ev.status === 'completed'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-amber-100 text-amber-700'
                }`}>
                  {ev.status === 'completed' ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                  {ev.status === 'completed' ? 'Concluída' : 'Pendente'}
                </span>
              </div>
              {ev.evaluated_at && (
                <p className="text-xs text-muted-foreground mt-3">
                  Avaliado em {new Date(ev.evaluated_at).toLocaleDateString('pt-BR')}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
