import { WifiOff, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePWA } from '@/hooks/usePWA';

export function OfflineBanner() {
  const { isOnline } = usePWA();
  
  if (isOnline) {
    return null;
  }
  
  const handleRefresh = () => {
    window.location.reload();
  };
  
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-500 text-yellow-950 py-2 px-4">
      <div className="flex items-center justify-center gap-3 text-sm">
        <WifiOff className="h-4 w-4" />
        <span>Anda sedang offline. Beberapa fitur mungkin terbatas.</span>
        <Button
          size="sm"
          variant="ghost"
          onClick={handleRefresh}
          className="h-7 text-yellow-950 hover:bg-yellow-600/50"
        >
          <RefreshCw className="h-3 w-3 mr-1" />
          Coba Lagi
        </Button>
      </div>
    </div>
  );
}
