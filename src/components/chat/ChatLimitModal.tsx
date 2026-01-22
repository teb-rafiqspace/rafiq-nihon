import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Crown } from 'lucide-react';

interface ChatLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ChatLimitModal({ isOpen, onClose }: ChatLimitModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[90%] max-w-sm"
          >
            <div className="bg-card rounded-2xl shadow-elevated p-6 text-center">
              <div className="text-5xl mb-4">😢</div>
              <h2 className="text-xl font-bold mb-2">Chat Harian Habis</h2>
              <p className="text-muted-foreground text-sm mb-6">
                Kamu sudah menggunakan 5 chat hari ini. Upgrade ke Premium untuk unlimited chat!
              </p>
              
              <div className="space-y-3">
                <Button variant="premium" className="w-full" size="lg">
                  <Crown className="h-4 w-4 mr-2" />
                  Upgrade Premium
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full" 
                  onClick={onClose}
                >
                  Tunggu Besok
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
