import { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, BellOff, Clock, Check } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useStudyReminder } from '@/hooks/useStudyReminder';
import { toast } from '@/hooks/use-toast';

const TIME_OPTIONS = [
  { value: '07:00', label: '07:00' },
  { value: '08:00', label: '08:00' },
  { value: '09:00', label: '09:00' },
  { value: '10:00', label: '10:00' },
  { value: '12:00', label: '12:00' },
  { value: '18:00', label: '18:00' },
  { value: '19:00', label: '19:00' },
  { value: '20:00', label: '20:00' },
  { value: '21:00', label: '21:00' },
];

export function ReminderSettingsCard() {
  const { 
    settings, 
    updateSettings,
    notificationPermission,
    requestNotificationPermission
  } = useStudyReminder();
  
  const [selectedTime, setSelectedTime] = useState(settings.time);

  const handleToggle = async (enabled: boolean) => {
    if (enabled && notificationPermission !== 'granted') {
      const granted = await requestNotificationPermission();
      if (!granted) {
        toast({
          title: 'Izin notifikasi diperlukan',
          description: 'Aktifkan notifikasi di pengaturan browser untuk pengingat belajar.',
          variant: 'destructive'
        });
        return;
      }
    }
    
    updateSettings({ enabled });
    toast({
      title: enabled ? 'Pengingat diaktifkan' : 'Pengingat dinonaktifkan',
      description: enabled 
        ? `Kamu akan diingatkan setiap hari pukul ${selectedTime}`
        : 'Pengingat belajar harian telah dinonaktifkan'
    });
  };

  const handleTimeChange = (time: string) => {
    setSelectedTime(time);
    updateSettings({ time });
    
    if (settings.enabled) {
      toast({
        title: 'Waktu pengingat diperbarui',
        description: `Pengingat akan muncul setiap hari pukul ${time}`
      });
    }
  };

  return (
    <Card className="bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Bell className="h-5 w-5 text-primary" />
          Pengingat Belajar Harian
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Enable/Disable Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {settings.enabled ? (
              <Bell className="h-5 w-5 text-primary" />
            ) : (
              <BellOff className="h-5 w-5 text-muted-foreground" />
            )}
            <div>
              <p className="font-medium text-sm">Aktifkan Pengingat</p>
              <p className="text-xs text-muted-foreground">
                Ingatkan saya untuk belajar setiap hari
              </p>
            </div>
          </div>
          <Switch
            checked={settings.enabled}
            onCheckedChange={handleToggle}
          />
        </div>
        
        {/* Time Selection */}
        {settings.enabled && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3"
          >
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Pilih waktu pengingat</span>
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              {TIME_OPTIONS.map((option) => (
                <Button
                  key={option.value}
                  variant={selectedTime === option.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleTimeChange(option.value)}
                  className="relative"
                >
                  {option.label}
                  {selectedTime === option.value && (
                    <Check className="h-3 w-3 ml-1" />
                  )}
                </Button>
              ))}
            </div>
            
            {/* Permission status */}
            {notificationPermission === 'denied' && (
              <p className="text-xs text-destructive bg-destructive/10 p-2 rounded-lg">
                ⚠️ Notifikasi browser diblokir. Aktifkan di pengaturan browser untuk menerima pengingat.
              </p>
            )}
            
            {notificationPermission === 'default' && (
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={requestNotificationPermission}
              >
                <Bell className="h-4 w-4 mr-2" />
                Aktifkan Notifikasi Browser
              </Button>
            )}
          </motion.div>
        )}
        
        {/* Info text */}
        <p className="text-xs text-muted-foreground">
          Pengingat akan menampilkan topik yang perlu diperkuat berdasarkan riwayat belajarmu.
        </p>
      </CardContent>
    </Card>
  );
}
