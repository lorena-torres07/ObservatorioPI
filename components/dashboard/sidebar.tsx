'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  BookOpen, LayoutDashboard, FolderOpen, Award, Users, Settings,
  LogOut, ChevronRight, ChartBar as BarChart3, Loader2, Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Profile } from '@/lib/supabase/types';
import { NotificationBell } from '@/components/dashboard/notification-bell';

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
    { label: 'Mentor IA', href: '/dashboard/chat', icon: Sparkles },
  ],
  professor: [
    { label: 'Início', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Turmas', href: '/dashboard/turmas', icon: Users },
    { label: 'Projetos', href: '/dashboard/projetos', icon: FolderOpen },
    { label: 'Avaliações', href: '/dashboard/avaliacoes', icon: Award },
    { label: 'Assistente IA', href: '/dashboard/chat', icon: Sparkles },
  ],
  admin: [
    { label: 'Início', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Usuários', href: '/dashboard/usuarios', icon: Users },
    { label: 'Projetos', href: '/dashboard/projetos', icon: FolderOpen },
    { label: 'Turmas', href: '/dashboard/turmas', icon: BookOpen },
    { label: 'Avaliações', href: '/dashboard/avaliacoes', icon: Award },
    { label: 'Relatórios', href: '/dashboard/relatorios', icon: BarChart3 },
    { label: 'Gerenciador IA', href: '/dashboard/chat', icon: Sparkles },
  ],
  partner: [
    { label: 'Início', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Projetos', href: '/dashboard/projetos', icon: FolderOpen },
    { label: 'Assistente IA', href: '/dashboard/chat', icon: Sparkles },
  ],
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
  const router = useRouter();
  const navItems = navByRole[profile.role] ?? navByRole.student;
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleSignOut = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingOut(true);
    try {
      await fetch('/auth/signout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('Erro ao sair:', error);
      setIsLoggingOut(false);
    }
  };

  return (
    <aside className="w-64 shrink-0 hidden lg:flex flex-col bg-card border-r border-border h-screen sticky top-0">
      {/* Logo + Sininho */}
      <div className="p-5 border-b border-border flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-primary-foreground" />
          </div>
          <div>
            <div className="font-bold text-foreground text-sm leading-none">Observatório PI</div>
            <div className="text-muted-foreground text-xs mt-0.5">{roleLabels[profile.role]}</div>
          </div>
        </Link>
        <NotificationBell />
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {navItems.map(item => {
          const Icon = item.icon;
          const active =
            pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(item.href));
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

        <form onSubmit={handleSignOut}>
          <button
            type="submit"
            disabled={isLoggingOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all disabled:opacity-50"
          >
            {isLoggingOut ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <LogOut className="w-4 h-4" />
            )}
            {isLoggingOut ? 'Saindo...' : 'Sair'}
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