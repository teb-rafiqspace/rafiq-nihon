import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, BookOpen, CheckCircle2, Circle, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useKanji } from '@/hooks/useKanji';
import { KanjiCard } from '@/components/kanji/KanjiCard';
import { KanjiDetailModal } from '@/components/kanji/KanjiDetailModal';
import { Skeleton } from '@/components/ui/skeleton';

export default function KanjiLearn() {
  const navigate = useNavigate();
  const [level, setLevel] = useState('N5');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedKanji, setSelectedKanji] = useState<any>(null);
  
  const { kanjiList, isLoading, stats, getKanjiStatus, updateProgress } = useKanji(level);

  const filteredKanji = kanjiList.filter(k => 
    k.character.includes(searchQuery) || 
    k.meanings_id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const progressPercent = stats.total > 0 
    ? Math.round((stats.learned / stats.total) * 100) 
    : 0;

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
              <h1 className="text-lg font-bold">Belajar Kanji</h1>
              <p className="text-xs text-muted-foreground">
                Kuasai karakter Kanji JLPT
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

          {/* Stats Card */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-2xl font-bold">{stats.learned}/{stats.total}</div>
                  <div className="text-sm text-muted-foreground">Kanji Dikuasai</div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-warning">{stats.learning}</div>
                  <div className="text-sm text-muted-foreground">Sedang Dipelajari</div>
                </div>
              </div>
              <Progress value={progressPercent} className="h-2" />
              <div className="text-xs text-muted-foreground mt-1 text-right">
                {progressPercent}% selesai
              </div>
            </CardContent>
          </Card>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari kanji atau arti..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <CheckCircle2 className="h-4 w-4 text-accent" />
              <span>Dikuasai</span>
            </div>
            <div className="flex items-center gap-1">
              <Circle className="h-4 w-4 text-warning fill-warning/20" />
              <span>Dipelajari</span>
            </div>
            <div className="flex items-center gap-1">
              <Circle className="h-4 w-4 text-muted-foreground" />
              <span>Belum</span>
            </div>
          </div>

          {/* Kanji Grid */}
          {isLoading ? (
            <div className="grid grid-cols-3 gap-3">
              {Array.from({ length: 12 }).map((_, i) => (
                <Skeleton key={i} className="h-32 rounded-lg" />
              ))}
            </div>
          ) : filteredKanji.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-medium mb-2">Belum Ada Kanji</h3>
                <p className="text-sm text-muted-foreground">
                  {searchQuery 
                    ? 'Tidak ditemukan kanji yang cocok'
                    : `Konten kanji untuk ${level} akan segera hadir`}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {filteredKanji.map((kanji) => (
                <KanjiCard
                  key={kanji.id}
                  kanji={kanji}
                  status={getKanjiStatus(kanji.id)}
                  onSelect={() => setSelectedKanji(kanji)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Detail Modal */}
        <KanjiDetailModal
          kanji={selectedKanji}
          isOpen={!!selectedKanji}
          onClose={() => setSelectedKanji(null)}
          onMarkKnown={() => {
            updateProgress({ kanjiId: selectedKanji.id, correct: true });
            setSelectedKanji(null);
          }}
          onMarkUnknown={() => {
            updateProgress({ kanjiId: selectedKanji.id, correct: false });
            setSelectedKanji(null);
          }}
        />
      </div>
    </AppLayout>
  );
}
