import { Bookmark, BookmarkCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIsBookmarked, useToggleBookmark, BookmarkContentType } from '@/hooks/useBookmarks';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';

interface BookmarkButtonProps {
  contentType: BookmarkContentType;
  contentId: string;
  className?: string;
  size?: 'sm' | 'default' | 'lg' | 'icon';
  variant?: 'ghost' | 'outline' | 'default';
  showLabel?: boolean;
}

export function BookmarkButton({
  contentType,
  contentId,
  className,
  size = 'icon',
  variant = 'ghost',
  showLabel = false,
}: BookmarkButtonProps) {
  const { user } = useAuth();
  const { data: isBookmarked, isLoading } = useIsBookmarked(contentType, contentId);
  const toggleBookmark = useToggleBookmark();
  
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (!user) {
      toast.error('Silakan login untuk menyimpan bookmark');
      return;
    }
    
    toggleBookmark.mutate({ contentType, contentId });
  };
  
  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      disabled={isLoading || toggleBookmark.isPending}
      className={cn(
        'transition-all duration-200',
        isBookmarked && 'text-yellow-500 hover:text-yellow-600',
        className
      )}
      aria-label={isBookmarked ? 'Hapus bookmark' : 'Tambah bookmark'}
    >
      {isBookmarked ? (
        <BookmarkCheck className="h-5 w-5 fill-current" />
      ) : (
        <Bookmark className="h-5 w-5" />
      )}
      {showLabel && (
        <span className="ml-2">
          {isBookmarked ? 'Tersimpan' : 'Simpan'}
        </span>
      )}
    </Button>
  );
}
