import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CreditCard, AlertCircle } from 'lucide-react';

interface PaymentScreenProps {
  plan: 'monthly' | 'yearly';
  onConfirm: () => void;
  onBack: () => void;
  isLoading: boolean;
}

export function PaymentScreen({ plan, onConfirm, onBack, isLoading }: PaymentScreenProps) {
  const price = plan === 'monthly' ? 'Rp 49.000/bln' : 'Rp 399.000/thn';
  
  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          disabled={isLoading}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-xl font-bold">Pembayaran</h2>
        </div>
      </div>
      
      {/* Demo Notice */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6"
      >
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-amber-800">DEMO MODE - POC</p>
            <p className="text-sm text-amber-700">
              Ini adalah simulasi pembayaran untuk demonstrasi. Tidak ada pembayaran nyata yang diproses.
            </p>
          </div>
        </div>
      </motion.div>
      
      {/* Payment Summary */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-muted/50 rounded-xl p-4 mb-6"
      >
        <div className="flex justify-between items-center mb-3">
          <span className="text-muted-foreground">Total Hari Ini</span>
          <span className="text-2xl font-bold text-success">Rp 0</span>
        </div>
        <div className="text-sm text-muted-foreground">
          <span className="font-medium">(Trial Gratis 7 Hari)</span>
        </div>
        <div className="border-t border-border mt-3 pt-3">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Setelah 7 hari</span>
            <span className="font-semibold">{price}</span>
          </div>
        </div>
      </motion.div>
      
      {/* Confirm Button */}
      <Button
        variant="premium"
        size="lg"
        className="w-full"
        onClick={onConfirm}
        disabled={isLoading}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Memproses...
          </span>
        ) : (
          'Konfirmasi Upgrade'
        )}
      </Button>
      
      <p className="text-xs text-center text-muted-foreground mt-3">
        Dengan melanjutkan, kamu menyetujui Syarat & Ketentuan kami
      </p>
    </div>
  );
}
