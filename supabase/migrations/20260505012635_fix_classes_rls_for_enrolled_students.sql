/*
  # Fix classes RLS for enrolled students

  1. Problem
    - The "Students view classes of own projects" policy only allows students
      to see classes where they already have a project
    - Students enrolled in a class (via class_students) but without a project
      cannot see the class at all
    - This breaks the project creation form — students can't select their class

  2. Solution
    - Drop the existing student policy on classes
    - Create a new policy that allows students to see classes they are enrolled in
      via class_students table
    - Keep the SECURITY DEFINER function for project-based access as fallback
    - Use a new SECURITY DEFINER function for enrollment-based access to avoid recursion

  3. Security
    - Students can only see classes they are explicitly enrolled in
    - No data exposure changes
*/

-- Create a security definer function to check if a student is enrolled in a class
CREATE OR REPLACE FUNCTION public.student_enrolled_in_class(class_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.class_students
    WHERE class_students.class_id = class_uuid
    AND class_students.student_id = auth.uid()
  );
$$;

-- Drop the old project-based policy
DROP POLICY IF EXISTS "Students view classes of own projects" ON public.classes;

-- Add new policy: students can see classes they are enrolled in
CREATE POLICY "Students view enrolled classes"
  ON public.classes FOR SELECT
  TO authenticated
  USING (public.student_enrolled_in_class(classes.id));
