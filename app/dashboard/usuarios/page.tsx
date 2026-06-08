'use client';

import { useState, useEffect, useCallback } from 'react';
import { Users, Plus, Search, Loader as Loader2, CircleAlert as AlertCircle, Trash2, Shield, BookOpen, GraduationCap, CircleCheck as CheckCircle, X, UserPlus, Circle as XCircle, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClient } from '@/lib/supabase/client';
import type { Profile, Class } from '@/lib/supabase/types';

const roleConfig = {
  admin: { label: 'Admin', icon: Shield, color: 'text-amber-600', bg: 'bg-amber-50' },
  student: { label: 'Aluno', icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-50' },
  professor: { label: 'Professor', icon: GraduationCap, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  partner: { label: 'Empresa', icon: Building2, color: 'text-cyan-600', bg: 'bg-cyan-50' }, 
};

interface UserWithClasses extends Profile {
  assignedClasses: { id: string; name: string; course: string }[];
}

export default function UsersManagementPage() {
  const [users, setUsers] = useState<UserWithClasses[]>([]);
  const [allClasses, setAllClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [assigningUser, setAssigningUser] = useState<string | null>(null);
  const [selectedClass, setSelectedClass] = useState('');
  const [assigning, setAssigning] = useState(false);

  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    full_name: '',
    role: 'student' as string,
  });

  const fetchData = useCallback(async () => {
    const supabase = createClient();
    setLoading(true);

    try {
      const [usersRes, classesRes, profAssignRes, studentAssignRes] = await Promise.all([
        supabase.from('profiles').select('*').order('created_at', { ascending: false }),
        supabase.from('classes').select('*').eq('is_active', true).order('name'),
        supabase.from('class_professors').select('class_id, professor_id'),
        supabase.from('class_students').select('class_id, student_id'),
      ]);

      const userList = (usersRes.data ?? []) as Profile[];
      const classList = (classesRes.data ?? []) as Class[];
      const profAssignments = profAssignRes.data ?? [];
      const studentAssignments = studentAssignRes.data ?? [];

      const usersWithClasses: UserWithClasses[] = userList.map(u => {
        let assignedClassIds: string[] = [];
        if (u.role === 'professor') {
          assignedClassIds = profAssignments.filter(a => a.professor_id === u.id).map(a => a.class_id);
        } else if (u.role === 'student') {
          assignedClassIds = studentAssignments.filter(a => a.student_id === u.id).map(a => a.class_id);
        }
        const assignedClasses = classList.filter(c => assignedClassIds.includes(c.id));
        return { ...u, assignedClasses: assignedClasses.map(c => ({ id: c.id, name: c.name, course: c.course })) };
      });

      setUsers(usersWithClasses);
      setAllClasses(classList);
    } catch {
      setError('Erro ao carregar dados.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

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
      setSuccess(`Usuario ${newUser.email} criado com sucesso!`);
      setShowCreateModal(false);
      setNewUser({ email: '', password: '', full_name: '', role: 'student' });
      fetchData();
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar usuário');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (userId: string, userEmail: string) => {
    if (!confirm(`Tem certeza que deseja excluir o usuário ${userEmail}? Esta ação e irreversível.`)) return;
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
      setSuccess(`Usuario ${userEmail} removido com sucesso.`);
      fetchData();
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
    fetchData();
  };

  const handleAssignClass = async () => {
    if (!assigningUser || !selectedClass) return;
    setAssigning(true);
    setError('');
    try {
      const supabase = createClient();
      const user = users.find(u => u.id === assigningUser);
      if (!user) return;

      if (user.role === 'professor') {
        const { error: err } = await supabase
          .from('class_professors')
          .insert({ class_id: selectedClass, professor_id: assigningUser });
        if (err) throw err;
      } else if (user.role === 'student') {
        const { error: err } = await supabase
          .from('class_students')
          .insert({ class_id: selectedClass, student_id: assigningUser });
        if (err) throw err;
      }

      setSuccess('Turma atribuída com sucesso!');
      setAssigningUser(null);
      setSelectedClass('');
      fetchData();
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atribuir turma.');
    } finally {
      setAssigning(false);
    }
  };

  const handleRemoveClass = async (userId: string, classId: string) => {
    const supabase = createClient();
    const user = users.find(u => u.id === userId);
    if (!user) return;

    if (user.role === 'professor') {
      await supabase.from('class_professors').delete().eq('class_id', classId).eq('professor_id', userId);
    } else if (user.role === 'student') {
      await supabase.from('class_students').delete().eq('class_id', classId).eq('student_id', userId);
    }
    fetchData();
  };

  const availableClasses = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return [];
    const assignedIds = user.assignedClasses.map(c => c.id);
    return allClasses.filter(c => !assignedIds.includes(c.id));
  };

  const filtered = users.filter(u =>
    u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.role?.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total: users.length,
    students: users.filter(u => u.role === 'student').length,
    professors: users.filter(u => u.role === 'professor').length,
  };

  return (
    <div className="p-6 sm:p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Gestão de Usuários</h1>
          <p className="text-muted-foreground mt-1 text-sm">Crie, gerencie e atribua turmas aos usuários.</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="gap-2 shrink-0">
          <UserPlus className="w-4 h-4" />
          Criar Usuário
        </Button>
      </div>

      {/* ERRO NA PÁGINA PRINCIPAL (Só aparece se o Modal estiver fechado) */}
      {error && !showCreateModal && (
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

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total', value: stats.total, icon: Users, color: 'text-foreground', bg: 'bg-muted' },
          { label: 'Alunos', value: stats.students, icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Professores', value: stats.professors, icon: GraduationCap, color: 'text-emerald-600', bg: 'bg-emerald-50' },
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

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome, e-mail ou papel..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="h-11 pl-10"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-card rounded-2xl border border-border p-16 text-center">
          <Users className="w-14 h-14 text-muted-foreground/40 mx-auto mb-4" />
          <h3 className="font-semibold text-foreground text-lg mb-2">Nenhum usuário encontrado</h3>
          <p className="text-muted-foreground text-sm">Ajuste os termos da busca ou crie um novo usuário.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(user => {
            const rc = roleConfig[user.role] ?? roleConfig.student;
            const RoleIcon = rc.icon;
            const canAssignClass = user.role === 'professor' || user.role === 'student';

            return (
              <div key={user.id} className="bg-card rounded-2xl border border-border p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-10 h-10 ${rc.bg} rounded-full flex items-center justify-center shrink-0`}>
                      <span className={`font-bold text-sm ${rc.color}`}>
                        {user.full_name?.charAt(0)?.toUpperCase() || '?'}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium text-foreground truncate">{user.full_name || 'Sem nome'}</div>
                      <div className="text-muted-foreground text-xs truncate">{user.email}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${rc.bg} ${rc.color}`}>
                          <RoleIcon className="w-3 h-3" />
                          {rc.label}
                        </span>
                        {user.course && (
                          <span className="text-xs text-muted-foreground">{user.course}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleToggleActive(user.id, user.is_active)}
                      className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full cursor-pointer transition-colors ${
                        user.is_active
                          ? 'bg-green-50 text-green-700 hover:bg-green-100'
                          : 'bg-red-50 text-red-700 hover:bg-red-100'
                      }`}
                    >
                      <div className={`w-1.5 h-1.5 rounded-full ${user.is_active ? 'bg-green-500' : 'bg-red-500'}`} />
                      {user.is_active ? 'Ativo' : 'Inativo'}
                    </button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-50/60"
                      onClick={() => handleDelete(user.id, user.email)}
                      disabled={deleting === user.id}
                    >
                      {deleting === user.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                {canAssignClass && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-semibold text-foreground">Turmas atribuídas</p>
                      <button
                        onClick={() => setAssigningUser(user.id)}
                        className="text-xs text-primary hover:text-primary/80 font-medium flex items-center gap-1"
                      >
                        <UserPlus className="w-3 h-3" /> Atribuir Turma
                      </button>
                    </div>

                    {user.assignedClasses.length === 0 ? (
                      <p className="text-xs text-muted-foreground italic">Nenhuma turma atribuída</p>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {user.assignedClasses.map(cls => (
                          <span
                            key={cls.id}
                            className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full ${
                              user.role === 'professor'
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-blue-50 text-blue-700'
                            }`}
                          >
                            {cls.name} — {cls.course}
                            <button
                              onClick={() => handleRemoveClass(user.id, cls.id)}
                              className="hover:text-destructive transition-colors"
                            >
                              <XCircle className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}

                    {assigningUser === user.id && (
                      <div className="mt-3 bg-muted/30 rounded-xl p-3 space-y-2 border border-border">
                        <select
                          value={selectedClass}
                          onChange={e => setSelectedClass(e.target.value)}
                          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        >
                          <option value="">Selecione uma turma</option>
                          {availableClasses(user.id).map(c => (
                            <option key={c.id} value={c.id}>
                              {c.name} — {c.course} ({c.year}/{c.semester})
                            </option>
                          ))}
                        </select>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={handleAssignClass}
                            disabled={!selectedClass || assigning}
                            className="flex-1 gap-1.5 h-8 text-xs"
                          >
                            {assigning ? <Loader2 className="w-3 h-3 animate-spin" /> : <UserPlus className="w-3 h-3" />}
                            Atribuir
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => { setAssigningUser(null); setSelectedClass(''); setError(''); }}
                            className="flex-1 h-8 text-xs"
                          >
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => { setShowCreateModal(false); setError(''); }} />
          <div className="relative bg-card border border-border rounded-2xl p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-foreground">Criar Novo Usuário</h2>
              <button onClick={() => { setShowCreateModal(false); setError(''); }} className="p-1 rounded-lg hover:bg-muted transition-colors">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {/* ERRO DENTRO DO MODAL */}
            {error && (
              <div className="mb-4 flex items-center gap-3 bg-destructive/10 border border-destructive/20 rounded-xl p-4">
                <AlertCircle className="w-4 h-4 text-destructive shrink-0" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

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
                <Label htmlFor="new_email">E-mail Institucional</Label>
                <Input
                  id="new_email"
                  type="email"
                  value={newUser.email}
                  onChange={e => setNewUser(p => ({ ...p, email: e.target.value }))}
                  placeholder="maria@fatec.edu.br"
                  className="h-11"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="new_password">Senha Provisória</Label>
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

              <div className="bg-muted/50 rounded-xl p-3 space-y-1.5">
                <p className="text-xs font-medium text-foreground">Informações sobre o acesso:</p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>- O usuário receberá o e-mail de confirmação</li>
                  <li>- A senha provisória deverá ser alterada no primeiro acesso</li>
                  <li>- O perfil será criado automaticamente com o papel selecionado</li>
                </ul>
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => { setShowCreateModal(false); setError(''); }} className="flex-1">
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
