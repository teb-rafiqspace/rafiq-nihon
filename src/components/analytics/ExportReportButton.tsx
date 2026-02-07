import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription 
} from '@/components/ui/dialog';
import { useAnalyticsSummary, useWeaknessAnalysis, useMonthlyTrends } from '@/hooks/useAnalytics';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/lib/auth';
import { FileDown, FileText, Loader2, CheckCircle2, Download } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export function ExportReportButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const { data: summary } = useAnalyticsSummary();
  const { data: weaknesses } = useWeaknessAnalysis();
  const { data: trends } = useMonthlyTrends();

  const generateReport = async () => {
    setIsGenerating(true);

    // Simulate processing time for better UX
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Generate HTML report content
    const reportContent = `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Laporan Progres Belajar - Rafiq Nihon</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: 'Segoe UI', system-ui, sans-serif; 
      line-height: 1.6; 
      color: #1a1a1a;
      background: #f8f9fa;
      padding: 20px;
    }
    .container { max-width: 800px; margin: 0 auto; background: white; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
    .header { 
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
      color: white; 
      padding: 30px; 
      border-radius: 12px 12px 0 0;
      text-align: center;
    }
    .header h1 { font-size: 24px; margin-bottom: 5px; }
    .header p { opacity: 0.9; font-size: 14px; }
    .content { padding: 30px; }
    .section { margin-bottom: 30px; }
    .section-title { 
      font-size: 18px; 
      color: #667eea; 
      margin-bottom: 15px; 
      padding-bottom: 10px;
      border-bottom: 2px solid #e9ecef;
    }
    .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; }
    .stat-card { 
      background: #f8f9fa; 
      padding: 15px; 
      border-radius: 8px; 
      text-align: center;
    }
    .stat-value { font-size: 24px; font-weight: bold; color: #667eea; }
    .stat-label { font-size: 12px; color: #6c757d; }
    .weakness-item { 
      background: #fff3cd; 
      border-left: 4px solid #ffc107; 
      padding: 12px; 
      margin-bottom: 10px; 
      border-radius: 0 8px 8px 0;
    }
    .weakness-title { font-weight: 600; margin-bottom: 5px; }
    .weakness-meta { font-size: 12px; color: #6c757d; }
    .trend-table { width: 100%; border-collapse: collapse; }
    .trend-table th, .trend-table td { 
      padding: 12px; 
      text-align: left; 
      border-bottom: 1px solid #e9ecef;
    }
    .trend-table th { background: #f8f9fa; font-weight: 600; }
    .footer { 
      text-align: center; 
      padding: 20px; 
      color: #6c757d; 
      font-size: 12px;
      border-top: 1px solid #e9ecef;
    }
    @media print {
      body { background: white; padding: 0; }
      .container { box-shadow: none; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📊 Laporan Progres Belajar</h1>
      <p>${profile?.full_name || user?.email} • ${format(new Date(), 'd MMMM yyyy', { locale: id })}</p>
    </div>
    
    <div class="content">
      <div class="section">
        <h2 class="section-title">📈 Ringkasan Statistik</h2>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-value">${summary?.totalXP?.toLocaleString() || 0}</div>
            <div class="stat-label">Total XP</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${Math.floor((summary?.totalStudyTime || 0) / 60)}j</div>
            <div class="stat-label">Waktu Belajar</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${summary?.currentStreak || 0}</div>
            <div class="stat-label">Streak Saat Ini</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${summary?.activeDaysThisMonth || 0}</div>
            <div class="stat-label">Hari Aktif</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${summary?.totalLessonsCompleted || 0}</div>
            <div class="stat-label">Pelajaran Selesai</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${summary?.totalQuizzesTaken || 0}</div>
            <div class="stat-label">Kuis Diselesaikan</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${summary?.averageQuizScore || 0}%</div>
            <div class="stat-label">Rata-rata Skor</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${summary?.masteryRate || 0}%</div>
            <div class="stat-label">Tingkat Penguasaan</div>
          </div>
        </div>
      </div>

      ${weaknesses && weaknesses.length > 0 ? `
      <div class="section">
        <h2 class="section-title">⚠️ Area yang Perlu Ditingkatkan</h2>
        ${weaknesses.slice(0, 5).map(w => `
          <div class="weakness-item">
            <div class="weakness-title">${w.title} (${w.titleJp})</div>
            <div class="weakness-meta">
              ${w.type === 'quiz' ? 'Kuis' : w.type === 'flashcard' ? 'Flashcard' : 'Speaking'} • 
              Skor: ${w.score}% • 
              ${w.attempts}x latihan
            </div>
            <div style="margin-top: 5px; font-size: 13px;">💡 ${w.recommendation}</div>
          </div>
        `).join('')}
      </div>
      ` : ''}

      ${trends && trends.length > 0 ? `
      <div class="section">
        <h2 class="section-title">📅 Tren Bulanan</h2>
        <table class="trend-table">
          <thead>
            <tr>
              <th>Bulan</th>
              <th>XP</th>
              <th>Waktu Belajar</th>
              <th>Item Selesai</th>
            </tr>
          </thead>
          <tbody>
            ${trends.map(t => `
              <tr>
                <td>${t.month}</td>
                <td>${t.xp.toLocaleString()}</td>
                <td>${t.studyMinutes} menit</td>
                <td>${t.itemsCompleted}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      ` : ''}
    </div>
    
    <div class="footer">
      <p>Dibuat oleh Rafiq Nihon • ${format(new Date(), 'd MMMM yyyy, HH:mm', { locale: id })}</p>
      <p>Terus semangat belajar bahasa Jepang! 頑張って！</p>
    </div>
  </div>
</body>
</html>
    `;

    // Create blob and download
    const blob = new Blob([reportContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `laporan-belajar-${format(new Date(), 'yyyy-MM-dd')}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setIsGenerating(false);
    setIsComplete(true);

    setTimeout(() => {
      setIsComplete(false);
      setIsOpen(false);
    }, 2000);
  };

  return (
    <>
      <Button 
        onClick={() => setIsOpen(true)}
        variant="outline"
        className="gap-2"
      >
        <FileDown className="h-4 w-4" />
        Export Laporan
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Export Laporan Progres
            </DialogTitle>
            <DialogDescription>
              Download laporan lengkap perjalanan belajarmu dalam format HTML yang bisa dicetak sebagai PDF.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <h4 className="font-medium text-sm">Laporan akan berisi:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>✓ Statistik lengkap (XP, waktu belajar, streak)</li>
                <li>✓ Analisis kelemahan dan rekomendasi</li>
                <li>✓ Tren bulanan (6 bulan terakhir)</li>
                <li>✓ Tingkat penguasaan materi</li>
              </ul>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isGenerating}>
                Batal
              </Button>
              <Button onClick={generateReport} disabled={isGenerating || isComplete}>
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Membuat...
                  </>
                ) : isComplete ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2 text-success" />
                    Selesai!
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
