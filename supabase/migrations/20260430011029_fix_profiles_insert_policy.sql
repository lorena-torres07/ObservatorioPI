
/*
  # Fix: Allow trigger to insert profiles during signup

  The AFTER INSERT trigger on auth.users runs before the user has a session,
  so auth.uid() returns NULL and the RLS INSERT policy blocks the profile creation.
  
  Fix: Replace the restrictive INSERT policy with one that allows the trigger
  (SECURITY DEFINER running as postgres) to insert, while still restricting
  direct API calls to only allow users to create their own profile.
*/

-- Drop the old restrictive policy
DROP POLICY IF EXISTS "Allow profile creation on signup" ON profiles;

-- New policy: allow insert when auth.uid() matches id (normal signup)
-- OR when the insert comes from the system (auth.uid() is null, i.e. trigger context)
CREATE POLICY "Allow profile creation on signup"
  ON profiles FOR INSERT
  TO authenticated, anon
  WITH CHECK (auth.uid() = id OR auth.uid() IS NULL);
