'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, LayoutDashboard, FolderOpen, Award, Users, Settings, LogOut, ChartBar as BarChart3, Menu, X, KeyRound } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Profile } from '@/lib/supabase/types';

const navByRole: Record<string, { label: string; href: string; icon: React.ElementType }[]> = {
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

export function MobileHeader({ profile }: { profile: Profile }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const navItems = navByRole[profile.role] ?? navByRole.student;

  return (
    <>
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-card border-b border-border h-14 flex items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
            <BookOpen className="w-3.5 h-3.5 text-primary-foreground" />
          </div>
          <span className="font-bold text-foreground text-sm">Observatório PI</span>
        </Link>
        <button onClick={() => setOpen(!open)} className="p-2 rounded-lg hover:bg-muted transition-colors">
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {open && (
        <div className="lg:hidden fixed inset-0 z-40 bg-background/80 backdrop-blur-sm" onClick={() => setOpen(false)} />
      )}

      <div className={cn(
        'lg:hidden fixed top-14 left-0 bottom-0 z-40 w-64 bg-card border-r border-border flex flex-col transition-transform duration-300',
        open ? 'translate-x-0' : '-translate-x-full'
      )}>
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {navItems.map(item => {
            const Icon = item.icon;
            const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                  active ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-border space-y-1">
          <Link href="/dashboard/configuracoes" onClick={() => setOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-all">
            <Settings className="w-4 h-4" />Configurações
          </Link>
          <form action="/auth/signout" method="POST">
            <button type="submit" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all">
              <LogOut className="w-4 h-4" />Sair
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
