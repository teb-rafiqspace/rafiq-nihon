-- Create time vocabulary table for hours, minutes, days, periods
CREATE TABLE public.time_vocabulary (
  id text PRIMARY KEY,
  type text NOT NULL, -- 'hour', 'minute', 'day', 'period'
  japanese text NOT NULL,
  reading text NOT NULL,
  meaning_id text NOT NULL,
  is_exception boolean DEFAULT false,
  exception_note text,
  order_index int NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.time_vocabulary ENABLE ROW LEVEL SECURITY;

-- Anyone can view time vocabulary (public learning content)
CREATE POLICY "Anyone can view time vocabulary"
ON public.time_vocabulary
FOR SELECT
USING (true);