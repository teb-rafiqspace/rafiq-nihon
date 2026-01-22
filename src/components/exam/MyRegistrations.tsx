import { motion } from 'framer-motion';
import { 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  FileText,
  Download,
  Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useUserRegistrations, formatDate, formatCurrency } from '@/hooks/useExamSchedules';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface MyRegistrationsProps {
  onViewDetail: (registrationId: string) => void;
}

const statusConfig = {
  pending: { label: 'Menunggu', icon: Clock, color: 'bg-warning text-warning-foreground' },
  submitted: { label: 'Terkirim', icon: Clock, color: 'bg-warning text-warning-foreground' },
  payment_pending: { label: 'Menunggu Pembayaran', icon: AlertCircle, color: 'bg-warning text-warning-foreground' },
  payment_verified: { label: 'Pembayaran Diverifikasi', icon: CheckCircle2, color: 'bg-accent text-accent-foreground' },
  confirmed: { label: 'Terkonfirmasi', icon: CheckCircle2, color: 'bg-accent text-accent-foreground' },
  rejected: { label: 'Ditolak', icon: AlertCircle, color: 'bg-destructive text-destructive-foreground' },
  cancelled: { label: 'Dibatalkan', icon: AlertCircle, color: 'bg-muted text-muted-foreground' },
};

const paymentStatusConfig = {
  unpaid: { label: 'Belum Bayar', color: 'text-destructive' },
  pending: { label: 'Menunggu Verifikasi', color: 'text-warning' },
  paid: { label: 'Lunas', color: 'text-accent' },
  refunded: { label: 'Dikembalikan', color: 'text-muted-foreground' },
};

export function MyRegistrations({ onViewDetail }: MyRegistrationsProps) {
  const { data: registrations, isLoading } = useUserRegistrations();

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2].map(i => (
          <Skeleton key={i} className="h-40 w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  if (!registrations || registrations.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">Belum ada pendaftaran</p>
        <p className="text-sm text-muted-foreground mt-1">
          Daftar ujian untuk melihat status pendaftaranmu
        </p>
      </div>
    );
  }

  // Group by status
  const pending = registrations.filter(r => 
    r.registration_status === 'pending' || 
    r.registration_status === 'submitted' ||
    r.payment_status === 'unpaid' ||
    r.payment_status === 'pending'
  );
  
  const confirmed = registrations.filter(r => 
    r.registration_status === 'confirmed' && 
    r.payment_status === 'paid'
  );
  
  const completed = registrations.filter(r => {
    if (!r.schedule) return false;
    return new Date(r.schedule.test_date) < new Date();
  });

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold flex items-center gap-2">
        <FileText className="h-5 w-5 text-primary" />
        Pendaftaran Saya
      </h2>

      {/* Pending Payment */}
      {pending.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-warning" />
            <h3 className="font-medium text-foreground">Menunggu Pembayaran</h3>
          </div>
          
          {pending.map((reg, i) => {
            const regStatus = statusConfig[reg.registration_status as keyof typeof statusConfig] || statusConfig.pending;
            const payStatus = paymentStatusConfig[reg.payment_status as keyof typeof paymentStatusConfig] || paymentStatusConfig.unpaid;
            
            return (
              <motion.div
                key={reg.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-card rounded-2xl border border-border p-4 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold">{reg.schedule?.test_name || 'Test'}</h4>
                    <p className="text-sm text-muted-foreground">
                      Level: {reg.test_level} • {reg.schedule?.venue_city || 'TBA'}
                    </p>
                  </div>
                  <Badge className={cn('text-xs', regStatus.color)}>
                    {regStatus.label}
                  </Badge>
                </div>

                <div className="text-sm space-y-1">
                  <p>
                    <span className="text-muted-foreground">Status Pembayaran:</span>{' '}
                    <span className={payStatus.color}>{payStatus.label}</span>
                  </p>
                  <p className="text-muted-foreground">
                    Jumlah: {formatCurrency(reg.payment_amount || 0)}
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => onViewDetail(reg.id)}>
                    <Eye className="h-4 w-4 mr-1" />
                    Detail
                  </Button>
                  {reg.payment_status === 'unpaid' && (
                    <Button size="sm" className="flex-1 bg-gradient-primary text-primary-foreground">
                      Bayar Sekarang
                    </Button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </section>
      )}

      {/* Confirmed */}
      {confirmed.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-accent" />
            <h3 className="font-medium text-foreground">Terkonfirmasi</h3>
          </div>
          
          {confirmed.map((reg, i) => (
            <motion.div
              key={reg.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-card rounded-2xl border border-accent/30 p-4 space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold">{reg.schedule?.test_name || 'Test'}</h4>
                  <p className="text-sm text-muted-foreground">
                    Level: {reg.test_level} • {reg.schedule?.venue_city || 'TBA'}
                  </p>
                </div>
                <Badge className="bg-accent text-accent-foreground text-xs">
                  ✅ Terkonfirmasi
                </Badge>
              </div>

              {reg.exam_number && (
                <div className="bg-muted/50 rounded-lg p-3 text-sm">
                  <p><span className="text-muted-foreground">Nomor Ujian:</span> {reg.exam_number}</p>
                  {reg.exam_room && <p><span className="text-muted-foreground">Ruang:</span> {reg.exam_room}, Kursi {reg.seat_number}</p>}
                </div>
              )}

              <p className="text-sm text-muted-foreground">
                📅 Tanggal Ujian: {reg.schedule ? formatDate(reg.schedule.test_date) : '-'}
              </p>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => onViewDetail(reg.id)}>
                  <Eye className="h-4 w-4 mr-1" />
                  Detail
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <Download className="h-4 w-4 mr-1" />
                  Kartu Ujian
                </Button>
              </div>
            </motion.div>
          ))}
        </section>
      )}

      {/* Completed */}
      {completed.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-muted-foreground" />
            <h3 className="font-medium text-foreground">Selesai</h3>
          </div>
          
          {completed.map((reg, i) => (
            <motion.div
              key={reg.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-card rounded-2xl border border-border p-4 space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold">{reg.schedule?.test_name || 'Test'}</h4>
                  <p className="text-sm text-muted-foreground">
                    Level: {reg.test_level}
                  </p>
                </div>
                <Badge variant="outline" className="text-xs">
                  Selesai
                </Badge>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => onViewDetail(reg.id)}>
                  <Eye className="h-4 w-4 mr-1" />
                  Lihat Hasil
                </Button>
              </div>
            </motion.div>
          ))}
        </section>
      )}
    </div>
  );
}
