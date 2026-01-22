import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth';
import { useProfile } from '@/hooks/useProfile';
import { ArrowRight, Sparkles, BookOpen, Bot, Trophy } from 'lucide-react';
import linguaLogo from '@/assets/lingua-logo.png';
import poweredByLogo from '@/assets/powered-by-logo.png';

export default function Index() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile();
  
  useEffect(() => {
    if (!authLoading && user) {
      if (!profileLoading && profile) {
        if (profile.onboarding_completed) {
          navigate('/home');
        } else {
          navigate('/onboarding');
        }
      }
    }
  }, [user, authLoading, profile, profileLoading, navigate]);
  
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Hero Section */}
      <div className="flex-1 bg-gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 text-6xl font-jp animate-float">あ</div>
          <div className="absolute top-40 right-10 text-5xl font-jp animate-float" style={{ animationDelay: '1s' }}>日</div>
          <div className="absolute bottom-40 left-20 text-4xl font-jp animate-float" style={{ animationDelay: '0.5s' }}>本</div>
          <div className="absolute bottom-20 right-20 text-5xl font-jp animate-float" style={{ animationDelay: '1.5s' }}>語</div>
        </div>
        
        <div className="container max-w-lg mx-auto px-4 pt-16 pb-8 relative">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.6 }}
            className="w-40 h-40 mx-auto mb-2 flex items-center justify-center"
          >
            <img 
              src={linguaLogo} 
              alt="Lingua Logo" 
              className="w-full h-full object-contain"
            />
          </motion.div>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center text-primary-foreground/90 text-lg mb-6"
          >
            Teman setia belajar bahasa Jepang
          </motion.p>
          
          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-3 gap-4 mb-4"
          >
            <div className="text-center">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl mx-auto mb-2 flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-primary-foreground" />
              </div>
              <p className="text-xs text-primary-foreground/80">Materi Lengkap</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl mx-auto mb-2 flex items-center justify-center">
                <Bot className="h-6 w-6 text-primary-foreground" />
              </div>
              <p className="text-xs text-primary-foreground/80">AI Assistant</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl mx-auto mb-2 flex items-center justify-center">
                <Trophy className="h-6 w-6 text-primary-foreground" />
              </div>
              <p className="text-xs text-primary-foreground/80">Gamifikasi</p>
            </div>
          </motion.div>
          
          {/* Powered by */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex items-center justify-center gap-2 mb-4"
          >
            <span className="text-xs text-primary-foreground/60">powered by</span>
            <img 
              src={poweredByLogo} 
              alt="Powered by" 
              className="h-8 object-contain"
            />
          </motion.div>
        </div>
      </div>
      
      {/* CTA Section */}
      <div className="bg-background rounded-t-3xl -mt-6 relative">
        <div className="container max-w-lg mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-4"
          >
            <Button 
              size="xl" 
              className="w-full"
              onClick={() => navigate('/auth')}
            >
              <Sparkles className="h-5 w-5 mr-2" />
              Mulai Belajar Gratis
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
            
            <Button 
              variant="outline" 
              size="xl" 
              className="w-full"
              onClick={() => navigate('/auth')}
            >
              Sudah punya akun? Masuk
            </Button>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-8 text-center"
          >
            <p className="text-sm text-muted-foreground">
              Dipercaya oleh <span className="font-semibold text-foreground">1000+</span> pelajar Indonesia
            </p>
            <div className="flex justify-center gap-1 mt-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} className="text-yellow-400">⭐</span>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
