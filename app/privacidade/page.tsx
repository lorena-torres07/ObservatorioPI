import Link from 'next/link';
import { ArrowLeft, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-12 sm:py-16">
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2 mb-6">
              <ArrowLeft className="w-4 h-4" /> Voltar
            </Button>
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">Política de Privacidade</h1>
          </div>
          <p className="text-muted-foreground">Última atualização: 30 de abril de 2026 — Versão 1.0</p>
        </div>

        <div className="prose prose-sm max-w-none space-y-8 text-foreground">
          <section className="bg-card rounded-2xl border border-border p-6 space-y-3">
            <h2 className="text-lg font-semibold">1. Introdução e Base Legal (LGPD)</h2>
            <p className="text-muted-foreground leading-relaxed">
              Esta Política de Privacidade descreve como o <strong>Observatório de Projetos Integradores</strong> coleta, utiliza, armazena e protege seus dados pessoais, em conformidade com a Lei Geral de Proteção de Dados Pessoais (LGPD — Lei n.º 13.709/2018).
            </p>
            <p className="text-muted-foreground leading-relaxed">
              A base legal para o tratamento de dados é o <strong>legítimo interesse acadêmico</strong> e o <strong>consentimento explícito</strong> fornecido no momento do cadastro.
            </p>
          </section>

          <section className="bg-card rounded-2xl border border-border p-6 space-y-3">
            <h2 className="text-lg font-semibold">2. Dados Coletados</h2>
            <ul className="space-y-2 text-muted-foreground">
              {[
                'Nome completo e endereço de e-mail institucional',
                'Informações de perfil acadêmico (curso, turma, instituição)',
                'Dados dos projetos submetidos (descrições, links, tecnologias)',
                'Registros de acesso e autenticação',
                'Endereço IP e dados de navegação para fins de segurança',
              ].map(item => (
                <li key={item} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section className="bg-card rounded-2xl border border-border p-6 space-y-3">
            <h2 className="text-lg font-semibold">3. Finalidade do Tratamento</h2>
            <p className="text-muted-foreground leading-relaxed">
              Os dados são utilizados exclusivamente para:
            </p>
            <ul className="space-y-2 text-muted-foreground">
              {[
                'Autenticação e controle de acesso à plataforma',
                'Gestão e avaliação de projetos acadêmicos',
                'Geração de relatórios institucionais',
                'Exibicao para professores das turmas atribuidas (conforme organizacao academica)',
                'Comunicações sobre o status dos projetos',
              ].map(item => (
                <li key={item} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section className="bg-card rounded-2xl border border-border p-6 space-y-3">
            <h2 className="text-lg font-semibold">4. Seus Direitos (LGPD, Art. 18)</h2>
            <p className="text-muted-foreground leading-relaxed">Como titular dos dados, você tem direito a:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { title: 'Acesso', desc: 'Consultar os dados que possuímos sobre você' },
                { title: 'Correção', desc: 'Solicitar a atualização de dados incorretos' },
                { title: 'Exclusão', desc: 'Solicitar a remoção dos seus dados' },
                { title: 'Portabilidade', desc: 'Receber seus dados em formato estruturado' },
                { title: 'Revogação', desc: 'Revogar o consentimento a qualquer momento' },
                { title: 'Oposição', desc: 'Opor-se ao tratamento em determinados casos' },
              ].map(right => (
                <div key={right.title} className="bg-muted/50 rounded-xl p-3">
                  <p className="font-medium text-sm text-foreground">{right.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{right.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-card rounded-2xl border border-border p-6 space-y-3">
            <h2 className="text-lg font-semibold">5. Retenção e Segurança</h2>
            <p className="text-muted-foreground leading-relaxed">
              Os dados são armazenados de forma segura utilizando infraestrutura Supabase com criptografia em trânsito (TLS) e em repouso. Os dados são retidos durante o período de atividade acadêmica e por até 5 anos após a conclusão do curso, conforme regulamentação institucional.
            </p>
          </section>

          <section className="bg-card rounded-2xl border border-border p-6 space-y-3">
            <h2 className="text-lg font-semibold">6. Contato — Encarregado de Dados (DPO)</h2>
            <p className="text-muted-foreground leading-relaxed">
              Para exercer seus direitos ou esclarecer dúvidas sobre o tratamento de dados, entre em contato com a coordenação do curso ou pelo e-mail institucional da plataforma.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
