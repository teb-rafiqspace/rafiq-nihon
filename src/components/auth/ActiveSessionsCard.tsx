import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Smartphone, 
  Monitor, 
  Globe, 
  LogOut, 
  Loader2,
  Shield,
  RefreshCw
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
import { useSessions } from '@/hooks/useSessions';
import { toast } from '@/hooks/use-toast';

export function ActiveSessionsCard() {
  const { sessions, isLoading, logoutAllSessions, isLoggingOut, refetch } = useSessions();
  const [showLogoutAll, setShowLogoutAll] = useState(false);

  const handleLogoutAll = async () => {
    const { error } = await logoutAllSessions();
    
    if (error) {
      toast({
        title: 'Gagal logout',
        description: error,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Berhasil',
        description: 'Semua sesi lain telah dikeluarkan',
      });
      setShowLogoutAll(false);
    }
  };

  const getDeviceIcon = (userAgent: string) => {
    const ua = userAgent.toLowerCase();
    if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
      return Smartphone;
    }
    return Monitor;
  };

  const getDeviceName = (userAgent: string) => {
    const ua = userAgent.toLowerCase();
    
    if (ua.includes('iphone')) return 'iPhone';
    if (ua.includes('ipad')) return 'iPad';
    if (ua.includes('android')) return 'Android';
    if (ua.includes('windows')) return 'Windows PC';
    if (ua.includes('macintosh') || ua.includes('mac os')) return 'Mac';
    if (ua.includes('linux')) return 'Linux';
    
    return 'Perangkat Lain';
  };

  const getBrowserName = (userAgent: string) => {
    const ua = userAgent.toLowerCase();
    
    if (ua.includes('chrome') && !ua.includes('edg')) return 'Chrome';
    if (ua.includes('firefox')) return 'Firefox';
    if (ua.includes('safari') && !ua.includes('chrome')) return 'Safari';
    if (ua.includes('edg')) return 'Edge';
    if (ua.includes('opera') || ua.includes('opr')) return 'Opera';
    
    return 'Browser';
  };

  const formatLastActive = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 5) return 'Aktif sekarang';
    if (diffMins < 60) return `${diffMins} menit lalu`;
    if (diffHours < 24) return `${diffHours} jam lalu`;
    if (diffDays < 7) return `${diffDays} hari lalu`;
    
    return date.toLocaleDateString('id-ID', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <h2 className="text-sm font-medium text-muted-foreground mb-3 px-1">
        Keamanan Sesi
      </h2>
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium">Sesi Aktif</p>
              <p className="text-sm text-muted-foreground">
                {isLoading ? 'Memuat...' : `${sessions.length} perangkat`}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Globe className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Tidak ada sesi aktif lainnya</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map((session, index) => {
              const DeviceIcon = getDeviceIcon(session.user_agent);
              const isCurrentSession = session.is_current;
              
              return (
                <div
                  key={session.id || index}
                  className={`flex items-center gap-3 p-3 rounded-lg ${
                    isCurrentSession ? 'bg-primary/5 border border-primary/20' : 'bg-muted/50'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    isCurrentSession ? 'bg-primary/10' : 'bg-muted'
                  }`}>
                    <DeviceIcon className={`h-5 w-5 ${
                      isCurrentSession ? 'text-primary' : 'text-muted-foreground'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate">
                        {getDeviceName(session.user_agent)}
                      </p>
                      {isCurrentSession && (
                        <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                          Sesi Ini
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {getBrowserName(session.user_agent)} • {formatLastActive(session.created_at)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {sessions.length > 1 && (
          <Button
            variant="outline"
            className="w-full mt-4 text-destructive hover:text-destructive"
            onClick={() => setShowLogoutAll(true)}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Memproses...
              </>
            ) : (
              <>
                <LogOut className="h-4 w-4 mr-2" />
                Logout dari Semua Perangkat Lain
              </>
            )}
          </Button>
        )}
      </Card>

      <AlertDialog open={showLogoutAll} onOpenChange={setShowLogoutAll}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Logout Semua Perangkat?</AlertDialogTitle>
            <AlertDialogDescription>
              Anda akan keluar dari semua perangkat lain kecuali perangkat ini. 
              Anda perlu login ulang di perangkat lain.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleLogoutAll}
              className="bg-destructive hover:bg-destructive/90"
            >
              Logout Semua
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.section>
  );
}
