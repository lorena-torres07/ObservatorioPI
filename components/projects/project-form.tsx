'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, X, Loader2, Save, Send, AlertCircle, Users, Search, Upload, FileCheck } from 'lucide-react';
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

interface StudentOption {
  id: string;
  full_name: string;
  email: string;
}

interface ProjectFormProps {
  classes: ClassOption[];
  mode: 'create' | 'edit';
  project?: Project;
  defaultClassId?: string;
  singleClass?: boolean;
  currentUserId?: string;
  initialMembers?: StudentOption[];
}

export function ProjectForm({
  classes,
  mode,
  project,
  defaultClassId,
  singleClass,
  currentUserId,
  initialMembers = [],
}: ProjectFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [techInput, setTechInput] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState('');

  // Membros do grupo
  const [members, setMembers] = useState<StudentOption[]>(initialMembers);
  const [memberSearch, setMemberSearch] = useState('');
  const [memberResults, setMemberResults] = useState<StudentOption[]>([]);
  const [searchingMembers, setSearchingMembers] = useState(false);

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

  // Busca alunos da mesma turma
  const searchMembers = async (query: string) => {
    setMemberSearch(query);
    if (query.length < 2) { setMemberResults([]); return; }

    setSearchingMembers(true);
    try {
      const supabase = createClient();
      const classId = form.class_id;

      let profileQuery = supabase
        .from('profiles')
        .select('id, full_name, email')
        .eq('role', 'student')
        .ilike('full_name', `%${query}%`)
        .limit(5);

      // Se há turma selecionada, filtra por alunos da turma
      if (classId) {
        const { data: classStudents } = await supabase
          .from('class_students')
          .select('student_id')
          .eq('class_id', classId);
        const ids = (classStudents ?? []).map(cs => cs.student_id);
        if (ids.length > 0) {
          profileQuery = profileQuery.in('id', ids);
        }
      }

      const { data } = await profileQuery;
      // Filtra o próprio usuário e quem já está na lista
      const currentMemberIds = members.map(m => m.id);
      setMemberResults(
        (data ?? []).filter(
          s => s.id !== currentUserId && !currentMemberIds.includes(s.id)
        )
      );
    } finally {
      setSearchingMembers(false);
    }
  };

  const addMember = (student: StudentOption) => {
    setMembers(prev => [...prev, student]);
    setMemberSearch('');
    setMemberResults([]);
  };

  const removeMember = (id: string) =>
    setMembers(prev => prev.filter(m => m.id !== id));


  const ALLOWED_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/zip',
  'application/x-zip-compressed', 
  ];

  const MAX_SIZE_MB = 100;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setFileError('');
    setSelectedFile(null);
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      setFileError('Formato inválido. Use PDF, DOCX, PPTX ou ZIP.');
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setFileError(`Arquivo muito grande. Máximo permitido: ${MAX_SIZE_MB} MB.`);
      return;
    }
    setSelectedFile(file);
  };

  const handleSave = async (submit = false) => {
    if (!form.title.trim()) { setError('O título do projeto é obrigatório.'); return; }
    if (!form.short_description.trim()) { setError('A descrição curta é obrigatória.'); return; }
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

      let projectId = project?.id;

      if (mode === 'create') {
        const { data, error: err } = await supabase
          .from('projects')
          .insert({ ...payload, owner_id: user.id, status: submit ? 'submitted' : 'draft', is_public: false })
          .select()
          .single();
        if (err) throw err;
        projectId = data.id;
      } else if (project) {
        const { error: err } = await supabase
          .from('projects')
          .update(payload)
          .eq('id', project.id);
        if (err) throw err;
      }

      // Salva membros do grupo
      if (projectId) {
        // Remove membros antigos e reinsere
        await supabase.from('project_members').delete().eq('project_id', projectId);

        // Sempre insere o próprio dono como membro
        const membersToInsert = [
          { project_id: projectId, user_id: user.id, role: 'owner' },
          ...members.map(m => ({ project_id: projectId!, user_id: m.id, role: 'member' })),
        ];
        await supabase.from('project_members').insert(membersToInsert);
      }

      window.location.href = `/dashboard/projetos/${projectId}`;
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

      {/* Informações Básicas */}
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
                  {classes.find(c => c.id === form.class_id)?.name ?? 'Turma atribuída'}
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
            <Label htmlFor="semester_year">
              Semestre: <span className="text-xs text-muted-foreground"></span>
            </Label>
            <Input
              id="semester_year"
              type="number"
              min="1"
              max="8"
              placeholder="Ex: 2"
              value={form.semester_year}
              onChange={e => {
                const val = e.target.value.replace(/\D/g, '');
                if (val === '' || (Number(val) >= 1 && Number(val) <= 8)) {
                  updateField('semester_year', val);
                }
              }}
              className="h-11"
            />
          </div>
        </div>
      </div>

      {/* Membros do Grupo */}
      <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-muted-foreground" />
          <h2 className="font-semibold text-foreground">Membros do Grupo</h2>
        </div>
        <p className="text-xs text-muted-foreground">
          Adicione os colegas que participam deste projeto. Você já está incluído como responsável.
        </p>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Buscar colega pelo nome..."
            value={memberSearch}
            onChange={e => searchMembers(e.target.value)}
            className="h-10 pl-9"
          />
          {searchingMembers && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
          )}
          {memberResults.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-card border border-border rounded-xl shadow-lg overflow-hidden">
              {memberResults.map(s => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => addMember(s)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-muted text-left transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                    {s.full_name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{s.full_name}</p>
                    <p className="text-xs text-muted-foreground">{s.email}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {members.length > 0 && (
          <div className="space-y-2">
            {members.map(m => (
              <div key={m.id} className="flex items-center justify-between bg-muted/50 rounded-lg px-3 py-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                    {m.full_name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{m.full_name}</p>
                    <p className="text-xs text-muted-foreground">{m.email}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeMember(m.id)}
                  className="text-muted-foreground hover:text-destructive transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tecnologias */}
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
                <button type="button" onClick={() => removeTech(tech)} className="hover:text-destructive transition-colors">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Links e Mídia */}
      <div className="bg-card rounded-2xl border border-border p-6 space-y-5">
        <h2 className="font-semibold text-foreground">Links e Mídia</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <Label htmlFor="repo">Repositório (GitHub/GitLab)</Label>
            <Input id="repo" type="url" placeholder="https://github.com/usuario/projeto" value={form.repository_url} onChange={e => updateField('repository_url', e.target.value)} className="h-11" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="demo">Link da Demo / Deploy</Label>
            <Input id="demo" type="url" placeholder="https://meu-projeto.vercel.app" value={form.demo_url} onChange={e => updateField('demo_url', e.target.value)} className="h-11" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="video">Vídeo de Apresentação</Label>
            <Input id="video" type="url" placeholder="https://youtube.com/watch?v=..." value={form.video_url} onChange={e => updateField('video_url', e.target.value)} className="h-11" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cover">URL da Imagem de Capa</Label>
            <Input id="cover" type="url" placeholder="https://images.pexels.com/..." value={form.cover_image_url} onChange={e => updateField('cover_image_url', e.target.value)} className="h-11" />
          </div>
        </div>
      </div>

      {/* Upload de Arquivo (RF13) */}
      <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Upload className="w-4 h-4 text-muted-foreground" />
          <h2 className="font-semibold text-foreground">Arquivo do Projeto</h2>
        </div>
        <p className="text-xs text-muted-foreground">
          Formatos aceitos: <strong>PDF, DOCX, PPTX, ZIP</strong>. Tamanho máximo: <strong>100 MB</strong>.
        </p>

        <label
          htmlFor="project-file"
          className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-colors
            ${fileError
              ? 'border-destructive/50 bg-destructive/5 hover:bg-destructive/10'
              : selectedFile
              ? 'border-primary/50 bg-primary/5 hover:bg-primary/10'
              : 'border-border bg-muted/30 hover:bg-muted/50'
            }`}
        >
          <input
            id="project-file"
            type="file"
            accept=".pdf,.docx,.pptx,.zip"
            className="hidden"
            onChange={handleFileChange}
          />
          {selectedFile ? (
            <div className="flex flex-col items-center gap-1 px-4 text-center">
              <FileCheck className="w-6 h-6 text-primary" />
              <p className="text-sm font-medium text-foreground truncate max-w-xs">{selectedFile.name}</p>
              <p className="text-xs text-muted-foreground">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1">
              <Upload className="w-6 h-6 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Clique para selecionar o arquivo</p>
            </div>
          )}
        </label>

        {fileError && (
          <div className="flex items-center gap-2 text-destructive text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{fileError}</span>
          </div>
        )}

        {selectedFile && !fileError && (
          <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => { setSelectedFile(null); setFileError(''); }}
          className="gap-2 text-red-500 border-red-500 hover:bg-red-50 hover:text-red-600 hover:border-red-300"
        >
          <X className="w-3.5 h-3.5" /> Remover arquivo
        </Button>
        )}
      </div>

      {/* Ações */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.back()}
          disabled={loading}
          className="sm:mr-auto"
        >
          Cancelar
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => handleSave(false)}
          disabled={loading}
          className="gap-2"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Salvar Rascunho
        </Button>
        <Button
          type="button"
          onClick={() => handleSave(true)}
          disabled={loading}
          className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          Submeter Projeto
        </Button>
      </div>
      
    
    </div>
  );
}