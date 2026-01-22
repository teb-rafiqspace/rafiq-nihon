import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { 
  Crown, 
  X, 
  Check, 
  MessageCircle, 
  BookOpen, 
  FileText, 
  BarChart3, 
  Ban,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PaymentScreen } from './PaymentScreen';
import { SuccessScreen } from './SuccessScreen';
import { useUpgradeSubscription } from '@/hooks/useSubscription';

interface PremiumUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Plan = 'monthly' | 'yearly';
type Step = 'plans' | 'payment' | 'success';

const features = [
  { icon: MessageCircle, free: '5 chat/hari', premium: 'Unlimited chat' },
  { icon: BookOpen, free: 'Bab 1-3 saja', premium: 'Semua materi' },
  { icon: FileText, free: 'Mock test terbatas', premium: 'Unlimited test' },
  { icon: BarChart3, free: 'No analytics', premium: 'Progress detail' },
  { icon: Ban, free: 'Iklan', premium: 'Bebas iklan' },
];

export function PremiumUpgradeModal({ isOpen, onClose }: PremiumUpgradeModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<Plan>('monthly');
  const [step, setStep] = useState<Step>('plans');
  const { mutateAsync: upgrade, isPending } = useUpgradeSubscription();
  const [expiryDate, setExpiryDate] = useState<Date | null>(null);
  
  const handleStartTrial = () => {
    setStep('payment');
  };
  
  const handleConfirmPayment = async () => {
    try {
      await upgrade({ plan: selectedPlan });
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + 7);
      setExpiryDate(expiry);
      setStep('success');
    } catch (error) {
      console.error('Upgrade failed:', error);
    }
  };
  
  const handleClose = () => {
    setStep('plans');
    onClose();
  };
  
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50"
            onClick={handleClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full max-w-md max-h-[90vh] overflow-y-auto no-scrollbar bg-card rounded-3xl shadow-elevated">
              {step === 'plans' && (
                <>
                  {/* Header */}
                  <div className="bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500 p-6 text-white relative">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-4 right-4 text-white/80 hover:text-white hover:bg-white/20"
                      onClick={handleClose}
                    >
                      <X className="h-5 w-5" />
                    </Button>
                    
                    <div className="flex items-center gap-3 mb-2">
                      <Crown className="h-8 w-8" />
                      <h2 className="text-2xl font-bold">Upgrade ke Premium</h2>
                    </div>
                    <p className="text-white/90 text-sm">
                      Belajar tanpa batas dengan fitur premium
                    </p>
                  </div>
                  
                  {/* Feature Comparison */}
                  <div className="p-6">
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="text-center">
                        <p className="text-sm font-medium text-muted-foreground mb-2">GRATIS</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-amber-600 mb-2">PREMIUM ⭐</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      {features.map((feature, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="grid grid-cols-2 gap-4 items-center"
                        >
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <X className="h-4 w-4 text-destructive" />
                            <span>{feature.free}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Check className="h-4 w-4 text-success" />
                            <span className="font-medium">{feature.premium}</span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                    
                    {/* Divider */}
                    <div className="my-6 border-t border-border" />
                    
                    {/* Plan Selection */}
                    <div className="space-y-3">
                      <button
                        onClick={() => setSelectedPlan('monthly')}
                        className={cn(
                          "w-full p-4 rounded-xl border-2 text-left transition-all",
                          selectedPlan === 'monthly'
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-muted-foreground"
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold">Bulanan</p>
                            <p className="text-2xl font-bold">
                              Rp 49.000<span className="text-sm font-normal text-muted-foreground">/bulan</span>
                            </p>
                          </div>
                          <div className={cn(
                            "w-6 h-6 rounded-full border-2 flex items-center justify-center",
                            selectedPlan === 'monthly'
                              ? "border-primary bg-primary"
                              : "border-muted-foreground"
                          )}>
                            {selectedPlan === 'monthly' && (
                              <Check className="h-4 w-4 text-primary-foreground" />
                            )}
                          </div>
                        </div>
                      </button>
                      
                      <button
                        onClick={() => setSelectedPlan('yearly')}
                        className={cn(
                          "w-full p-4 rounded-xl border-2 text-left transition-all relative",
                          selectedPlan === 'yearly'
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-muted-foreground"
                        )}
                      >
                        <div className="absolute -top-2 right-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                          HEMAT 32%
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold flex items-center gap-2">
                              Tahunan
                              <Sparkles className="h-4 w-4 text-amber-500" />
                            </p>
                            <p className="text-2xl font-bold">
                              Rp 399.000<span className="text-sm font-normal text-muted-foreground">/tahun</span>
                            </p>
                            <p className="text-xs text-muted-foreground">= Rp 33.250/bulan</p>
                          </div>
                          <div className={cn(
                            "w-6 h-6 rounded-full border-2 flex items-center justify-center",
                            selectedPlan === 'yearly'
                              ? "border-primary bg-primary"
                              : "border-muted-foreground"
                          )}>
                            {selectedPlan === 'yearly' && (
                              <Check className="h-4 w-4 text-primary-foreground" />
                            )}
                          </div>
                        </div>
                      </button>
                    </div>
                    
                    {/* CTA Button */}
                    <Button
                      variant="premium"
                      size="lg"
                      className="w-full mt-6"
                      onClick={handleStartTrial}
                    >
                      <Crown className="h-5 w-5 mr-2" />
                      Mulai 7 Hari Gratis
                    </Button>
                    
                    <p className="text-xs text-center text-muted-foreground mt-3">
                      Batal kapan saja. Tidak ada komitmen.
                    </p>
                  </div>
                </>
              )}
              
              {step === 'payment' && (
                <PaymentScreen
                  plan={selectedPlan}
                  onConfirm={handleConfirmPayment}
                  onBack={() => setStep('plans')}
                  isLoading={isPending}
                />
              )}
              
              {step === 'success' && (
                <SuccessScreen
                  expiryDate={expiryDate!}
                  onClose={handleClose}
                />
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
