import { ReactNode } from 'react';
import { BottomNav } from './BottomNav';
import { InstallBanner } from '@/components/pwa/InstallBanner';
import { OfflineBanner } from '@/components/pwa/OfflineBanner';

interface AppLayoutProps {
  children: ReactNode;
  hideNav?: boolean;
}

export function AppLayout({ children, hideNav = false }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <OfflineBanner />
      <main className={hideNav ? "" : "pb-24"}>
        {children}
      </main>
      {!hideNav && (
        <>
          <InstallBanner />
          <BottomNav />
        </>
      )}
    </div>
  );
}
