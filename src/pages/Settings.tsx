import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Sun, 
  Moon, 
  Monitor,
  Globe,
  User,
  Bell,
  Shield,
  HelpCircle,
  LogOut,
  ChevronRight,
  Trash2,
  Target,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useTheme } from '@/hooks/useTheme';
import { useI18n, LANGUAGES } from '@/lib/i18n';
import { useAuth } from '@/lib/auth';
import { useProfile, useUpdateProfile } from '@/hooks/useProfile';
import { useStudyReminder } from '@/hooks/useStudyReminder';
import { toast } from '@/hooks/use-toast';

type ThemeOption = 'light' | 'dark' | 'system';

const themeOptions: { value: ThemeOption; icon: typeof Sun; labelKey: 'light' | 'dark' | 'system' }[] = [
  { value: 'light', icon: Sun, labelKey: 'light' },
  { value: 'dark', icon: Moon, labelKey: 'dark' },
  { value: 'system', icon: Monitor, labelKey: 'system' },
];

export default function Settings() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, currentLanguage, t, formatDate } = useI18n();
  const { user, signOut } = useAuth();
  const { data: profile } = useProfile();
  const updateProfileMutation = useUpdateProfile();
  const { settings: reminderSettings, updateSettings: updateReminderSettings } = useStudyReminder();

  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showLanguageSelect, setShowLanguageSelect] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [editName, setEditName] = useState(profile?.full_name || '');
  const [dailyGoal, setDailyGoal] = useState(profile?.daily_goal_minutes || 15);
  const [reminderEnabled, setReminderEnabled] = useState(reminderSettings.enabled);

  const handleSaveProfile = async () => {
    try {
      await updateProfileMutation.mutateAsync({ full_name: editName, daily_goal_minutes: dailyGoal });
      setShowEditProfile(false);
      toast({ title: 'Profil berhasil diperbarui' });
    } catch {
      toast({ title: 'Gagal memperbarui profil', variant: 'destructive' });
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const handleToggleReminder = (enabled: boolean) => {
    setReminderEnabled(enabled);
    updateReminderSettings({ enabled });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate(-1)}
              className="shrink-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold">{t('settings')}</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6 pb-24">
        {/* Theme Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-sm font-medium text-muted-foreground mb-3 px-1">
            {t('appearance')}
          </h2>
          <Card className="p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Sun className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">{t('theme')}</p>
                <p className="text-sm text-muted-foreground">
                  {t(theme as 'light' | 'dark' | 'system')}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {themeOptions.map(({ value, icon: Icon, labelKey }) => (
                <button
                  key={value}
                  onClick={() => setTheme(value)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                    theme === value 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-muted-foreground/30'
                  }`}
                >
                  <Icon className={`h-5 w-5 ${theme === value ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span className={`text-sm ${theme === value ? 'font-medium text-primary' : 'text-muted-foreground'}`}>
                    {t(labelKey)}
                  </span>
                </button>
              ))}
            </div>
          </Card>
        </motion.section>

        {/* Language Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="text-sm font-medium text-muted-foreground mb-3 px-1">
            {t('language')}
          </h2>
          <Card 
            className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => setShowLanguageSelect(true)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                  <Globe className="h-5 w-5 text-secondary" />
                </div>
                <div>
                  <p className="font-medium">{t('language')}</p>
                  <p className="text-sm text-muted-foreground">
                    {currentLanguage.flag} {currentLanguage.nativeName}
                  </p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </div>
          </Card>
        </motion.section>

        {/* Account Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-sm font-medium text-muted-foreground mb-3 px-1">
            {t('account')}
          </h2>
          <Card className="divide-y divide-border">
            <button 
              className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
              onClick={() => {
                setEditName(profile?.full_name || '');
                setDailyGoal(profile?.daily_goal_minutes || 15);
                setShowEditProfile(true);
              }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                  <User className="h-5 w-5 text-accent" />
                </div>
                <div className="text-left">
                  <p className="font-medium">{t('editProfile')}</p>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </button>

            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center">
                  <Bell className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <p className="font-medium">{t('studyReminder')}</p>
                  <p className="text-sm text-muted-foreground">
                    {reminderEnabled ? `${reminderSettings.time}` : 'Nonaktif'}
                  </p>
                </div>
              </div>
              <Switch 
                checked={reminderEnabled}
                onCheckedChange={handleToggleReminder}
              />
            </div>

            <div className="p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-xp/10 flex items-center justify-center">
                  <Target className="h-5 w-5 text-xp" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{t('dailyGoal')}</p>
                  <p className="text-sm text-muted-foreground">{dailyGoal} {t('minutes')}</p>
                </div>
              </div>
              <Slider
                value={[dailyGoal]}
                onValueChange={([val]) => setDailyGoal(val)}
                onValueCommit={([val]) => updateProfileMutation.mutate({ daily_goal_minutes: val })}
                min={5}
                max={60}
                step={5}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>5 {t('minutes')}</span>
                <span>60 {t('minutes')}</span>
              </div>
            </div>
          </Card>
        </motion.section>

        {/* About Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-sm font-medium text-muted-foreground mb-3 px-1">
            {t('about')}
          </h2>
          <Card className="divide-y divide-border">
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                  <Shield className="h-5 w-5 text-muted-foreground" />
                </div>
                <p className="font-medium">{t('privacy')}</p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </div>

            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                  <HelpCircle className="h-5 w-5 text-muted-foreground" />
                </div>
                <p className="font-medium">{t('helpSupport')}</p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </div>

            <div className="p-4 flex items-center justify-between">
              <p className="text-muted-foreground">{t('version')}</p>
              <p className="text-sm text-muted-foreground">1.0.0</p>
            </div>
          </Card>
        </motion.section>

        {/* Danger Zone */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="divide-y divide-border">
            <button 
              className="w-full p-4 flex items-center gap-3 hover:bg-muted/50 transition-colors text-left"
              onClick={() => setShowLogoutConfirm(true)}
            >
              <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                <LogOut className="h-5 w-5 text-destructive" />
              </div>
              <p className="font-medium text-destructive">{t('logout')}</p>
            </button>

            <button 
              className="w-full p-4 flex items-center gap-3 hover:bg-muted/50 transition-colors text-left"
              onClick={() => setShowDeleteConfirm(true)}
            >
              <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                <Trash2 className="h-5 w-5 text-destructive" />
              </div>
              <p className="font-medium text-destructive">{t('deleteAccount')}</p>
            </button>
          </Card>
        </motion.section>
      </div>

      {/* Language Selection Dialog */}
      <Dialog open={showLanguageSelect} onOpenChange={setShowLanguageSelect}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('language')}</DialogTitle>
            <DialogDescription>
              Pilih bahasa tampilan aplikasi
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  setLanguage(lang.code);
                  setShowLanguageSelect(false);
                }}
                className={`w-full p-4 flex items-center justify-between rounded-xl border-2 transition-all ${
                  language === lang.code 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:border-muted-foreground/30'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{lang.flag}</span>
                  <div className="text-left">
                    <p className="font-medium">{lang.nativeName}</p>
                    <p className="text-sm text-muted-foreground">{lang.name}</p>
                  </div>
                </div>
                {language === lang.code && (
                  <Check className="h-5 w-5 text-primary" />
                )}
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Profile Dialog */}
      <Dialog open={showEditProfile} onOpenChange={setShowEditProfile}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('editProfile')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t('name')}</Label>
              <Input
                id="name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Masukkan nama"
              />
            </div>
            <div className="space-y-2">
              <Label>{t('email')}</Label>
              <Input value={user?.email || ''} disabled className="bg-muted" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditProfile(false)}>
              {t('cancel')}
            </Button>
            <Button onClick={handleSaveProfile}>
              {t('save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Logout Confirmation */}
      <AlertDialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Keluar dari Akun?</AlertDialogTitle>
            <AlertDialogDescription>
              Anda akan keluar dari aplikasi. Progress belajar Anda tetap tersimpan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout} className="bg-destructive hover:bg-destructive/90">
              Keluar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Account Confirmation */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Akun?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Semua data Anda akan dihapus secara permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive hover:bg-destructive/90">
              Hapus Akun
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
