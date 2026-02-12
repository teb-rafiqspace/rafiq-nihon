import { motion } from 'framer-motion';
import { ArrowLeft, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { useMyCertificates } from '@/hooks/useCertificates';
import { CertificateList } from '@/components/certificate/CertificateList';

export default function MyCertificates() {
  const navigate = useNavigate();
  const { data: certificates = [], isLoading } = useMyCertificates();

  return (
    <AppLayout>
      <div className="pt-safe pb-8">
        {/* Header */}
        <div className="bg-gradient-to-b from-amber-500/20 to-background">
          <div className="container max-w-lg mx-auto px-4 pt-4 pb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/profile')}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Profil
            </Button>

            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center">
                <Award className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Sertifikat Saya</h1>
                <p className="text-sm text-muted-foreground">
                  {certificates.length} sertifikat diperoleh
                </p>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="container max-w-lg mx-auto px-4 mt-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <CertificateList certificates={certificates} />
          )}
        </div>
      </div>
    </AppLayout>
  );
}
