/*
  # Fix Users Table Permissions

  1. Security
    - Enable RLS on users table
    - Create policies for authenticated users to read their own data
    - Create policies for admins to manage all users
    - Ensure proper access control without recursion

  2. Changes
    - Drop existing problematic policies
    - Enable RLS if not already enabled
    - Create simple, non-recursive policies
    - Use auth.uid() for user identification
*/

-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Admins can read all users" ON users;
DROP POLICY IF EXISTS "Admins can update all users" ON users;
DROP POLICY IF EXISTS "users_select_own" ON users;
DROP POLICY IF EXISTS "users_update_own" ON users;
DROP POLICY IF EXISTS "users_insert_own" ON users;
DROP POLICY IF EXISTS "users_admin_select" ON users;
DROP POLICY IF EXISTS "users_admin_update" ON users;

-- Create simple policy for users to read their own data
CREATE POLICY "users_select_own" ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Create simple policy for users to update their own data
CREATE POLICY "users_update_own" ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create simple policy for users to insert their own profile
CREATE POLICY "users_insert_own" ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create policy for service role to have full access (for admin operations)
CREATE POLICY "service_role_access" ON users
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);