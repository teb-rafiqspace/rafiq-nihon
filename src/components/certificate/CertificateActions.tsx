import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Share2, Check, MessageCircle, Copy } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface CertificateActionsProps {
  certificateRef: React.RefObject<HTMLDivElement>;
  certificateNumber: string;
  testName: string;
}

export function CertificateActions({ certificateRef, certificateNumber, testName }: CertificateActionsProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleDownloadPDF = async () => {
    if (!certificateRef.current) return;
    setIsDownloading(true);

    try {
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: null,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`certificate-${certificateNumber}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  const shareText = `Saya berhasil mendapatkan sertifikat ${testName} dari Rafiq Nihon! Nomor: ${certificateNumber}`;

  const handleShareWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
    setShowShareMenu(false);
  };

  const handleShareTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
    setShowShareMenu(false);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const textArea = document.createElement('textarea');
      textArea.value = shareText;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
    setShowShareMenu(false);
  };

  return (
    <div className="flex gap-3">
      <Button
        onClick={handleDownloadPDF}
        disabled={isDownloading}
        className="flex-1 bg-amber-600 hover:bg-amber-700 text-white"
      >
        <Download className="h-4 w-4 mr-2" />
        {isDownloading ? 'Mengunduh...' : 'Download PDF'}
      </Button>

      <div className="relative">
        <Button
          variant="outline"
          onClick={() => setShowShareMenu(!showShareMenu)}
        >
          <Share2 className="h-4 w-4" />
        </Button>

        {showShareMenu && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowShareMenu(false)} />
            <div className="absolute right-0 bottom-full mb-2 w-48 bg-card rounded-xl shadow-elevated border border-border p-2 z-50">
              <button
                onClick={handleShareWhatsApp}
                className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted transition-colors text-sm"
              >
                <MessageCircle className="h-4 w-4 text-green-500" />
                WhatsApp
              </button>
              <button
                onClick={handleShareTwitter}
                className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted transition-colors text-sm"
              >
                <Share2 className="h-4 w-4 text-blue-500" />
                Twitter
              </button>
              <button
                onClick={handleCopyLink}
                className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted transition-colors text-sm"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4 text-muted-foreground" />
                )}
                {copied ? 'Tersalin!' : 'Salin Teks'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
