import { motion, AnimatePresence } from 'framer-motion';
import { X, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Certificate } from '@/hooks/useCertificates';
import confetti from 'canvas-confetti';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface CertificateUnlockedModalProps {
  certificate: Certificate | null;
  testName: string;
  onClose: () => void;
}

export function CertificateUnlockedModal({ certificate, testName, onClose }: CertificateUnlockedModalProps) {
  const navigate = useNavigate();

  useEffect(() => {
    if (certificate) {
      const duration = 3000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 4,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.7 },
          colors: ['#FFD700', '#FFA500', '#C9A84C', '#F4D784']
        });
        confetti({
          particleCount: 4,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.7 },
          colors: ['#FFD700', '#FFA500', '#C9A84C', '#F4D784']
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };

      frame();
    }
  }, [certificate]);

  const handleViewCertificate = () => {
    if (certificate) {
      navigate(`/certificate/${certificate.id}`);
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {certificate && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="bg-card rounded-3xl p-8 max-w-sm w-full text-center shadow-elevated border border-amber-300/50"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition-colors"
            >
              <X className="h-5 w-5 text-muted-foreground" />
            </button>

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 1] }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center justify-center mb-4"
            >
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                <Award className="h-10 w-10 text-white" />
              </div>
            </motion.div>

            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-xl font-bold text-amber-600 dark:text-amber-400 mb-2"
            >
              Selamat! Sertifikat Diperoleh!
            </motion.h2>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-muted-foreground mb-2"
            >
              Kamu berhasil lulus {testName}
            </motion.p>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 mb-6"
            >
              <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">
                {certificate.score_percent}%
              </p>
              <p className="text-sm text-amber-600/80 dark:text-amber-400/80">
                {certificate.score}/{certificate.total_questions} benar
              </p>
              <p className="text-xs text-muted-foreground mt-1 font-mono">
                {certificate.certificate_number}
              </p>
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex gap-2"
            >
              <Button
                onClick={handleViewCertificate}
                className="flex-1 bg-amber-600 hover:bg-amber-700 text-white"
              >
                <Award className="h-4 w-4 mr-2" />
                Lihat Sertifikat
              </Button>
              <Button variant="outline" onClick={onClose} className="flex-1">
                Tutup
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
