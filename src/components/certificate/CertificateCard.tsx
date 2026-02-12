import { forwardRef } from 'react';
import { Award } from 'lucide-react';

interface CertificateCardProps {
  displayName: string;
  testName: string;
  scorePercent: number;
  certificateNumber: string;
  issuedDate: string;
  score: number;
  totalQuestions: number;
}

const TEST_DISPLAY_NAMES: Record<string, string> = {
  cert_jlpt_n5: 'JLPT N5 Certification',
  cert_jlpt_n4: 'JLPT N4 Certification',
  cert_jlpt_n3: 'JLPT N3 Certification',
  cert_jlpt_n2: 'JLPT N2 Certification',
  cert_kakunin: 'IM Japan Kakunin Certification',
};

export const CertificateCard = forwardRef<HTMLDivElement, CertificateCardProps>(
  ({ displayName, testName, scorePercent, certificateNumber, issuedDate, score, totalQuestions }, ref) => {
    const formattedDate = new Date(issuedDate).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    const testDisplayName = TEST_DISPLAY_NAMES[testName] || testName;

    return (
      <div
        ref={ref}
        className="relative w-full aspect-[1.414/1] bg-gradient-to-br from-amber-50 via-yellow-50 to-amber-100 dark:from-amber-950 dark:via-yellow-950 dark:to-amber-900 rounded-2xl overflow-hidden shadow-elevated"
        style={{ maxWidth: 600 }}
      >
        {/* Ornamental corners */}
        <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-amber-500/60 rounded-tl-2xl" />
        <div className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 border-amber-500/60 rounded-tr-2xl" />
        <div className="absolute bottom-0 left-0 w-16 h-16 border-b-4 border-l-4 border-amber-500/60 rounded-bl-2xl" />
        <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-amber-500/60 rounded-br-2xl" />

        {/* Inner border */}
        <div className="absolute inset-3 border-2 border-amber-400/40 rounded-xl pointer-events-none" />

        {/* Content */}
        <div className="relative h-full flex flex-col items-center justify-between p-6 sm:p-8 text-center">
          {/* Header */}
          <div>
            <div className="flex items-center justify-center gap-2 mb-2">
              <Award className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              <span className="text-sm font-semibold tracking-widest uppercase text-amber-700 dark:text-amber-300">
                Rafiq Nihon
              </span>
              <Award className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
            <h1 className="text-lg sm:text-xl font-bold tracking-wide text-amber-800 dark:text-amber-200">
              CERTIFICATE OF ACHIEVEMENT
            </h1>
            <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-amber-500 to-transparent mx-auto mt-2" />
          </div>

          {/* Body */}
          <div className="flex-1 flex flex-col items-center justify-center py-4">
            <p className="text-sm text-amber-700/80 dark:text-amber-300/80 mb-1">This certifies that</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-amber-900 dark:text-amber-100 mb-2">
              {displayName}
            </h2>
            <p className="text-sm text-amber-700/80 dark:text-amber-300/80 mb-1">
              has successfully passed the
            </p>
            <h3 className="text-lg sm:text-xl font-bold text-amber-800 dark:text-amber-200 mb-2">
              {testDisplayName}
            </h3>
            <p className="text-sm text-amber-700/80 dark:text-amber-300/80">
              with a score of <span className="font-bold text-amber-900 dark:text-amber-100">{scorePercent}%</span> ({score}/{totalQuestions})
            </p>
          </div>

          {/* Details grid */}
          <div className="w-full">
            <div className="flex items-center justify-center gap-6 text-xs text-amber-700 dark:text-amber-300 mb-3">
              <div className="text-center">
                <p className="font-semibold">Tanggal</p>
                <p>{formattedDate}</p>
              </div>
              <div className="w-px h-8 bg-amber-400/40" />
              <div className="text-center">
                <p className="font-semibold">Nomor Sertifikat</p>
                <p className="font-mono text-[10px]">{certificateNumber}</p>
              </div>
            </div>

            <div className="w-32 h-0.5 bg-gradient-to-r from-transparent via-amber-500 to-transparent mx-auto mb-2" />
            <p className="text-[10px] text-amber-600/60 dark:text-amber-400/60">
              Issued by Rafiq Nihon Language Learning Platform
            </p>
          </div>
        </div>
      </div>
    );
  }
);

CertificateCard.displayName = 'CertificateCard';
