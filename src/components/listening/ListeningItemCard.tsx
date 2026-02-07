import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Headphones, Clock, Users, CheckCircle2, Lock, Play } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ListeningItemCardProps {
  item: {
    id: string;
    title_jp: string;
    title_id: string;
    category: string;
    difficulty: number;
    duration_seconds: number;
    speakers: number;
    is_premium: boolean;
  };
  status: string;
  score?: number;
  playCount?: number;
  onSelect: () => void;
  isPremiumUser?: boolean;
}

export function ListeningItemCard({ 
  item, 
  status, 
  score,
  playCount = 0,
  onSelect,
  isPremiumUser = true
}: ListeningItemCardProps) {
  const isLocked = item.is_premium && !isPremiumUser;

  const difficultyLabel = {
    1: 'Mudah',
    2: 'Sedang',
    3: 'Sulit'
  }[item.difficulty] || 'Mudah';

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card 
      className={cn(
        "cursor-pointer transition-all duration-300 hover:shadow-lg",
        status === 'completed' && "ring-2 ring-accent/30",
        isLocked && "opacity-60"
      )}
      onClick={isLocked ? undefined : onSelect}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-secondary/10 flex items-center justify-center">
              <Headphones className="h-6 w-6 text-secondary" />
            </div>
            <div>
              <h3 className="font-jp text-lg">{item.title_jp}</h3>
              <p className="text-sm text-muted-foreground">{item.title_id}</p>
            </div>
          </div>
          
          {status === 'completed' ? (
            <CheckCircle2 className="h-5 w-5 text-accent" />
          ) : isLocked ? (
            <Lock className="h-5 w-5 text-muted-foreground" />
          ) : null}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="flex items-center gap-2 flex-wrap mb-3">
          <Badge variant="outline">
            {difficultyLabel}
          </Badge>
          <Badge variant="secondary">
            {item.category}
          </Badge>
        </div>

        <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{formatDuration(item.duration_seconds)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{item.speakers} pembicara</span>
            </div>
          </div>

          {playCount > 0 && (
            <div className="flex items-center gap-1 text-xs">
              <Play className="h-3 w-3" />
              <span>{playCount}x diputar</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button 
            className="flex-1" 
            variant={status === 'completed' ? 'outline' : 'default'}
            disabled={isLocked}
          >
            {isLocked ? 'Premium' : status === 'completed' ? 'Dengar Ulang' : 'Mulai Dengarkan'}
          </Button>
          
          {score !== undefined && (
            <Badge variant="outline" className="bg-accent/10 text-accent h-9 px-3">
              {score}%
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
