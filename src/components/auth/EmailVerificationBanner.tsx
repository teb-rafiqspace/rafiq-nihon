import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, RefreshCw, X, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth';
import { toast } from '@/hooks/use-toast';

interface EmailVerificationBannerProps {
  onDismiss?: () => void;
}

export function EmailVerificationBanner({ onDismiss }: EmailVerificationBannerProps) {
  const { user, resendVerificationEmail } = useAuth();
  const [isResending, setIsResending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleResend = async () => {
    if (!user?.email) return;
    
    setIsResending(true);
    try {
      const { error } = await resendVerificationEmail(user.email);
      if (error) {
        toast({
          title: 'Gagal mengirim email',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        setEmailSent(true);
        toast({
          title: 'Email terkirim!',
          description: 'Silakan cek inbox email Anda',
        });
      }
    } finally {
      setIsResending(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-warning/10 border border-warning/20 rounded-xl p-4 mb-4"
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-warning/20 flex items-center justify-center shrink-0">
          {emailSent ? (
            <CheckCircle className="h-5 w-5 text-warning" />
          ) : (
            <Mail className="h-5 w-5 text-warning" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground">
            {emailSent ? 'Email Terkirim!' : 'Verifikasi Email Anda'}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {emailSent 
              ? 'Silakan cek inbox email Anda dan klik link verifikasi.'
              : `Kami telah mengirim link verifikasi ke ${user?.email}. Silakan cek inbox Anda.`
            }
          </p>
          {!emailSent && (
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={handleResend}
              disabled={isResending}
            >
              {isResending ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Mengirim...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Kirim Ulang Email
                </>
              )}
            </Button>
          )}
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
    </motion.div>
  );
}
