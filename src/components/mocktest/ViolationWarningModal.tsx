import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  MonitorX,
  AppWindow,
  Maximize,
  ClipboardCopy,
  Code2,
  ScanFace,
  Users,
  AudioLines,
  AlertTriangle,
  ShieldAlert,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ViolationWarningModalProps {
  isOpen: boolean;
  violation: { type: string; detail: string } | null;
  warningCount: number;
  maxWarnings: number;
  onDismiss: () => void;
}

const violationMessages: Record<string, { label: string; icon: React.ReactNode }> = {
  tab_switch: {
    label: 'Anda meninggalkan halaman tes',
    icon: <MonitorX className="h-6 w-6" />,
  },
  window_blur: {
    label: 'Jendela tes kehilangan fokus',
    icon: <AppWindow className="h-6 w-6" />,
  },
  fullscreen_exit: {
    label: 'Anda keluar dari mode layar penuh',
    icon: <Maximize className="h-6 w-6" />,
  },
  copy_paste: {
    label: 'Salin/tempel tidak diperbolehkan',
    icon: <ClipboardCopy className="h-6 w-6" />,
  },
  devtools: {
    label: 'Developer tools terdeteksi',
    icon: <Code2 className="h-6 w-6" />,
  },
  no_face: {
    label: 'Wajah tidak terdeteksi oleh kamera',
    icon: <ScanFace className="h-6 w-6" />,
  },
  multiple_faces: {
    label: 'Lebih dari satu wajah terdeteksi',
    icon: <Users className="h-6 w-6" />,
  },
  speech_detected: {
    label: 'Suara percakapan terdeteksi',
    icon: <AudioLines className="h-6 w-6" />,
  },
};

export function ViolationWarningModal({
  isOpen,
  violation,
  warningCount,
  maxWarnings,
  onDismiss,
}: ViolationWarningModalProps) {
  const config = violation
    ? violationMessages[violation.type] ?? {
        label: violation.detail || 'Pelanggaran terdeteksi',
        icon: <AlertTriangle className="h-6 w-6" />,
      }
    : null;

  const progressValue = (warningCount / maxWarnings) * 100;
  const isLastWarning = warningCount >= maxWarnings - 1;
  const remainingWarnings = maxWarnings - warningCount;

  return (
    <AlertDialog open={isOpen} onOpenChange={() => onDismiss()}>
      <AlertDialogContent className="max-w-sm">
        <AlertDialogHeader className="space-y-4">
          {/* Icon */}
          <div className="flex justify-center">
            <div
              className={cn(
                'w-16 h-16 rounded-2xl flex items-center justify-center',
                isLastWarning
                  ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                  : 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
              )}
            >
              {config?.icon ?? <ShieldAlert className="h-6 w-6" />}
            </div>
          </div>

          <AlertDialogTitle className="text-center text-lg">
            <span
              className={cn(
                isLastWarning
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-amber-600 dark:text-amber-400'
              )}
            >
              Pelanggaran Terdeteksi
            </span>
          </AlertDialogTitle>

          <AlertDialogDescription asChild>
            <div className="space-y-4">
              {/* Violation message */}
              <p className="text-center text-sm font-medium text-foreground">
                {config?.label}
              </p>

              {violation?.detail && (
                <p className="text-center text-xs text-muted-foreground">
                  {violation.detail}
                </p>
              )}

              {/* Warning count */}
              <div
                className={cn(
                  'rounded-xl p-3 text-center space-y-2',
                  isLastWarning
                    ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                    : 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800'
                )}
              >
                <p
                  className={cn(
                    'text-sm font-semibold',
                    isLastWarning
                      ? 'text-red-700 dark:text-red-300'
                      : 'text-amber-700 dark:text-amber-300'
                  )}
                >
                  Peringatan {warningCount} dari {maxWarnings}
                </p>

                {/* Progress bar */}
                <Progress
                  value={progressValue}
                  className={cn(
                    'h-2',
                    isLastWarning
                      ? '[&>div]:bg-red-500'
                      : '[&>div]:bg-amber-500'
                  )}
                />

                <p
                  className={cn(
                    'text-xs',
                    isLastWarning
                      ? 'text-red-600 dark:text-red-400 font-semibold'
                      : 'text-amber-600 dark:text-amber-400'
                  )}
                >
                  {remainingWarnings <= 1
                    ? 'Satu pelanggaran lagi akan mengakhiri tes Anda.'
                    : `${remainingWarnings} pelanggaran lagi akan mengakhiri tes Anda.`}
                </p>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="sm:justify-center">
          <AlertDialogAction asChild>
            <Button
              variant={isLastWarning ? 'destructive' : 'default'}
              className="w-full"
              onClick={onDismiss}
            >
              {isLastWarning ? 'Saya Mengerti' : 'Lanjutkan Tes'}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
