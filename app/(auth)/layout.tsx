import Link from 'next/link';
import { BookOpen } from 'lucide-react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left: decorative panel */}
      <div className="hidden lg:flex gradient-hero flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 -right-20 w-72 h-72 rounded-full bg-blue-400/10 blur-3xl" />
          <div className="absolute bottom-1/4 -left-10 w-56 h-56 rounded-full bg-cyan-400/10 blur-3xl" />
        </div>
        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-white/15 rounded-xl flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-white text-lg">Observatório PI</span>
          </Link>
        </div>
        <div className="relative z-10 space-y-8">
          <div>
            <h2 className="text-3xl font-bold text-white mb-3 leading-tight">
              Inovação acadêmica <br />visível ao mercado
            </h2>
            <p className="text-white/60 text-base leading-relaxed">
              Uma plataforma que conecta alunos, professores e empresas através de projetos que transformam o conhecimento em impacto real.
            </p>
          </div>
          <div className="space-y-3">
            {[
              'Submissão e gestão completa de projetos',
              'Avaliação por rubrica detalhada',
              'Vitrine para empresas parceiras',
              'Mentor IA para feedback imediato',
            ].map(item => (
              <div key={item} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-cyan-400/30 flex items-center justify-center shrink-0">
                  <div className="w-2 h-2 rounded-full bg-cyan-400" />
                </div>
                <span className="text-white/70 text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="relative z-10">
          <p className="text-white/30 text-xs">
            Plataforma institucional — acesso restrito a membros cadastrados.
          </p>
        </div>
      </div>

      {/* Right: form */}
      <div className="flex flex-col items-center justify-center p-6 sm:p-12 bg-background">
        <div className="lg:hidden flex items-center gap-2 mb-10">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-bold text-foreground">Observatório PI</span>
        </div>
        <div className="w-full max-w-[400px]">
          {children}
        </div>
      </div>
    </div>
  );
}
