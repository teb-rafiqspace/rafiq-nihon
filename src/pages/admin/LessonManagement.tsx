import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  BookOpen, 
  ChevronRight,
  Filter
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useChapters, useLessons } from '@/hooks/useAdmin';

const trackColors: Record<string, string> = {
  kemnaker: 'bg-blue-500',
  jlpt_n5: 'bg-green-500',
  jlpt_n4: 'bg-yellow-500',
  jlpt_n3: 'bg-orange-500',
  jlpt_n2: 'bg-red-500',
};

const trackLabels: Record<string, string> = {
  kemnaker: 'Kemnaker',
  jlpt_n5: 'JLPT N5',
  jlpt_n4: 'JLPT N4',
  jlpt_n3: 'JLPT N3',
  jlpt_n2: 'JLPT N2',
};

export default function LessonManagement() {
  const [search, setSearch] = useState('');
  const [trackFilter, setTrackFilter] = useState<string>('all');
  
  const { data: chapters, isLoading: chaptersLoading } = useChapters();
  const { data: lessons, isLoading: lessonsLoading } = useLessons();

  const filteredChapters = chapters?.filter(chapter => {
    const matchesSearch = 
      chapter.title_id?.toLowerCase().includes(search.toLowerCase()) ||
      chapter.title_jp?.toLowerCase().includes(search.toLowerCase());
    
    const matchesTrack = trackFilter === 'all' || chapter.track === trackFilter;
    
    return matchesSearch && matchesTrack;
  }) || [];

  const getLessonsForChapter = (chapterId: string) => {
    return lessons?.filter(lesson => lesson.chapter_id === chapterId) || [];
  };

  const isLoading = chaptersLoading || lessonsLoading;

  return (
    <AdminLayout 
      title="Lesson Management" 
      description="Kelola chapters dan lessons"
    >
      <div className="space-y-4">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari chapter atau lesson..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={trackFilter} onValueChange={setTrackFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Filter Track" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Track</SelectItem>
              <SelectItem value="kemnaker">Kemnaker</SelectItem>
              <SelectItem value="jlpt_n5">JLPT N5</SelectItem>
              <SelectItem value="jlpt_n4">JLPT N4</SelectItem>
              <SelectItem value="jlpt_n3">JLPT N3</SelectItem>
              <SelectItem value="jlpt_n2">JLPT N2</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {Object.entries(trackLabels).map(([key, label]) => {
            const count = chapters?.filter(c => c.track === key).length || 0;
            return (
              <Card key={key}>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${trackColors[key]}`} />
                    <span className="text-sm font-medium">{label}</span>
                  </div>
                  <p className="text-2xl font-bold mt-1">{count}</p>
                  <p className="text-xs text-muted-foreground">chapters</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Chapters Accordion */}
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : filteredChapters.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              Tidak ada chapter ditemukan
            </CardContent>
          </Card>
        ) : (
          <Accordion type="multiple" className="space-y-2">
            {filteredChapters.map((chapter, index) => {
              const chapterLessons = getLessonsForChapter(chapter.id);
              return (
                <motion.div
                  key={chapter.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <AccordionItem value={chapter.id} className="border rounded-lg px-4">
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-3 text-left">
                        <div className={`w-10 h-10 rounded-lg ${trackColors[chapter.track] || 'bg-muted'} flex items-center justify-center text-white font-bold`}>
                          {chapter.chapter_number}
                        </div>
                        <div>
                          <p className="font-medium">{chapter.title_id}</p>
                          <p className="text-sm text-muted-foreground font-jp">
                            {chapter.title_jp}
                          </p>
                        </div>
                        <Badge variant="outline" className="ml-auto mr-2">
                          {trackLabels[chapter.track] || chapter.track}
                        </Badge>
                        <Badge variant="secondary">
                          {chapterLessons.length} lessons
                        </Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="pt-2 pb-4 space-y-2">
                        {chapterLessons.length === 0 ? (
                          <p className="text-sm text-muted-foreground text-center py-4">
                            Tidak ada lesson dalam chapter ini
                          </p>
                        ) : (
                          chapterLessons.map((lesson) => (
                            <div 
                              key={lesson.id}
                              className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                            >
                              <div className="w-8 h-8 rounded-full bg-background flex items-center justify-center text-sm font-medium">
                                {lesson.lesson_number}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">{lesson.title_id}</p>
                                <p className="text-sm text-muted-foreground font-jp truncate">
                                  {lesson.title_jp}
                                </p>
                              </div>
                              <Badge variant="outline" className="shrink-0">
                                {lesson.xp_reward} XP
                              </Badge>
                              <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                            </div>
                          ))
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </motion.div>
              );
            })}
          </Accordion>
        )}

        {/* Stats */}
        <div className="text-sm text-muted-foreground">
          Total: {chapters?.length || 0} chapters, {lessons?.length || 0} lessons
        </div>
      </div>
    </AdminLayout>
  );
}
