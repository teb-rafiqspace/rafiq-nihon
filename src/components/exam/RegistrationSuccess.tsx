import { motion } from 'framer-motion';
import { CheckCircle2, Copy, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface RegistrationSuccessProps {
  onViewRegistrations: () => void;
  onBackToSchedules: () => void;
}

export function RegistrationSuccess({ onViewRegistrations, onBackToSchedules }: RegistrationSuccessProps) {
  const bankAccount = '123-456-7890';

  const copyToClipboard = () => {
    navigator.clipboard.writeText(bankAccount);
    toast.success('Nomor rekening disalin!');
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-8 space-y-6"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', delay: 0.2 }}
      >
        <CheckCircle2 className="h-20 w-20 text-accent mx-auto" />
      </motion.div>

      <div>
        <h1 className="text-2xl font-bold text-foreground">Pendaftaran Berhasil!</h1>
        <p className="text-muted-foreground mt-2">
          Silakan selesaikan pembayaran untuk mengkonfirmasi pendaftaran
        </p>
      </div>

      <div className="bg-card rounded-2xl border border-border p-6 text-left space-y-4">
        <h2 className="font-semibold text-center">💳 Instruksi Pembayaran</h2>
        
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Bank:</span>
            <span className="font-medium">BCA</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Nomor Rekening:</span>
            <div className="flex items-center gap-2">
              <span className="font-medium font-mono">{bankAccount}</span>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={copyToClipboard}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Nama:</span>
            <span className="font-medium">PT Rafiq Nihon Indonesia</span>
          </div>
        </div>

        <div className="bg-warning/10 rounded-lg p-3 text-sm">
          <p className="font-medium text-warning-foreground">⚠️ Penting:</p>
          <ul className="text-muted-foreground mt-1 space-y-1">
            <li>• Transfer sesuai nominal yang tertera</li>
            <li>• Cantumkan nama Anda di berita transfer</li>
            <li>• Upload bukti pembayaran di halaman pendaftaran</li>
          </ul>
        </div>
      </div>

      <div className="space-y-3">
        <Button 
          className="w-full bg-gradient-primary text-primary-foreground" 
          size="lg"
          onClick={onViewRegistrations}
        >
          Lihat Pendaftaran Saya
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
        
        <Button 
          variant="outline" 
          className="w-full"
          onClick={onBackToSchedules}
        >
          Kembali ke Jadwal Ujian
        </Button>
      </div>
    </motion.div>
  );
}
