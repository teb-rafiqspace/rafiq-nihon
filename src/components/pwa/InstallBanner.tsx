import { Download, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { usePWA } from '@/hooks/usePWA';

export function InstallBanner() {
  const navigate = useNavigate();
  const { isInstalled, canPromptInstall, promptInstall } = usePWA();
  const [dismissed, setDismissed] = useState(false);
  
  useEffect(() => {
    const wasDismissed = localStorage.getItem('pwa-install-dismissed');
    if (wasDismissed) {
      const dismissedTime = parseInt(wasDismissed, 10);
      // Show again after 7 days
      if (Date.now() - dismissedTime < 7 * 24 * 60 * 60 * 1000) {
        setDismissed(true);
      }
    }
  }, []);
  
  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };
  
  const handleInstall = async () => {
    if (canPromptInstall) {
      const installed = await promptInstall();
      if (installed) {
        setDismissed(true);
      }
    } else {
      navigate('/install');
    }
  };
  
  if (isInstalled || dismissed) {
    return null;
  }
  
  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 animate-in slide-in-from-bottom-4">
      <div className="bg-primary text-primary-foreground rounded-xl p-4 shadow-lg flex items-center gap-3">
        <div className="flex-shrink-0 w-10 h-10 bg-primary-foreground/20 rounded-lg flex items-center justify-center">
          <Download className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm">Install Rafiq Nihon</p>
          <p className="text-xs opacity-90 truncate">
            Belajar offline & akses cepat
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={handleInstall}
            className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
          >
            Install
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={handleDismiss}
            className="h-8 w-8 hover:bg-primary-foreground/20"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
