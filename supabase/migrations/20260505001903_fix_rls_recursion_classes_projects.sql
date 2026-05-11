/*
  # Fix infinite RLS recursion between classes and projects

  1. Problem
    - The "Students view own project classes" policy on `classes` references `projects`
    - The "Users view accessible projects" policy on `projects` references `class_professors`
    - When Supabase evaluates policies, it can enter an infinite loop between these tables

  2. Solution
    - Drop the "Students view own project classes" policy from `classes`
    - Create a SECURITY DEFINER function to check student project ownership
    - This breaks the recursion because the function runs with elevated privileges

  3. Security
    - No data exposure changes — students still only see classes their projects belong to
*/

-- Create a security definer function to check if a student owns a project in a class
CREATE OR REPLACE FUNCTION public.student_owns_project_in_class(class_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.class_id = class_uuid
    AND projects.owner_id = auth.uid()
  );
$$;

-- Drop the problematic policy
DROP POLICY IF EXISTS "Students view own project classes" ON public.classes;

-- Add new policy using the function (no recursion)
CREATE POLICY "Students view classes of own projects"
  ON public.classes FOR SELECT
  TO authenticated
  USING (public.student_owns_project_in_class(classes.id));
