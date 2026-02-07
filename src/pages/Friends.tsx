import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, UserPlus, Search, ArrowLeft, Check, X, 
  Flame, Trophy, Swords, MoreHorizontal, UserMinus
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useSocial, useUserSearch } from '@/hooks/useSocial';
import { cn } from '@/lib/utils';

export default function Friends() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [addFriendOpen, setAddFriendOpen] = useState(false);
  const [addSearchQuery, setAddSearchQuery] = useState('');

  const {
    friends,
    friendsLoading,
    pendingRequests,
    requestsLoading,
    pendingChallenges,
    acceptFriendRequest,
    rejectFriendRequest,
    removeFriend,
    sendFriendRequest,
    sendChallenge,
    respondToChallenge,
  } = useSocial();

  const { data: searchResults, isLoading: searching } = useUserSearch(addSearchQuery);

  const filteredFriends = friends?.filter(f =>
    f.friend_profile?.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border">
        <div className="flex items-center gap-3 p-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Teman
            </h1>
          </div>
          <Dialog open={addFriendOpen} onOpenChange={setAddFriendOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <UserPlus className="h-4 w-4 mr-1" />
                Tambah
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Tambah Teman</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Cari berdasarkan nama..."
                    className="pl-9"
                    value={addSearchQuery}
                    onChange={(e) => setAddSearchQuery(e.target.value)}
                  />
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {searching && (
                    <div className="text-center py-4 text-muted-foreground">
                      Mencari...
                    </div>
                  )}
                  {searchResults?.map((profile) => (
                    <div
                      key={profile.id}
                      className="flex items-center gap-3 p-3 rounded-lg border bg-card"
                    >
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                        {profile.avatar_url ? (
                          <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span>👤</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{profile.full_name || 'Pelajar'}</p>
                        <p className="text-xs text-muted-foreground">
                          {profile.total_xp?.toLocaleString() || 0} XP
                        </p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => {
                          sendFriendRequest.mutate({ receiverId: profile.user_id });
                          setAddFriendOpen(false);
                        }}
                        disabled={sendFriendRequest.isPending}
                      >
                        <UserPlus className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  {addSearchQuery.length >= 2 && !searching && searchResults?.length === 0 && (
                    <div className="text-center py-4 text-muted-foreground">
                      Tidak ditemukan
                    </div>
                  )}
                  {addSearchQuery.length < 2 && (
                    <div className="text-center py-4 text-muted-foreground text-sm">
                      Ketik minimal 2 karakter untuk mencari
                    </div>
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="friends" className="p-4">
        <TabsList className="w-full mb-4">
          <TabsTrigger value="friends" className="flex-1">
            Teman ({friends?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="requests" className="flex-1 relative">
            Permintaan
            {pendingRequests && pendingRequests.length > 0 && (
              <Badge className="ml-1 h-5 w-5 p-0 flex items-center justify-center">
                {pendingRequests.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="challenges" className="flex-1">
            Tantangan
          </TabsTrigger>
        </TabsList>

        {/* Friends Tab */}
        <TabsContent value="friends" className="space-y-2">
          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari teman..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {friendsLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded-xl animate-pulse" />
            ))
          ) : filteredFriends && filteredFriends.length > 0 ? (
            filteredFriends.map((friend) => (
              <motion.div
                key={friend.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 p-3 rounded-xl border bg-card"
              >
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                  {friend.friend_profile?.avatar_url ? (
                    <img
                      src={friend.friend_profile.avatar_url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-xl">👤</span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">
                    {friend.friend_profile?.full_name || 'Pelajar'}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Trophy className="h-3 w-3" />
                      {friend.friend_profile?.total_xp?.toLocaleString() || 0} XP
                    </span>
                    {friend.friend_profile?.current_streak && friend.friend_profile.current_streak > 0 && (
                      <span className="flex items-center gap-1 text-orange-500">
                        <Flame className="h-3 w-3" />
                        {friend.friend_profile.current_streak}
                      </span>
                    )}
                  </div>
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => sendChallenge.mutate({ challengedId: friend.friend_id })}
                  disabled={sendChallenge.isPending}
                >
                  <Swords className="h-4 w-4" />
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="icon" variant="ghost">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => removeFriend.mutate(friend.friend_id)}
                    >
                      <UserMinus className="h-4 w-4 mr-2" />
                      Hapus Teman
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
              <p className="text-muted-foreground">Belum ada teman</p>
              <Button
                variant="link"
                onClick={() => setAddFriendOpen(true)}
                className="mt-2"
              >
                Tambah teman sekarang
              </Button>
            </div>
          )}
        </TabsContent>

        {/* Requests Tab */}
        <TabsContent value="requests" className="space-y-2">
          {requestsLoading ? (
            Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded-xl animate-pulse" />
            ))
          ) : pendingRequests && pendingRequests.length > 0 ? (
            <AnimatePresence>
              {pendingRequests.map((request) => (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex items-center gap-3 p-3 rounded-xl border bg-card"
                >
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                    {request.sender_profile?.avatar_url ? (
                      <img
                        src={request.sender_profile.avatar_url}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-xl">👤</span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
                      {request.sender_profile?.full_name || 'Pelajar'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {request.sender_profile?.total_xp?.toLocaleString() || 0} XP
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="icon"
                      variant="default"
                      onClick={() => acceptFriendRequest.mutate(request.id)}
                      disabled={acceptFriendRequest.isPending}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => rejectFriendRequest.mutate(request.id)}
                      disabled={rejectFriendRequest.isPending}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          ) : (
            <div className="text-center py-12">
              <UserPlus className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
              <p className="text-muted-foreground">Tidak ada permintaan pertemanan</p>
            </div>
          )}
        </TabsContent>

        {/* Challenges Tab */}
        <TabsContent value="challenges" className="space-y-2">
          {pendingChallenges && pendingChallenges.length > 0 ? (
            pendingChallenges.map((challenge) => (
              <motion.div
                key={challenge.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-xl border bg-card"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Swords className="h-5 w-5 text-primary" />
                  <span className="font-medium">Tantangan Quiz</span>
                  <Badge variant={challenge.status === 'pending' ? 'secondary' : 'default'}>
                    {challenge.status === 'pending' ? 'Menunggu' : 
                     challenge.status === 'accepted' ? 'Diterima' : 
                     challenge.status === 'in_progress' ? 'Berlangsung' : challenge.status}
                  </Badge>
                </div>

                {challenge.status === 'pending' && (
                  <div className="flex gap-2 mt-3">
                    <Button
                      className="flex-1"
                      onClick={() => respondToChallenge.mutate({ challengeId: challenge.id, accept: true })}
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Terima
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => respondToChallenge.mutate({ challengeId: challenge.id, accept: false })}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Tolak
                    </Button>
                  </div>
                )}

                {challenge.status === 'completed' && (
                  <div className="mt-3 text-center">
                    <p className="text-lg font-bold">
                      {challenge.challenger_score} - {challenge.challenged_score}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {challenge.winner_id ? 'Pemenang mendapat +' + challenge.xp_reward + ' XP' : 'Seri!'}
                    </p>
                  </div>
                )}
              </motion.div>
            ))
          ) : (
            <div className="text-center py-12">
              <Swords className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
              <p className="text-muted-foreground">Tidak ada tantangan aktif</p>
              <p className="text-sm text-muted-foreground mt-1">
                Tantang temanmu untuk battle quiz!
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
