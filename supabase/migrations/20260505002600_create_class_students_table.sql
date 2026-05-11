/*
  # Create class_students table

  1. New Tables
    - `class_students`
      - `id` (uuid, primary key)
      - `class_id` (uuid, foreign key to classes)
      - `student_id` (uuid, foreign key to profiles)
      - `created_at` (timestamp)

  2. Purpose
    - Links students to classes so that when creating a project,
      the student's class is known and auto-selected

  3. Security
    - Enable RLS on `class_students`
    - Admins can manage all assignments
    - Professors can view students in their assigned classes
    - Students can view their own enrollments
*/

CREATE TABLE IF NOT EXISTS public.class_students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id uuid NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(class_id, student_id)
);

ALTER TABLE public.class_students ENABLE ROW LEVEL SECURITY;

-- Admins manage class students
CREATE POLICY "Admins manage class students"
  ON public.class_students FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Professors view students in their assigned classes
CREATE POLICY "Professors view students in own classes"
  ON public.class_students FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.class_professors
      WHERE class_professors.professor_id = auth.uid()
      AND class_professors.class_id = class_students.class_id
    )
  );

-- Students view own enrollments
CREATE POLICY "Students view own enrollments"
  ON public.class_students FOR SELECT
  TO authenticated
  USING (student_id = auth.uid());

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_class_students_class_id ON public.class_students(class_id);
CREATE INDEX IF NOT EXISTS idx_class_students_student_id ON public.class_students(student_id);
