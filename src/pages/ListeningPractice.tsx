import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Headphones, Trophy, Play } from 'lucide-react';
import { useListening } from '@/hooks/useListening';
import { ListeningItemCard } from '@/components/listening/ListeningItemCard';
import { Skeleton } from '@/components/ui/skeleton';

type LangTab = 'japanese' | 'english';

export default function ListeningPractice() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialLang = searchParams.get('lang') === 'english' ? 'english' : 'japanese';
  const [langTab, setLangTab] = useState<LangTab>(initialLang);
  const [level, setLevel] = useState(initialLang === 'english' ? 'ielts' : 'N5');

  const { listeningItems, isLoading, stats, getItemStatus, userProgress } = useListening(level);

  const isEnglish = langTab === 'english';

  const progressPercent = stats.total > 0
    ? Math.round((stats.completed / stats.total) * 100)
    : 0;

  const handleSelectItem = (itemId: string) => {
    navigate(`/listening/${itemId}`);
  };

  const handleLangChange = (lang: LangTab) => {
    setLangTab(lang);
    if (lang === 'english') {
      setLevel('ielts');
    } else {
      setLevel('N5');
    }
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
              <h1 className="text-lg font-bold">{isEnglish ? 'Listening Practice' : 'Latihan Mendengar'}</h1>
              <p className="text-xs text-muted-foreground">
                {isEnglish ? 'Improve your listening skills' : 'Tingkatkan kemampuan choukai'}
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-6">
          {/* Language Tabs */}
          <Tabs value={langTab} onValueChange={(v) => handleLangChange(v as LangTab)}>
            <TabsList className="w-full grid grid-cols-2">
              <TabsTrigger value="japanese">🇯🇵 Jepang</TabsTrigger>
              <TabsTrigger value="english">🇬🇧 Inggris</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Level Tabs */}
          {isEnglish ? (
            <Tabs value={level} onValueChange={setLevel}>
              <TabsList className="w-full grid grid-cols-2">
                <TabsTrigger value="ielts">IELTS</TabsTrigger>
                <TabsTrigger value="toefl">TOEFL</TabsTrigger>
              </TabsList>
            </Tabs>
          ) : (
            <Tabs value={level} onValueChange={setLevel}>
              <TabsList className="w-full grid grid-cols-5">
                <TabsTrigger value="N5">N5</TabsTrigger>
                <TabsTrigger value="N4">N4</TabsTrigger>
                <TabsTrigger value="N3">N3</TabsTrigger>
                <TabsTrigger value="N2">N2</TabsTrigger>
                <TabsTrigger value="N1">N1</TabsTrigger>
              </TabsList>
            </Tabs>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-3">
            <Card>
              <CardContent className="p-3 text-center">
                <Headphones className="h-5 w-5 mx-auto mb-1 text-secondary" />
                <div className="text-xl font-bold">{stats.total}</div>
                <div className="text-xs text-muted-foreground">{isEnglish ? 'Audio' : 'Audio'}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <Trophy className="h-5 w-5 mx-auto mb-1 text-accent" />
                <div className="text-xl font-bold">{stats.completed}</div>
                <div className="text-xs text-muted-foreground">{isEnglish ? 'Done' : 'Selesai'}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <Play className="h-5 w-5 mx-auto mb-1 text-warning" />
                <div className="text-xl font-bold">{stats.totalPlays}</div>
                <div className="text-xs text-muted-foreground">{isEnglish ? 'Plays' : 'Diputar'}</div>
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

          {/* Listening Items List */}
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-40 rounded-lg" />
              ))}
            </div>
          ) : listeningItems.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Headphones className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-medium mb-2">{isEnglish ? 'No Audio Yet' : 'Belum Ada Audio'}</h3>
                <p className="text-sm text-muted-foreground">
                  {isEnglish ? `Listening content for ${level.toUpperCase()} coming soon` : `Konten mendengar untuk ${level} akan segera hadir`}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {listeningItems.map((item) => {
                const progress = userProgress.find(p => p.listening_id === item.id);
                return (
                  <ListeningItemCard
                    key={item.id}
                    item={item}
                    status={getItemStatus(item.id)}
                    score={progress?.score ?? undefined}
                    playCount={progress?.play_count}
                    onSelect={() => handleSelectItem(item.id)}
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
