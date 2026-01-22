import { motion } from 'framer-motion';
import { Calendar, MapPin, FileText, Wallet, Clock, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TestSchedule, 
  getScheduleStatus, 
  formatCurrency, 
  formatDate, 
  getDaysRemaining 
} from '@/hooks/useExamSchedules';
import { cn } from '@/lib/utils';

interface TestScheduleCardProps {
  schedule: TestSchedule;
  onViewDetails: (id: string) => void;
  onRegister: (id: string) => void;
  onSetReminder: (id: string) => void;
  isSaved?: boolean;
}

const testTypeIcons: Record<string, string> = {
  'tt-jlpt': '🏅',
  'tt-nat': '🏆',
  'tt-jft': '🖥️',
  'tt-jtest': '💬',
};

const statusConfig = {
  registration_open: {
    label: 'Pendaftaran Dibuka',
    color: 'bg-accent text-accent-foreground',
    dotColor: 'bg-accent',
  },
  upcoming: {
    label: 'Akan Datang',
    color: 'bg-warning text-warning-foreground',
    dotColor: 'bg-warning',
  },
  registration_closed: {
    label: 'Pendaftaran Ditutup',
    color: 'bg-destructive text-destructive-foreground',
    dotColor: 'bg-destructive',
  },
  completed: {
    label: 'Selesai',
    color: 'bg-muted text-muted-foreground',
    dotColor: 'bg-muted-foreground',
  },
};

export function TestScheduleCard({ 
  schedule, 
  onViewDetails, 
  onRegister, 
  onSetReminder,
  isSaved 
}: TestScheduleCardProps) {
  const status = getScheduleStatus(schedule);
  const config = statusConfig[status];
  const icon = testTypeIcons[schedule.test_type_id || ''] || '📝';
  
  // Calculate fill percentage for registration_open status
  const getTotalCapacity = () => {
    if (!schedule.capacity_per_level) return 0;
    return Object.values(schedule.capacity_per_level).reduce((a, b) => a + b, 0);
  };
  
  const getTotalRegistered = () => {
    if (!schedule.current_registrations) return 0;
    return Object.values(schedule.current_registrations as Record<string, number>).reduce((a, b) => a + b, 0);
  };
  
  const fillPercentage = Math.round((getTotalRegistered() / getTotalCapacity()) * 100) || 0;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl border border-border shadow-card p-4 space-y-3"
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <span className="text-2xl">{icon}</span>
          <div>
            <h3 className="font-semibold text-foreground">{schedule.test_name}</h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
              <Calendar className="h-3.5 w-3.5" />
              <span>{formatDate(schedule.test_date)}</span>
              <span>•</span>
              <MapPin className="h-3.5 w-3.5" />
              <span>{schedule.venue_city || 'TBA'}</span>
            </div>
          </div>
        </div>
        <Badge className={cn('text-xs', config.color)}>
          {config.label}
        </Badge>
      </div>
      
      {/* Details */}
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <FileText className="h-3.5 w-3.5" />
          <span>Level: {schedule.levels_available?.join(', ') || '-'}</span>
        </div>
        {schedule.fee_amount && (
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Wallet className="h-3.5 w-3.5" />
            <span>{formatCurrency(schedule.fee_amount, schedule.fee_currency || 'IDR')}</span>
          </div>
        )}
      </div>
      
      {/* Status specific content */}
      {status === 'registration_open' && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            <span>Pendaftaran berakhir: {formatDate(schedule.registration_end)}</span>
          </div>
          {schedule.capacity_per_level && (
            <div className="space-y-1">
              <Progress value={fillPercentage} className="h-2" />
              <p className="text-xs text-muted-foreground">{fillPercentage}% terisi</p>
            </div>
          )}
        </div>
      )}
      
      {status === 'upcoming' && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          <span>Pendaftaran dibuka: {formatDate(schedule.registration_start)}</span>
        </div>
      )}
      
      {/* Actions */}
      <div className="flex items-center gap-2 pt-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex-1"
          onClick={() => onViewDetails(schedule.id)}
        >
          Lihat Detail
        </Button>
        
        {status === 'registration_open' && (
          <Button 
            size="sm" 
            className="flex-1 bg-gradient-primary text-primary-foreground"
            onClick={() => onRegister(schedule.id)}
          >
            Daftar Sekarang →
          </Button>
        )}
        
        {status === 'upcoming' && (
          <Button 
            variant={isSaved ? 'secondary' : 'outline'}
            size="sm" 
            className="flex-1"
            onClick={() => onSetReminder(schedule.id)}
          >
            <Bell className={cn("h-4 w-4 mr-1", isSaved && "fill-current")} />
            {isSaved ? 'Pengingat Aktif' : 'Ingatkan Saya'}
          </Button>
        )}
      </div>
    </motion.div>
  );
}
