import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Crown, Sparkles } from 'lucide-react';

interface SuccessScreenProps {
  expiryDate: Date;
  onClose: () => void;
}

export function SuccessScreen({ expiryDate, onClose }: SuccessScreenProps) {
  const navigate = useNavigate();
  
  const handleStartLearning = () => {
    onClose();
    navigate('/learn');
  };
  
  return (
    <div className="p-8 text-center">
      {/* Celebration Animation */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 15 }}
        className="relative mx-auto mb-6 w-24 h-24"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center">
          <Crown className="h-12 w-12 text-white" />
        </div>
        
        {/* Sparkles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: [0, 1, 0], scale: [0, 1, 0] }}
            transition={{ 
              delay: 0.3 + i * 0.1, 
              duration: 0.8,
              repeat: Infinity,
              repeatDelay: 2
            }}
            className="absolute"
            style={{
              top: `${20 + Math.sin(i * 60 * Math.PI / 180) * 50}%`,
              left: `${50 + Math.cos(i * 60 * Math.PI / 180) * 60}%`,
            }}
          >
            <Sparkles className="h-4 w-4 text-amber-500" />
          </motion.div>
        ))}
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-2xl font-bold mb-2">🎉 Selamat!</h2>
        <p className="text-lg text-muted-foreground mb-6">
          Kamu sekarang <span className="text-amber-600 font-semibold">Premium Member</span>!
        </p>
        
        <div className="bg-muted/50 rounded-xl p-4 mb-6">
          <p className="text-sm text-muted-foreground mb-1">Trial berakhir:</p>
          <p className="text-lg font-semibold">
            {format(expiryDate, 'd MMMM yyyy', { locale: id })}
          </p>
        </div>
        
        <div className="space-y-3">
          <Button
            variant="premium"
            size="lg"
            className="w-full"
            onClick={handleStartLearning}
          >
            Mulai Belajar
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
