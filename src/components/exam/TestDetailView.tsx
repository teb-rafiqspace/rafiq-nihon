import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Bell, 
  Heart, 
  Calendar, 
  Clock, 
  MapPin, 
  FileText, 
  Wallet,
  CreditCard,
  Building2,
  Mail,
  Phone,
  Globe,
  AlertTriangle,
  CheckCircle2,
  Circle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  useTestScheduleDetail, 
  useUserSavedTests,
  useSaveTest,
  getScheduleStatus, 
  formatCurrency, 
  formatDate,
  getDaysRemaining
} from '@/hooks/useExamSchedules';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface TestDetailViewProps {
  scheduleId: string;
  onBack: () => void;
  onRegister: (id: string) => void;
}

const statusConfig = {
  registration_open: {
    label: 'Pendaftaran Dibuka',
    color: 'bg-accent text-accent-foreground',
  },
  upcoming: {
    label: 'Akan Datang',
    color: 'bg-warning text-warning-foreground',
  },
  registration_closed: {
    label: 'Pendaftaran Ditutup',
    color: 'bg-destructive text-destructive-foreground',
  },
  completed: {
    label: 'Selesai',
    color: 'bg-muted text-muted-foreground',
  },
};

const levelInfo = [
  {
    level: 'N5',
    title: 'Pemula',
    kanji: '~100 Kanji',
    vocab: '~800 kosakata',
    hours: '~150 jam belajar',
    suitable: 'Baru belajar 3-6 bulan',
  },
  {
    level: 'N4',
    title: 'Dasar',
    kanji: '~300 Kanji',
    vocab: '~1500 kosakata',
    hours: '~300 jam belajar',
    suitable: '6-12 bulan belajar',
  },
  {
    level: 'N3',
    title: 'Menengah',
    kanji: '~650 Kanji',
    vocab: '~3750 kosakata',
    hours: '~450 jam belajar',
    suitable: '1-2 tahun belajar',
  },
  {
    level: 'N2',
    title: 'Lanjutan',
    kanji: '~1000 Kanji',
    vocab: '~6000 kosakata',
    hours: '~600 jam belajar',
    suitable: '2-3 tahun belajar',
  },
  {
    level: 'N1',
    title: 'Mahir',
    kanji: '~2000 Kanji',
    vocab: '~10000 kosakata',
    hours: '~900 jam belajar',
    suitable: '3+ tahun belajar',
  },
];

export function TestDetailView({ scheduleId, onBack, onRegister }: TestDetailViewProps) {
  const { data: schedule, isLoading } = useTestScheduleDetail(scheduleId);
  const { data: savedTests } = useUserSavedTests();
  const saveTest = useSaveTest();
  const [showLevelInfo, setShowLevelInfo] = useState(false);

  const isSaved = savedTests?.some(s => s.schedule_id === scheduleId);

  if (isLoading || !schedule) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const status = getScheduleStatus(schedule);
  const config = statusConfig[status];
  const daysRemaining = getDaysRemaining(schedule.registration_end);

  // Important dates timeline
  const timeline = [
    { label: 'Pendaftaran Dibuka', date: schedule.registration_start, done: new Date() >= new Date(schedule.registration_start) },
    { label: 'Pendaftaran Ditutup', date: schedule.registration_end, done: new Date() > new Date(schedule.registration_end) },
    { label: 'Batas Pembayaran', date: schedule.payment_deadline, done: schedule.payment_deadline ? new Date() > new Date(schedule.payment_deadline) : false },
    { label: 'HARI UJIAN', date: schedule.test_date, done: new Date() > new Date(schedule.test_date), isMain: true },
    { label: 'Pengumuman Hasil', date: schedule.announcement_date, done: schedule.announcement_date ? new Date() > new Date(schedule.announcement_date) : false },
  ].filter(t => t.date);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pb-24"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => !isSaved && saveTest.mutate(scheduleId)}
          >
            <Bell className={cn("h-5 w-5", isSaved && "fill-primary text-primary")} />
          </Button>
          <Button variant="ghost" size="icon">
            <Heart className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Title */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-foreground">{schedule.test_type?.name_id || schedule.test_name}</h1>
        <p className="text-lg text-muted-foreground font-jp">{schedule.test_type?.name_ja}</p>
        
        <div className="mt-4 inline-block">
          <Badge className={cn('text-sm px-4 py-1', config.color)}>
            {config.label}
          </Badge>
          {status === 'registration_open' && daysRemaining > 0 && (
            <p className="text-sm text-muted-foreground mt-2">
              Pendaftaran berakhir dalam {daysRemaining} hari
            </p>
          )}
        </div>
      </div>

      {/* Test Information */}
      <section className="bg-card rounded-2xl border border-border p-4 mb-4">
        <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary" />
          Informasi Ujian
        </h2>
        
        <div className="space-y-3 text-sm">
          <div className="flex items-start gap-3">
            <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div>
              <p className="font-medium">Tanggal Ujian</p>
              <p className="text-muted-foreground">{formatDate(schedule.test_date, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
            </div>
          </div>
          
          {schedule.test_time_start && (
            <div className="flex items-start gap-3">
              <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">Waktu</p>
                <p className="text-muted-foreground">{schedule.test_time_start} - {schedule.test_time_end} WIB</p>
              </div>
            </div>
          )}
          
          <div className="flex items-start gap-3">
            <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div>
              <p className="font-medium">Tempat</p>
              <p className="text-muted-foreground">{schedule.venue_name || 'TBA'}</p>
              {schedule.venue_address && (
                <p className="text-muted-foreground">{schedule.venue_address}</p>
              )}
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div>
              <p className="font-medium">Level</p>
              <p className="text-muted-foreground">{schedule.levels_available?.join(', ')}</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <Wallet className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div>
              <p className="font-medium">Biaya</p>
              <p className="text-muted-foreground">
                {schedule.fee_amount ? formatCurrency(schedule.fee_amount, schedule.fee_currency || 'IDR') : 'TBA'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="bg-card rounded-2xl border border-border p-4 mb-4">
        <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <Calendar className="h-4 w-4 text-primary" />
          Tanggal Penting
        </h2>
        
        <div className="space-y-0">
          {timeline.map((item, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="flex flex-col items-center">
                {item.done ? (
                  <CheckCircle2 className="h-5 w-5 text-accent" />
                ) : item.isMain ? (
                  <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-primary-foreground" />
                  </div>
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground" />
                )}
                {i < timeline.length - 1 && (
                  <div className="w-0.5 h-8 bg-border" />
                )}
              </div>
              <div className="pb-6">
                <p className={cn(
                  "font-medium text-sm",
                  item.isMain ? "text-primary" : item.done ? "text-accent" : "text-foreground"
                )}>
                  {item.label}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDate(item.date!)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Seat Availability */}
      {schedule.capacity_per_level && (
        <section className="bg-card rounded-2xl border border-border p-4 mb-4">
          <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            📊 Ketersediaan Kursi
          </h2>
          
          <div className="space-y-3">
            {Object.entries(schedule.capacity_per_level).map(([level, capacity]) => {
              const registered = (schedule.current_registrations as Record<string, number>)?.[level] || 0;
              const percentage = Math.round((registered / capacity) * 100);
              
              return (
                <div key={level} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{level}</span>
                    <span className="text-muted-foreground">
                      {registered}/{capacity} ({percentage}%)
                      {percentage >= 90 && ' 🔥'}
                      {percentage >= 80 && percentage < 90 && ' ⚠️'}
                    </span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Requirements */}
      {schedule.requirements && schedule.requirements.length > 0 && (
        <section className="bg-card rounded-2xl border border-border p-4 mb-4">
          <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            Persyaratan
          </h2>
          
          <ul className="space-y-2 text-sm text-muted-foreground">
            {schedule.requirements.map((req, i) => (
              <li key={i} className="flex items-start gap-2">
                <span>•</span>
                <span>{req}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Payment Methods */}
      {schedule.payment_methods && schedule.payment_methods.length > 0 && (
        <section className="bg-card rounded-2xl border border-border p-4 mb-4">
          <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-primary" />
            Metode Pembayaran
          </h2>
          
          <ul className="space-y-2 text-sm text-muted-foreground">
            {schedule.payment_methods.map((method, i) => (
              <li key={i} className="flex items-start gap-2">
                <span>•</span>
                <span>{method}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Organizer */}
      {schedule.institution && (
        <section className="bg-card rounded-2xl border border-border p-4 mb-4">
          <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Building2 className="h-4 w-4 text-primary" />
            Penyelenggara
          </h2>
          
          <div className="space-y-2 text-sm">
            <p className="font-medium">{schedule.institution.name_id}</p>
            {schedule.institution.email && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-3.5 w-3.5" />
                <span>{schedule.institution.email}</span>
              </div>
            )}
            {schedule.institution.phone && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-3.5 w-3.5" />
                <span>{schedule.institution.phone}</span>
              </div>
            )}
            {schedule.institution.website_url && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Globe className="h-3.5 w-3.5" />
                <a href={schedule.institution.website_url} target="_blank" rel="noopener noreferrer" className="text-primary underline">
                  {schedule.institution.website_url.replace('https://', '')}
                </a>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Level Comparison */}
      <Collapsible open={showLevelInfo} onOpenChange={setShowLevelInfo}>
        <CollapsibleTrigger asChild>
          <Button variant="outline" className="w-full mb-4">
            📊 Perbandingan Level {showLevelInfo ? '▲' : '▼'}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <section className="bg-card rounded-2xl border border-border p-4 mb-4">
            <p className="text-sm text-muted-foreground mb-4">Level mana yang cocok untukmu?</p>
            <div className="space-y-3">
              {levelInfo.map((info) => (
                <div key={info.level} className="bg-muted/50 rounded-xl p-3 text-sm">
                  <p className="font-semibold">{info.level} - {info.title}</p>
                  <ul className="text-muted-foreground mt-1 space-y-0.5">
                    <li>• {info.kanji}, {info.vocab}</li>
                    <li>• {info.hours}</li>
                    <li className="text-accent">✅ Cocok untuk: {info.suitable}</li>
                  </ul>
                </div>
              ))}
            </div>
          </section>
        </CollapsibleContent>
      </Collapsible>

      {/* Register Button */}
      <div className="fixed bottom-20 left-0 right-0 p-4 bg-background/95 backdrop-blur-lg border-t border-border">
        <div className="container max-w-lg mx-auto">
          {status === 'registration_open' && (
            <>
              {schedule.allow_in_app_registration ? (
                <Button 
                  className="w-full bg-gradient-primary text-primary-foreground shadow-button"
                  size="lg"
                  onClick={() => onRegister(scheduleId)}
                >
                  🚀 Daftar Ujian Ini
                </Button>
              ) : (
                <>
                  <Button 
                    className="w-full bg-gradient-primary text-primary-foreground shadow-button"
                    size="lg"
                    onClick={() => window.open(schedule.external_registration_url || '', '_blank')}
                  >
                    🚀 Daftar (Website Resmi)
                  </Button>
                  <p className="text-xs text-center text-muted-foreground mt-2">
                    ℹ️ Pendaftaran via website resmi penyelenggara
                  </p>
                </>
              )}
            </>
          )}
          
          {status === 'upcoming' && (
            <Button 
              className="w-full"
              size="lg"
              variant={isSaved ? 'secondary' : 'outline'}
              onClick={() => !isSaved && saveTest.mutate(scheduleId)}
            >
              <Bell className={cn("h-4 w-4 mr-2", isSaved && "fill-current")} />
              {isSaved ? 'Pengingat Sudah Aktif' : 'Ingatkan Saya Saat Pendaftaran Dibuka'}
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
