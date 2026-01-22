import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppLayout } from '@/components/layout/AppLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TestScheduleList } from '@/components/exam/TestScheduleList';
import { TestDetailView } from '@/components/exam/TestDetailView';
import { RegistrationForm } from '@/components/exam/RegistrationForm';
import { RegistrationSuccess } from '@/components/exam/RegistrationSuccess';
import { MyRegistrations } from '@/components/exam/MyRegistrations';
import { Calendar, FileText } from 'lucide-react';

type ViewState = 
  | { type: 'list' }
  | { type: 'detail'; scheduleId: string }
  | { type: 'register'; scheduleId: string }
  | { type: 'success' }
  | { type: 'registration-detail'; registrationId: string };

export default function ExamView() {
  const [activeTab, setActiveTab] = useState('schedules');
  const [viewState, setViewState] = useState<ViewState>({ type: 'list' });

  const handleViewDetails = (scheduleId: string) => {
    setViewState({ type: 'detail', scheduleId });
  };

  const handleRegister = (scheduleId: string) => {
    setViewState({ type: 'register', scheduleId });
  };

  const handleBack = () => {
    if (viewState.type === 'register') {
      setViewState({ type: 'detail', scheduleId: viewState.scheduleId });
    } else {
      setViewState({ type: 'list' });
    }
  };

  const handleRegistrationComplete = () => {
    setViewState({ type: 'success' });
  };

  const handleViewRegistrations = () => {
    setActiveTab('registrations');
    setViewState({ type: 'list' });
  };

  const handleViewRegistrationDetail = (registrationId: string) => {
    setViewState({ type: 'registration-detail', registrationId });
  };

  return (
    <AppLayout>
      <div className="container max-w-lg mx-auto px-4 py-6 pb-24">
        <AnimatePresence mode="wait">
          {viewState.type === 'list' && (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="schedules" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Jadwal
                  </TabsTrigger>
                  <TabsTrigger value="registrations" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Pendaftaran
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="schedules">
                  <TestScheduleList
                    onViewDetails={handleViewDetails}
                    onRegister={handleRegister}
                  />
                </TabsContent>

                <TabsContent value="registrations">
                  <MyRegistrations onViewDetail={handleViewRegistrationDetail} />
                </TabsContent>
              </Tabs>
            </motion.div>
          )}

          {viewState.type === 'detail' && (
            <motion.div
              key="detail"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <TestDetailView
                scheduleId={viewState.scheduleId}
                onBack={handleBack}
                onRegister={handleRegister}
              />
            </motion.div>
          )}

          {viewState.type === 'register' && (
            <motion.div
              key="register"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <RegistrationForm
                scheduleId={viewState.scheduleId}
                onBack={handleBack}
                onComplete={handleRegistrationComplete}
              />
            </motion.div>
          )}

          {viewState.type === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
            >
              <RegistrationSuccess
                onViewRegistrations={handleViewRegistrations}
                onBackToSchedules={() => setViewState({ type: 'list' })}
              />
            </motion.div>
          )}

          {viewState.type === 'registration-detail' && (
            <motion.div
              key="reg-detail"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              {/* Registration detail view - simplified for now */}
              <div className="space-y-4">
                <button 
                  onClick={() => setViewState({ type: 'list' })}
                  className="text-sm text-primary flex items-center gap-1"
                >
                  ← Kembali
                </button>
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Detail pendaftaran akan ditampilkan di sini</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppLayout>
  );
}
