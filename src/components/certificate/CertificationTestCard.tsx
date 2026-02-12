import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Clock, FileText, Trophy, Award, CheckCircle } from 'lucide-react';

interface CertificationTestCardProps {
  id: string;
  title: string;
  description: string;
  questionCount: number;
  timeMinutes: number;
  icon: string;
  passingScore: number;
  bestScore?: number;
  hasCertificate?: boolean;
  onStart: () => void;
}

export function CertificationTestCard({
  title,
  description,
  questionCount,
  timeMinutes,
  icon,
  passingScore,
  bestScore,
  hasCertificate = false,
  onStart
}: CertificationTestCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl p-5 shadow-card border border-amber-200/50 dark:border-amber-800/50 relative overflow-hidden"
    >
      {/* Gold accent line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-400" />

      <div className="flex items-start gap-4">
        <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center text-2xl shrink-0 shadow-md">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-lg truncate">{title}</h3>
            {hasCertificate && (
              <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
            )}
          </div>
          <p className="text-sm text-muted-foreground mb-3">{description}</p>

          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
            <div className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              <span>{questionCount} soal</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{timeMinutes} menit</span>
            </div>
            <div className="flex items-center gap-1">
              <Award className="h-4 w-4 text-amber-500" />
              <span>Lulus {passingScore}%</span>
            </div>
          </div>

          {bestScore !== undefined && (
            <div className="flex items-center gap-2 mb-1 text-sm">
              <Trophy className="h-4 w-4 text-amber-500" />
              <span className="text-muted-foreground">Skor terbaik:</span>
              <span className="font-semibold text-primary">{bestScore}%</span>
            </div>
          )}
        </div>
      </div>

      <Button
        className="w-full mt-3 bg-amber-600 hover:bg-amber-700 text-white"
        onClick={onStart}
      >
        <Award className="h-4 w-4 mr-2" />
        {hasCertificate ? 'Ambil Ulang Tes' : 'Mulai Sertifikasi'}
      </Button>
    </motion.div>
  );
}
