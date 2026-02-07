-- Create bookmarks table for all content types
CREATE TABLE public.bookmarks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  content_type TEXT NOT NULL, -- 'vocabulary', 'lesson', 'grammar', 'flashcard', 'chapter'
  content_id TEXT NOT NULL, -- ID of the bookmarked item
  notes TEXT, -- Optional user notes
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add unique constraint to prevent duplicate bookmarks
CREATE UNIQUE INDEX idx_bookmarks_unique ON public.bookmarks (user_id, content_type, content_id);

-- Create index for faster queries
CREATE INDEX idx_bookmarks_user ON public.bookmarks (user_id);
CREATE INDEX idx_bookmarks_content ON public.bookmarks (content_type, content_id);

-- Enable Row Level Security
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own bookmarks" 
ON public.bookmarks 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bookmarks" 
ON public.bookmarks 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bookmarks" 
ON public.bookmarks 
FOR DELETE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own bookmarks" 
ON public.bookmarks 
FOR UPDATE 
USING (auth.uid() = user_id);