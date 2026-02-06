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
} from 'lucide-react';
import { PremiumUpgradeModal } from '@/components/subscription/PremiumUpgradeModal';
import { SubscriptionSection } from '@/components/subscription/SubscriptionSection';
import { ReminderSettingsCard } from '@/components/notifications/ReminderSettingsCard';
import { AchievementSection } from '@/components/achievements/AchievementSection';

const menuItems = [
  { icon: Settings, label: 'Pengaturan Akun', path: '/settings' },
  { icon: Bell, label: 'Notifikasi', path: '/notifications' },
  { icon: HelpCircle, label: 'Bantuan', path: '/help' },
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
        
        {/* Subscription Section */}
        <div className="container max-w-lg mx-auto px-4 mt-6">
          <SubscriptionSection onUpgrade={() => setShowPremiumModal(true)} />
        </div>
        
        {/* Study Reminder Settings */}
        <div className="container max-w-lg mx-auto px-4 mt-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
          >
            <ReminderSettingsCard />
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
        
        {/* Achievements */}
        <div className="container max-w-lg mx-auto px-4 mt-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card rounded-2xl shadow-card p-4 border border-border"
          >
            <AchievementSection />
          </motion.div>
        </div>
        
        {/* Menu */}
        <div className="container max-w-lg mx-auto px-4 mt-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
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
      <PremiumUpgradeModal 
        isOpen={showPremiumModal} 
        onClose={() => setShowPremiumModal(false)} 
      />
    </AppLayout>
  );
}
