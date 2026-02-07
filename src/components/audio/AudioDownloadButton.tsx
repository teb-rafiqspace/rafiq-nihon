import { useState } from 'react';
import { Download, Check, Loader2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useOfflineAudio } from '@/hooks/useOfflineAudio';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface AudioDownloadButtonProps {
  id: string;
  audioUrl: string;
  text: string;
  type?: 'vocabulary' | 'speaking' | 'kana' | 'kanji';
  className?: string;
  showLabel?: boolean;
  size?: 'sm' | 'default' | 'icon';
}

export function AudioDownloadButton({
  id,
  audioUrl,
  text,
  type = 'vocabulary',
  className,
  showLabel = false,
  size = 'icon',
}: AudioDownloadButtonProps) {
  const { downloadAudio, removeAudio, isCached } = useOfflineAudio();
  const [isDownloading, setIsDownloading] = useState(false);
  const [cached, setCached] = useState<boolean | null>(null);

  // Check cache status on mount
  useState(() => {
    isCached(id).then(setCached);
  });

  const handleDownload = async () => {
    if (cached) {
      // Remove from cache
      const success = await removeAudio(id);
      if (success) {
        setCached(false);
        toast.success('Audio dihapus dari cache');
      }
      return;
    }

    setIsDownloading(true);
    const success = await downloadAudio(id, audioUrl, text, type);
    setIsDownloading(false);

    if (success) {
      setCached(true);
      toast.success('Audio berhasil diunduh');
    } else {
      toast.error('Gagal mengunduh audio');
    }
  };

  if (cached === null) {
    return null; // Loading state
  }

  return (
    <Button
      variant={cached ? 'secondary' : 'outline'}
      size={size}
      onClick={handleDownload}
      disabled={isDownloading}
      className={cn(
        'transition-all',
        cached && 'bg-secondary text-secondary-foreground',
        className
      )}
      aria-label={cached ? 'Hapus dari offline' : 'Unduh untuk offline'}
    >
      {isDownloading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : cached ? (
        <>
          <Check className="h-4 w-4" />
          {showLabel && <span className="ml-2">Tersimpan</span>}
        </>
      ) : (
        <>
          <Download className="h-4 w-4" />
          {showLabel && <span className="ml-2">Unduh</span>}
        </>
      )}
    </Button>
  );
}

interface BatchDownloadButtonProps {
  items: Array<{
    id: string;
    audioUrl: string;
    text: string;
    type?: 'vocabulary' | 'speaking' | 'kana' | 'kanji';
  }>;
  className?: string;
  label?: string;
}

export function BatchDownloadButton({
  items,
  className,
  label = 'Unduh Semua',
}: BatchDownloadButtonProps) {
  const { downloadBatch } = useOfflineAudio();
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleDownload = async () => {
    setIsDownloading(true);
    setProgress(0);

    const batchItems = items.map(item => ({
      id: item.id,
      url: item.audioUrl,
      text: item.text,
      type: item.type || 'vocabulary' as const,
    }));

    const result = await downloadBatch(batchItems);
    
    setIsDownloading(false);
    
    if (result.failed === 0) {
      toast.success(`${result.success} audio berhasil diunduh`);
    } else {
      toast.warning(`${result.success} berhasil, ${result.failed} gagal`);
    }
  };

  return (
    <Button
      variant="outline"
      onClick={handleDownload}
      disabled={isDownloading || items.length === 0}
      className={className}
    >
      {isDownloading ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Mengunduh...
        </>
      ) : (
        <>
          <Download className="h-4 w-4 mr-2" />
          {label} ({items.length})
        </>
      )}
    </Button>
  );
}
