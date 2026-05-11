'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Plus, Loader as Loader2, CircleAlert as AlertCircle, X,
  CircleCheck as CheckCircle, Users, GraduationCap, Calendar,
  UserPlus, Trash2, BookOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { createClient } from '@/lib/supabase/client';
import type { Class, Profile } from '@/lib/supabase/types';

interface ClassWithMembers extends Class {
  professors: { id: string; full_name: string; email: string }[];
  students: { id: string; full_name: string; email: string }[];
}

export default function ClassesManagementPage() {
  const [classes, setClasses] = useState<ClassWithMembers[]>([]);
  const [professors, setProfessors] = useState<Profile[]>([]);
  const [allStudents, setAllStudents] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [assigningClass, setAssigningClass] = useState<string | null>(null);
  const [assignType, setAssignType] = useState<'professor' | 'student'>('professor');
  const [selectedPerson, setSelectedPerson] = useState('');
  const [assigning, setAssigning] = useState(false);

  const [form, setForm] = useState({
    name: '',
    course: '',
    year: new Date().getFullYear(),
    semester: '1' as '1' | '2',
    description: '',
  });

  const fetchData = useCallback(async () => {
    const supabase = createClient();
    setLoading(true);

    try {
      const [classesRes, profRes, studentRes, profAssignRes, studentAssignRes] = await Promise.all([
        supabase.from('classes').select('*').order('year', { ascending: false }),
        supabase.from('profiles').select('*').eq('role', 'professor').eq('is_active', true).order('full_name'),
        supabase.from('profiles').select('*').eq('role', 'student').eq('is_active', true).order('full_name'),
        supabase.from('class_professors').select('class_id, professor_id'),
        supabase.from('class_students').select('class_id, student_id'),
      ]);

      const classList = (classesRes.data ?? []) as Class[];
      const profList = (profRes.data ?? []) as Profile[];
      const studentList = (studentRes.data ?? []) as Profile[];
      const profAssignments = profAssignRes.data ?? [];
      const studentAssignments = studentAssignRes.data ?? [];

      const classesWithMembers: ClassWithMembers[] = classList.map(cls => {
        const profIds = profAssignments.filter(a => a.class_id === cls.id).map(a => a.professor_id);
        const studentIds = studentAssignments.filter(a => a.class_id === cls.id).map(a => a.student_id);
        return {
          ...cls,
          professors: profList.filter(p => profIds.includes(p.id)).map(p => ({ id: p.id, full_name: p.full_name, email: p.email })),
          students: studentList.filter(s => studentIds.includes(s.id)).map(s => ({ id: s.id, full_name: s.full_name, email: s.email })),
        };
      });

      setClasses(classesWithMembers);
      setProfessors(profList);
      setAllStudents(studentList);
    } catch {
      setError('Erro ao carregar dados.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const supabase = createClient();
      const { error: err } = await supabase.from('classes').insert({
        name: form.name.trim(),
        course: form.course.trim(),
        year: form.year,
        semester: form.semester,
        description: form.description.trim(),
      });
      if (err) throw err;
      setSuccess('Turma criada com sucesso!');
      setShowModal(false);
      setForm({ name: '', course: '', year: new Date().getFullYear(), semester: '1', description: '' });
      fetchData();
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar turma.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (classId: string, isActive: boolean) => {
    const supabase = createClient();
    await supabase.from('classes').update({ is_active: !isActive }).eq('id', classId);
    fetchData();
  };

  const handleAssign = async () => {
    if (!assigningClass || !selectedPerson) return;
    setAssigning(true);
    setError('');
    try {
      const supabase = createClient();
      if (assignType === 'professor') {
        const { error: err } = await supabase
          .from('class_professors')
          .insert({ class_id: assigningClass, professor_id: selectedPerson });
        if (err) throw err;
      } else {
        const { error: err } = await supabase
          .from('class_students')
          .insert({ class_id: assigningClass, student_id: selectedPerson });
        if (err) throw err;
      }
      setSuccess(assignType === 'professor' ? 'Professor atribuido com sucesso!' : 'Aluno matriculado com sucesso!');
      setAssigningClass(null);
      setSelectedPerson('');
      fetchData();
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atribuir.');
    } finally {
      setAssigning(false);
    }
  };

  const handleRemoveProfessor = async (classId: string, professorId: string) => {
    const supabase = createClient();
    await supabase.from('class_professors').delete().eq('class_id', classId).eq('professor_id', professorId);
    fetchData();
  };

  const handleRemoveStudent = async (classId: string, studentId: string) => {
    const supabase = createClient();
    await supabase.from('class_students').delete().eq('class_id', classId).eq('student_id', studentId);
    fetchData();
  };

  const availableProfessors = (classId: string) => {
    const cls = classes.find(c => c.id === classId);
    if (!cls) return [];
    const assigned = cls.professors.map(p => p.id);
    return professors.filter(p => !assigned.includes(p.id));
  };

  const availableStudents = (classId: string) => {
    const cls = classes.find(c => c.id === classId);
    if (!cls) return [];
    const assigned = cls.students.map(s => s.id);
    return allStudents.filter(s => !assigned.includes(s.id));
  };

  return (
    <div className="p-6 sm:p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Gestao de Turmas</h1>
          <p className="text-muted-foreground mt-1 text-sm">Crie turmas, atribua professores e matricule alunos.</p>
        </div>
        <Button onClick={() => setShowModal(true)} className="gap-2 shrink-0">
          <Plus className="w-4 h-4" />
          Nova Turma
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

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : classes.length === 0 ? (
        <div className="bg-card rounded-2xl border border-border p-16 text-center">
          <GraduationCap className="w-14 h-14 text-muted-foreground/40 mx-auto mb-4" />
          <h3 className="font-semibold text-foreground text-lg mb-2">Nenhuma turma cadastrada</h3>
          <p className="text-muted-foreground text-sm mb-6">Crie a primeira turma para organizar os projetos.</p>
          <Button onClick={() => setShowModal(true)} className="gap-2">
            <Plus className="w-4 h-4" /> Criar Turma
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {classes.map(cls => (
            <div key={cls.id} className="bg-card rounded-2xl border border-border p-6 card-hover">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center shrink-0">
                  <GraduationCap className="w-5 h-5 text-emerald-600" />
                </div>
                <button
                  onClick={() => handleToggleActive(cls.id, cls.is_active)}
                  className={`text-xs font-medium px-2.5 py-1 rounded-full cursor-pointer transition-colors ${
                    cls.is_active
                      ? 'bg-green-50 text-green-700 hover:bg-green-100'
                      : 'bg-red-50 text-red-700 hover:bg-red-100'
                  }`}
                >
                  {cls.is_active ? 'Ativa' : 'Inativa'}
                </button>
              </div>
              <h3 className="font-semibold text-foreground mb-1">{cls.name}</h3>
              <p className="text-muted-foreground text-sm mb-3">{cls.course}</p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  {cls.year}/{cls.semester}
                </div>
                <div className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" />
                  {cls.students.length} aluno{cls.students.length !== 1 ? 's' : ''}
                </div>
              </div>
              {cls.description && (
                <p className="text-muted-foreground text-xs mb-4 line-clamp-2">{cls.description}</p>
              )}

              {/* Professors */}
              <div className="border-t border-border pt-4 mt-1">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold text-foreground">Professores</p>
                  <button
                    onClick={() => { setAssigningClass(cls.id); setAssignType('professor'); }}
                    className="text-xs text-primary hover:text-primary/80 font-medium flex items-center gap-1"
                  >
                    <UserPlus className="w-3 h-3" /> Atribuir
                  </button>
                </div>
                {cls.professors.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic">Nenhum professor atribuido</p>
                ) : (
                  <div className="space-y-1.5">
                    {cls.professors.map(prof => (
                      <div key={prof.id} className="flex items-center justify-between gap-2 bg-emerald-50 rounded-lg px-3 py-1.5">
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-emerald-700 truncate">{prof.full_name || 'Professor'}</p>
                        </div>
                        <button onClick={() => handleRemoveProfessor(cls.id, prof.id)} className="shrink-0 p-1 rounded hover:bg-destructive/10 transition-colors">
                          <Trash2 className="w-3 h-3 text-muted-foreground hover:text-destructive" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Students */}
              <div className="border-t border-border pt-4 mt-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold text-foreground">Alunos</p>
                  <button
                    onClick={() => { setAssigningClass(cls.id); setAssignType('student'); }}
                    className="text-xs text-primary hover:text-primary/80 font-medium flex items-center gap-1"
                  >
                    <BookOpen className="w-3 h-3" /> Matricular
                  </button>
                </div>
                {cls.students.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic">Nenhum aluno matriculado</p>
                ) : (
                  <div className="space-y-1.5 max-h-40 overflow-y-auto">
                    {cls.students.map(stu => (
                      <div key={stu.id} className="flex items-center justify-between gap-2 bg-blue-50 rounded-lg px-3 py-1.5">
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-blue-700 truncate">{stu.full_name || 'Aluno'}</p>
                        </div>
                        <button onClick={() => handleRemoveStudent(cls.id, stu.id)} className="shrink-0 p-1 rounded hover:bg-destructive/10 transition-colors">
                          <Trash2 className="w-3 h-3 text-muted-foreground hover:text-destructive" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Assign inline */}
              {assigningClass === cls.id && (
                <div className="mt-3 bg-muted/30 rounded-xl p-3 space-y-2 border border-border">
                  <p className="text-xs font-medium text-foreground">
                    {assignType === 'professor' ? 'Atribuir professor' : 'Matricular aluno'}
                  </p>
                  <select
                    value={selectedPerson}
                    onChange={e => setSelectedPerson(e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  >
                    <option value="">{assignType === 'professor' ? 'Selecione um professor' : 'Selecione um aluno'}</option>
                    {(assignType === 'professor' ? availableProfessors(cls.id) : availableStudents(cls.id)).map(p => (
                      <option key={p.id} value={p.id}>
                        {p.full_name || p.email}
                      </option>
                    ))}
                  </select>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={handleAssign}
                      disabled={!selectedPerson || assigning}
                      className="flex-1 gap-1.5 h-8 text-xs"
                    >
                      {assigning ? <Loader2 className="w-3 h-3 animate-spin" /> : <UserPlus className="w-3 h-3" />}
                      {assignType === 'professor' ? 'Atribuir' : 'Matricular'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => { setAssigningClass(null); setSelectedPerson(''); }}
                      className="flex-1 h-8 text-xs"
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create Class Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-card border border-border rounded-2xl p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-foreground">Nova Turma</h2>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-lg hover:bg-muted transition-colors">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="cls_name">Nome da Turma</Label>
                <Input id="cls_name" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Ex: 5o Semestre — Noturno" className="h-11" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cls_course">Curso</Label>
                <Input id="cls_course" value={form.course} onChange={e => setForm(p => ({ ...p, course: e.target.value }))} placeholder="Ex: Analise e Desenvolvimento de Sistemas" className="h-11" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="cls_year">Ano</Label>
                  <Input id="cls_year" type="number" value={form.year} onChange={e => setForm(p => ({ ...p, year: parseInt(e.target.value) || new Date().getFullYear() }))} className="h-11" required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="cls_semester">Semestre</Label>
                  <select id="cls_semester" value={form.semester} onChange={e => setForm(p => ({ ...p, semester: e.target.value as '1' | '2' }))} className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                    <option value="1">1o Semestre</option>
                    <option value="2">2o Semestre</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cls_desc">Descricao (opcional)</Label>
                <Textarea id="cls_desc" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Informacoes adicionais sobre a turma..." className="min-h-[80px]" />
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowModal(false)} className="flex-1">Cancelar</Button>
                <Button type="submit" disabled={saving} className="flex-1 gap-2">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  Criar Turma
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
