/*
  # Add performance indexes

  1. Purpose
    - Add indexes for frequently queried columns to speed up lookups
    - These indexes reduce query time for common access patterns

  2. Indexes added
    - profiles.role (filtering by role)
    - profiles.is_active (filtering active users)
    - classes.is_active (filtering active classes)
    - projects.owner_id (user's projects)
    - projects.class_id (projects by class)
    - projects.status (filtering by status)
*/

CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_is_active ON public.profiles(is_active);
CREATE INDEX IF NOT EXISTS idx_classes_is_active ON public.classes(is_active);
CREATE INDEX IF NOT EXISTS idx_projects_owner_id ON public.projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_projects_class_id ON public.projects(class_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
