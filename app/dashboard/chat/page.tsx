'use client';

import { useState, FormEvent, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sparkles, SendHorizontal, Bot, User, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import type { Profile } from '@/lib/supabase/types';

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
}

const roleLabels: Record<string, string> = {
  student: 'Estudante',
  professor: 'Professor',
  partner: 'Empresa Parceira',
  admin: 'Administrador',
};

const roleColors: Record<string, string> = {
  student: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  professor: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
  partner: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  admin: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loadingUser, setLoadingUser] = useState<boolean>(true);

  const scrollRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  useEffect(() => {
    async function getUserProfile() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
          if (!error && data) setProfile(data as Profile);
        }
      } catch (err) {
        console.error("Erro ao carregar perfil no chat:", err);
      } finally {
        setLoadingUser(false);
      }
    }
    getUserProfile();
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading || !profile) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      text: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          userData: {
            id: profile.id,
            name: profile.full_name || 'Usuário',
            role: profile.role,
          },
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Erro na requisição');

      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: 'model', text: data.text },
      ]);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loadingUser) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  const firstName = profile?.full_name?.split(' ')[0] || 'Usuário';
  const roleLabel = roleLabels[profile?.role ?? ''] ?? profile?.role ?? '';
  const roleColor = roleColors[profile?.role ?? ''] ?? 'bg-muted text-muted-foreground';

  const assistantName =
    profile?.role === 'student' ? 'Mentor de Projetos IA' : 'Assistente Inteligente';

  const emptyStateMessage = {
    student: 'Envie os detalhes do seu projeto integrador para receber análises, sugestões práticas e estimativas de maturidade.',
    professor: 'Como posso te ajudar hoje? Posso auxiliar na elaboração de feedbacks para as rubricas ou na síntese de relatórios.',
    partner: 'Bem-vindo ao portal de inovação! Posso te ajudar a encontrar projetos que se encaixem nos requisitos de tecnologia da sua empresa.',
    admin: 'Painel administrativo de IA ativo. Posso ajudar na análise de dados e insights da plataforma.',
    }[(profile?.role ?? '') as 'student' | 'professor' | 'partner' | 'admin'] ?? 'Como posso te ajudar hoje?';

  return (
    <div className="flex flex-col h-[calc(100vh-2rem)] max-w-4xl mx-auto p-4 bg-background">

      {/* Cabeçalho */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground leading-none">
              {assistantName}
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Conectado como{' '}
              <span className="font-medium text-foreground">{profile?.full_name}</span>
            </p>
          </div>
        </div>

        {/* Badge de role em português */}
        <span className={cn('text-xs font-semibold px-2.5 py-1 rounded-full', roleColor)}>
          {roleLabel}
        </span>
      </div>

      {/* Histórico de mensagens */}
      <div className="flex-1 overflow-y-auto pr-2 space-y-4 mb-4 scrollbar-thin">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <Bot className="w-7 h-7" />
            </div>
            <div className="max-w-sm space-y-1">
              <p className="text-sm font-semibold text-foreground">Olá, {firstName}!</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {emptyStateMessage}
              </p>
            </div>
          </div>
        ) : (
          messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={cn(
                  'flex items-end gap-2 max-w-[85%]',
                  isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'
                )}
              >
                <div className={cn(
                  'w-7 h-7 rounded-lg flex items-center justify-center shrink-0 shadow-sm',
                  isUser ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                )}>
                  {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                </div>

                <div className={cn(
                  'px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm whitespace-pre-line',
                  isUser
                    ? 'bg-primary text-primary-foreground rounded-br-sm'
                    : 'bg-card text-card-foreground border border-border rounded-bl-sm'
                )}>
                  {msg.text}
                </div>
              </div>
            );
          })
        )}

        {loading && (
          <div className="flex items-end gap-2 max-w-[85%] mr-auto">
            <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center shrink-0 text-muted-foreground">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <div className="bg-card border border-border px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.3s]" />
              <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.15s]" />
              <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" />
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="flex gap-2 items-center pt-2 border-t border-border">
        <Input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            profile?.role === 'student'
              ? 'Descreva seu projeto para o Mentor IA...'
              : 'Faça uma pergunta ao assistente...'
          }
          disabled={loading}
          className="flex-1 py-6 bg-card text-sm rounded-xl focus-visible:ring-primary"
        />
        <Button
          type="submit"
          size="icon"
          disabled={loading || !input.trim()}
          className="h-12 w-12 rounded-xl shrink-0 shadow-sm"
        >
          <SendHorizontal className="w-4 h-4" />
        </Button>
      </form>

    </div>
  );
}