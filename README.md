# 🔭 Observatório PI: Academic Integrative Projects Showcase

> A web platform for submitting, evaluating, and showcasing academic Integrative Projects (*Projetos Integradores*), connecting students, professors, and partner companies. Developed as a Capstone Project for the **Systems Analysis and Development Program** at **FATEC**.

[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-13.5-black)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-green)](https://supabase.com/)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-black)](https://vercel.com/)
[![LGPD](https://img.shields.io/badge/Compliance-LGPD%20Ready-blueviolet)](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm)

---

## 📋 Project Overview

**Observatório PI** is a digital ecosystem built to bridge the gap between academic project development and real-world visibility. Students submit their Integrative Projects, professors evaluate them using configurable criteria, and partner companies browse a curated showcase of approved work to discover talent and innovative solutions.

### Features by User Role

| Role | Features |
|------|----------|
| **Student** | Submit projects, track evaluation status, manage team members |
| **Professor** | Evaluate projects by criteria, give feedback, approve or return submissions |
| **Partner Company** | Browse the approved projects showcase, send interest via email |
| **Admin** | Manage users, classes, reports, and the entire platform |

---

## 🔒 LGPD & Data Privacy Compliance (Lei Geral de Proteção de Dados)

Because this application processes **Personal Data** (*dados pessoais*) including academic profiles, project authorship, and institutional affiliations, privacy by design was a core requirement of this project in compliance with Brazilian Federal Law nº 13.709/2018 (LGPD).

### Implemented Privacy Standards:

* **Legal Basis for Processing (Art. 7º):** All personal data collection is strictly bound to the **explicit consent** (*consentimento*) of the user upon account creation, purely for the purposes of academic project submission and evaluation.

* **Data Minimization:** Only strictly necessary information is collected for each user role — students, professors, and admins have separate data scopes with no cross-role data leakage.

* **Row Level Security (RLS):** Enforced at the database level via Supabase — each user can only read and write their own records, regardless of application-layer logic.

* **User Rights Panel (Art. 18):** A dedicated `/privacidade` page allows users to:
  * Access and review their registered data.
  * Correct incomplete or inaccurate information.
  * **Revoke consent** and request permanent deletion of their account and associated data (*Direito ao Esquecimento*).

* **Security (Art. 46):** Authentication is handled by Supabase Auth with secure password hashing. Row Level Security policies prevent unauthorized data access even at the infrastructure level.

---

## 🛠️ Tech Stack

### Frontend
* **Next.js 13.5** — React framework with App Router and Server Components
* **TypeScript 5.2** — Static typing
* **Tailwind CSS 3.3** — Utility-first styling
* **shadcn/ui + Radix UI** — Accessible and customizable components
* **Lucide React** — Icon library
* **React Hook Form + Zod** — Form handling with schema validation
* **Recharts** — Charts and report visualizations

### Backend & Database
* **Supabase** — Backend as a Service
  * **PostgreSQL** — Relational database
  * **Supabase Auth** — Email/password authentication
  * **Row Level Security (RLS)** — Row-level access control
  * **Supabase Storage** — Project cover image storage
  * **Supabase SSR** (`@supabase/ssr`) — Server-side integration with Next.js

### Infrastructure & Deploy
* **Vercel** — Continuous deployment via GitHub
* **GitHub** — Version control

---

## 🗄️ Database Structure (Supabase / PostgreSQL)

| Table | Description |
|-------|-------------|
| `profiles` | Platform users (student, professor, partner, admin) |
| `projects` | Submitted Integrative Projects |
| `classes` | Academic classes/cohorts |
| `class_professors` | Professor ↔ class relationship |
| `class_students` | Student ↔ class relationship |
| `evaluations` | Project evaluations |
| `evaluation_criteria` | Configurable scoring criteria |
| `evaluation_scores` | Per-criterion scores |
| `project_members` | Team members per project |
| `project_comments` | Comments on projects |
| `project_tags` | Project tags |
| `ai_recommendations` | AI-generated recommendations |
| `privacy_consents` | LGPD consent records |

---

## 📊 Core API Endpoints

| Method | Endpoint | Description | LGPD Scope |
|--------|----------|-------------|------------|
| `POST` | `/api/auth/register` | Registers a new user account | Consent collection recorded |
| `POST` | `/api/projects` | Submits a new Integrative Project | Linked to authenticated user |
| `PATCH` | `/api/projects/:id/evaluate` | Professor submits evaluation | Access restricted by role |
| `GET` | `/api/privacy/export` | Downloads a JSON package of all user data | Right to access (Art. 18, II) |
| `DELETE` | `/api/privacy/purge` | Permanently deletes user account and records | Right to erasure (Art. 18, VI) |

---

## ⚙️ Getting Started (Local Development)

### 1. Prerequisites

Ensure you have installed:
* [Git](https://git-scm.com)
* [Node.js](https://nodejs.org/) (v18.0.0 or higher)
* A [Supabase](https://supabase.com/) account and project

### 2. Configuration (`.env.local`)

Create a `.env.local` file in the project root and configure the environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Setup and Execution

```bash
# 1. Clone the repository
git clone https://github.com/allanydias/ObservatorioPI.git
cd ObservatorioPI

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

Access the application at `http://localhost:3000`

---

## 📝 Business Rules

* A project can only be submitted by a **student** with an active class enrollment.
* **Professors** may only evaluate projects belonging to their assigned classes.
* A project is listed in the public showcase only after receiving an **"Approved"** status from evaluation.
* **Partner companies** have read-only access — they cannot interact with projects directly.
* **Admins** have full platform access including user management and reporting.

---

## 🚀 Future Improvements

If we had another semester, we would focus on:

* **AI-Powered Recommendations:** Expand the `ai_recommendations` module to proactively suggest relevant projects to partner companies based on their interest history.
* **Real-Time Notifications:** Implement Supabase Realtime subscriptions so students receive instant alerts when their project status changes.
* **Public API for Institutions:** Expose a read-only public API so other FATEC campuses can index and display projects from their own institutions.
* **Advanced Analytics Dashboard:** Build richer reporting for admins with trend analysis across semesters, evaluation score distributions, and tag-based insights.

---

## 👥 Authors & Project Team

| Name | Role |
|------|------|
| José Luis | Researcher |
| Mariana Oliveira | UX/UI Designer |
| [Allany Dias](https://github.com/allanydias) | Vice-Leader · Frontend Developer |
| Mayara Marina | QA Tester · Communication & Presentation |
| Lorena Torres | Leader · Backend Developer |

**Academic Advisor:** Prof. ___________
**Tech English Professor:** Prof. ___________

---

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.



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
