import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bookmark, 
  Book, 
  Layers, 
  MessageSquare, 
  GraduationCap,
  BookOpen,
  Trash2,
  Search
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useBookmarks, useToggleBookmark, BookmarkContentType } from '@/hooks/useBookmarks';
import { useAuth } from '@/lib/auth';
import { AppLayout } from '@/components/layout/AppLayout';

const CONTENT_TYPE_CONFIG: Record<BookmarkContentType, { 
  label: string; 
  icon: React.ReactNode; 
  color: string;
}> = {
  vocabulary: { 
    label: 'Kosakata', 
    icon: <Book className="h-4 w-4" />, 
    color: 'bg-blue-500' 
  },
  lesson: { 
    label: 'Pelajaran', 
    icon: <GraduationCap className="h-4 w-4" />, 
    color: 'bg-green-500' 
  },
  grammar: { 
    label: 'Tata Bahasa', 
    icon: <MessageSquare className="h-4 w-4" />, 
    color: 'bg-purple-500' 
  },
  flashcard: { 
    label: 'Flashcard', 
    icon: <Layers className="h-4 w-4" />, 
    color: 'bg-orange-500' 
  },
  chapter: { 
    label: 'Bab', 
    icon: <BookOpen className="h-4 w-4" />, 
    color: 'bg-red-500' 
  },
  kana: { 
    label: 'Kana', 
    icon: <span className="text-sm font-bold">あ</span>, 
    color: 'bg-pink-500' 
  },
};

export default function Bookmarks() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<BookmarkContentType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const { data: bookmarks = [], isLoading } = useBookmarks(
    activeTab === 'all' ? undefined : activeTab
  );
  const toggleBookmark = useToggleBookmark();
  
  const filteredBookmarks = bookmarks.filter(bookmark => 
    bookmark.content_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    bookmark.notes?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleRemoveBookmark = (contentType: BookmarkContentType, contentId: string) => {
    toggleBookmark.mutate({ contentType, contentId });
  };
  
  if (!user) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center min-h-[50vh] p-6 text-center">
          <Bookmark className="h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Login untuk Melihat Bookmark</h2>
          <p className="text-muted-foreground mb-4">
            Simpan kosakata, pelajaran, dan materi favorit Anda
          </p>
          <Button onClick={() => navigate('/auth')}>Login</Button>
        </div>
      </AppLayout>
    );
  }
  
  return (
    <AppLayout>
      <div className="p-4 pb-24 space-y-4">
        <div className="flex items-center gap-3">
          <Bookmark className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Bookmark Saya</h1>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari bookmark..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as BookmarkContentType | 'all')}>
          <TabsList className="w-full flex-wrap h-auto gap-1 p-1">
            <TabsTrigger value="all" className="text-xs">Semua</TabsTrigger>
            {Object.entries(CONTENT_TYPE_CONFIG).map(([key, config]) => (
              <TabsTrigger key={key} value={key} className="text-xs gap-1">
                {config.icon}
                <span className="hidden sm:inline">{config.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
          
          <TabsContent value={activeTab} className="mt-4">
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-4">
                      <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                      <div className="h-3 bg-muted rounded w-1/2" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredBookmarks.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Bookmark className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">
                    {searchQuery 
                      ? 'Tidak ada bookmark yang cocok' 
                      : 'Belum ada bookmark. Mulai simpan materi favorit Anda!'
                    }
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {filteredBookmarks.map((bookmark) => {
                  const config = CONTENT_TYPE_CONFIG[bookmark.content_type as BookmarkContentType];
                  
                  return (
                    <Card key={bookmark.id} className="overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge 
                                variant="secondary" 
                                className={`${config.color} text-white text-xs`}
                              >
                                {config.icon}
                                <span className="ml-1">{config.label}</span>
                              </Badge>
                            </div>
                            <p className="font-medium truncate">{bookmark.content_id}</p>
                            {bookmark.notes && (
                              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                {bookmark.notes}
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground mt-2">
                              {new Date(bookmark.created_at).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="shrink-0 text-destructive hover:text-destructive"
                            onClick={() => handleRemoveBookmark(
                              bookmark.content_type as BookmarkContentType, 
                              bookmark.content_id
                            )}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
