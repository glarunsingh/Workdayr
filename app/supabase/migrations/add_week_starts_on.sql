-- Migration: Add week_starts_on to profiles
-- Run this in Supabase SQL Editor if you already have the profiles table
-- ================================

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS week_starts_on TEXT DEFAULT 'sunday' 
CHECK (week_starts_on IN ('sunday', 'monday'));

-- Update existing profiles to have the default value
UPDATE profiles SET week_starts_on = 'sunday' WHERE week_starts_on IS NULL;
