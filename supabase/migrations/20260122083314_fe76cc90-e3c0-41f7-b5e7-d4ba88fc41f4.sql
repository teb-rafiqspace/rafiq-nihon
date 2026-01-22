-- Add feedback column to chat_messages table
ALTER TABLE public.chat_messages 
ADD COLUMN feedback text CHECK (feedback IN ('positive', 'negative'));

-- Create index for faster user message queries
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_created 
ON public.chat_messages(user_id, created_at DESC);