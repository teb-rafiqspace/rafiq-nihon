import { useState } from 'react';
import { motion } from 'framer-motion';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/lib/auth';
import { useNavigate } from 'react-router-dom';
import { 
  Flame, 
  Zap, 
  Star, 
  Trophy,
  Medal,
  Settings,
  Bell,
  HelpCircle,
  LogOut,
  ChevronRight,
  Crown,
  Check,
  X
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const menuItems = [
  { icon: Settings, label: 'Pengaturan Akun', path: '/settings' },
  { icon: Bell, label: 'Notifikasi', path: '/notifications' },
  { icon: HelpCircle, label: 'Bantuan', path: '/help' },
];

const freePlanFeatures = [
  { text: 'Akses Bab 1 semua jalur', included: true },
  { text: '5 chat AI per hari', included: true },
  { text: 'Flashcard dasar', included: true },
  { text: 'Akses semua bab', included: false },
  { text: 'Chat AI tanpa batas', included: false },
  { text: 'Tes simulasi lengkap', included: false },
  { text: 'Tanpa iklan', included: false },
];

const premiumPlanFeatures = [
  { text: 'Akses Bab 1 semua jalur', included: true },
  { text: '5 chat AI per hari', included: true },
  { text: 'Flashcard dasar', included: true },
  { text: 'Akses semua bab', included: true },
  { text: 'Chat AI tanpa batas', included: true },
  { text: 'Tes simulasi lengkap', included: true },
  { text: 'Tanpa iklan', included: true },
];

export default function Profile() {
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const { data: profile, isLoading } = useProfile();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };
  
  // Mock badges
  const badges = [
    { icon: '⭐', name: 'Pemula', earned: true },
    { icon: '🔥', name: 'Semangat', earned: true },
    { icon: '📚', name: 'Rajin', earned: false },
    { icon: '🏆', name: 'Master XP', earned: false },
  ];
  
  // Generate streak calendar (last 7 days)
  const streakDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return {
      day: date.toLocaleDateString('id', { weekday: 'short' }).slice(0, 2),
      active: i >= 4, // Mock: last 3 days active
    };
  });
  
  if (isLoading) {
    return (
      <AppLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </AppLayout>
    );
  }
  
  return (
    <AppLayout>
      <div className="pt-safe pb-8">
        {/* Header */}
        <div className="bg-gradient-hero">
          <div className="container max-w-lg mx-auto px-4 pt-6 pb-16">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <div className="w-20 h-20 bg-card rounded-full mx-auto mb-3 flex items-center justify-center text-3xl shadow-elevated">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                ) : (
                  '👤'
                )}
              </div>
              <h1 className="text-xl font-bold text-primary-foreground">
                {profile?.full_name || user?.email?.split('@')[0]}
              </h1>
              <p className="text-primary-foreground/80 text-sm">{user?.email}</p>
            </motion.div>
          </div>
        </div>
        
        {/* Stats Cards */}
        <div className="container max-w-lg mx-auto px-4 -mt-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-2xl shadow-elevated p-4"
          >
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <div className="w-10 h-10 bg-gradient-xp rounded-xl flex items-center justify-center mx-auto mb-2">
                  <Zap className="h-5 w-5 text-white" />
                </div>
                <p className="font-bold">{profile?.total_xp || 0}</p>
                <p className="text-xs text-muted-foreground">XP</p>
              </div>
              <div>
                <div className="w-10 h-10 bg-gradient-secondary rounded-xl flex items-center justify-center mx-auto mb-2">
                  <Star className="h-5 w-5 text-white" />
                </div>
                <p className="font-bold">{profile?.current_level || 1}</p>
                <p className="text-xs text-muted-foreground">Level</p>
              </div>
              <div>
                <div className="w-10 h-10 bg-gradient-streak rounded-xl flex items-center justify-center mx-auto mb-2">
                  <Flame className="h-5 w-5 text-white" />
                </div>
                <p className="font-bold">{profile?.current_streak || 0}</p>
                <p className="text-xs text-muted-foreground">Streak</p>
              </div>
              <div>
                <div className="w-10 h-10 bg-gradient-success rounded-xl flex items-center justify-center mx-auto mb-2">
                  <Trophy className="h-5 w-5 text-white" />
                </div>
                <p className="font-bold">{profile?.lessons_completed || 0}</p>
                <p className="text-xs text-muted-foreground">Pelajaran</p>
              </div>
            </div>
          </motion.div>
        </div>
        
        {/* Streak Calendar */}
        <div className="container max-w-lg mx-auto px-4 mt-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card rounded-2xl shadow-card p-4 border border-border"
          >
            <div className="flex items-center gap-2 mb-4">
              <Flame className="h-5 w-5 text-streak" />
              <h3 className="font-semibold">Kalender Streak</h3>
            </div>
            <div className="flex justify-between">
              {streakDays.map((day, i) => (
                <div key={i} className="text-center">
                  <p className="text-xs text-muted-foreground mb-2">{day.day}</p>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    day.active ? 'bg-gradient-streak' : 'bg-muted'
                  }`}>
                    {day.active && <Flame className="h-4 w-4 text-white" />}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
        
        {/* Badges */}
        <div className="container max-w-lg mx-auto px-4 mt-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card rounded-2xl shadow-card p-4 border border-border"
          >
            <div className="flex items-center gap-2 mb-4">
              <Medal className="h-5 w-5 text-amber-500" />
              <h3 className="font-semibold">Lencana</h3>
            </div>
            <div className="flex gap-3">
              {badges.map((badge, i) => (
                <div 
                  key={i} 
                  className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${
                    badge.earned ? 'bg-gradient-to-br from-amber-100 to-orange-100' : 'bg-muted opacity-40'
                  }`}
                  title={badge.name}
                >
                  {badge.icon}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
        
        {/* Upgrade Button */}
        <div className="container max-w-lg mx-auto px-4 mt-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Button 
              variant="premium" 
              size="xl" 
              className="w-full"
              onClick={() => setShowPremiumModal(true)}
            >
              <Crown className="h-5 w-5 mr-2" />
              Upgrade ke Premium
            </Button>
          </motion.div>
        </div>
        
        {/* Menu */}
        <div className="container max-w-lg mx-auto px-4 mt-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-card rounded-2xl shadow-card border border-border overflow-hidden"
          >
            {menuItems.map((item, i) => {
              const Icon = item.icon;
              return (
                <button
                  key={i}
                  className="w-full flex items-center gap-3 p-4 hover:bg-muted transition-colors border-b border-border last:border-b-0"
                >
                  <Icon className="h-5 w-5 text-muted-foreground" />
                  <span className="flex-1 text-left">{item.label}</span>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </button>
              );
            })}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 p-4 hover:bg-destructive/10 transition-colors text-destructive"
            >
              <LogOut className="h-5 w-5" />
              <span className="flex-1 text-left">Keluar</span>
            </button>
          </motion.div>
        </div>
      </div>
      
      {/* Premium Modal */}
      <Dialog open={showPremiumModal} onOpenChange={setShowPremiumModal}>
        <DialogContent className="max-w-lg mx-4">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-amber-500" />
              Upgrade ke Premium
            </DialogTitle>
          </DialogHeader>
          
          <div className="mt-4">
            {/* Plan Comparison */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              {/* Free Plan */}
              <div className="border border-border rounded-xl p-4">
                <h4 className="font-semibold mb-2">Gratis</h4>
                <p className="text-2xl font-bold mb-4">Rp 0</p>
                <ul className="space-y-2">
                  {freePlanFeatures.map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-xs">
                      {f.included ? (
                        <Check className="h-4 w-4 text-success" />
                      ) : (
                        <X className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className={f.included ? '' : 'text-muted-foreground'}>{f.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Premium Plan */}
              <div className="border-2 border-amber-400 rounded-xl p-4 bg-gradient-to-br from-amber-50 to-orange-50 relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                  POPULER
                </div>
                <h4 className="font-semibold mb-2">Premium</h4>
                <div className="mb-4">
                  <p className="text-2xl font-bold">Rp 49.000</p>
                  <p className="text-xs text-muted-foreground">/bulan</p>
                </div>
                <ul className="space-y-2">
                  {premiumPlanFeatures.map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-xs">
                      <Check className="h-4 w-4 text-success" />
                      <span>{f.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            {/* Pricing Options */}
            <div className="space-y-3">
              <button className="w-full border-2 border-amber-400 rounded-xl p-4 text-left hover:bg-amber-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">Bulanan</p>
                    <p className="text-sm text-muted-foreground">Rp 49.000/bulan</p>
                  </div>
                  <div className="w-5 h-5 border-2 border-amber-400 rounded-full" />
                </div>
              </button>
              <button className="w-full border-2 border-amber-400 bg-amber-50 rounded-xl p-4 text-left relative">
                <div className="absolute -top-2 -right-2 bg-success text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  Hemat 32%
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">Tahunan</p>
                    <p className="text-sm text-muted-foreground">Rp 399.000/tahun</p>
                  </div>
                  <div className="w-5 h-5 border-2 border-amber-400 rounded-full flex items-center justify-center">
                    <div className="w-3 h-3 bg-amber-400 rounded-full" />
                  </div>
                </div>
              </button>
            </div>
            
            <Button variant="premium" size="xl" className="w-full mt-6">
              Mulai 7 Hari Gratis
            </Button>
            <p className="text-xs text-center text-muted-foreground mt-3">
              Dibatalkan kapan saja. Tidak ada komitmen.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
