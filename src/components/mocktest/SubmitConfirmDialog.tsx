import React from 'react';
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
import { AlertTriangle } from 'lucide-react';

interface SubmitConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  unansweredCount: number;
  flaggedCount: number;
}

export function SubmitConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  unansweredCount,
  flaggedCount
}: SubmitConfirmDialogProps) {
  const hasWarnings = unansweredCount > 0 || flaggedCount > 0;
  
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            {hasWarnings && <AlertTriangle className="h-5 w-5 text-amber-500" />}
            Yakin submit?
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            {unansweredCount > 0 && (
              <p className="text-amber-600">
                ⚠️ {unansweredCount} soal belum dijawab
              </p>
            )}
            {flaggedCount > 0 && (
              <p className="text-amber-600">
                🚩 {flaggedCount} soal ditandai untuk review
              </p>
            )}
            {!hasWarnings && (
              <p>Semua soal sudah dijawab. Siap untuk submit?</p>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Kembali</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>
            Submit Tes
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
