'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, LayoutDashboard, FolderOpen, Award, Users, Settings, LogOut, ChevronRight, ChartBar as BarChart3, KeyRound } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Profile } from '@/lib/supabase/types';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const navByRole: Record<string, NavItem[]> = {
  student: [
    { label: 'Início', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Meus Projetos', href: '/dashboard/projetos', icon: FolderOpen },
    { label: 'Avaliações', href: '/dashboard/avaliacoes', icon: Award },
  ],
  professor: [
    { label: 'Início', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Turmas', href: '/dashboard/turmas', icon: Users },
    { label: 'Projetos', href: '/dashboard/projetos', icon: FolderOpen },
    { label: 'Avaliações', href: '/dashboard/avaliacoes', icon: Award },
  ],
  admin: [
    { label: 'Início', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Usuários', href: '/dashboard/usuarios', icon: Users },
    { label: 'Credenciais', href: '/dashboard/credenciais', icon: KeyRound },
    { label: 'Projetos', href: '/dashboard/projetos', icon: FolderOpen },
    { label: 'Turmas', href: '/dashboard/turmas', icon: BookOpen },
    { label: 'Avaliações', href: '/dashboard/avaliacoes', icon: Award },
    { label: 'Relatórios', href: '/dashboard/relatorios', icon: BarChart3 },
  ],
  partner: [],
};

interface SidebarProps {
  profile: Profile;
}

const roleLabels: Record<string, string> = {
  student: 'Aluno',
  professor: 'Professor',
  admin: 'Administrador',
  partner: 'Empresa Parceira',
};

export function Sidebar({ profile }: SidebarProps) {
  const pathname = usePathname();
  const navItems = navByRole[profile.role] ?? navByRole.student;

  return (
    <aside className="w-64 shrink-0 hidden lg:flex flex-col bg-card border-r border-border h-screen sticky top-0">
      {/* Logo */}
      <div className="p-5 border-b border-border">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-primary-foreground" />
          </div>
          <div>
            <div className="font-bold text-foreground text-sm leading-none">Observatório PI</div>
            <div className="text-muted-foreground text-xs mt-0.5">{roleLabels[profile.role]}</div>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {navItems.map(item => {
          const Icon = item.icon;
          const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group',
                active
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="flex-1">{item.label}</span>
              {active && <ChevronRight className="w-3.5 h-3.5 opacity-70" />}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="p-3 border-t border-border space-y-1">
        <Link
          href="/dashboard/configuracoes"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
        >
          <Settings className="w-4 h-4" />
          Configurações
        </Link>
        <form action="/auth/signout" method="POST">
          <button
            type="submit"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </button>
        </form>
        <div className="px-3 py-2 mt-1">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
              <span className="text-primary font-bold text-xs">
                {profile.full_name?.charAt(0)?.toUpperCase() || '?'}
              </span>
            </div>
            <div className="overflow-hidden">
              <div className="text-foreground text-xs font-semibold truncate">{profile.full_name || 'Usuário'}</div>
              <div className="text-muted-foreground text-xs truncate">{profile.email}</div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
