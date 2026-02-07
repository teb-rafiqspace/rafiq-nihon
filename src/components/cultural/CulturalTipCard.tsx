import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bookmark, BookOpen, CheckCircle2, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CulturalTipCardProps {
  tip: {
    id: string;
    title_jp: string;
    title_id: string;
    category: string;
    image_url: string | null;
    is_premium: boolean;
  };
  status: { read: boolean; bookmarked: boolean };
  onSelect: () => void;
  onToggleBookmark: () => void;
  isPremiumUser?: boolean;
}

const categoryIcons: Record<string, string> = {
  etiquette: '🎎',
  workplace: '💼',
  food: '🍱',
  greetings: '🙇',
  customs: '🏯',
  business: '📊',
  daily_life: '🏠'
};

const categoryLabels: Record<string, string> = {
  etiquette: 'Tata Krama',
  workplace: 'Tempat Kerja',
  food: 'Makanan',
  greetings: 'Salam & Sapaan',
  customs: 'Tradisi',
  business: 'Bisnis',
  daily_life: 'Kehidupan Sehari-hari'
};

export function CulturalTipCard({ 
  tip, 
  status, 
  onSelect,
  onToggleBookmark,
  isPremiumUser = true
}: CulturalTipCardProps) {
  const isLocked = tip.is_premium && !isPremiumUser;

  return (
    <Card 
      className={cn(
        "cursor-pointer transition-all duration-300 hover:shadow-lg overflow-hidden",
        status.read && "ring-2 ring-accent/20",
        isLocked && "opacity-60"
      )}
      onClick={isLocked ? undefined : onSelect}
    >
      {tip.image_url && (
        <div className="h-32 bg-muted overflow-hidden">
          <img 
            src={tip.image_url} 
            alt={tip.title_id}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">{categoryIcons[tip.category] || '📚'}</span>
              <Badge variant="secondary" className="text-xs">
                {categoryLabels[tip.category] || tip.category}
              </Badge>
            </div>
            <h3 className="font-jp text-lg">{tip.title_jp}</h3>
            <p className="text-sm text-muted-foreground">{tip.title_id}</p>
          </div>
          
          <div className="flex items-center gap-1">
            {status.read && (
              <CheckCircle2 className="h-4 w-4 text-accent" />
            )}
            {isLocked && (
              <Lock className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="flex items-center gap-2">
          <Button 
            className="flex-1" 
            variant={status.read ? 'outline' : 'default'}
            disabled={isLocked}
            size="sm"
          >
            <BookOpen className="h-4 w-4 mr-2" />
            {isLocked ? 'Premium' : status.read ? 'Baca Ulang' : 'Baca'}
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-9 w-9 p-0",
              status.bookmarked && "text-primary"
            )}
            onClick={(e) => {
              e.stopPropagation();
              onToggleBookmark();
            }}
          >
            <Bookmark className={cn("h-4 w-4", status.bookmarked && "fill-current")} />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
