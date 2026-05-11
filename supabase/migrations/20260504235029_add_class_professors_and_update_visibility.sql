/*
  # Add class_professors junction table and update project visibility

  1. New Tables
    - `class_professors`
      - `id` (uuid, primary key)
      - `class_id` (uuid, foreign key to classes)
      - `professor_id` (uuid, foreign key to profiles)
      - `assigned_at` (timestamp)
      - Unique constraint on (class_id, professor_id) to prevent duplicates

  2. Security
    - Enable RLS on `class_professors` table
    - Admin can manage class-professor assignments (SELECT, INSERT, DELETE)
    - Professors can view their own assignments
    - Students can view which professors are assigned to their classes

  3. RLS Policy Updates for `projects`
    - Professors can view projects that belong to their assigned classes
    - Remove the old policy that allowed professors to see all projects

  4. RLS Policy Updates for `classes`
    - Professors can view classes they are assigned to
    - Remove the old policy that allowed professors to see all classes

  5. Important notes
    - The `is_public` column on projects is no longer used for visibility
    - Projects are now visible to professors only through class assignment
    - The `partner` role no longer has access to projects
*/

-- Create class_professors junction table
CREATE TABLE IF NOT EXISTS class_professors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id uuid NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  professor_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  assigned_at timestamptz DEFAULT now(),
  UNIQUE(class_id, professor_id)
);

-- Enable RLS
ALTER TABLE class_professors ENABLE ROW LEVEL SECURITY;

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_class_professors_professor ON class_professors(professor_id);
CREATE INDEX IF NOT EXISTS idx_class_professors_class ON class_professors(class_id);

-- Policies for class_professors
CREATE POLICY "Admins manage class professors"
  ON class_professors FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

CREATE POLICY "Professors view own assignments"
  ON class_professors FOR SELECT
  TO authenticated
  USING (professor_id = auth.uid());

CREATE POLICY "Students view class professors"
  ON class_professors FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.class_id = class_professors.class_id
      AND projects.owner_id = auth.uid()
    )
  );

-- Drop old professor project visibility policy
DROP POLICY IF EXISTS "Auth users view projects" ON projects;

-- Create new project SELECT policy
CREATE POLICY "Users view accessible projects"
  ON projects FOR SELECT
  TO authenticated
  USING (
    -- Owner can always see their own projects
    owner_id = auth.uid()
    -- Admin can see all projects
    OR EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
    -- Professor can see projects from their assigned classes
    OR EXISTS (
      SELECT 1 FROM class_professors
      WHERE class_professors.professor_id = auth.uid()
      AND class_professors.class_id = projects.class_id
    )
  );

-- Drop old anon policy (no more public access)
DROP POLICY IF EXISTS "Anon view public projects" ON projects;

-- Drop old class visibility policies and create new ones
-- First check what policies exist on classes
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'classes' AND schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON classes', pol.policyname);
  END LOOP;
END $$;

-- New class policies
CREATE POLICY "Admins manage classes"
  ON classes FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

CREATE POLICY "Professors view assigned classes"
  ON classes FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM class_professors
      WHERE class_professors.professor_id = auth.uid()
      AND class_professors.class_id = classes.id
    )
  );

CREATE POLICY "Students view own project classes"
  ON classes FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.class_id = classes.id
      AND projects.owner_id = auth.uid()
    )
  );
