import { useState, useEffect, useCallback } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface PWAStatus {
  isInstalled: boolean;
  isInstallable: boolean;
  isOnline: boolean;
  isUpdateAvailable: boolean;
}

export function usePWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [status, setStatus] = useState<PWAStatus>({
    isInstalled: false,
    isInstallable: false,
    isOnline: navigator.onLine,
    isUpdateAvailable: false,
  });

  useEffect(() => {
    // Check if app is installed
    const checkInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true;
      
      setStatus(prev => ({ ...prev, isInstalled: isStandalone }));
    };
    
    checkInstalled();
    
    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setStatus(prev => ({ ...prev, isInstallable: true }));
    };
    
    // Listen for app installed
    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setStatus(prev => ({ 
        ...prev, 
        isInstalled: true, 
        isInstallable: false 
      }));
    };
    
    // Listen for online/offline
    const handleOnline = () => {
      setStatus(prev => ({ ...prev, isOnline: true }));
    };
    
    const handleOffline = () => {
      setStatus(prev => ({ ...prev, isOnline: false }));
    };
    
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const promptInstall = useCallback(async () => {
    if (!deferredPrompt) {
      console.log('Install prompt not available');
      return false;
    }
    
    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setStatus(prev => ({ ...prev, isInstallable: false }));
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Install prompt error:', error);
      return false;
    }
  }, [deferredPrompt]);

  const getInstallInstructions = useCallback(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    
    if (/iphone|ipad|ipod/.test(userAgent)) {
      return {
        platform: 'iOS',
        steps: [
          'Ketuk tombol Share di Safari',
          'Scroll ke bawah dan pilih "Add to Home Screen"',
          'Ketuk "Add" untuk menginstall'
        ]
      };
    }
    
    if (/android/.test(userAgent)) {
      return {
        platform: 'Android',
        steps: [
          'Ketuk menu (tiga titik) di browser',
          'Pilih "Install app" atau "Add to Home screen"',
          'Konfirmasi instalasi'
        ]
      };
    }
    
    return {
      platform: 'Desktop',
      steps: [
        'Klik ikon install di address bar browser',
        'Atau buka menu browser dan pilih "Install Rafiq Nihon"',
        'Konfirmasi instalasi'
      ]
    };
  }, []);

  return {
    ...status,
    promptInstall,
    getInstallInstructions,
    canPromptInstall: !!deferredPrompt,
  };
}
