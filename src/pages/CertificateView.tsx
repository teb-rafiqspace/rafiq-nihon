import { useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCertificate } from '@/hooks/useCertificates';
import { CertificateCard } from '@/components/certificate/CertificateCard';
import { CertificateActions } from '@/components/certificate/CertificateActions';

export default function CertificateView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const certificateRef = useRef<HTMLDivElement>(null);

  const { data: certificate, isLoading } = useCertificate(id);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!certificate) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Award className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">Sertifikat tidak ditemukan</p>
          <Button onClick={() => navigate('/certificates')}>Kembali</Button>
        </div>
      </div>
    );
  }

  const TEST_NAMES: Record<string, string> = {
    cert_jlpt_n5: 'Sertifikasi JLPT N5',
    cert_jlpt_n4: 'Sertifikasi JLPT N4',
    cert_jlpt_n3: 'Sertifikasi JLPT N3',
    cert_jlpt_n2: 'Sertifikasi JLPT N2',
    cert_kakunin: 'Sertifikasi IM Japan Kakunin',
  };

  return (
    <div className="min-h-screen bg-background pb-safe">
      {/* Header */}
      <div className="bg-gradient-to-b from-amber-500/20 to-background pt-safe">
        <div className="container max-w-lg mx-auto px-4 pt-4 pb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/certificates')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Kembali
          </Button>

          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <Award className="h-8 w-8 text-amber-500 mx-auto mb-2" />
            <h1 className="text-xl font-bold">Sertifikat Saya</h1>
          </motion.div>
        </div>
      </div>

      <div className="container max-w-lg mx-auto px-4 space-y-6">
        {/* Certificate Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <CertificateCard
            ref={certificateRef}
            displayName={certificate.display_name}
            testName={certificate.test_type}
            scorePercent={certificate.score_percent}
            certificateNumber={certificate.certificate_number}
            issuedDate={certificate.issued_date}
            score={certificate.score}
            totalQuestions={certificate.total_questions}
          />
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <CertificateActions
            certificateRef={certificateRef}
            certificateNumber={certificate.certificate_number}
            testName={TEST_NAMES[certificate.test_type] || certificate.test_type}
          />
        </motion.div>

        {/* Section Scores */}
        {certificate.section_scores && Array.isArray(certificate.section_scores) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-card rounded-2xl p-4 shadow-card border border-border"
          >
            <h3 className="font-semibold mb-3">Detail Skor per Seksi</h3>
            <div className="space-y-3">
              {(certificate.section_scores as any[]).map((section: any, i: number) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground capitalize">{section.section}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-500 rounded-full"
                        style={{ width: `${section.percent}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium w-12 text-right">{section.percent}%</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
