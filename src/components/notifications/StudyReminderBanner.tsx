import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { X, Bell, ChevronRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useStudyReminder } from '@/hooks/useStudyReminder';

export function StudyReminderBanner() {
  const navigate = useNavigate();
  const { 
    showReminder, 
    dismissReminder, 
    getReminderMessage 
  } = useStudyReminder();
  
  const message = getReminderMessage();
  
  const handleAction = () => {
    dismissReminder();
    navigate(message.topicRoute);
  };

  return (
    <AnimatePresence>
      {showReminder && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          className="fixed top-4 left-4 right-4 z-50 max-w-lg mx-auto"
        >
          <div className="bg-gradient-to-r from-primary to-primary/80 rounded-2xl shadow-elevated overflow-hidden">
            {/* Close button */}
            <button
              onClick={dismissReminder}
              className="absolute top-3 right-3 p-1.5 rounded-full bg-primary-foreground/20 hover:bg-primary-foreground/30 transition-colors"
            >
              <X className="h-4 w-4 text-primary-foreground" />
            </button>
            
            <div className="p-4">
              {/* Header */}
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-primary-foreground/20 flex items-center justify-center flex-shrink-0">
                  <Bell className="h-5 w-5 text-primary-foreground" />
                </div>
                <div className="flex-1 pr-6">
                  <h3 className="font-bold text-primary-foreground text-sm">
                    {message.title}
                  </h3>
                  <p className="text-primary-foreground/80 text-xs mt-0.5">
                    {message.body}
                  </p>
                </div>
              </div>
              
              {/* Weak topics indicator */}
              {message.weakCount > 0 && (
                <div className="flex items-center gap-2 mb-3 p-2 bg-primary-foreground/10 rounded-lg">
                  <Sparkles className="h-4 w-4 text-accent" />
                  <span className="text-xs text-primary-foreground/90">
                    {message.weakCount} topik perlu diperkuat
                  </span>
                </div>
              )}
              
              {/* Action button */}
              <Button
                onClick={handleAction}
                className="w-full bg-primary-foreground text-primary hover:bg-primary-foreground/90 font-medium"
                size="sm"
              >
                {message.topicTitle ? `Latihan: ${message.topicTitle}` : 'Mulai Belajar'}
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
