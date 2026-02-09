import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, Loader2, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useDeleteAccount } from '@/hooks/useDeleteAccount';
import { toast } from '@/hooks/use-toast';

interface DeleteAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteAccountDialog({ open, onOpenChange }: DeleteAccountDialogProps) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const navigate = useNavigate();
  const { deleteAccount, isDeleting } = useDeleteAccount();

  const canDelete = password.length >= 6 && confirmText === 'HAPUS';

  const handleDelete = async () => {
    if (!canDelete) return;

    const { error } = await deleteAccount(password);
    
    if (error) {
      toast({
        title: 'Gagal menghapus akun',
        description: error,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Akun berhasil dihapus',
        description: 'Semua data Anda telah dihapus secara permanen.',
      });
      navigate('/');
    }
  };

  const handleClose = () => {
    setPassword('');
    setConfirmText('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <DialogTitle className="text-destructive">Hapus Akun Permanen</DialogTitle>
              <DialogDescription>
                Tindakan ini tidak dapat dibatalkan
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-4">
            <p className="text-sm text-muted-foreground">
              Menghapus akun akan menghilangkan:
            </p>
            <ul className="text-sm text-muted-foreground mt-2 space-y-1">
              <li>• Semua progress belajar dan XP</li>
              <li>• Riwayat chat dengan Rafiq AI</li>
              <li>• Bookmark dan catatan</li>
              <li>• Data langganan</li>
            </ul>
          </div>

          <div className="space-y-2">
            <Label htmlFor="delete-password">Konfirmasi Password</Label>
            <div className="relative">
              <Input
                id="delete-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Masukkan password Anda"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-text">
              Ketik <span className="font-bold text-destructive">HAPUS</span> untuk konfirmasi
            </Label>
            <Input
              id="confirm-text"
              type="text"
              placeholder="HAPUS"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose} disabled={isDeleting}>
            Batal
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={!canDelete || isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Menghapus...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Hapus Akun
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
