-- Drop old constraint and add updated one with jlpt_n2
ALTER TABLE public.chapters DROP CONSTRAINT chapters_track_check;
ALTER TABLE public.chapters ADD CONSTRAINT chapters_track_check CHECK (track = ANY (ARRAY['kemnaker'::text, 'jlpt_n5'::text, 'jlpt_n4'::text, 'jlpt_n3'::text, 'jlpt_n2'::text]));