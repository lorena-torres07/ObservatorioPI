/*
  # Add check constraint: is_public only true when approved/featured

  1. Security
    - Adds a CHECK constraint on `projects` table ensuring `is_public` can only be `true`
      when `status` is 'approved' or 'featured'
    - Prevents data inconsistency where a submitted/draft project appears in the public vitrine
  2. Important notes
    - Uses `NOT VALID` then `VALIDATE CONSTRAINT` to avoid full table scan during creation
    - Existing data was already corrected before this migration
*/

ALTER TABLE projects
  ADD CONSTRAINT check_is_public_requires_approval
  CHECK (
    is_public = false OR status IN ('approved', 'featured')
  );
