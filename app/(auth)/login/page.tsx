'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, LogIn, CircleAlert as AlertCircle, Loader as Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password });

      if (authError) {
        if (authError.message.includes('Invalid login credentials')) {
          setError('E-mail ou senha incorretos. Verifique seus dados e tente novamente.');
        } else if (authError.message.includes('Email not confirmed')) {
          setError('E-mail não confirmado. Entre em contato com o administrador.');
        } else {
          setError('Ocorreu um erro ao fazer login. Tente novamente.');
        }
        setLoading(false); // Garante que o loading pare se houver erro
        return;
      }

      // router.push navega no client-side e router.refresh() força o Next.js 
      // a re-renderizar a árvore do servidor, garantindo que o middleware pegue o novo cookie.
      router.push('/dashboard');
      router.refresh(); 
      
    } catch {
      setError('Erro inesperado. Tente novamente mais tarde.');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-foreground">Bem-vindo de volta</h1>
        <p className="text-muted-foreground text-sm">
          Entre com suas credenciais institucionais para acessar a plataforma.
        </p>
      </div>

      <form onSubmit={handleLogin} className="space-y-5">
        {error && (
          <div 
            className="flex items-start gap-3 bg-destructive/10 border border-destructive/20 rounded-xl p-4"
            role="alert" // Adicionado para leitores de tela anunciarem o erro automaticamente
          >
            <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
            <p className="text-sm text-destructive leading-relaxed">{error}</p>
          </div>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-foreground font-medium text-sm">E-mail institucional</Label>
          <Input
            id="email"
            type="email"
            placeholder="seu@email.edu.br"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            autoComplete="email"
            autoFocus // Melhora a UX já focando no campo de e-mail ao carregar
            className="h-11"
            disabled={loading}
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-foreground font-medium text-sm">Senha</Label>
            <Link
              href="/recuperar-senha"
              className="text-xs text-primary hover:text-primary/80 transition-colors"
            >
              Esqueceu a senha?
            </Link>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="h-11 pr-11"
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              tabIndex={-1}
              aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"} // Acessibilidade
              title={showPassword ? "Ocultar senha" : "Mostrar senha"}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full h-11 gap-2 font-semibold"
          disabled={loading || !email || !password}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Entrando...
            </>
          ) : (
            <>
              <LogIn className="w-4 h-4" />
              Entrar na plataforma
            </>
          )}
        </Button>
      </form>

      <div className="space-y-4">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center">
            <span className="px-3 bg-background text-muted-foreground text-xs">Informações</span>
          </div>
        </div>

        <div className="bg-muted/50 rounded-xl p-4 space-y-2">
          <p className="text-xs text-muted-foreground font-medium">Novo na plataforma?</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            O acesso é concedido pelo administrador do sistema. Entre em contato com a coordenação do seu curso para solicitar suas credenciais.
          </p>
        </div>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        Ao entrar, você concorda com os{' '}
        <Link href="/termos" className="text-primary hover:underline">Termos de Uso</Link>
        {' '}e a{' '}
        <Link href="/privacidade" className="text-primary hover:underline">Política de Privacidade</Link>.
      </p>
    </div>
  );
}