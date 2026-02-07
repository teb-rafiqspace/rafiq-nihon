import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  HelpCircle,
  Clock,
  Zap
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
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useQuizSets } from '@/hooks/useAdmin';

const difficultyColors: Record<string, string> = {
  easy: 'bg-green-500',
  medium: 'bg-yellow-500',
  hard: 'bg-red-500',
};

export default function QuizManagement() {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  
  const { data: quizSets, isLoading } = useQuizSets();

  const categories = [...new Set(quizSets?.map(q => q.category) || [])];

  const filteredQuizSets = quizSets?.filter(quiz => {
    const matchesSearch = 
      quiz.title_id?.toLowerCase().includes(search.toLowerCase()) ||
      quiz.title_jp?.toLowerCase().includes(search.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || quiz.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  }) || [];

  const totalQuestions = quizSets?.reduce((sum, quiz) => sum + (quiz.question_count || 0), 0) || 0;

  return (
    <AdminLayout 
      title="Quiz Management" 
      description="Kelola practice quiz sets dan questions"
    >
      <div className="space-y-4">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari quiz set..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Category</SelectItem>
              {categories.map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">Quiz Sets</span>
              </div>
              <p className="text-2xl font-bold mt-1">{quizSets?.length || 0}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-xp" />
                <span className="text-sm font-medium">Questions</span>
              </div>
              <p className="text-2xl font-bold mt-1">{totalQuestions.toLocaleString()}</p>
            </CardContent>
          </Card>
        </div>

        {/* Quiz Sets Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-40" />
            ))}
          </div>
        ) : filteredQuizSets.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              Tidak ada quiz set ditemukan
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredQuizSets.map((quiz, index) => (
              <motion.div
                key={quiz.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: quiz.color || '#3B82F6' }}
                      >
                        <HelpCircle className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex gap-1">
                        {quiz.is_daily && (
                          <Badge className="bg-warning text-warning-foreground text-xs">
                            Daily
                          </Badge>
                        )}
                        {quiz.is_premium && (
                          <Badge variant="secondary" className="text-xs">
                            Premium
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardTitle className="text-base mb-1">{quiz.title_id}</CardTitle>
                    <p className="text-sm text-muted-foreground font-jp mb-3">
                      {quiz.title_jp}
                    </p>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <HelpCircle className="h-3.5 w-3.5" />
                        {quiz.question_count || 0} soal
                      </div>
                      {quiz.time_limit_seconds && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {Math.floor(quiz.time_limit_seconds / 60)} menit
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Zap className="h-3.5 w-3.5" />
                        {quiz.xp_reward || 0} XP
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      <Badge variant="outline">{quiz.category}</Badge>
                      {quiz.difficulty && (
                        <div className="flex items-center gap-1">
                          <div className={`w-2 h-2 rounded-full ${difficultyColors[quiz.difficulty] || 'bg-muted'}`} />
                          <span className="text-xs capitalize">{quiz.difficulty}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="text-sm text-muted-foreground">
          Menampilkan {filteredQuizSets.length} dari {quizSets?.length || 0} quiz sets
        </div>
      </div>
    </AdminLayout>
  );
}
