import Link from 'next/link';
import { BookOpen, Users, Award, ArrowRight, Star, TrendingUp, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-foreground text-sm sm:text-base">Observatório PI</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">Entrar</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="gradient-hero pt-32 pb-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-cyan-500/10 blur-3xl" />
        </div>
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 mb-6">
            <Star className="w-3.5 h-3.5 text-yellow-400" />
            <span className="text-white/80 text-xs font-medium">Plataforma Acadêmica de Inovação</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight text-balance mb-6">
            Observatório de{' '}
            <span className="text-cyan-400">Projetos Integradores</span>
          </h1>
          <p className="text-lg sm:text-xl text-white/70 max-w-3xl mx-auto leading-relaxed mb-10">
            Submeta, avalie e apresente projetos acadêmicos ao mercado. Conectamos talento estudantil com empresas parceiras que buscam inovação.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login">
              <Button size="lg" className="bg-white text-blue-900 hover:bg-white/90 font-semibold gap-2 px-8 shadow-lg">
                Acessar Plataforma
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
        <div className="max-w-4xl mx-auto mt-20 grid grid-cols-2 sm:grid-cols-4 gap-4 relative z-10">
          {[
            { value: '500+', label: 'Projetos' },
            { value: '1.200+', label: 'Alunos' },
            { value: '80+', label: 'Professores' },
            { value: '40+', label: 'Empresas' },
          ].map(stat => (
            <div key={stat.label} className="glass rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <div className="text-white/60 text-sm mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Perfis */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Acesso por Perfil</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Cada participante tem uma experiência personalizada dentro da plataforma.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: BookOpen,
                role: 'Aluno',
                color: 'text-blue-600',
                bg: 'bg-blue-50',
                desc: 'Submeta projetos, acompanhe avaliacoes e construa seu portfolio academico.',
                features: ['CRUD de projetos', 'Historico de feedback', 'Mentor IA'],
              },
              {
                icon: Users,
                role: 'Professor',
                color: 'text-emerald-600',
                bg: 'bg-emerald-50',
                desc: 'Filtre turmas, avalie projetos com rubrica detalhada e registre autorias.',
                features: ['Rubrica de avaliação', 'Gestão de turmas', 'Relatorios'],
              },
              {
                icon: Shield,
                role: 'Admin / Coord.',
                color: 'text-amber-600',
                bg: 'bg-amber-50',
                desc: 'Gerencie usuarios, projetos, turmas e gere relatorios completos.',
                features: ['Gestão de usuários', 'Atribuição de turmas', 'Dashboard analitico'],
              },
            ].map(({ icon: Icon, role, color, bg, desc, features }) => (
              <div key={role} className="bg-card rounded-2xl border border-border p-6 card-hover">
                <div className={`w-12 h-12 ${bg} rounded-xl flex items-center justify-center mb-4`}>
                  <Icon className={`w-6 h-6 ${color}`} />
                </div>
                <h3 className="font-bold text-foreground text-lg mb-2">{role}</h3>
                <p className="text-muted-foreground text-sm mb-4 leading-relaxed">{desc}</p>
                <ul className="space-y-1.5">
                  {features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Diferencial: IA Mentor */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="bg-gradient-to-br from-blue-900 to-cyan-900 rounded-3xl p-10 sm:p-14 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-cyan-400" />
                <span className="text-cyan-400 font-semibold text-sm uppercase tracking-wider">Diferencial</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                IA Mentor de Projetos
              </h2>
              <p className="text-white/70 text-lg leading-relaxed max-w-2xl mb-8">
                Um mentor baseado em inteligência artificial analisa automaticamente os projetos submetidos e sugere melhorias em clareza, viabilidade técnica, impacto social e documentação — em tempo real.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { title: 'Análise Automática', desc: 'Avalia título, descrição e tecnologias escolhidas' },
                  { title: 'Sugestões Práticas', desc: 'Recomendações acionáveis para melhorar o projeto' },
                  { title: 'Pontuação Prévia', desc: 'Estima a nota antes da avaliação formal do professor' },
                ].map(item => (
                  <div key={item.title} className="glass rounded-xl p-4">
                    <h4 className="font-semibold text-white mb-1">{item.title}</h4>
                    <p className="text-white/60 text-sm">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-3xl mx-auto text-center">
          <Award className="w-12 h-12 text-primary mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-foreground mb-4">Pronto para começar?</h2>
          <p className="text-muted-foreground text-lg mb-8">
            Acesse a plataforma com suas credenciais fornecidas pelo coordenador do curso.
          </p>
          <Link href="/login">
            <Button size="lg" className="gap-2 px-10">
              Fazer Login <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
              <BookOpen className="w-3 h-3 text-primary-foreground" />
            </div>
            <span className="text-sm font-semibold text-foreground">Observatório PI</span>
          </div>
          <p className="text-muted-foreground text-sm text-center">
            © 2026 Observatório de Projetos Integradores. Todos os direitos reservados.
          </p>
          <div className="flex gap-4">
            <Link href="/privacidade" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
              Privacidade
            </Link>
            <Link href="/termos" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
              Termos
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
