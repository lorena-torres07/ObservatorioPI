'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Bell, CheckCheck, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNotifications, type NotificationItem } from '@/hooks/use-notifications';

const typeColors: Record<string, string> = {
  evaluation: 'bg-blue-100 text-blue-700',
  status_change: 'bg-green-100 text-green-700',
  comment: 'bg-purple-100 text-purple-700',
};

const typeLabels: Record<string, string> = {
  evaluation: 'Avaliação',
  status_change: 'Status',
  comment: 'Comentário',
};

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const { notifications, unreadCount, markAllRead, markRead } = useNotifications();

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="relative rounded-xl"
        onClick={() => setOpen(prev => !prev)}
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />

          <div className="fixed left-4 right-4 sm:left-auto sm:right-auto lg:left-4 top-16 lg:top-16 z-50 sm:w-72 lg:w-72 max-w-[calc(100vw-2rem)] bg-card border border-border rounded-2xl shadow-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-foreground" />
                <span className="font-semibold text-foreground text-sm">Notificações</span>
                {unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllRead}
                  className="gap-1.5 text-xs text-muted-foreground hover:text-foreground h-7 px-2"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  Marcar todas
                </Button>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 gap-2">
                  <Bell className="w-8 h-8 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground">Nenhuma notificação</p>
                </div>
              ) : (
                notifications.map((n: NotificationItem) => (
                  <div
                    key={n.id}
                    className={`px-4 py-3 border-b border-border last:border-0 transition-colors ${
                      !n.read_at ? 'bg-primary/5' : 'hover:bg-muted/50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${typeColors[n.type] ?? 'bg-gray-100 text-gray-700'}`}>
                            {typeLabels[n.type] ?? n.type}
                          </span>
                          {!n.read_at && (
                            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full shrink-0" />
                          )}
                        </div>
                        <p className="text-sm font-medium text-foreground leading-tight">{n.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{n.message}</p>
                        <p className="text-[10px] text-muted-foreground/60 mt-1">
                          {new Date(n.created_at).toLocaleDateString('pt-BR', {
                            day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        {n.project_id && (
                          <Link
                            href={`/dashboard/projetos/${n.project_id}`}
                            onClick={() => { markRead(n.id); setOpen(false); }}
                          >
                            <Button variant="ghost" size="icon" className="w-6 h-6 rounded-lg">
                              <ExternalLink className="w-3 h-3" />
                            </Button>
                          </Link>
                        )}
                        {!n.read_at && (
                          <button
                            onClick={() => markRead(n.id)}
                            className="text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                          >
                            Lida
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}