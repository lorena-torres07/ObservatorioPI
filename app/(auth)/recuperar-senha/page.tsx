'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, Loader as Loader2, CircleCheck as CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClient } from '@/lib/supabase/client';

export default function RecoverPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const supabase = createClient();
      const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/atualizar-senha`,
      });
      if (err) { setError('Não foi possível enviar o e-mail. Tente novamente.'); return; }
      setSent(true);
    } catch {
      setError('Erro inesperado. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="space-y-6 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">E-mail enviado!</h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Enviamos um link de recuperação para <strong>{email}</strong>. Verifique sua caixa de entrada e spam.
          </p>
        </div>
        <Link href="/login">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Voltar ao login
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-foreground">Recuperar senha</h1>
        <p className="text-muted-foreground text-sm">
          Informe seu e-mail cadastrado e enviaremos um link para redefinir sua senha.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-xl p-3">{error}</p>
        )}
        <div className="space-y-1.5">
          <Label htmlFor="email">E-mail institucional</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="seu@email.edu.br"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="h-11 pl-10"
              disabled={loading}
            />
          </div>
        </div>
        <Button type="submit" className="w-full h-11 gap-2" disabled={loading || !email}>
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Enviando...</> : 'Enviar link de recuperação'}
        </Button>
      </form>
      <Link href="/login" className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Voltar ao login
      </Link>
    </div>
  );
}
