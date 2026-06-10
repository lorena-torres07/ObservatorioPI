# 🔭 Observatório PI

> Plataforma web para submissão, avaliação e vitrine de Projetos Integradores acadêmicos, conectando alunos, professores e empresas parceiras.

[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-13.5-black)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-green)](https://supabase.com/)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-black)](https://vercel.com/)
[![LGPD](https://img.shields.io/badge/Compliance-LGPD-blueviolet)](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm)

---

## 📋 Visão Geral

O **Observatório PI** é um ecossistema digital desenvolvido como Projeto Integrador do curso de **Análise e Desenvolvimento de Sistemas** da **FATEC**. A plataforma permite que alunos submetam seus projetos, professores os avaliem, e empresas parceiras descubram talentos e projetos de interesse.

### Funcionalidades por perfil

| Perfil | Funcionalidades |
|--------|----------------|
| **Aluno** | Submeter projetos, acompanhar status de avaliação, gerenciar membros da equipe |
| **Professor** | Avaliar projetos por critérios, dar feedback, aprovar ou devolver projetos |
| **Empresa Parceira** | Visualizar vitrine de projetos aprovados, enviar interesse por e-mail |
| **Admin** | Gerenciar usuários, turmas, relatórios e toda a plataforma |

---

## 🛠️ Stack Tecnológica

### Frontend
- **Next.js 13.5** — Framework React com App Router e Server Components
- **TypeScript 5.2** — Tipagem estática
- **Tailwind CSS 3.3** — Estilização utilitária
- **shadcn/ui + Radix UI** — Componentes acessíveis e customizáveis
- **Lucide React** — Ícones
- **React Hook Form + Zod** — Formulários com validação
- **Recharts** — Gráficos e relatórios

### Backend & Banco de Dados
- **Supabase** — Backend as a Service
  - **PostgreSQL** — Banco de dados relacional
  - **Supabase Auth** — Autenticação com email/senha
  - **Row Level Security (RLS)** — Controle de acesso por linha no banco
  - **Supabase Storage** — Armazenamento de imagens de capa dos projetos
  - **Supabase SSR** (`@supabase/ssr`) — Integração server-side com Next.js

### Deploy & Infraestrutura
- **Vercel** — Deploy contínuo via GitHub
- **GitHub** — Controle de versão

---

## 🗄️ Estrutura do Banco de Dados (Supabase)

| Tabela | Descrição |
|--------|-----------|
| `profiles` | Usuários da plataforma (aluno, professor, partner, admin) |
| `projects` | Projetos integradores submetidos |
| `classes` | Turmas acadêmicas |
| `class_professors` | Vínculo professor ↔ turma |
| `class_students` | Vínculo aluno ↔ turma |
| `evaluations` | Avaliações dos projetos |
| `evaluation_criteria` | Critérios de avaliação configuráveis |
| `evaluation_scores` | Notas por critério |
| `project_members` | Membros de cada projeto |
| `project_comments` | Comentários nos projetos |
| `project_tags` | Tags dos projetos |
| `ai_recommendations` | Recomendações geradas por IA |
| `privacy_consents` | Registros de consentimento LGPD |

---

## 🔒 Privacidade e LGPD

A plataforma foi desenvolvida com **privacy by design** em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018):

- **Consentimento explícito** na criação de conta
- **Row Level Security** no Supabase — cada usuário acessa apenas seus próprios dados
- **Painel de privacidade** onde o usuário pode consultar e gerenciar seus dados
- **Minimização de dados** — apenas informações necessárias são coletadas

---

## ⚙️ Rodando Localmente

### Pré-requisitos
- [Node.js](https://nodejs.org/) v18+
- Conta no [Supabase](https://supabase.com/)

### Configuração

1. Clone o repositório:
```bash
git clone https://github.com/allanydias/ObservatorioPI.git
cd ObservatorioPI
```

2. Instale as dependências:
```bash
npm install
```

3. Crie o arquivo `.env.local` na raiz:
```env
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima
```

4. Execute o servidor de desenvolvimento:
```bash
npm run dev
```

Acesse `http://localhost:3000`

---

## 👥 Equipe

| Nome | Função |
|------|--------|
| José Luis | Pesquisador |
| Mariana Oliveira | Designer UX/UI |
| Allany Dias | Vice-Líder · Desenvolvedora Front-end |
| Mayara Marina | QA Tester · Comunicação e Apresentação |
| Lorena Torres | Líder · Desenvolvedora Back-end |

**Orientador(a):** Prof. ___________

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.
