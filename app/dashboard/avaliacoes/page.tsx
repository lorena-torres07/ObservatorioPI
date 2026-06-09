'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Award, Star, Clock, CircleCheck as CheckCircle, Search, Edit, Loader as Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';

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

export default function EvaluationsPage() {
  const router = useRouter();
  const [evaluations, setEvaluations] = useState<EvalRow[]>([]);
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editingEval, setEditingEval] = useState<EvalRow | null>(null);
  const [evalScore, setEvalScore] = useState('');
  const [evalFeedback, setEvalFeedback] = useState('');
  const [evalStrengths, setEvalStrengths] = useState('');
  const [evalImprovements, setEvalImprovements] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    const supabase = createClient();
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profileData } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
      const userRole = profileData?.role ?? '';
      setRole(userRole);

      let data: EvalRow[] = [];

      if (userRole === 'student') {
        const { data: myProjects } = await supabase.from('projects').select('id').eq('owner_id', user.id);
        const projectIds = (myProjects ?? []).map((p: { id: string }) => p.id);
        if (projectIds.length > 0) {
          const { data: evs } = await supabase
            .from('evaluations')
            .select('id, overall_score, feedback, strengths, improvements, status, evaluated_at, project_id, projects(title)')
            .in('project_id', projectIds)
            .order('created_at', { ascending: false });
          data = (evs ?? []) as unknown as EvalRow[];
        }
      } else if (userRole === 'professor') {
        const { data: evs } = await supabase
          .from('evaluations')
          .select('id, overall_score, feedback, strengths, improvements, status, evaluated_at, project_id, projects(title)')
          .eq('professor_id', user.id)
          .order('created_at', { ascending: false });
        data = (evs ?? []) as unknown as EvalRow[];
      } else if (userRole === 'admin') {
        const { data: evs } = await supabase
          .from('evaluations')
          .select('id, overall_score, feedback, strengths, improvements, status, evaluated_at, project_id, projects(title)')
          .order('created_at', { ascending: false });
        data = (evs ?? []) as unknown as EvalRow[];
      }

      setEvaluations(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openEdit = (ev: EvalRow) => {
    setEditingEval(ev);
    setEvalScore(ev.overall_score?.toString() ?? '');
    setEvalFeedback(ev.feedback ?? '');
    setEvalStrengths(ev.strengths ?? '');
    setEvalImprovements(ev.improvements ?? '');
    setError('');
  };

  const handleSaveEdit = async () => {
    if (!editingEval) return;
    setSaving(true);
    setError('');
    try {
      const supabase = createClient();
      const { error: err } = await supabase
        .from('evaluations')
        .update({
          overall_score: evalScore ? parseFloat(evalScore) : null,
          feedback: evalFeedback,
          strengths: evalStrengths,
          improvements: evalImprovements,
          evaluated_at: new Date().toISOString(),
        })
        .eq('id', editingEval.id);
      if (err) throw err;
      setEditingEval(null);
      fetchData();
    } catch {
      setError('Erro ao salvar avaliação.');
    } finally {
      setSaving(false);
    }
  };

  const filtered = evaluations.filter(ev =>
    (ev.projects?.title ?? '').toLowerCase().includes(search.toLowerCase())
  );

  const pageTitle = role === 'student' ? 'Minhas Avaliações' : role === 'professor' ? 'Avaliações Realizadas' : 'Todas as Avaliações';
  const pageDesc = role === 'student'
    ? 'Acompanhe o feedback dos professores nos seus projetos.'
    : role === 'professor'
    ? 'Histórico de avaliações que você realizou.'
    : 'Visão geral de todas as avaliações da plataforma.';

  return (
    <div className="p-6 sm:p-8 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{pageTitle}</h1>
        <p className="text-muted-foreground mt-1 text-sm">{pageDesc}</p>
      </div>

      {/* Busca */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Buscar por nome do projeto..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 text-sm border border-border rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-card rounded-2xl border border-border p-16 text-center">
          <Award className="w-14 h-14 text-muted-foreground/40 mx-auto mb-4" />
          <h3 className="font-semibold text-foreground text-lg mb-2">Nenhuma avaliação encontrada</h3>
          <p className="text-muted-foreground text-sm max-w-md mx-auto mb-6">
            {search ? `Nenhum projeto corresponds a "${search}".` : role === 'student'
              ? 'As avaliações aparecerão aqui após a revisão dos seus projetos.'
              : role === 'professor'
              ? 'Você ainda não avaliou nenhum projeto.'
              : 'Nenhuma avaliação foi registrada ainda.'}
          </p>

          {search && (
            <button
              onClick={() => setSearch('')}
              className="text-sm text-primary hover:underline font-medium"
            >
              Limpar filtros
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(ev => (
            <div key={ev.id} className="bg-card rounded-2xl border border-border p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <Link
                    href={`/dashboard/projetos/${ev.project_id}`}
                    className="font-semibold text-foreground hover:text-primary transition-colors"
                  >
                    {ev.projects?.title ?? 'Projeto'}
                  </Link>
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
                  {ev.evaluated_at && (
                    <p className="text-xs text-muted-foreground mt-3">
                      Avaliado em {new Date(ev.evaluated_at).toLocaleDateString('pt-BR')}
                    </p>
                  )}
                </div>

                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${
                    ev.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {ev.status === 'completed' ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                    {ev.status === 'completed' ? 'Concluída' : 'Pendente'}
                  </span>
                  
                  {/* Modificado: Botão editar agora aparece estritamente para professores */}
                  {role === 'professor' && (
                    <button
                      onClick={() => openEdit(ev)}
                      className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 font-medium"
                    >
                      <Edit className="w-3 h-3" /> Editar
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Edição */}
      {editingEval && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-card rounded-2xl border border-border w-full max-w-lg p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-blue-500" />
                <h2 className="font-semibold text-foreground">Editar Avaliação</h2>
              </div>
              <button onClick={() => setEditingEval(null)} className="text-muted-foreground hover:text-foreground text-lg leading-none">✕</button>
            </div>
            <p className="text-sm text-muted-foreground">Projeto: <span className="font-medium text-foreground">{editingEval.projects?.title}</span></p>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">Nota (0 a 10)</label>
                <input
                  type="number" min="0" max="10" step="0.1"
                  value={evalScore} onChange={e => setEvalScore(e.target.value)}
                  className="w-full border border-border rounded-xl px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">Feedback Geral</label>
                <textarea value={evalFeedback} onChange={e => setEvalFeedback(e.target.value)} rows={3}
                  className="w-full border border-border rounded-xl px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-green-700 mb-1 block">Pontos Fortes</label>
                <textarea value={evalStrengths} onChange={e => setEvalStrengths(e.target.value)} rows={2}
                  className="w-full border border-border rounded-xl px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-amber-700 mb-1 block">Melhorias Sugeridas</label>
                <textarea value={evalImprovements} onChange={e => setEvalImprovements(e.target.value)} rows={2}
                  className="w-full border border-border rounded-xl px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={() => setEditingEval(null)} className="flex-1">Cancelar</Button>
              <Button onClick={handleSaveEdit} disabled={saving} className="flex-1 gap-2">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Salvar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}