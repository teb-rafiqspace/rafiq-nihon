import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, Clock, CheckCircle2, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReadingPassageCardProps {
  passage: {
    id: string;
    title_jp: string;
    title_id: string;
    category: string;
    difficulty: number;
    word_count: number;
    estimated_minutes: number;
    is_premium: boolean;
  };
  status: string;
  score?: number;
  onSelect: () => void;
  isPremiumUser?: boolean;
}

export function ReadingPassageCard({ 
  passage, 
  status, 
  score,
  onSelect,
  isPremiumUser = true
}: ReadingPassageCardProps) {
  const isLocked = passage.is_premium && !isPremiumUser;

  const difficultyLabel = {
    1: 'Mudah',
    2: 'Sedang',
    3: 'Sulit'
  }[passage.difficulty] || 'Mudah';

  const difficultyColor = {
    1: 'bg-accent/10 text-accent',
    2: 'bg-warning/10 text-warning',
    3: 'bg-destructive/10 text-destructive'
  }[passage.difficulty] || 'bg-accent/10 text-accent';

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
          <div className="flex-1">
            <h3 className="font-jp text-lg mb-1">{passage.title_jp}</h3>
            <p className="text-sm text-muted-foreground">{passage.title_id}</p>
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
          <Badge variant="outline" className={difficultyColor}>
            {difficultyLabel}
          </Badge>
          <Badge variant="secondary">
            {passage.category}
          </Badge>
        </div>

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <BookOpen className="h-4 w-4" />
              <span>{passage.word_count} kata</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{passage.estimated_minutes} menit</span>
            </div>
          </div>

          {score !== undefined && (
            <Badge variant="outline" className="bg-accent/10 text-accent">
              {score}%
            </Badge>
          )}
        </div>

        <Button 
          className="w-full mt-4" 
          variant={status === 'completed' ? 'outline' : 'default'}
          disabled={isLocked}
        >
          {isLocked ? 'Premium' : status === 'completed' ? 'Baca Ulang' : 'Mulai Baca'}
        </Button>
      </CardContent>
    </Card>
  );
}
