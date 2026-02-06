-- Drop the old check constraint
ALTER TABLE chapters DROP CONSTRAINT chapters_track_check;

-- Add new check constraint with N4 and N3
ALTER TABLE chapters ADD CONSTRAINT chapters_track_check 
CHECK (track = ANY (ARRAY['kemnaker'::text, 'jlpt_n5'::text, 'jlpt_n4'::text, 'jlpt_n3'::text]));