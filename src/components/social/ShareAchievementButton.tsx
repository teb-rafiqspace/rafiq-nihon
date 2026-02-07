import { useState } from 'react';
import { Share2, Twitter, MessageCircle, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

interface ShareAchievementButtonProps {
  badgeName: string;
  badgeDescription: string;
  className?: string;
}

export function ShareAchievementButton({
  badgeName,
  badgeDescription,
  className,
}: ShareAchievementButtonProps) {
  const [copied, setCopied] = useState(false);

  const shareText = `🏆 Saya baru saja mendapatkan badge "${badgeName}" di Rafiq Nihon! ${badgeDescription} #BelajarJepang #RafiqNihon`;
  const shareUrl = typeof window !== 'undefined' ? window.location.origin : 'https://rafiq-nihon.lovable.app';

  const shareToTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank', 'width=550,height=420');
  };

  const shareToWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(shareText + '\n\n' + shareUrl)}`;
    window.open(url, '_blank');
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareText + '\n\n' + shareUrl);
      setCopied(true);
      toast.success('Teks berhasil disalin!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Gagal menyalin teks');
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Badge: ${badgeName}`,
          text: shareText,
          url: shareUrl,
        });
      } catch (error) {
        // User cancelled or error
      }
    }
  };

  // Use native share if available on mobile
  if (typeof navigator !== 'undefined' && navigator.share) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={handleNativeShare}
        className={className}
      >
        <Share2 className="h-4 w-4 mr-1" />
        Bagikan
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className={className}>
          <Share2 className="h-4 w-4 mr-1" />
          Bagikan
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={shareToTwitter}>
          <Twitter className="h-4 w-4 mr-2" />
          Twitter / X
        </DropdownMenuItem>
        <DropdownMenuItem onClick={shareToWhatsApp}>
          <MessageCircle className="h-4 w-4 mr-2" />
          WhatsApp
        </DropdownMenuItem>
        <DropdownMenuItem onClick={copyToClipboard}>
          {copied ? (
            <Check className="h-4 w-4 mr-2 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <Copy className="h-4 w-4 mr-2" />
          )}
          {copied ? 'Disalin!' : 'Salin Teks'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
