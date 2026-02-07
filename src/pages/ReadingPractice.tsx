import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, BookOpen, Trophy, Clock } from 'lucide-react';
import { useReading } from '@/hooks/useReading';
import { ReadingPassageCard } from '@/components/reading/ReadingPassageCard';
import { Skeleton } from '@/components/ui/skeleton';

export default function ReadingPractice() {
  const navigate = useNavigate();
  const [level, setLevel] = useState('N5');
  
  const { passages, isLoading, stats, getPassageStatus, userProgress } = useReading(level);

  const progressPercent = stats.total > 0 
    ? Math.round((stats.completed / stats.total) * 100) 
    : 0;

  const handleSelectPassage = (passageId: string) => {
    navigate(`/reading/${passageId}`);
  };

  return (
    <AppLayout>
      <div className="min-h-screen bg-background pb-20">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b">
          <div className="px-4 py-3 flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-lg font-bold">Latihan Membaca</h1>
              <p className="text-xs text-muted-foreground">
                Tingkatkan kemampuan membaca Jepang
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-6">
          {/* Level Tabs */}
          <Tabs value={level} onValueChange={setLevel}>
            <TabsList className="w-full grid grid-cols-5">
              <TabsTrigger value="N5">N5</TabsTrigger>
              <TabsTrigger value="N4">N4</TabsTrigger>
              <TabsTrigger value="N3">N3</TabsTrigger>
              <TabsTrigger value="N2">N2</TabsTrigger>
              <TabsTrigger value="N1">N1</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-3">
            <Card>
              <CardContent className="p-3 text-center">
                <BookOpen className="h-5 w-5 mx-auto mb-1 text-secondary" />
                <div className="text-xl font-bold">{stats.total}</div>
                <div className="text-xs text-muted-foreground">Bacaan</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <Trophy className="h-5 w-5 mx-auto mb-1 text-accent" />
                <div className="text-xl font-bold">{stats.completed}</div>
                <div className="text-xs text-muted-foreground">Selesai</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <Clock className="h-5 w-5 mx-auto mb-1 text-warning" />
                <div className="text-xl font-bold">{stats.averageScore}%</div>
                <div className="text-xs text-muted-foreground">Rata-rata</div>
              </CardContent>
            </Card>
          </div>

          {/* Progress */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Progress {level}</span>
              <span className="text-sm text-muted-foreground">{progressPercent}%</span>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </div>

          {/* Passages List */}
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-40 rounded-lg" />
              ))}
            </div>
          ) : passages.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-medium mb-2">Belum Ada Bacaan</h3>
                <p className="text-sm text-muted-foreground">
                  Konten bacaan untuk {level} akan segera hadir
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {passages.map((passage) => {
                const progress = userProgress.find(p => p.passage_id === passage.id);
                return (
                  <ReadingPassageCard
                    key={passage.id}
                    passage={passage}
                    status={getPassageStatus(passage.id)}
                    score={progress?.score ?? undefined}
                    onSelect={() => handleSelectPassage(passage.id)}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
