import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { FolderOpen, Users, GraduationCap, Award, TrendingUp, ChartBar as BarChart3 } from 'lucide-react';
import type { Profile, Project } from '@/lib/supabase/types';

export default async function ReportsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profileData } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
  if (!profileData) redirect('/login');
  const profile = profileData as Profile;
  if (profile.role !== 'admin') redirect('/dashboard');

  const [usersRes, projectsRes, evaluationsRes, classesRes] = await Promise.all([
    supabase.from('profiles').select('role, is_active'),
    supabase.from('projects').select('status, owner_id'),
    supabase.from('evaluations').select('status, overall_score'),
    supabase.from('classes').select('is_active'),
  ]);

  const users = (usersRes.data ?? []) as Pick<Profile, 'role' | 'is_active'>[];
  const projects = (projectsRes.data ?? []) as Pick<Project, 'status' | 'owner_id'>[];
  const evaluations = evaluationsRes.data ?? [];
  const classes = classesRes.data ?? [];

  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.is_active).length;
  const studentsCount = users.filter(u => u.role === 'student').length;
  const professorsCount = users.filter(u => u.role === 'professor').length;
  const partnersCount = users.filter(u => u.role === 'partner').length;

  const totalProjects = projects.length;
  const draftCount = projects.filter(p => p.status === 'draft').length;
  const submittedCount = projects.filter(p => p.status === 'submitted').length;
  const underReviewCount = projects.filter(p => p.status === 'under_review').length;
  const approvedCount = projects.filter(p => p.status === 'approved').length;
  const featuredCount = projects.filter(p => p.status === 'featured').length;
  const rejectedCount = projects.filter(p => p.status === 'rejected').length;

  const totalEvaluations = evaluations.length;
  const completedEvals = evaluations.filter((e: { status: string }) => e.status === 'completed').length;
  const avgScore = evaluations
    .filter((e: { overall_score: number | null }) => e.overall_score !== null)
    .reduce((sum: number, e: { overall_score: number | null }, _: number, arr: { overall_score: number | null }[]) => {
      return sum + (e.overall_score ?? 0) / arr.length;
    }, 0);

  const activeClasses = classes.filter((c: { is_active: boolean }) => c.is_active).length;

  return (
    <div className="p-6 sm:p-8 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Relatórios e Estatísticas</h1>
        <p className="text-muted-foreground mt-1 text-sm">Visão geral da plataforma e métricas de desempenho.</p>
      </div>

      {/* Overview cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { icon: Users, label: 'Usuários Ativos', value: activeUsers, total: totalUsers, color: 'text-blue-600', bg: 'bg-blue-50' },
          { icon: FolderOpen, label: 'Projetos', value: totalProjects, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { icon: Award, label: 'Avaliações', value: completedEvals, total: totalEvaluations, color: 'text-amber-600', bg: 'bg-amber-50' },
          { icon: GraduationCap, label: 'Turmas Ativas', value: activeClasses, color: 'text-cyan-600', bg: 'bg-cyan-50' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-xl p-5`}>
            <s.icon className={`w-5 h-5 ${s.color} mb-2`} />
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-muted-foreground text-xs mt-0.5">{s.label}</div>
            {'total' in s && s.total !== undefined && (
              <div className="text-muted-foreground text-xs mt-1">de {s.total} total</div>
            )}
          </div>
        ))}
      </div>

      {/* Users breakdown */}
      <div className="bg-card rounded-2xl border border-border p-6">
        <div className="flex items-center gap-2 mb-5">
          <Users className="w-5 h-5 text-primary" />
          <h2 className="font-semibold text-foreground">Distribuição de Usuários</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Alunos', value: studentsCount, color: 'bg-blue-500' },
            { label: 'Professores', value: professorsCount, color: 'bg-emerald-500' },
            { label: 'Empresas', value: partnersCount, color: 'bg-cyan-500' },
            { label: 'Admins', value: users.filter(u => u.role === 'admin').length, color: 'bg-amber-500' },
          ].map(item => (
            <div key={item.label} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{item.label}</span>
                <span className="font-bold text-foreground">{item.value}</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full ${item.color} rounded-full transition-all duration-500`}
                  style={{ width: totalUsers > 0 ? `${(item.value / totalUsers) * 100}%` : '0%' }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Projects by status */}
      <div className="bg-card rounded-2xl border border-border p-6">
        <div className="flex items-center gap-2 mb-5">
          <FolderOpen className="w-5 h-5 text-primary" />
          <h2 className="font-semibold text-foreground">Projetos por Status</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { label: 'Rascunho', value: draftCount, color: 'bg-gray-400' },
            { label: 'Submetido', value: submittedCount, color: 'bg-blue-500' },
            { label: 'Em Revisão', value: underReviewCount, color: 'bg-amber-500' },
            { label: 'Aprovado', value: approvedCount, color: 'bg-green-500' },
            { label: 'Destaque', value: featuredCount, color: 'bg-cyan-500' },
            { label: 'Devolvido', value: rejectedCount, color: 'bg-red-500' },
          ].map(item => (
            <div key={item.label} className="text-center">
              <div className={`w-12 h-12 ${item.color} rounded-xl flex items-center justify-center mx-auto mb-2`}>
                <span className="text-white font-bold text-lg">{item.value}</span>
              </div>
              <div className="text-xs text-muted-foreground">{item.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Evaluation stats */}
      <div className="bg-card rounded-2xl border border-border p-6">
        <div className="flex items-center gap-2 mb-5">
          <BarChart3 className="w-5 h-5 text-primary" />
          <h2 className="font-semibold text-foreground">Métricas de Avaliação</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-muted/30 rounded-xl">
            <div className="text-3xl font-bold text-foreground">{totalEvaluations}</div>
            <div className="text-sm text-muted-foreground mt-1">Total de Avaliações</div>
          </div>
          <div className="text-center p-4 bg-muted/30 rounded-xl">
            <div className="text-3xl font-bold text-foreground">{completedEvals}</div>
            <div className="text-sm text-muted-foreground mt-1">Concluídas</div>
          </div>
          <div className="text-center p-4 bg-muted/30 rounded-xl">
            <div className="text-3xl font-bold text-foreground">{avgScore.toFixed(1)}</div>
            <div className="text-sm text-muted-foreground mt-1">Nota Média (/10)</div>
          </div>
        </div>
      </div>
    </div>
  );
}
