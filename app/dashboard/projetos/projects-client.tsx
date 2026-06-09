'use client';

import { useState, useMemo } from 'react';
import { Plus, Search, X } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ProjectCard } from '@/components/projects/project-card';
import type { Project, Profile } from '@/lib/supabase/types';

type ClassInfo = {
  id: string;
  name: string;
  course: string;
  year: number;
  semester: string;
};

type ProjectWithProfile = Project & {
  profiles?: Pick<Profile, 'full_name'> | null;
  student_email?: string;
  professor_email?: string;
  admin_email?: string;
};

type Props = {
  role: string;
  classes: ClassInfo[];
  projects: ProjectWithProfile[];
};

export function ProjectsClient({ role, classes, projects }: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('');

  const filtered = useMemo(() => {
    let result = projects;

    // 1. Filtro por turma selecionada (botões)
    if (selectedClassId) {
      result = result.filter(p => p.class_id === selectedClassId);
    }

    // 2. Filtro Inteligente da Barra de Busca (Focado em Projeto, Turma e Mês)
    if (searchQuery.trim()) {
      const lower = searchQuery.toLowerCase();
      
      // Matriz textual para tradução e mapeamento do getMonth() do JavaScript (0 a 11)
      const mesesDoAno = [
        'janeiro jan 01',
        'fevereiro fev 02',
        'março mar 03',
        'abril abr 04',
        'maio mai 05',
        'junho jun 06',
        'julho jul 07',
        'agosto ago 08',
        'setembro set 09',
        'outubro out 10',
        'novembro nov 11',
        'dezembro dez 12'
      ];

      result = result.filter(p => {
        // Encontra os detalhes da turma associada ao projeto
        const projectClass = classes.find(c => c.id === p.class_id);
        
        // Tratamento da data do projeto para extração textual do mês
        let dataDoMesTextual = '';
        if (p.created_at) {
          const dataProjeto = new Date(p.created_at);
          const numeroDoMes = dataProjeto.getMonth(); // Retorna índice de 0 a 11
          dataDoMesTextual = mesesDoAno[numeroDoMes] || ''; // Ex: Se for mês 5 (Junho), injeta 'junho jun 06'
        }

        // Monta a string unificada de busca (Sem o authorName)
        const searchString = [
          p.title,
          p.short_description,
          projectClass?.name,
          projectClass?.course,
          projectClass?.year?.toString(),
          dataDoMesTextual // Permite buscar por variações do mês de criação
        ].filter(Boolean).join(' ').toLowerCase();

        return searchString.includes(lower);
      });
    }

    return result;
  }, [projects, selectedClassId, searchQuery, classes]);

  // Atualização: Permite que Admin, Professor e Empresa vejam a barra e filtros completos
  const canFilterByClass = role === 'professor' || role === 'admin' || role === 'partner';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {role === 'student' ? 'Meus Projetos' : 'Projetos'}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {filtered.length} {filtered.length === 1 ? 'projeto encontrado' : 'projetos encontrados'}
            {searchQuery && (
              <span className="ml-1">
                para <span className="font-medium">"{searchQuery}"</span>
              </span>
            )}
          </p>
        </div>
        {role === 'student' && (
          <Link href="/dashboard/projetos/novo">
            <Button className="gap-2 shrink-0">
              <Plus className="w-4 h-4" />
              Novo Projeto
            </Button>
          </Link>
        )}
      </div>

      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder={
            canFilterByClass
              ? 'Buscar por projeto, turma, curso, ano ou mês...'
              : 'Buscar por nome do projeto ou mês...'
          }
          className="w-full h-10 pl-9 pr-9 rounded-xl border border-input bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filters row */}
      <div className="flex flex-wrap gap-3 items-center">
        {/* Class filter — admin, professor e empresa */}
        {canFilterByClass && classes.length > 0 && (
          <div className="flex gap-1.5 flex-wrap">
            <button
              onClick={() => setSelectedClassId('')}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                !selectedClassId
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-secondary text-secondary-foreground border-border hover:bg-muted'
              }`}
            >
              Todas as turmas
            </button>
            {classes.map(cls => (
              <button
                key={cls.id}
                onClick={() => setSelectedClassId(cls.id === selectedClassId ? '' : cls.id)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                  selectedClassId === cls.id
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-secondary text-secondary-foreground border-border hover:bg-muted'
                }`}
              >
                {cls.name} — {cls.course} ({cls.year}/{cls.semester})
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Empty states */}
      {filtered.length === 0 ? (
        <div className="bg-card rounded-2xl border border-border p-16 text-center">
          <div className="w-14 h-14 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Search className="w-7 h-7 text-muted-foreground/50" />
          </div>
          <h3 className="font-semibold text-foreground text-lg mb-2">
            Nenhum projeto encontrado
          </h3>
          <p className="text-muted-foreground text-sm mb-6 max-w-md mx-auto">
            {role === 'student'
              ? 'Você ainda não submeteu nenhum projeto. Que tal começar agora?'
              : searchQuery
              ? `Nenhum projeto corresponde a "${searchQuery}".`
              : selectedClassId
              ? 'Nenhum projeto nesta turma.'
              : role === 'partner'
              ? 'Nenhum projeto disponível na vitrine ainda.'
              : 'Nenhum projeto submetido ainda.'}
          </p>

          {(searchQuery || selectedClassId) && (
            <button
              onClick={() => {
                searchQuery && setSearchQuery('');
                selectedClassId && setSelectedClassId('');
              }}
              className="text-sm text-primary hover:underline"
            >
              Limpar filtros
            </button>
          )}

          {role === 'student' && !searchQuery && (
            <Link href="/dashboard/projetos/novo">
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Criar Primeiro Projeto
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map(project => (
            <ProjectCard key={project.id} project={project} role={role} />
          ))}
        </div>
      )}
    </div>
  );
}