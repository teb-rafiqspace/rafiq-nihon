import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Search } from 'lucide-react';
import { TestScheduleCard } from './TestScheduleCard';
import { TestScheduleFilters } from './TestScheduleFilters';
import { 
  useTestSchedules, 
  useUserSavedTests, 
  useSaveTest,
  getScheduleStatus 
} from '@/hooks/useExamSchedules';
import { Skeleton } from '@/components/ui/skeleton';

interface TestScheduleListProps {
  onViewDetails: (id: string) => void;
  onRegister: (id: string) => void;
}

export function TestScheduleList({ onViewDetails, onRegister }: TestScheduleListProps) {
  const [testType, setTestType] = useState('all');
  const [city, setCity] = useState('all');
  const [level, setLevel] = useState('all');

  const { data: schedules, isLoading } = useTestSchedules({
    testType,
    city,
    level,
  });

  const { data: savedTests } = useUserSavedTests();
  const saveTest = useSaveTest();

  const savedScheduleIds = new Set(savedTests?.map(s => s.schedule_id));

  const handleSetReminder = (scheduleId: string) => {
    if (!savedScheduleIds.has(scheduleId)) {
      saveTest.mutate(scheduleId);
    }
  };

  // Group schedules by status
  const registrationOpen = schedules?.filter(s => getScheduleStatus(s) === 'registration_open') || [];
  const upcoming = schedules?.filter(s => getScheduleStatus(s) === 'upcoming') || [];
  const closed = schedules?.filter(s => 
    getScheduleStatus(s) === 'registration_closed' || getScheduleStatus(s) === 'completed'
  ) || [];

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex gap-2">
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-9 w-28" />
          <Skeleton className="h-9 w-36" />
        </div>
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className="h-48 w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-xl font-bold text-foreground flex items-center justify-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Jadwal Ujian Sertifikasi
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Temukan dan daftar ujian bahasa Jepang
        </p>
      </div>

      {/* Filters */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Search className="h-4 w-4" />
          <span>Filter</span>
        </div>
        <TestScheduleFilters
          testType={testType}
          city={city}
          level={level}
          onTestTypeChange={setTestType}
          onCityChange={setCity}
          onLevelChange={setLevel}
        />
      </div>

      {/* Registration Open */}
      <AnimatePresence mode="popLayout">
        {registrationOpen.length > 0 && (
          <motion.section 
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-3"
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-accent" />
              <h2 className="font-semibold text-foreground">Pendaftaran Dibuka</h2>
            </div>
            {registrationOpen.map((schedule, i) => (
              <motion.div
                key={schedule.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <TestScheduleCard
                  schedule={schedule}
                  onViewDetails={onViewDetails}
                  onRegister={onRegister}
                  onSetReminder={handleSetReminder}
                  isSaved={savedScheduleIds.has(schedule.id)}
                />
              </motion.div>
            ))}
          </motion.section>
        )}

        {/* Upcoming */}
        {upcoming.length > 0 && (
          <motion.section 
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-3"
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-warning" />
              <h2 className="font-semibold text-foreground">Akan Datang</h2>
            </div>
            {upcoming.map((schedule, i) => (
              <motion.div
                key={schedule.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <TestScheduleCard
                  schedule={schedule}
                  onViewDetails={onViewDetails}
                  onRegister={onRegister}
                  onSetReminder={handleSetReminder}
                  isSaved={savedScheduleIds.has(schedule.id)}
                />
              </motion.div>
            ))}
          </motion.section>
        )}

        {/* Closed/Completed */}
        {closed.length > 0 && (
          <motion.section 
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-3"
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-muted-foreground" />
              <h2 className="font-semibold text-foreground">Selesai / Ditutup</h2>
            </div>
            {closed.slice(0, 3).map((schedule, i) => (
              <motion.div
                key={schedule.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <TestScheduleCard
                  schedule={schedule}
                  onViewDetails={onViewDetails}
                  onRegister={onRegister}
                  onSetReminder={handleSetReminder}
                  isSaved={savedScheduleIds.has(schedule.id)}
                />
              </motion.div>
            ))}
          </motion.section>
        )}

        {/* Empty state */}
        {schedules?.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Tidak ada jadwal ujian ditemukan</p>
            <p className="text-sm text-muted-foreground mt-1">
              Coba ubah filter pencarian
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
