import { motion } from 'framer-motion';
import { AppLayout } from '@/components/layout/AppLayout';
import { AnalyticsSummaryCard } from '@/components/analytics/AnalyticsSummaryCard';
import { ActivityHeatmap } from '@/components/analytics/ActivityHeatmap';
import { StudyTimeDistribution } from '@/components/analytics/StudyTimeDistribution';
import { WeaknessAnalysis } from '@/components/analytics/WeaknessAnalysis';
import { MonthlyTrendsChart } from '@/components/analytics/MonthlyTrendsChart';
import { ExportReportButton } from '@/components/analytics/ExportReportButton';
import { BarChart3, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export default function Analytics() {
  const navigate = useNavigate();

  return (
    <AppLayout>
      <div className="pt-safe pb-8">
        {/* Header */}
        <div className="bg-gradient-to-br from-primary/20 via-primary/10 to-transparent">
          <div className="container max-w-lg mx-auto px-4 pt-6 pb-8">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="shrink-0"
                  onClick={() => navigate(-1)}
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="flex-1">
                  <h1 className="text-2xl font-bold flex items-center gap-2">
                    <BarChart3 className="h-6 w-6 text-primary" />
                    Analytics
                  </h1>
                  <p className="text-muted-foreground text-sm">
                    Analisis lengkap perjalanan belajarmu
                  </p>
                </div>
                <ExportReportButton />
              </div>
            </motion.div>
          </div>
        </div>

        {/* Content */}
        <div className="container max-w-lg mx-auto px-4 -mt-2 space-y-4">
          {/* Summary Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <AnalyticsSummaryCard />
          </motion.div>

          {/* Activity Heatmap */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <ActivityHeatmap />
          </motion.div>

          {/* Monthly Trends */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <MonthlyTrendsChart />
          </motion.div>

          {/* Study Time Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <StudyTimeDistribution />
          </motion.div>

          {/* Weakness Analysis */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <WeaknessAnalysis />
          </motion.div>
        </div>
      </div>
    </AppLayout>
  );
}
