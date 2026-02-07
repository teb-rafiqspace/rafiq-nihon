import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Layers,
  Star
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useFlashcardDecks } from '@/hooks/useAdmin';

export default function FlashcardManagement() {
  const [search, setSearch] = useState('');
  
  const { data: decks, isLoading } = useFlashcardDecks();

  const filteredDecks = decks?.filter(deck => {
    return (
      deck.title_id?.toLowerCase().includes(search.toLowerCase()) ||
      deck.title_jp?.toLowerCase().includes(search.toLowerCase()) ||
      deck.category?.toLowerCase().includes(search.toLowerCase())
    );
  }) || [];

  const totalCards = decks?.reduce((sum, deck) => sum + (deck.card_count || 0), 0) || 0;

  return (
    <AdminLayout 
      title="Flashcard Management" 
      description="Kelola flashcard decks dan cards"
    >
      <div className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari deck..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <Layers className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">Total Decks</span>
              </div>
              <p className="text-2xl font-bold mt-1">{decks?.length || 0}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-warning" />
                <span className="text-sm font-medium">Total Cards</span>
              </div>
              <p className="text-2xl font-bold mt-1">{totalCards.toLocaleString()}</p>
            </CardContent>
          </Card>
        </div>

        {/* Decks Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        ) : filteredDecks.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              Tidak ada deck ditemukan
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDecks.map((deck, index) => (
              <motion.div
                key={deck.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: deck.color || '#3B82F6' }}
                      >
                        <Layers className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex gap-1">
                        {deck.is_premium && (
                          <Badge variant="secondary" className="text-xs">
                            Premium
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-xs">
                          {deck.category}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardTitle className="text-base mb-1">{deck.title_id}</CardTitle>
                    <p className="text-sm text-muted-foreground font-jp mb-2">
                      {deck.title_jp}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {deck.card_count || 0} cards
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="text-sm text-muted-foreground">
          Menampilkan {filteredDecks.length} dari {decks?.length || 0} decks
        </div>
      </div>
    </AdminLayout>
  );
}
