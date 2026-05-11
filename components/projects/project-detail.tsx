'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, CreditCard as Edit, Trash2, ExternalLink, Github, Play,
  Calendar, Send, CircleAlert as AlertCircle, Loader as Loader2,
  CircleCheck as CheckCircle, Clock, Star, Shield, User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import type { Project } from '@/lib/supabase/types';

const statusConfig: Record<string, { label: string; classes: string; icon: React.ElementType }> = {
  draft: { label: 'Rascunho', classes: 'bg-gray-100 text-gray-700 border-gray-200', icon: Clock },
  submitted: { label: 'Submetido', classes: 'bg-blue-100 text-blue-700 border-blue-200', icon: Send },
  under_review: { label: 'Em Revisao', classes: 'bg-amber-100 text-amber-700 border-amber-200', icon: Clock },
  approved: { label: 'Aprovado', classes: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle },
  featured: { label: 'Destaque', classes: 'bg-cyan-100 text-cyan-700 border-cyan-200', icon: CheckCircle },
  rejected: { label: 'Devolvido', classes: 'bg-red-100 text-red-700 border-red-200', icon: AlertCircle },
};

export interface EvaluationData {
  id: string;
  overall_score: number | null;
  feedback: string;
  strengths: string;
  improvements: string;
  status: string;
  evaluated_at: string | null;
  professor_id: string;
}

interface ProjectDetailProps {
  project: Project;
  canEdit: boolean;
  isOwner: boolean;
  role: string;
  classes: { id: string; name: string; course: string; year: number; semester: string }[];
  members: unknown[];
  evaluations: EvaluationData[];
  ownerProfile: { full_name: string; email: string; course: string } | null;
  isAdmin: boolean;
}

export function ProjectDetail({ project, canEdit, isOwner, role, evaluations = [], ownerProfile, isAdmin }: ProjectDetailProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState('');
  const [changingStatus, setChangingStatus] = useState<string | null>(null);

  const st = statusConfig[project.status] ?? statusConfig.draft;
  const StatusIcon = st.icon;

  const handleDelete = async () => {
    setDeleting(true);
    setError('');
    try {
      const supabase = createClient();
      const { error: err } = await supabase.from('projects').delete().eq('id', project.id);
      if (err) throw err;
      router.push('/dashboard/projetos');
      router.refresh();
    } catch {
      setError('Erro ao excluir o projeto.');
      setDeleting(false);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');
    try {
      const supabase = createClient();
      const { error: err } = await supabase
        .from('projects')
        .update({ status: 'submitted', submitted_at: new Date().toISOString() })
        .eq('id', project.id);
      if (err) throw err;
      router.refresh();
    } catch {
      setError('Erro ao submeter o projeto.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    setChangingStatus(newStatus);
    setError('');
    try {
      const supabase = createClient();
      const updates: Record<string, unknown> = { status: newStatus };
      if (newStatus === 'featured') {
        updates.featured_at = new Date().toISOString();
      }
      const { error: err } = await supabase.from('projects').update(updates).eq('id', project.id);
      if (err) throw err;
      router.refresh();
    } catch {
      setError('Erro ao alterar status.');
    } finally {
      setChangingStatus(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard/projetos">
          <Button variant="ghost" size="icon" className="rounded-xl">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground truncate">{project.title}</h1>
        </div>
        <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border shrink-0 ${st.classes}`}>
          <StatusIcon className="w-3 h-3" />
          {st.label}
        </span>
      </div>

      {error && (
        <div className="flex items-center gap-3 bg-destructive/10 border border-destructive/20 rounded-xl p-4">
          <AlertCircle className="w-4 h-4 text-destructive shrink-0" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Cover */}
      {project.cover_image_url ? (
        <div className="rounded-2xl overflow-hidden h-52 sm:h-64">
          <img src={project.cover_image_url} alt={project.title} className="w-full h-full object-cover" />
        </div>
      ) : (
        <div className="rounded-2xl gradient-hero h-40 flex items-center justify-center">
          <span className="text-white/20 text-7xl font-bold select-none">
            {project.title?.charAt(0)?.toUpperCase()}
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {project.short_description && (
            <div className="bg-card rounded-2xl border border-border p-6">
              <h2 className="font-semibold text-foreground mb-2">Resumo</h2>
              <p className="text-muted-foreground leading-relaxed">{project.short_description}</p>
            </div>
          )}

          {project.description && (
            <div className="bg-card rounded-2xl border border-border p-6">
              <h2 className="font-semibold text-foreground mb-3">Descricao Completa</h2>
              <div className="text-muted-foreground leading-relaxed whitespace-pre-wrap text-sm">
                {project.description}
              </div>
            </div>
          )}

          {project.technologies && project.technologies.length > 0 && (
            <div className="bg-card rounded-2xl border border-border p-6">
              <h2 className="font-semibold text-foreground mb-3">Tecnologias</h2>
              <div className="flex flex-wrap gap-2">
                {project.technologies.map(tech => (
                  <span key={tech} className="inline-block text-sm bg-secondary text-secondary-foreground px-3 py-1.5 rounded-full font-medium">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Evaluations section */}
          {evaluations.length > 0 && (
            <div className="bg-card rounded-2xl border border-border p-6">
              <div className="flex items-center gap-2 mb-4">
                <Star className="w-5 h-5 text-amber-500" />
                <h2 className="font-semibold text-foreground">Avaliacoes Recebidas</h2>
              </div>
              <div className="space-y-4">
                {evaluations.map(ev => (
                  <div key={ev.id} className="border border-border rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                        ev.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {ev.status === 'completed' ? 'Concluida' : 'Pendente'}
                      </span>
                      {ev.overall_score !== null && (
                        <div className="flex items-center gap-1.5">
                          <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                          <span className="font-bold text-foreground">{ev.overall_score.toFixed(1)}</span>
                          <span className="text-muted-foreground text-sm">/ 10</span>
                        </div>
                      )}
                    </div>
                    {ev.feedback && (
                      <div>
                        <p className="text-xs font-medium text-foreground mb-1">Feedback</p>
                        <p className="text-sm text-muted-foreground leading-relaxed">{ev.feedback}</p>
                      </div>
                    )}
                    {ev.strengths && (
                      <div>
                        <p className="text-xs font-medium text-green-700 mb-1">Pontos Fortes</p>
                        <p className="text-sm text-muted-foreground leading-relaxed">{ev.strengths}</p>
                      </div>
                    )}
                    {ev.improvements && (
                      <div>
                        <p className="text-xs font-medium text-amber-700 mb-1">Melhorias Sugeridas</p>
                        <p className="text-sm text-muted-foreground leading-relaxed">{ev.improvements}</p>
                      </div>
                    )}
                    {ev.evaluated_at && (
                      <p className="text-xs text-muted-foreground pt-1">
                        Avaliado em {new Date(ev.evaluated_at).toLocaleDateString('pt-BR')}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Owner info */}
          {ownerProfile && (role === 'admin' || role === 'professor') && (
            <div className="bg-card rounded-2xl border border-border p-5 space-y-3">
              <h3 className="font-semibold text-foreground text-sm">Autor do Projeto</h3>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <div className="font-medium text-foreground text-sm truncate">{ownerProfile.full_name || 'Aluno'}</div>
                  <div className="text-muted-foreground text-xs truncate">{ownerProfile.email}</div>
                  {ownerProfile.course && <div className="text-muted-foreground text-xs truncate">{ownerProfile.course}</div>}
                </div>
              </div>
            </div>
          )}

          {/* Student actions */}
          {isOwner && canEdit && (
            <div className="bg-card rounded-2xl border border-border p-5 space-y-3">
              <h3 className="font-semibold text-foreground text-sm">Acoes</h3>
              <Link href={`/dashboard/projetos/${project.id}/editar`}>
                <Button variant="outline" className="w-full gap-2 justify-start h-10">
                  <Edit className="w-4 h-4" /> Editar Projeto
                </Button>
              </Link>
              {project.status === 'draft' && (
                <Button onClick={handleSubmit} disabled={submitting} className="w-full gap-2 justify-start h-10">
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Submeter para Avaliacao
                </Button>
              )}
              {project.status === 'draft' && !showDeleteConfirm && (
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full gap-2 justify-start h-10 text-destructive border-destructive/30 hover:bg-destructive/10"
                >
                  <Trash2 className="w-4 h-4" /> Excluir Projeto
                </Button>
              )}
              {showDeleteConfirm && (
                <div className="space-y-2 bg-destructive/5 border border-destructive/20 rounded-xl p-3">
                  <p className="text-xs text-destructive font-medium">Confirmar exclusao? Esta acao nao pode ser desfeita.</p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="destructive" onClick={handleDelete} disabled={deleting} className="flex-1 gap-1.5">
                      {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                      Excluir
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setShowDeleteConfirm(false)} className="flex-1">Cancelar</Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Admin actions */}
          {isAdmin && (
            <div className="bg-card rounded-2xl border border-border p-5 space-y-3">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-amber-600" />
                <h3 className="font-semibold text-foreground text-sm">Acoes do Admin</h3>
              </div>

              <div className="space-y-2">
                <p className="text-xs text-muted-foreground font-medium">Alterar Status:</p>
                {[
                  { status: 'under_review', label: 'Em Revisao', color: 'bg-amber-500 hover:bg-amber-600' },
                  { status: 'approved', label: 'Aprovar', color: 'bg-green-500 hover:bg-green-600' },
                  { status: 'featured', label: 'Destacar', color: 'bg-cyan-500 hover:bg-cyan-600' },
                  { status: 'rejected', label: 'Devolver', color: 'bg-red-500 hover:bg-red-600' },
                ]
                  .filter(s => s.status !== project.status)
                  .map(s => (
                    <Button
                      key={s.status}
                      size="sm"
                      onClick={() => handleStatusChange(s.status)}
                      disabled={changingStatus !== null}
                      className={`w-full gap-2 text-white ${s.color}`}
                    >
                      {changingStatus === s.status ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                      {s.label}
                    </Button>
                  ))}
              </div>
            </div>
          )}

          {/* Details */}
          <div className="bg-card rounded-2xl border border-border p-5 space-y-3">
            <h3 className="font-semibold text-foreground text-sm">Detalhes</h3>
            {project.semester_year && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-muted-foreground shrink-0" />
                <span className="text-muted-foreground">{project.semester_year}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-muted-foreground shrink-0" />
              <span className="text-muted-foreground">
                Atualizado em {new Date(project.updated_at).toLocaleDateString('pt-BR')}
              </span>
            </div>
          </div>

          {/* Links */}
          {(project.repository_url || project.demo_url || project.video_url) && (
            <div className="bg-card rounded-2xl border border-border p-5 space-y-2">
              <h3 className="font-semibold text-foreground text-sm">Links</h3>
              {project.repository_url && (
                <a href={project.repository_url} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="w-full gap-2 justify-start h-9 text-sm">
                    <Github className="w-4 h-4" /> Repositorio
                  </Button>
                </a>
              )}
              {project.demo_url && (
                <a href={project.demo_url} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="w-full gap-2 justify-start h-9 text-sm">
                    <ExternalLink className="w-4 h-4" /> Demo / Deploy
                  </Button>
                </a>
              )}
              {project.video_url && (
                <a href={project.video_url} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="w-full gap-2 justify-start h-9 text-sm">
                    <Play className="w-4 h-4" /> Video de Apresentacao
                  </Button>
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
