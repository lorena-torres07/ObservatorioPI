
/*
  # Observatório de Projetos Integradores — Parte 2: Avaliações, LGPD, Tags, IA, Triggers

  Cria: evaluation_criteria, evaluations, evaluation_scores,
        privacy_consents, project_tags, ai_recommendations
  + trigger para auto-criar perfil
  + seed de critérios padrão
*/

-- evaluation_criteria
CREATE TABLE IF NOT EXISTS evaluation_criteria (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  max_score integer NOT NULL DEFAULT 10,
  weight decimal(3,2) NOT NULL DEFAULT 1.0,
  category text DEFAULT 'general',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE evaluation_criteria ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated view criteria"
  ON evaluation_criteria FOR SELECT TO authenticated USING (is_active = true);

CREATE POLICY "Admins manage criteria"
  ON evaluation_criteria FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- evaluations
CREATE TABLE IF NOT EXISTS evaluations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  professor_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  overall_score decimal(4,2) DEFAULT NULL,
  feedback text DEFAULT '',
  strengths text DEFAULT '',
  improvements text DEFAULT '',
  status text DEFAULT 'pending',
  evaluated_at timestamptz DEFAULT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(project_id, professor_id)
);

ALTER TABLE evaluations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Stakeholders view evaluations"
  ON evaluations FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM projects WHERE id = project_id AND owner_id = auth.uid())
    OR professor_id = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Professors insert evaluations"
  ON evaluations FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = professor_id
    AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'professor')
  );

CREATE POLICY "Professors update own evaluations"
  ON evaluations FOR UPDATE TO authenticated
  USING (auth.uid() = professor_id)
  WITH CHECK (auth.uid() = professor_id);

-- evaluation_scores
CREATE TABLE IF NOT EXISTS evaluation_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  evaluation_id uuid NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,
  criteria_id uuid NOT NULL REFERENCES evaluation_criteria(id) ON DELETE CASCADE,
  score decimal(4,2) NOT NULL DEFAULT 0,
  comment text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  UNIQUE(evaluation_id, criteria_id)
);

ALTER TABLE evaluation_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Stakeholders view scores"
  ON evaluation_scores FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM evaluations e
      JOIN projects p ON p.id = e.project_id
      WHERE e.id = evaluation_id
        AND (p.owner_id = auth.uid() OR e.professor_id = auth.uid()
          OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
    )
  );

CREATE POLICY "Professors insert scores"
  ON evaluation_scores FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM evaluations WHERE id = evaluation_id AND professor_id = auth.uid())
  );

-- privacy_consents (LGPD)
CREATE TABLE IF NOT EXISTS privacy_consents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  version text NOT NULL DEFAULT '1.0',
  ip_address text DEFAULT '',
  user_agent text DEFAULT '',
  consented_at timestamptz DEFAULT now(),
  revoked_at timestamptz DEFAULT NULL,
  is_active boolean DEFAULT true
);

ALTER TABLE privacy_consents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own consents"
  ON privacy_consents FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users insert own consent"
  ON privacy_consents FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own consent"
  ON privacy_consents FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- project_tags
CREATE TABLE IF NOT EXISTS project_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  tag text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(project_id, tag)
);

ALTER TABLE project_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone view tags"
  ON project_tags FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Project owners insert tags"
  ON project_tags FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM projects WHERE id = project_id AND owner_id = auth.uid()));

CREATE POLICY "Project owners delete tags"
  ON project_tags FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM projects WHERE id = project_id AND owner_id = auth.uid()));

-- ai_recommendations (DIFERENCIAL: IA Mentor)
CREATE TABLE IF NOT EXISTS ai_recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  type text NOT NULL DEFAULT 'improvement',
  title text NOT NULL DEFAULT '',
  content text NOT NULL DEFAULT '',
  source text DEFAULT 'ai',
  is_applied boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE ai_recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Project owners view recommendations"
  ON ai_recommendations FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM projects WHERE id = project_id AND owner_id = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "System insert recommendations"
  ON ai_recommendations FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM projects WHERE id = project_id AND owner_id = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Índices adicionais
CREATE INDEX IF NOT EXISTS idx_evaluations_project ON evaluations(project_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_professor ON evaluations(professor_id);
CREATE INDEX IF NOT EXISTS idx_project_tags_project ON project_tags(project_id);

-- Seed: critérios de avaliação
INSERT INTO evaluation_criteria (name, description, max_score, weight, category) VALUES
  ('Inovação e Criatividade', 'O projeto apresenta soluções inovadoras para o problema abordado.', 10, 1.5, 'concept'),
  ('Viabilidade Técnica', 'Demonstra viabilidade técnica e uso adequado das tecnologias.', 10, 1.5, 'technical'),
  ('Impacto Social', 'Gera impacto positivo ou soluciona um problema real.', 10, 1.0, 'impact'),
  ('Qualidade da Documentação', 'Documentação clara, completa e bem estruturada.', 10, 1.0, 'documentation'),
  ('Apresentação Visual', 'Interface, design e UX adequados e bem executados.', 10, 1.0, 'design'),
  ('Trabalho em Equipe', 'Evidências de colaboração e divisão de responsabilidades.', 10, 0.5, 'teamwork')
ON CONFLICT DO NOTHING;

-- Trigger: auto-criar perfil ao registrar
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.email, ''),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'student')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
