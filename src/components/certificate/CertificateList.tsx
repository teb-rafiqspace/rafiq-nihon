import { motion } from 'framer-motion';
import { Award, Calendar, ChevronRight } from 'lucide-react';
import { Certificate } from '@/hooks/useCertificates';
import { useNavigate } from 'react-router-dom';

interface CertificateListProps {
  certificates: Certificate[];
}

const TEST_LABELS: Record<string, string> = {
  cert_jlpt_n5: 'JLPT N5',
  cert_jlpt_n4: 'JLPT N4',
  cert_jlpt_n3: 'JLPT N3',
  cert_jlpt_n2: 'JLPT N2',
  cert_kakunin: 'IM Japan Kakunin',
};

const TEST_ICONS: Record<string, string> = {
  cert_jlpt_n5: '📜',
  cert_jlpt_n4: '📜',
  cert_jlpt_n3: '📜',
  cert_jlpt_n2: '📜',
  cert_kakunin: '🏭',
};

export function CertificateList({ certificates }: CertificateListProps) {
  const navigate = useNavigate();

  if (certificates.length === 0) {
    return (
      <div className="text-center py-12">
        <Award className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
        <h3 className="font-semibold text-lg mb-2">Belum Ada Sertifikat</h3>
        <p className="text-sm text-muted-foreground">
          Ikuti tes sertifikasi dan lulus untuk mendapatkan sertifikat pertamamu!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {certificates.map((cert, index) => {
        const formattedDate = new Date(cert.issued_date).toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        });

        return (
          <motion.button
            key={cert.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => navigate(`/certificate/${cert.id}`)}
            className="w-full bg-card rounded-2xl p-4 shadow-card border border-amber-200/50 dark:border-amber-800/50 hover:border-amber-300 dark:hover:border-amber-700 transition-colors text-left"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center text-xl shrink-0">
                {TEST_ICONS[cert.test_type] || '🏆'}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-sm">
                  {TEST_LABELS[cert.test_type] || cert.test_type}
                </h3>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                  <span className="font-semibold text-amber-600 dark:text-amber-400">
                    {cert.score_percent}%
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formattedDate}
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground font-mono mt-0.5 truncate">
                  {cert.certificate_number}
                </p>
              </div>

              <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}
