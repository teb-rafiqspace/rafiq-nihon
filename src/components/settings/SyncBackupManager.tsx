import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Cloud, 
  CloudUpload, 
  Download, 
  Upload, 
  RefreshCw, 
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
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
import { useSyncBackup } from '@/hooks/useSyncBackup';
import { useI18n } from '@/lib/i18n';

export function SyncBackupManager() {
  const { t } = useI18n();
  const { 
    status, 
    syncToCloud, 
    downloadBackup, 
    importBackup,
    clearLocalData 
  } = useSyncBackup();

  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setPendingFile(file);
      setShowRestoreConfirm(true);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleConfirmRestore = async () => {
    if (pendingFile) {
      await importBackup(pendingFile);
      setPendingFile(null);
    }
    setShowRestoreConfirm(false);
  };

  const isLoading = status.isSyncing || status.isRestoring;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <h2 className="text-sm font-medium text-muted-foreground mb-3 px-1">
        Sinkronisasi & Backup
      </h2>
      <Card className="p-4 space-y-4">
        {/* Sync Status */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Cloud className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="font-medium">Status Sinkronisasi</p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {status.lastSyncAt ? (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                  <span>Terakhir: {new Date(status.lastSyncAt).toLocaleDateString('id-ID', { 
                    day: 'numeric', 
                    month: 'short', 
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Belum pernah disinkronkan</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        {isLoading && status.syncProgress > 0 && (
          <div className="space-y-2">
            <Progress value={status.syncProgress} className="h-2" />
            <p className="text-xs text-muted-foreground text-center">
              {status.isSyncing ? 'Menyinkronkan...' : 'Memulihkan...'} {status.syncProgress}%
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={syncToCloud}
            disabled={isLoading}
          >
            {status.isSyncing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            <span>Sinkronkan</span>
          </Button>

          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={downloadBackup}
            disabled={isLoading}
          >
            <Download className="h-4 w-4" />
            <span>Unduh Backup</span>
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
          >
            {status.isRestoring ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            <span>Pulihkan</span>
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileSelect}
            className="hidden"
          />

          <Button
            variant="outline"
            className="flex items-center gap-2 text-destructive hover:text-destructive"
            onClick={() => setShowClearConfirm(true)}
            disabled={isLoading}
          >
            <Trash2 className="h-4 w-4" />
            <span>Hapus Lokal</span>
          </Button>
        </div>

        {/* Info */}
        <div className="bg-muted/50 rounded-lg p-3">
          <p className="text-xs text-muted-foreground">
            <strong>Tips:</strong> Data progress belajar Anda otomatis tersimpan di cloud. 
            Gunakan fitur backup untuk menyimpan salinan lokal data Anda.
          </p>
        </div>
      </Card>

      {/* Clear Local Data Confirmation */}
      <AlertDialog open={showClearConfirm} onOpenChange={setShowClearConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Data Lokal?</AlertDialogTitle>
            <AlertDialogDescription>
              Ini akan menghapus cache dan data sementara dari perangkat ini. 
              Data progress di cloud tidak akan terpengaruh.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction 
              onClick={clearLocalData}
              className="bg-destructive hover:bg-destructive/90"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Restore Confirmation */}
      <AlertDialog open={showRestoreConfirm} onOpenChange={setShowRestoreConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Pulihkan dari Backup?</AlertDialogTitle>
            <AlertDialogDescription>
              Data saat ini akan diganti dengan data dari file backup. 
              Pastikan file yang dipilih adalah backup yang valid dari akun Anda.
              {pendingFile && (
                <span className="block mt-2 font-medium text-foreground">
                  File: {pendingFile.name}
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingFile(null)}>
              Batal
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmRestore}>
              Pulihkan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.section>
  );
}
