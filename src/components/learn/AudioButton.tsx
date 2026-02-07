import { Volume2, VolumeX, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useJapaneseAudio } from '@/hooks/useJapaneseAudio';
import { cn } from '@/lib/utils';

interface AudioButtonProps {
  text: string;
  audioUrl?: string | null;
  slow?: boolean;
  className?: string;
  size?: 'sm' | 'default' | 'lg' | 'icon';
  variant?: 'ghost' | 'outline' | 'default';
  showLabel?: boolean;
  label?: string;
}

export function AudioButton({
  text,
  audioUrl,
  slow = false,
  className,
  size = 'icon',
  variant = 'ghost',
  showLabel = false,
  label,
}: AudioButtonProps) {
  const { speak, playAudioUrl, stop, isPlaying, hasJapaneseVoice } = useJapaneseAudio();
  
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (isPlaying) {
      stop();
      return;
    }
    
    if (audioUrl) {
      playAudioUrl(audioUrl, text);
    } else {
      speak(text, slow);
    }
  };
  
  if (!hasJapaneseVoice && !audioUrl) {
    return (
      <Button
        variant={variant}
        size={size}
        disabled
        className={cn('opacity-50', className)}
        aria-label="Audio tidak tersedia"
      >
        <VolumeX className="h-4 w-4" />
        {showLabel && <span className="ml-2">Audio tidak tersedia</span>}
      </Button>
    );
  }
  
  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      className={cn(
        'transition-all duration-200',
        isPlaying && 'text-primary animate-pulse',
        className
      )}
      aria-label={isPlaying ? 'Berhenti' : (slow ? 'Putar lambat' : 'Putar audio')}
    >
      {isPlaying ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Volume2 className="h-4 w-4" />
      )}
      {showLabel && (
        <span className="ml-2">
          {label || (slow ? 'Lambat' : 'Dengar')}
        </span>
      )}
    </Button>
  );
}

interface AudioPlayButtonProps {
  japaneseText: string;
  audioUrl?: string | null;
  className?: string;
}

/**
 * Compact audio play button for vocabulary cards and lists
 */
export function AudioPlayButton({ japaneseText, audioUrl, className }: AudioPlayButtonProps) {
  return (
    <AudioButton
      text={japaneseText}
      audioUrl={audioUrl}
      size="sm"
      variant="ghost"
      className={cn('h-8 w-8 rounded-full', className)}
    />
  );
}

/**
 * Slow audio button for pronunciation practice
 */
export function SlowAudioButton({ japaneseText, audioUrl, className }: AudioPlayButtonProps) {
  return (
    <AudioButton
      text={japaneseText}
      audioUrl={audioUrl}
      slow
      size="sm"
      variant="outline"
      showLabel
      label="Lambat"
      className={className}
    />
  );
}
