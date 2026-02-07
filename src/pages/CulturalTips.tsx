import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ArrowLeft, BookOpen, Bookmark, CheckCircle2, ThumbsUp, ThumbsDown } from 'lucide-react';
import { useCulturalTips } from '@/hooks/useCulturalTips';
import { CulturalTipCard } from '@/components/cultural/CulturalTipCard';
import { Skeleton } from '@/components/ui/skeleton';

const categoryOrder = ['etiquette', 'workplace', 'greetings', 'food', 'customs', 'business', 'daily_life'];

export default function CulturalTips() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const [selectedTip, setSelectedTip] = useState<any>(null);
  
  const { tips, isLoading, stats, categories, getTipStatus, markAsRead, toggleBookmark } = useCulturalTips(selectedCategory);

  const handleOpenTip = (tip: any) => {
    setSelectedTip(tip);
    markAsRead(tip.id);
  };

  const sortedCategories = categories.sort((a, b) => 
    categoryOrder.indexOf(a) - categoryOrder.indexOf(b)
  );

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
              <h1 className="text-lg font-bold">Tips Budaya Jepang</h1>
              <p className="text-xs text-muted-foreground">
                Pahami budaya dan etika Jepang
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <Card>
              <CardContent className="p-3 text-center">
                <BookOpen className="h-5 w-5 mx-auto mb-1 text-secondary" />
                <div className="text-xl font-bold">{stats.total}</div>
                <div className="text-xs text-muted-foreground">Artikel</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <CheckCircle2 className="h-5 w-5 mx-auto mb-1 text-accent" />
                <div className="text-xl font-bold">{stats.read}</div>
                <div className="text-xs text-muted-foreground">Dibaca</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <Bookmark className="h-5 w-5 mx-auto mb-1 text-primary" />
                <div className="text-xl font-bold">{stats.bookmarked}</div>
                <div className="text-xs text-muted-foreground">Disimpan</div>
              </CardContent>
            </Card>
          </div>

          {/* Category Filter */}
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
            <Badge
              variant={selectedCategory === undefined ? 'default' : 'outline'}
              className="cursor-pointer whitespace-nowrap"
              onClick={() => setSelectedCategory(undefined)}
            >
              Semua
            </Badge>
            {sortedCategories.map((cat) => (
              <Badge
                key={cat}
                variant={selectedCategory === cat ? 'default' : 'outline'}
                className="cursor-pointer whitespace-nowrap"
                onClick={() => setSelectedCategory(cat)}
              >
                {cat === 'etiquette' && '🎎 Tata Krama'}
                {cat === 'workplace' && '💼 Tempat Kerja'}
                {cat === 'greetings' && '🙇 Sapaan'}
                {cat === 'food' && '🍱 Makanan'}
                {cat === 'customs' && '🏯 Tradisi'}
                {cat === 'business' && '📊 Bisnis'}
                {cat === 'daily_life' && '🏠 Kehidupan'}
              </Badge>
            ))}
          </div>

          {/* Tips Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-48 rounded-lg" />
              ))}
            </div>
          ) : tips.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-medium mb-2">Belum Ada Tips</h3>
                <p className="text-sm text-muted-foreground">
                  Konten tips budaya akan segera hadir
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {tips.map((tip) => (
                <CulturalTipCard
                  key={tip.id}
                  tip={tip}
                  status={getTipStatus(tip.id)}
                  onSelect={() => handleOpenTip(tip)}
                  onToggleBookmark={() => toggleBookmark(tip.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Tip Detail Dialog */}
        <Dialog open={!!selectedTip} onOpenChange={() => setSelectedTip(null)}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            {selectedTip && (
              <>
                <DialogHeader>
                  <DialogTitle className="font-jp text-xl">{selectedTip.title_jp}</DialogTitle>
                  <p className="text-sm text-muted-foreground">{selectedTip.title_id}</p>
                </DialogHeader>

                <div className="space-y-6">
                  {selectedTip.image_url && (
                    <div className="rounded-lg overflow-hidden">
                      <img 
                        src={selectedTip.image_url} 
                        alt={selectedTip.title_id}
                        className="w-full h-48 object-cover"
                      />
                    </div>
                  )}

                  <div className="prose prose-sm dark:prose-invert">
                    <p>{selectedTip.content_id}</p>
                  </div>

                  {/* Do & Don't */}
                  {(selectedTip.do_list?.length > 0 || selectedTip.dont_list?.length > 0) && (
                    <div className="grid grid-cols-2 gap-4">
                      {selectedTip.do_list?.length > 0 && (
                        <Card className="bg-accent/10 border-accent/20">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm flex items-center gap-2 text-accent">
                              <ThumbsUp className="h-4 w-4" />
                              Lakukan
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <ul className="text-sm space-y-1">
                              {selectedTip.do_list.map((item: string, i: number) => (
                                <li key={i} className="flex items-start gap-2">
                                  <span className="text-accent">•</span>
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>
                      )}
                      
                      {selectedTip.dont_list?.length > 0 && (
                        <Card className="bg-destructive/10 border-destructive/20">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm flex items-center gap-2 text-destructive">
                              <ThumbsDown className="h-4 w-4" />
                              Hindari
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <ul className="text-sm space-y-1">
                              {selectedTip.dont_list.map((item: string, i: number) => (
                                <li key={i} className="flex items-start gap-2">
                                  <span className="text-destructive">•</span>
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  )}

                  {/* Related Phrases */}
                  {selectedTip.related_phrases?.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-3">Frasa Terkait</h4>
                      <div className="space-y-2">
                        {selectedTip.related_phrases.map((phrase: any, i: number) => (
                          <Card key={i}>
                            <CardContent className="p-3">
                              <div className="font-jp text-lg">{phrase.japanese}</div>
                              <div className="text-sm text-muted-foreground font-jp">
                                {phrase.reading}
                              </div>
                              <div className="text-sm mt-1">{phrase.meaning}</div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  <Button 
                    className="w-full"
                    variant="outline"
                    onClick={() => toggleBookmark(selectedTip.id)}
                  >
                    <Bookmark className="h-4 w-4 mr-2" />
                    {getTipStatus(selectedTip.id).bookmarked ? 'Hapus dari Simpan' : 'Simpan'}
                  </Button>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
