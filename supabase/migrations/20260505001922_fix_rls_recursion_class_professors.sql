/*
  # Fix infinite RLS recursion on class_professors

  1. Problem
    - The "Students view class professors" policy on `class_professors` references `projects`
    - The "Users view accessible projects" policy on `projects` references `class_professors`
    - This creates another infinite recursion loop

  2. Solution
    - Drop the "Students view class professors" policy
    - Reuse the SECURITY DEFINER function `student_owns_project_in_class` to break recursion
    - Students can still see which professors are assigned to classes they have projects in

  3. Security
    - No data exposure changes
*/

-- Drop the problematic policy
DROP POLICY IF EXISTS "Students view class professors" ON public.class_professors;

-- Add new policy using the security definer function (no recursion)
CREATE POLICY "Students view class professors via own projects"
  ON public.class_professors FOR SELECT
  TO authenticated
  USING (public.student_owns_project_in_class(class_professors.class_id));
