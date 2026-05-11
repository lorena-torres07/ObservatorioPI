import Link from 'next/link';
import { ExternalLink, Github, Calendar } from 'lucide-react';
import type { Project } from '@/lib/supabase/types';

const statusConfig: Record<string, { label: string; classes: string }> = {
  draft: { label: 'Rascunho', classes: 'bg-gray-100 text-gray-600 border-gray-200' },
  submitted: { label: 'Submetido', classes: 'bg-blue-100 text-blue-700 border-blue-200' },
  under_review: { label: 'Em Revisão', classes: 'bg-amber-100 text-amber-700 border-amber-200' },
  approved: { label: 'Aprovado', classes: 'bg-green-100 text-green-700 border-green-200' },
  featured: { label: 'Destaque', classes: 'bg-cyan-100 text-cyan-700 border-cyan-200' },
  rejected: { label: 'Devolvido', classes: 'bg-red-100 text-red-700 border-red-200' },
};

interface ProjectCardProps {
  project: Project;
  role?: string;
}

export function ProjectCard({ project, role }: ProjectCardProps) {
  const st = statusConfig[project.status] ?? statusConfig.draft;
  const href = role === 'student' || role === 'admin'
    ? `/dashboard/projetos/${project.id}`
    : `/dashboard/projetos/${project.id}`;

  const formattedDate = new Date(project.updated_at).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'short', year: 'numeric',
  });

  return (
    <Link href={href}>
      <div className="bg-card border border-border rounded-2xl overflow-hidden card-hover h-full flex flex-col">
        {/* Cover */}
        {project.cover_image_url ? (
          <div className="h-36 overflow-hidden">
            <img
              src={project.cover_image_url}
              alt={project.title}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="h-36 gradient-hero flex items-center justify-center">
            <span className="text-white/20 text-5xl font-bold select-none">
              {project.title?.charAt(0)?.toUpperCase()}
            </span>
          </div>
        )}

        <div className="p-5 flex flex-col flex-1">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-semibold text-foreground leading-snug line-clamp-2 flex-1">
              {project.title}
            </h3>
            <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full border shrink-0 ${st.classes}`}>
              {st.label}
            </span>
          </div>

          {project.short_description && (
            <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2 mb-3">
              {project.short_description}
            </p>
          )}

          {project.technologies && project.technologies.length > 0 && (
            <div className="flex gap-1.5 flex-wrap mb-4">
              {project.technologies.slice(0, 4).map(tech => (
                <span
                  key={tech}
                  className="inline-block text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full"
                >
                  {tech}
                </span>
              ))}
              {project.technologies.length > 4 && (
                <span className="text-xs text-muted-foreground">+{project.technologies.length - 4}</span>
              )}
            </div>
          )}

          <div className="mt-auto flex items-center justify-between">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="w-3.5 h-3.5" />
              {formattedDate}
            </div>
            <div className="flex items-center gap-2">
              {project.repository_url && (
                <span className="w-7 h-7 flex items-center justify-center rounded-lg bg-muted hover:bg-muted/80">
                  <Github className="w-3.5 h-3.5 text-muted-foreground" />
                </span>
              )}
              {project.demo_url && (
                <span className="w-7 h-7 flex items-center justify-center rounded-lg bg-muted hover:bg-muted/80">
                  <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
