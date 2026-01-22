import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Crown, Calendar, Settings } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { useSubscription, isPremiumActive, getDaysUntilExpiry } from '@/hooks/useSubscription';

interface SubscriptionSectionProps {
  onUpgrade: () => void;
}

export function SubscriptionSection({ onUpgrade }: SubscriptionSectionProps) {
  const { data: subscription, isLoading } = useSubscription();
  
  const isPremium = isPremiumActive(subscription);
  const daysLeft = getDaysUntilExpiry(subscription);
  
  if (isLoading) {
    return (
      <div className="bg-card rounded-2xl p-4 shadow-card animate-pulse">
        <div className="h-20 bg-muted rounded-xl" />
      </div>
    );
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl p-4 shadow-card border border-border"
    >
      <h3 className="font-semibold mb-3 flex items-center gap-2">
        <Crown className="h-5 w-5 text-amber-500" />
        Langganan
      </h3>
      
      {isPremium ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium">Status:</span>
                <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Crown className="h-3 w-3" />
                  Premium
                </span>
              </div>
            </div>
          </div>
          
          {subscription?.expires_at && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>
                Berlaku hingga: {format(new Date(subscription.expires_at), 'd MMMM yyyy', { locale: id })}
              </span>
            </div>
          )}
          
          {daysLeft !== null && daysLeft <= 7 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm">
              <p className="text-amber-800">
                ⚠️ Trial berakhir dalam {daysLeft} hari. Perpanjang langganan untuk terus menikmati fitur Premium.
              </p>
            </div>
          )}
          
          <Button
            variant="outline"
            size="sm"
            className="w-full"
          >
            <Settings className="h-4 w-4 mr-2" />
            Kelola Langganan
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium">Status:</span>
                <span className="bg-muted text-muted-foreground text-xs font-medium px-2 py-0.5 rounded-full">
                  Gratis
                </span>
              </div>
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground">
            Upgrade ke Premium untuk akses penuh ke semua fitur dan materi.
          </p>
          
          <Button
            variant="premium"
            size="sm"
            className="w-full"
            onClick={onUpgrade}
          >
            <Crown className="h-4 w-4 mr-2" />
            Upgrade ke Premium
          </Button>
        </div>
      )}
    </motion.div>
  );
}
