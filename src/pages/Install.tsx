import { Download, Smartphone, CheckCircle2, Wifi, WifiOff, Zap, Shield, Bell } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { usePWA } from '@/hooks/usePWA';
import { AppLayout } from '@/components/layout/AppLayout';

export default function Install() {
  const { 
    isInstalled, 
    isInstallable, 
    isOnline, 
    promptInstall, 
    canPromptInstall,
    getInstallInstructions 
  } = usePWA();
  
  const instructions = getInstallInstructions();
  
  const features = [
    {
      icon: <WifiOff className="h-5 w-5" />,
      title: 'Belajar Offline',
      description: 'Akses pelajaran tanpa koneksi internet'
    },
    {
      icon: <Zap className="h-5 w-5" />,
      title: 'Akses Cepat',
      description: 'Buka langsung dari home screen'
    },
    {
      icon: <Bell className="h-5 w-5" />,
      title: 'Notifikasi',
      description: 'Pengingat belajar harian'
    },
    {
      icon: <Shield className="h-5 w-5" />,
      title: 'Aman & Privat',
      description: 'Data tersimpan di perangkat Anda'
    },
  ];
  
  return (
    <AppLayout>
      <div className="p-4 pb-24 space-y-6">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="w-20 h-20 mx-auto bg-primary/10 rounded-2xl flex items-center justify-center">
            <Smartphone className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Install Rafiq Nihon</h1>
          <p className="text-muted-foreground">
            Dapatkan pengalaman belajar terbaik dengan menginstall aplikasi
          </p>
        </div>
        
        {/* Status */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {isOnline ? (
                  <Wifi className="h-5 w-5 text-green-500" />
                ) : (
                  <WifiOff className="h-5 w-5 text-yellow-500" />
                )}
                <div>
                  <p className="font-medium">
                    {isOnline ? 'Terhubung' : 'Mode Offline'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {isOnline 
                      ? 'Semua fitur tersedia' 
                      : 'Beberapa fitur terbatas'
                    }
                  </p>
                </div>
              </div>
              <Badge variant={isOnline ? 'default' : 'secondary'}>
                {isOnline ? 'Online' : 'Offline'}
              </Badge>
            </div>
          </CardContent>
        </Card>
        
        {/* Install Section */}
        {isInstalled ? (
          <Card className="border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950">
            <CardContent className="p-6 text-center">
              <CheckCircle2 className="h-12 w-12 mx-auto text-green-500 mb-3" />
              <h3 className="text-lg font-semibold text-green-700 dark:text-green-300">
                Aplikasi Terinstall!
              </h3>
              <p className="text-green-600 dark:text-green-400 mt-1">
                Anda sudah menginstall Rafiq Nihon. Nikmati belajar offline!
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Install Aplikasi
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {canPromptInstall && isInstallable ? (
                <Button 
                  onClick={promptInstall} 
                  className="w-full" 
                  size="lg"
                >
                  <Download className="mr-2 h-5 w-5" />
                  Install Sekarang
                </Button>
              ) : (
                <div className="space-y-3">
                  <Badge variant="outline">{instructions.platform}</Badge>
                  <ol className="space-y-2">
                    {instructions.steps.map((step, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center">
                          {index + 1}
                        </span>
                        <span className="text-sm pt-0.5">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </CardContent>
          </Card>
        )}
        
        {/* Features */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Keuntungan Install</h2>
          <div className="grid grid-cols-2 gap-3">
            {features.map((feature, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="text-primary mb-2">{feature.icon}</div>
                  <h3 className="font-medium text-sm">{feature.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
