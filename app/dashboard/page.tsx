import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { FolderOpen, Award, TrendingUp, Clock, ArrowRight, Plus, Users, GraduationCap, ChartBar as BarChart3, Shield, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import type { Project, Profile } from '@/lib/supabase/types';

const statusLabel: Record<string, { label: string; color: string }> = {
  draft: { label: 'Rascunho', color: 'bg-gray-100 text-gray-600' },
  submitted: { label: 'Submetido', color: 'bg-blue-100 text-blue-700' },
  under_review: { label: 'Em Revisão', color: 'bg-amber-100 text-amber-700' },
  approved: { label: 'Aprovado', color: 'bg-green-100 text-green-700' },
  featured: { label: 'Destaque', color: 'bg-cyan-100 text-cyan-700' },
  rejected: { label: 'Devolvido', color: 'bg-red-100 text-red-700' },
};

export default async function DashboardPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
  if (!profileData) redirect('/login');
  const profile = profileData as Profile;

  const firstName = profile.full_name?.split(' ')[0] || 'Usuario';

  // Admin dashboard
  if (profile.role === 'admin') {
    const [usersRes, projectsRes, evalsRes, classesRes] = await Promise.all([
      supabase.from('profiles').select('role, is_active'),
      supabase.from('projects').select('status'),
      supabase.from('evaluations').select('status'),
      supabase.from('classes').select('is_active'),
    ]);

    const allUsers = usersRes.data ?? [];
    const allProjects = projectsRes.data ?? [];
    const allEvals = evalsRes.data ?? [];
    const allClasses = classesRes.data ?? [];

    const totalUsers = allUsers.length;
    const totalProjects = allProjects.length;
    const pendingProjects = allProjects.filter((p: { status: string }) => p.status === 'submitted').length;
    const totalEvals = allEvals.length;
    const activeClasses = allClasses.filter((c: { is_active: boolean }) => c.is_active).length;

    return (
      <div className="p-6 sm:p-8 max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Painel Administrativo</h1>
            <p className="text-muted-foreground mt-1">Olá, {firstName}. Gerencie a plataforma completa.</p>
          </div>
          <div className="flex gap-3">
            <Link href="/dashboard/usuarios">
              <Button className="gap-2 shrink-0"><Users className="w-4 h-4" /> Gerenciar Usuários</Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { icon: Users, label: 'Usuários', value: totalUsers, color: 'text-blue-600', bg: 'bg-blue-50', href: '/dashboard/usuarios' },
            { icon: FolderOpen, label: 'Projetos', value: totalProjects, color: 'text-emerald-600', bg: 'bg-emerald-50', href: '/dashboard/projetos' },
            { icon: Award, label: 'Avaliações', value: totalEvals, color: 'text-amber-600', bg: 'bg-amber-50', href: '/dashboard/avaliacoes' },
            { icon: GraduationCap, label: 'Turmas Ativas', value: activeClasses, color: 'text-cyan-600', bg: 'bg-cyan-50', href: '/dashboard/turmas' },
          ].map(stat => (
            <Link key={stat.label} href={stat.href}>
              <div className={`${stat.bg} rounded-2xl p-5 card-hover cursor-pointer`}>
                <stat.icon className={`w-5 h-5 ${stat.color} mb-2`} />
                <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                <div className="text-muted-foreground text-sm">{stat.label}</div>
              </div>
            </Link>
          ))}
        </div>

        {pendingProjects > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="font-semibold text-amber-900">{pendingProjects} projeto{pendingProjects > 1 ? 's' : ''} aguardando revisão</p>
                <p className="text-amber-700 text-sm">Acesse os projetos para aprovar ou devolver.</p>
              </div>
            </div>
            <Link href="/dashboard/projetos">
              <Button variant="outline" size="sm" className="gap-1.5 border-amber-300 text-amber-700 hover:bg-amber-100">
                Ver Projetos <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link href="/dashboard/relatorios">
            <div className="bg-card rounded-2xl border border-border p-6 card-hover">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground">Relatórios e Estatísticas</h3>
              </div>
              <p className="text-muted-foreground text-sm">Métricas de uso, distribuição de projetos e desempenho das avaliações.</p>
            </div>
          </Link>
          <Link href="/dashboard/turmas">
            <div className="bg-card rounded-2xl border border-border p-6 card-hover">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-emerald-600" />
                </div>
                <h3 className="font-semibold text-foreground">Gestão de Turmas</h3>
              </div>
              <p className="text-muted-foreground text-sm">Atribua professores às turmas e gerencie a organização acadêmica.</p>
            </div>
          </Link>
        </div>

        <div className="bg-muted/40 rounded-xl border border-border p-4 flex items-start gap-3">
          <Shield className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-foreground">Acesso de Administrador</p>
            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
              Você tem acesso total à plataforma. Use as funções administrativas com responsabilidade.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Professor dashboard
  if (profile.role === 'professor') {
    const { data: myEvals } = await supabase
      .from('evaluations')
      .select('id, status')
      .eq('professor_id', user.id);

    const evals = myEvals ?? [];
    const completedEvals = evals.filter((e: { status: string }) => e.status === 'completed').length;
    const pendingEvals = evals.filter((e: { status: string }) => e.status === 'pending').length;

    // Get professor's assigned classes
    const { data: assignments } = await supabase
      .from('class_professors')
      .select('class_id')
      .eq('professor_id', user.id);
    const classIds = (assignments ?? []).map(a => a.class_id);

    let typedProjects: Project[] = [];
    if (classIds.length > 0) {
      const { data: recentProjects } = await supabase
        .from('projects')
        .select('*')
        .in('class_id', classIds)
        .in('status', ['submitted', 'under_review'])
        .order('submitted_at', { ascending: true })
        .limit(5);
      typedProjects = (recentProjects ?? []) as Project[];
    }

    return (
      <div className="p-6 sm:p-8 max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Painel do Professor</h1>
          <p className="text-muted-foreground mt-1">Olá, {firstName}. Acompanhe e avalie os projetos das suas turmas.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: Award, label: 'Avaliações Concluidas', value: completedEvals, color: 'text-green-600', bg: 'bg-green-50' },
            { icon: Clock, label: 'Avaliações Pendentes', value: pendingEvals, color: 'text-amber-600', bg: 'bg-amber-50' },
            { icon: FolderOpen, label: 'Projetos para Avaliar', value: typedProjects.length, color: 'text-blue-600', bg: 'bg-blue-50' },
          ].map(stat => (
            <div key={stat.label} className="bg-card rounded-2xl border border-border p-6 flex items-center gap-4">
              <div className={`w-12 h-12 ${stat.bg} rounded-xl flex items-center justify-center shrink-0`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                <div className="text-muted-foreground text-sm">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {classIds.length === 0 && (
          <div className="bg-card rounded-2xl border border-border p-8 text-center">
            <GraduationCap className="w-14 h-14 text-muted-foreground/40 mx-auto mb-4" />
            <h3 className="font-semibold text-foreground text-lg mb-2">Nenhuma turma atribuída</h3>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">
              Solicite ao administrador que atribua turmas para que você possa visualizar e avaliar os projetos.
            </p>
          </div>
        )}

        {typedProjects.length > 0 && (
          <div className="bg-card rounded-2xl border border-border">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                <h2 className="font-semibold text-foreground">Projetos Aguardando Avaliação</h2>
              </div>
              <Link href="/dashboard/projetos">
                <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
                  Ver todos <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
            <div className="divide-y divide-border">
              {typedProjects.map(project => {
                const st = statusLabel[project.status] ?? statusLabel.draft;
                return (
                  <Link key={project.id} href={`/dashboard/projetos/${project.id}`}>
                    <div className="flex items-center justify-between p-4 sm:p-6 hover:bg-muted/30 transition-colors">
                      <div className="flex-1 min-w-0 mr-4">
                        <div className="font-medium text-foreground truncate">{project.title}</div>
                        <div className="text-muted-foreground text-sm truncate mt-0.5">{project.short_description}</div>
                      </div>
                      <span className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${st.color}`}>
                        {st.label}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Student dashboard (default)
  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .eq('owner_id', user.id)
    .order('updated_at', { ascending: false })
    .limit(5);

  const typedProjects = (projects ?? []) as Project[];
  const totalProjects = typedProjects.length;
  const submittedCount = typedProjects.filter(p => p.status === 'submitted' || p.status === 'under_review').length;
  const approvedCount = typedProjects.filter(p => p.status === 'approved' || p.status === 'featured').length;

  return (
    <div className="p-6 sm:p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Olá, {firstName}!</h1>
          <p className="text-muted-foreground mt-1">Gerencie e acompanhe seus projetos.</p>
        </div>
        <Link href="/dashboard/projetos/novo">
          <Button className="gap-2 shrink-0"><Plus className="w-4 h-4" /> Novo Projeto</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: FolderOpen, label: 'Total de Projetos', value: totalProjects, color: 'text-blue-600', bg: 'bg-blue-50' },
          { icon: Clock, label: 'Em Avaliação', value: submittedCount, color: 'text-amber-600', bg: 'bg-amber-50' },
          { icon: Award, label: 'Aprovados', value: approvedCount, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        ].map(stat => (
          <div key={stat.label} className="bg-card rounded-2xl border border-border p-6 flex items-center gap-4">
            <div className={`w-12 h-12 ${stat.bg} rounded-xl flex items-center justify-center shrink-0`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <div className="text-muted-foreground text-sm">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-card rounded-2xl border border-border">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-foreground">Projetos Recentes</h2>
          </div>
          <Link href="/dashboard/projetos">
            <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
              Ver todos <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>

        {typedProjects.length === 0 ? (
          <div className="p-12 text-center">
            <FolderOpen className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="font-semibold text-foreground mb-2">Nenhum projeto ainda</h3>
            <p className="text-muted-foreground text-sm mb-6">Comece submetendo seu primeiro projeto integrador.</p>
            <Link href="/dashboard/projetos/novo">
              <Button size="sm" className="gap-2"><Plus className="w-4 h-4" /> Criar Primeiro Projeto</Button>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {typedProjects.map(project => {
              const st = statusLabel[project.status] ?? statusLabel.draft;
              return (
                <Link key={project.id} href={`/dashboard/projetos/${project.id}`}>
                  <div className="flex items-center justify-between p-4 sm:p-6 hover:bg-muted/30 transition-colors">
                    <div className="flex-1 min-w-0 mr-4">
                      <div className="font-medium text-foreground truncate">{project.title}</div>
                      <div className="text-muted-foreground text-sm truncate mt-0.5">{project.short_description}</div>
                      {project.technologies && project.technologies.length > 0 && (
                        <div className="flex gap-1.5 mt-2 flex-wrap">
                          {project.technologies.slice(0, 3).map(tech => (
                            <span key={tech} className="inline-block text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full">{tech}</span>
                          ))}
                          {project.technologies.length > 3 && (
                            <span className="inline-block text-xs text-muted-foreground">+{project.technologies.length - 3}</span>
                          )}
                        </div>
                      )}
                    </div>
                    <span className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${st.color}`}>{st.label}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      <div className="bg-muted/40 rounded-xl border border-border p-4 flex items-start gap-3">
        <div className="w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center shrink-0 mt-0.5">
          <div className="w-2 h-2 rounded-full bg-primary" />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">Privacidade dos seus dados (LGPD)</p>
          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
            Seus dados são utilizados exclusivamente para fins acadêmicos e de avaliação.
            Consulte nossa <Link href="/privacidade" className="text-primary hover:underline">Política de Privacidade</Link> para mais informações.
          </p>
        </div>
      </div>
    </div>
  );
}
