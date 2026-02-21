import { motion } from 'framer-motion';
import { Bot, ThumbsUp, ThumbsDown, Volume2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import type { ChatMessage as ChatMessageType } from '@/hooks/useRafiqChat';
import { useJapaneseAudio } from '@/hooks/useJapaneseAudio';

interface ChatMessageProps {
  message: ChatMessageType;
  onFeedback?: (messageId: string, feedback: 'positive' | 'negative') => void;
}

// Extract Japanese text from mixed content
function extractJapaneseText(text: string): string {
  // Match Japanese character ranges
  const jpMatches = text.match(/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF\u3000-\u303F、。！？]+/g);
  return jpMatches ? jpMatches.join(' ') : '';
}

export function ChatMessage({ message, onFeedback }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const { speak, isPlaying } = useJapaneseAudio();
  const hasJapanese = !isUser && /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]/.test(message.content);

  const handlePlayTTS = () => {
    const japaneseText = extractJapaneseText(message.content);
    if (japaneseText) {
      speak(japaneseText);
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('flex mb-4', isUser ? 'justify-end' : 'justify-start')}
    >
      {!isUser && (
        <div className="w-8 h-8 bg-gradient-xp rounded-full flex items-center justify-center mr-2 flex-shrink-0 mt-1">
          <Bot className="h-4 w-4 text-white" />
        </div>
      )}
      
      <div className="flex flex-col max-w-[80%]">
        <div
          className={cn(
            'rounded-2xl px-4 py-3',
            isUser
              ? 'bg-[#1565C0] text-white rounded-br-md'
              : 'bg-card shadow-card rounded-bl-md'
          )}
        >
          <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
        </div>
        
        <div className={cn(
          'flex items-center gap-2 mt-1 px-1',
          isUser ? 'justify-end' : 'justify-start'
        )}>
          <span className="text-[10px] text-muted-foreground">
            {format(message.timestamp, 'HH:mm', { locale: id })}
          </span>
          
          {hasJapanese && (
            <button
              onClick={handlePlayTTS}
              disabled={isPlaying}
              className="p-1 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
              title="Putar audio Jepang"
            >
              {isPlaying ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Volume2 className="h-3 w-3" />
              )}
            </button>
          )}

          {!isUser && onFeedback && !message.id.startsWith('temp') && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => onFeedback(message.id, 'positive')}
                className={cn(
                  'p-1 rounded-full transition-colors',
                  message.feedback === 'positive'
                    ? 'text-success bg-success/10'
                    : 'text-muted-foreground hover:text-success hover:bg-success/10'
                )}
                disabled={!!message.feedback}
              >
                <ThumbsUp className="h-3 w-3" />
              </button>
              <button
                onClick={() => onFeedback(message.id, 'negative')}
                className={cn(
                  'p-1 rounded-full transition-colors',
                  message.feedback === 'negative'
                    ? 'text-destructive bg-destructive/10'
                    : 'text-muted-foreground hover:text-destructive hover:bg-destructive/10'
                )}
                disabled={!!message.feedback}
              >
                <ThumbsDown className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
