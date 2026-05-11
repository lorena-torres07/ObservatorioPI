'use client';

import { useState, useEffect, useCallback } from 'react';
import { KeyRound, Plus, Search, Loader as Loader2, CircleAlert as AlertCircle, Trash2, UserPlus, Shield, BookOpen, GraduationCap, Building2, CircleCheck as CheckCircle, X, Copy, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClient } from '@/lib/supabase/client';
import type { Profile } from '@/lib/supabase/types';

const roleConfig: Record<string, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  admin: { label: 'Admin', icon: Shield, color: 'text-amber-600', bg: 'bg-amber-50' },
  student: { label: 'Aluno', icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-50' },
  professor: { label: 'Professor', icon: GraduationCap, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  partner: { label: 'Empresa', icon: Building2, color: 'text-cyan-600', bg: 'bg-cyan-50' },
};

interface Credential {
  id: string;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
  password?: string;
}

export default function CredenciaisPage() {
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    full_name: '',
    role: 'student' as string,
  });

  const fetchUsers = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    setCredentials((data ?? []) as Credential[]);
    setLoading(false);
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError('');
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/admin-create-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify(newUser),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Erro ao criar usuário');
      setSuccess(`Usuário ${newUser.email} criado com sucesso!`);
      setShowCreateModal(false);
      setNewUser({ email: '', password: '', full_name: '', role: 'student' });
      fetchUsers();
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar usuário');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (userId: string, userEmail: string) => {
    if (!confirm(`Tem certeza que deseja excluir o usuário ${userEmail}? Esta ação é irreversível.`)) return;
    setDeleting(userId);
    setError('');
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/admin-delete-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ userId }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Erro ao deletar');
      setSuccess(`Usuário ${userEmail} removido com sucesso.`);
      fetchUsers();
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao deletar usuário');
    } finally {
      setDeleting(null);
    }
  };

  const handleToggleActive = async (userId: string, isActive: boolean) => {
    const supabase = createClient();
    await supabase.from('profiles').update({ is_active: !isActive }).eq('id', userId);
    fetchUsers();
  };

  const togglePasswordVisibility = (id: string) => {
    setVisiblePasswords(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {}
  };

  const filtered = credentials.filter(u =>
    u.full_name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 sm:p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Credenciais de Acesso</h1>
          <p className="text-muted-foreground mt-1 text-sm">Gerencie os logins e senhas de acesso à plataforma.</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="gap-2 shrink-0">
          <UserPlus className="w-4 h-4" />
          Criar Usuário
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-3 bg-destructive/10 border border-destructive/20 rounded-xl p-4">
          <AlertCircle className="w-4 h-4 text-destructive shrink-0" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}
      {success && (
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl p-4">
          <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
          <p className="text-sm text-green-700">{success}</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: credentials.length, icon: KeyRound, color: 'text-foreground', bg: 'bg-muted' },
          { label: 'Alunos', value: credentials.filter(u => u.role === 'student').length, icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Professores', value: credentials.filter(u => u.role === 'professor').length, icon: GraduationCap, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Empresas', value: credentials.filter(u => u.role === 'partner').length, icon: Building2, color: 'text-cyan-600', bg: 'bg-cyan-50' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-xl p-4 flex items-center gap-3`}>
            <s.icon className={`w-5 h-5 ${s.color}`} />
            <div>
              <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-muted-foreground text-xs">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome, e-mail ou papel..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="h-11 pl-10"
        />
      </div>

      {/* Credentials list */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-card rounded-2xl border border-border p-16 text-center">
          <KeyRound className="w-14 h-14 text-muted-foreground/40 mx-auto mb-4" />
          <h3 className="font-semibold text-foreground text-lg mb-2">Nenhum usuário encontrado</h3>
          <p className="text-muted-foreground text-sm">Ajuste os termos da busca ou crie um novo usuário.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(user => {
            const rc = roleConfig[user.role] ?? roleConfig.student;
            const RoleIcon = rc.icon;
            const isVisible = visiblePasswords[user.id] ?? false;

            return (
              <div key={user.id} className="bg-card rounded-2xl border border-border p-5">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  {/* Avatar + Info */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`w-11 h-11 ${rc.bg} rounded-full flex items-center justify-center shrink-0`}>
                      <span className={`font-bold text-sm ${rc.color}`}>
                        {user.full_name?.charAt(0)?.toUpperCase() || '?'}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-foreground truncate">{user.full_name || 'Sem nome'}</div>
                      <div className="text-muted-foreground text-sm truncate">{user.email}</div>
                    </div>
                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${rc.bg} ${rc.color} shrink-0`}>
                      <RoleIcon className="w-3 h-3" />
                      {rc.label}
                    </span>
                  </div>

                  {/* Credential fields */}
                  <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                    {/* Email field */}
                    <div className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2 min-w-0">
                      <span className="text-xs text-muted-foreground font-medium shrink-0">E-mail:</span>
                      <span className="text-sm text-foreground font-mono truncate">{user.email}</span>
                      <button
                        onClick={() => copyToClipboard(user.email, `email-${user.id}`)}
                        className="shrink-0 p-1 rounded hover:bg-muted transition-colors"
                        title="Copiar e-mail"
                      >
                        {copiedId === `email-${user.id}` ? (
                          <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                        )}
                      </button>
                    </div>

                    {/* Password field */}
                    <div className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2">
                      <span className="text-xs text-muted-foreground font-medium shrink-0">Senha:</span>
                      <span className="text-sm text-foreground font-mono">
                        {isVisible ? '••••••' : '••••••'}
                      </span>
                      <button
                        onClick={() => togglePasswordVisibility(user.id)}
                        className="shrink-0 p-1 rounded hover:bg-muted transition-colors"
                        title={isVisible ? 'Ocultar senha' : 'Mostrar senha'}
                      >
                        {isVisible ? <EyeOff className="w-3.5 h-3.5 text-muted-foreground" /> : <Eye className="w-3.5 h-3.5 text-muted-foreground" />}
                      </button>
                    </div>

                    {/* Status toggle */}
                    <button
                      onClick={() => handleToggleActive(user.id, user.is_active)}
                      className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-full cursor-pointer transition-colors shrink-0 ${
                        user.is_active
                          ? 'bg-green-50 text-green-700 hover:bg-green-100'
                          : 'bg-red-50 text-red-700 hover:bg-red-100'
                      }`}
                    >
                      <div className={`w-1.5 h-1.5 rounded-full ${user.is_active ? 'bg-green-500' : 'bg-red-500'}`} />
                      {user.is_active ? 'Ativo' : 'Inativo'}
                    </button>

                    {/* Delete */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
                      onClick={() => handleDelete(user.id, user.email)}
                      disabled={deleting === user.id}
                    >
                      {deleting === user.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setShowCreateModal(false)} />
          <div className="relative bg-card border border-border rounded-2xl p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-foreground">Criar Novo Usuário</h2>
              <button onClick={() => setShowCreateModal(false)} className="p-1 rounded-lg hover:bg-muted transition-colors">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="new_name">Nome Completo</Label>
                <Input
                  id="new_name"
                  value={newUser.full_name}
                  onChange={e => setNewUser(p => ({ ...p, full_name: e.target.value }))}
                  placeholder="Ex: Maria Silva"
                  className="h-11"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="new_email">E-mail</Label>
                <Input
                  id="new_email"
                  type="email"
                  value={newUser.email}
                  onChange={e => setNewUser(p => ({ ...p, email: e.target.value }))}
                  placeholder="maria@email.com"
                  className="h-11"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="new_password">Senha</Label>
                <Input
                  id="new_password"
                  type="password"
                  value={newUser.password}
                  onChange={e => setNewUser(p => ({ ...p, password: e.target.value }))}
                  placeholder="Mínimo 6 caracteres"
                  className="h-11"
                  required
                  minLength={6}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="new_role">Papel na Plataforma</Label>
                <select
                  id="new_role"
                  value={newUser.role}
                  onChange={e => setNewUser(p => ({ ...p, role: e.target.value }))}
                  className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  required
                >
                  <option value="student">Aluno</option>
                  <option value="professor">Professor</option>
                  <option value="admin">Administrador</option>
                  <option value="partner">Empresa Parceira</option>
                </select>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 space-y-1.5">
                <p className="text-xs font-medium text-amber-900">Atenção:</p>
                <ul className="text-xs text-amber-700 space-y-1">
                  <li>- Anote a senha criada, ela não pode ser recuperada depois</li>
                  <li>- O perfil será criado automaticamente com o papel selecionado</li>
                  <li>- O usuário poderá alterar a senha após o primeiro acesso</li>
                </ul>
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)} className="flex-1">
                  Cancelar
                </Button>
                <Button type="submit" disabled={creating} className="flex-1 gap-2">
                  {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  Criar Usuário
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
