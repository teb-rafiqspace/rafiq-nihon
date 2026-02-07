import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Mail, ArrowLeft, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import { z } from 'zod';

const emailSchema = z.object({
  email: z.string().trim().email('Email tidak valid').max(255, 'Email terlalu panjang'),
});

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  
  const { resetPassword } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validate email
    try {
      emailSchema.parse({ email });
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0]?.message || 'Email tidak valid');
        return;
      }
    }
    
    setLoading(true);
    
    try {
      const { error: resetError } = await resetPassword(email.trim());
      
      if (resetError) {
        toast({
          title: 'Gagal mengirim email',
          description: resetError.message,
          variant: 'destructive',
        });
      } else {
        setSent(true);
        toast({
          title: 'Email terkirim!',
          description: 'Cek inbox email Anda untuk link reset password.',
        });
      }
    } finally {
      setLoading(false);
    }
  };
  
  if (sent) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        {/* Header */}
        <div className="bg-gradient-primary pt-safe">
          <div className="container max-w-lg mx-auto px-4 pt-12 pb-16 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 0.6 }}
              className="w-20 h-20 bg-card rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-elevated"
            >
              <CheckCircle2 className="h-10 w-10 text-primary" />
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-2xl font-bold text-primary-foreground"
            >
              Email Terkirim!
            </motion.h1>
          </div>
        </div>
        
        <div className="flex-1 container max-w-lg mx-auto px-4 -mt-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-card rounded-2xl shadow-elevated p-6 text-center"
          >
            <p className="text-muted-foreground mb-6">
              Kami telah mengirim link reset password ke <strong className="text-foreground">{email}</strong>. 
              Silakan cek inbox atau folder spam email Anda.
            </p>
            
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setSent(false)}
              >
                Kirim ulang email
              </Button>
              
              <Button
                className="w-full"
                onClick={() => navigate('/auth')}
              >
                Kembali ke login
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="bg-gradient-primary pt-safe">
        <div className="container max-w-lg mx-auto px-4 pt-12 pb-16 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.6 }}
            className="w-20 h-20 bg-card rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-elevated"
          >
            <span className="text-4xl">🔐</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-2xl font-bold text-primary-foreground"
          >
            Lupa Password?
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-primary-foreground/80 text-sm mt-1"
          >
            Masukkan email untuk reset password
          </motion.p>
        </div>
      </div>
      
      {/* Form */}
      <div className="flex-1 container max-w-lg mx-auto px-4 -mt-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card rounded-2xl shadow-elevated p-6"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="email@contoh.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  maxLength={255}
                />
              </div>
              {error && (
                <p className="text-xs text-destructive">{error}</p>
              )}
            </div>
            
            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  Kirim Link Reset
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <Link 
              to="/auth" 
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Kembali ke login
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
