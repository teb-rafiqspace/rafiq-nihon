import { useState, useEffect } from 'react';
import { 
  Download, 
  Trash2, 
  HardDrive, 
  Wifi, 
  WifiOff,
  Loader2,
  CheckCircle2,
  AlertCircle,
  FolderOpen,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useOfflineAudio } from '@/hooks/useOfflineAudio';
import { usePWA } from '@/hooks/usePWA';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface OfflineAudioManagerProps {
  className?: string;
}

export function OfflineAudioManager({ className }: OfflineAudioManagerProps) {
  const { 
    isReady, 
    cachedCount, 
    totalSize, 
    downloads,
    clearCache, 
    getCachedByType,
    removeAudio,
    formatSize,
  } = useOfflineAudio();
  const { isOnline } = usePWA();
  
  const [activeTab, setActiveTab] = useState<string>('vocabulary');
  const [cachedItems, setCachedItems] = useState<Record<string, any[]>>({
    vocabulary: [],
    speaking: [],
    kana: [],
    kanji: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isClearing, setIsClearing] = useState(false);

  // Load cached items
  useEffect(() => {
    if (!isReady) return;

    const loadCachedItems = async () => {
      setIsLoading(true);
      const types = ['vocabulary', 'speaking', 'kana', 'kanji'] as const;
      const items: Record<string, any[]> = {};
      
      for (const type of types) {
        items[type] = await getCachedByType(type);
      }
      
      setCachedItems(items);
      setIsLoading(false);
    };

    loadCachedItems();
  }, [isReady, getCachedByType, cachedCount]);

  const handleClearCache = async () => {
    setIsClearing(true);
    const success = await clearCache();
    setIsClearing(false);
    
    if (success) {
      toast.success('Cache audio berhasil dihapus');
      setCachedItems({
        vocabulary: [],
        speaking: [],
        kana: [],
        kanji: [],
      });
    } else {
      toast.error('Gagal menghapus cache');
    }
  };

  const handleRemoveItem = async (id: string, type: string) => {
    const success = await removeAudio(id);
    if (success) {
      setCachedItems(prev => ({
        ...prev,
        [type]: prev[type].filter(item => item.id !== id),
      }));
      toast.success('Audio dihapus');
    }
  };

  const tabCounts = {
    vocabulary: cachedItems.vocabulary.length,
    speaking: cachedItems.speaking.length,
    kana: cachedItems.kana.length,
    kanji: cachedItems.kanji.length,
  };

  return (
    <Card className={cn('', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <HardDrive className="h-5 w-5" />
              Audio Offline
            </CardTitle>
            <CardDescription className="mt-1">
              Kelola audio yang tersimpan untuk belajar offline
            </CardDescription>
          </div>
          <Badge variant={isOnline ? 'default' : 'secondary'} className="gap-1">
            {isOnline ? (
              <>
                <Wifi className="h-3 w-3" />
                Online
              </>
            ) : (
              <>
                <WifiOff className="h-3 w-3" />
                Offline
              </>
            )}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Storage Summary */}
        <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
          <div className="space-y-1">
            <p className="text-sm font-medium">
              {cachedCount} audio tersimpan
            </p>
            <p className="text-xs text-muted-foreground">
              Total: {formatSize(totalSize)}
            </p>
          </div>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="destructive" 
                size="sm"
                disabled={cachedCount === 0 || isClearing}
              >
                {isClearing ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4 mr-2" />
                )}
                Hapus Semua
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Hapus Semua Audio Offline?</AlertDialogTitle>
                <AlertDialogDescription>
                  Ini akan menghapus {cachedCount} audio ({formatSize(totalSize)}) 
                  dari penyimpanan lokal. Anda perlu mengunduh ulang untuk 
                  menggunakannya secara offline.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Batal</AlertDialogCancel>
                <AlertDialogAction onClick={handleClearCache}>
                  Ya, Hapus Semua
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {/* Download Progress */}
        {downloads.size > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Sedang mengunduh...</p>
            {Array.from(downloads.values()).map((download) => (
              <div key={download.id} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="truncate max-w-[200px]">{download.id}</span>
                  <span>
                    {download.status === 'downloading' && (
                      <Loader2 className="h-3 w-3 animate-spin inline" />
                    )}
                    {download.status === 'completed' && (
                      <CheckCircle2 className="h-3 w-3 text-primary inline" />
                    )}
                    {download.status === 'error' && (
                      <AlertCircle className="h-3 w-3 text-destructive inline" />
                    )}
                  </span>
                </div>
                <Progress value={download.progress} className="h-1" />
              </div>
            ))}
          </div>
        )}

        {/* Cached Items by Type */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="vocabulary" className="text-xs">
              Kosakata ({tabCounts.vocabulary})
            </TabsTrigger>
            <TabsTrigger value="speaking" className="text-xs">
              Speaking ({tabCounts.speaking})
            </TabsTrigger>
            <TabsTrigger value="kana" className="text-xs">
              Kana ({tabCounts.kana})
            </TabsTrigger>
            <TabsTrigger value="kanji" className="text-xs">
              Kanji ({tabCounts.kanji})
            </TabsTrigger>
          </TabsList>

          {['vocabulary', 'speaking', 'kana', 'kanji'].map((type) => (
            <TabsContent key={type} value={type} className="mt-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : cachedItems[type].length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                  <FolderOpen className="h-12 w-12 mb-2 opacity-50" />
                  <p className="text-sm">Belum ada audio tersimpan</p>
                  <p className="text-xs mt-1">
                    Unduh audio dari halaman pelajaran untuk akses offline
                  </p>
                </div>
              ) : (
                <ScrollArea className="h-64">
                  <div className="space-y-2">
                    {cachedItems[type].map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{item.text}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {formatSize(item.size)}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {new Date(item.downloadedAt).toLocaleDateString('id-ID')}
                            </span>
                          </div>
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveItem(item.id, type)}
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </TabsContent>
          ))}
        </Tabs>

        {/* Offline Tips */}
        {!isOnline && (
          <div className="p-3 rounded-lg bg-muted border border-border">
            <p className="text-sm text-muted-foreground">
              <WifiOff className="h-4 w-4 inline mr-2" />
              Mode offline aktif. Audio yang sudah diunduh tetap dapat diputar.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
