
/*
  # Observatório de Projetos Integradores — Parte 1: Tipos e Tabelas Base

  Cria enums, profiles, classes, projects, project_members.
*/

CREATE TYPE user_role AS ENUM ('admin', 'student', 'professor', 'partner');
CREATE TYPE project_status AS ENUM ('draft', 'submitted', 'under_review', 'approved', 'featured', 'rejected');
CREATE TYPE semester AS ENUM ('1', '2');

-- profiles
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  role user_role NOT NULL DEFAULT 'student',
  avatar_url text DEFAULT NULL,
  bio text DEFAULT '',
  institution text DEFAULT 'FATEC',
  course text DEFAULT '',
  linkedin_url text DEFAULT '',
  github_url text DEFAULT '',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users view profiles"
  ON profiles FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users update own profile"
  ON profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY "Allow profile creation on signup"
  ON profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

-- classes
CREATE TABLE IF NOT EXISTS classes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  course text NOT NULL,
  year integer NOT NULL,
  semester semester NOT NULL,
  professor_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  description text DEFAULT '',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE classes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users view classes"
  ON classes FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins professors insert classes"
  ON classes FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'professor'))
  );

CREATE POLICY "Admins professors update classes"
  ON classes FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'professor')))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'professor')));

-- projects
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  short_description text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  status project_status NOT NULL DEFAULT 'draft',
  class_id uuid REFERENCES classes(id) ON DELETE SET NULL,
  owner_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  cover_image_url text DEFAULT NULL,
  repository_url text DEFAULT '',
  demo_url text DEFAULT '',
  video_url text DEFAULT '',
  technologies text[] DEFAULT '{}',
  semester_year text DEFAULT '',
  is_public boolean DEFAULT false,
  view_count integer DEFAULT 0,
  featured_at timestamptz DEFAULT NULL,
  submitted_at timestamptz DEFAULT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- project_members
CREATE TABLE IF NOT EXISTS project_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role text DEFAULT 'member',
  created_at timestamptz DEFAULT now(),
  UNIQUE(project_id, user_id)
);

ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users view project members"
  ON project_members FOR SELECT TO authenticated USING (true);

CREATE POLICY "Project owners manage members"
  ON project_members FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM projects WHERE id = project_id AND owner_id = auth.uid())
  );

CREATE POLICY "Project owners delete members"
  ON project_members FOR DELETE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM projects WHERE id = project_id AND owner_id = auth.uid())
  );

-- Now add projects policies (project_members table exists now)
CREATE POLICY "Anon view public projects"
  ON projects FOR SELECT TO anon
  USING (is_public = true AND status IN ('approved', 'featured'));

CREATE POLICY "Auth users view projects"
  ON projects FOR SELECT TO authenticated
  USING (
    (is_public = true AND status IN ('approved', 'featured'))
    OR owner_id = auth.uid()
    OR EXISTS (SELECT 1 FROM project_members WHERE project_id = id AND user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'professor', 'partner'))
  );

CREATE POLICY "Students insert own projects"
  ON projects FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = owner_id
    AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'student')
  );

CREATE POLICY "Students update own projects"
  ON projects FOR UPDATE TO authenticated
  USING (auth.uid() = owner_id AND status IN ('draft', 'submitted', 'rejected'))
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Admins update any project"
  ON projects FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Students delete own draft projects"
  ON projects FOR DELETE TO authenticated
  USING (auth.uid() = owner_id AND status = 'draft');

CREATE POLICY "Admins delete any project"
  ON projects FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE INDEX IF NOT EXISTS idx_projects_owner ON projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_class ON projects(class_id);
CREATE INDEX IF NOT EXISTS idx_project_members_project ON project_members(project_id);
