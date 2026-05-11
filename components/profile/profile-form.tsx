'use client';

import { useState } from 'react';
import { Loader as Loader2, Save, CircleCheck as CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { createClient } from '@/lib/supabase/client';
import type { Profile } from '@/lib/supabase/types';

const roleLabels: Record<string, string> = {
  student: 'Aluno',
  professor: 'Professor',
  admin: 'Administrador',
  partner: 'Empresa Parceira',
};

export function ProfileForm({ profile }: { profile: Profile }) {
  const [form, setForm] = useState({
    full_name: profile.full_name ?? '',
    bio: profile.bio ?? '',
    course: profile.course ?? '',
    institution: profile.institution ?? '',
    linkedin_url: profile.linkedin_url ?? '',
    github_url: profile.github_url ?? '',
  });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const update = (field: string, value: string) => setForm(p => ({ ...p, [field]: value }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSaved(false);
    try {
      const supabase = createClient();
      const { error: err } = await supabase
        .from('profiles')
        .update({ ...form, updated_at: new Date().toISOString() })
        .eq('id', profile.id);
      if (err) throw err;
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError('Erro ao salvar o perfil. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* Role badge */}
      <div className="bg-muted/50 rounded-xl border border-border p-4 flex items-center gap-3">
        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
          <span className="text-primary font-bold text-lg">{profile.full_name?.charAt(0)?.toUpperCase() || '?'}</span>
        </div>
        <div>
          <p className="font-semibold text-foreground">{profile.email}</p>
          <p className="text-sm text-muted-foreground">{roleLabels[profile.role] ?? profile.role}</p>
        </div>
      </div>

      {error && <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-xl p-3">{error}</p>}
      {saved && (
        <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl p-3">
          <CheckCircle className="w-4 h-4" />Perfil salvo com sucesso!
        </div>
      )}

      <div className="bg-card rounded-2xl border border-border p-6 space-y-5">
        <h2 className="font-semibold text-foreground">Informações Pessoais</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <Label htmlFor="full_name">Nome Completo</Label>
            <Input id="full_name" value={form.full_name} onChange={e => update('full_name', e.target.value)} className="h-11" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="institution">Instituição</Label>
            <Input id="institution" value={form.institution} onChange={e => update('institution', e.target.value)} className="h-11" />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="course">Curso</Label>
            <Input id="course" value={form.course} onChange={e => update('course', e.target.value)} className="h-11" />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea id="bio" value={form.bio} onChange={e => update('bio', e.target.value)} className="min-h-[100px]" placeholder="Fale um pouco sobre você..." />
          </div>
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border p-6 space-y-5">
        <h2 className="font-semibold text-foreground">Links Profissionais</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <Label htmlFor="linkedin">LinkedIn</Label>
            <Input id="linkedin" type="url" placeholder="https://linkedin.com/in/..." value={form.linkedin_url} onChange={e => update('linkedin_url', e.target.value)} className="h-11" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="github">GitHub</Label>
            <Input id="github" type="url" placeholder="https://github.com/..." value={form.github_url} onChange={e => update('github_url', e.target.value)} className="h-11" />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={loading} className="gap-2">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Salvar Alterações
        </Button>
      </div>
    </form>
  );
}
