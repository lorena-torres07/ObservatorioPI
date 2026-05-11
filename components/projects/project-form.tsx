'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, X, Loader as Loader2, Save, Send, CircleAlert as AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { createClient } from '@/lib/supabase/client';
import type { Project } from '@/lib/supabase/types';

interface ClassOption {
  id: string;
  name: string;
  course: string;
  year: number;
  semester: '1' | '2';
}

interface ProjectFormProps {
  classes: ClassOption[];
  mode: 'create' | 'edit';
  project?: Project;
  defaultClassId?: string;
  singleClass?: boolean;
}

export function ProjectForm({ classes, mode, project, defaultClassId, singleClass }: ProjectFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [techInput, setTechInput] = useState('');

  const [form, setForm] = useState({
    title: project?.title ?? '',
    short_description: project?.short_description ?? '',
    description: project?.description ?? '',
    class_id: project?.class_id ?? defaultClassId ?? '',
    repository_url: project?.repository_url ?? '',
    demo_url: project?.demo_url ?? '',
    video_url: project?.video_url ?? '',
    technologies: project?.technologies ?? [] as string[],
    semester_year: project?.semester_year ?? '',
    cover_image_url: project?.cover_image_url ?? '',
  });

  const updateField = (field: string, value: string | string[]) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const addTech = () => {
    const t = techInput.trim();
    if (t && !form.technologies.includes(t)) {
      updateField('technologies', [...form.technologies, t]);
    }
    setTechInput('');
  };

  const removeTech = (tech: string) =>
    updateField('technologies', form.technologies.filter(t => t !== tech));

  const handleSave = async (submit = false) => {
    if (!form.title.trim()) { setError('O titulo do projeto e obrigatorio.'); return; }
    if (!form.short_description.trim()) { setError('A descricao curta e obrigatoria.'); return; }
    if (!form.class_id) { setError('Selecione a turma do projeto.'); return; }

    setError('');
    setLoading(true);

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setError('Sessão expirada. Faça login novamente.'); return; }

      const payload = {
        title: form.title.trim(),
        short_description: form.short_description.trim(),
        description: form.description.trim(),
        class_id: form.class_id || null,
        repository_url: form.repository_url.trim(),
        demo_url: form.demo_url.trim(),
        video_url: form.video_url.trim(),
        technologies: form.technologies,
        semester_year: form.semester_year.trim(),
        cover_image_url: form.cover_image_url.trim() || null,
        ...(submit ? { status: 'submitted' as const, submitted_at: new Date().toISOString() } : {}),
        updated_at: new Date().toISOString(),
      };

      if (mode === 'create') {
        const { data, error: err } = await supabase
          .from('projects')
          .insert({ ...payload, owner_id: user.id, status: submit ? 'submitted' : 'draft', is_public: false })
          .select()
          .single();

        if (err) throw err;
        window.location.href = `/dashboard/projetos/${data.id}`;
      } else if (project) {
        const { error: err } = await supabase
          .from('projects')
          .update(payload)
          .eq('id', project.id);

        if (err) throw err;
        window.location.href = `/dashboard/projetos/${project.id}`;
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao salvar o projeto.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {error && (
        <div className="flex items-start gap-3 bg-destructive/10 border border-destructive/20 rounded-xl p-4">
          <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Basic info */}
      <div className="bg-card rounded-2xl border border-border p-6 space-y-5">
        <h2 className="font-semibold text-foreground">Informações Básicas</h2>

        <div className="space-y-1.5">
          <Label htmlFor="title">Título do Projeto <span className="text-destructive">*</span></Label>
          <Input
            id="title"
            placeholder="Ex: Sistema de Gestão de Biblioteca Digital"
            value={form.title}
            onChange={e => updateField('title', e.target.value)}
            className="h-11"
            maxLength={120}
          />
          <p className="text-xs text-muted-foreground text-right">{form.title.length}/120</p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="short_desc">Descrição Curta <span className="text-destructive">*</span></Label>
          <Input
            id="short_desc"
            placeholder="Uma frase que resume o seu projeto (aparece nos cards)"
            value={form.short_description}
            onChange={e => updateField('short_description', e.target.value)}
            className="h-11"
            maxLength={200}
          />
          <p className="text-xs text-muted-foreground text-right">{form.short_description.length}/200</p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="description">Descrição Completa</Label>
          <Textarea
            id="description"
            placeholder="Descreva o problema que o projeto resolve, a solução proposta, as tecnologias utilizadas e o impacto esperado..."
            value={form.description}
            onChange={e => updateField('description', e.target.value)}
            className="min-h-[160px] resize-y"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            {singleClass && form.class_id ? (
              <>
                <Label>Turma</Label>
                <div className="flex h-11 items-center rounded-md border border-input bg-muted/50 px-3 text-sm text-foreground">
                  {classes.find(c => c.id === form.class_id)?.name ?? 'Turma atribuida'}
                </div>
              </>
            ) : (
              <>
                <Label htmlFor="class">Turma <span className="text-destructive">*</span></Label>
                <select
                  id="class"
                  value={form.class_id}
                  onChange={e => updateField('class_id', e.target.value)}
                  className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  <option value="">Selecione a turma</option>
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} — {c.course} ({c.year}/{c.semester})
                    </option>
                  ))}
                </select>
              </>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="semester_year">Semestre/Ano</Label>
            <Input
              id="semester_year"
              placeholder="Ex: 1º Sem / 2026"
              value={form.semester_year}
              onChange={e => updateField('semester_year', e.target.value)}
              className="h-11"
            />
          </div>
        </div>
      </div>

      {/* Technologies */}
      <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
        <h2 className="font-semibold text-foreground">Tecnologias Utilizadas</h2>
        <div className="flex gap-2">
          <Input
            placeholder="Ex: React, Node.js, PostgreSQL..."
            value={techInput}
            onChange={e => setTechInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTech())}
            className="h-10"
          />
          <Button type="button" variant="outline" onClick={addTech} className="gap-2 shrink-0 h-10">
            <Plus className="w-4 h-4" /> Adicionar
          </Button>
        </div>
        {form.technologies.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {form.technologies.map(tech => (
              <span
                key={tech}
                className="inline-flex items-center gap-1.5 text-sm bg-secondary text-secondary-foreground px-3 py-1 rounded-full"
              >
                {tech}
                <button
                  type="button"
                  onClick={() => removeTech(tech)}
                  className="hover:text-destructive transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Links */}
      <div className="bg-card rounded-2xl border border-border p-6 space-y-5">
        <h2 className="font-semibold text-foreground">Links e Mídia</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <Label htmlFor="repo">Repositório (GitHub/GitLab)</Label>
            <Input
              id="repo"
              type="url"
              placeholder="https://github.com/usuario/projeto"
              value={form.repository_url}
              onChange={e => updateField('repository_url', e.target.value)}
              className="h-11"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="demo">Link da Demo / Deploy</Label>
            <Input
              id="demo"
              type="url"
              placeholder="https://meu-projeto.vercel.app"
              value={form.demo_url}
              onChange={e => updateField('demo_url', e.target.value)}
              className="h-11"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="video">Vídeo de Apresentação</Label>
            <Input
              id="video"
              type="url"
              placeholder="https://youtube.com/watch?v=..."
              value={form.video_url}
              onChange={e => updateField('video_url', e.target.value)}
              className="h-11"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cover">URL da Imagem de Capa</Label>
            <Input
              id="cover"
              type="url"
              placeholder="https://images.pexels.com/..."
              value={form.cover_image_url}
              onChange={e => updateField('cover_image_url', e.target.value)}
              className="h-11"
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={loading}
          className="order-3 sm:order-1"
        >
          Cancelar
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => handleSave(false)}
          disabled={loading}
          className="gap-2 order-2"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Salvar Rascunho
        </Button>
        <Button
          type="button"
          onClick={() => handleSave(true)}
          disabled={loading}
          className="gap-2 order-1 sm:order-3"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          Submeter Projeto
        </Button>
      </div>
    </div>
  );
}
