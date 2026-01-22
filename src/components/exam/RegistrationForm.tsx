import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Check, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  useTestScheduleDetail, 
  useCreateRegistration,
  formatCurrency, 
  formatDate 
} from '@/hooks/useExamSchedules';
import { useAuth } from '@/lib/auth';
import { useProfile } from '@/hooks/useProfile';
import { toast } from 'sonner';

interface RegistrationFormProps {
  scheduleId: string;
  onBack: () => void;
  onComplete: () => void;
}

interface FormData {
  test_level: string;
  full_name: string;
  full_name_katakana: string;
  birth_date: string;
  gender: string;
  nationality: string;
  id_card_number: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  payment_method: string;
  agreed: boolean;
}

const steps = [
  { id: 1, title: 'Pilih Level' },
  { id: 2, title: 'Data Pribadi' },
  { id: 3, title: 'Dokumen' },
  { id: 4, title: 'Pembayaran' },
];

export function RegistrationForm({ scheduleId, onBack, onComplete }: RegistrationFormProps) {
  const [step, setStep] = useState(1);
  const { data: schedule, isLoading } = useTestScheduleDetail(scheduleId);
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const createRegistration = useCreateRegistration();

  const [formData, setFormData] = useState<FormData>({
    test_level: '',
    full_name: profile?.full_name || '',
    full_name_katakana: '',
    birth_date: '',
    gender: '',
    nationality: 'Indonesia',
    id_card_number: '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    payment_method: '',
    agreed: false,
  });

  const updateField = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const handlePrev = () => {
    if (step > 1) setStep(step - 1);
    else onBack();
  };

  const handleSubmit = async () => {
    if (!formData.agreed) {
      toast.error('Harap setujui syarat dan ketentuan');
      return;
    }

    try {
      await createRegistration.mutateAsync({
        schedule_id: scheduleId,
        test_level: formData.test_level,
        full_name: formData.full_name,
        full_name_katakana: formData.full_name_katakana,
        birth_date: formData.birth_date,
        gender: formData.gender,
        nationality: formData.nationality,
        id_card_number: formData.id_card_number,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        payment_method: formData.payment_method,
      });
      onComplete();
    } catch (error) {
      // Error handled by mutation
    }
  };

  if (isLoading || !schedule) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const progressPercent = (step / 4) * 100;
  const serviceFee = 5000;
  const totalAmount = (schedule.fee_amount || 0) + serviceFee;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pb-24"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <Button variant="ghost" size="icon" onClick={handlePrev}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="font-semibold text-foreground">📝 Daftar {schedule.test_name}</h1>
          <p className="text-sm text-muted-foreground">
            Step {step} of 4: {steps[step - 1].title}
          </p>
        </div>
      </div>

      {/* Progress */}
      <Progress value={progressPercent} className="h-2 mb-6" />

      <AnimatePresence mode="wait">
        {/* Step 1: Select Level */}
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <h2 className="font-semibold text-lg">Pilih level yang ingin diambil:</h2>
            
            <RadioGroup value={formData.test_level} onValueChange={(v) => updateField('test_level', v)}>
              {schedule.levels_available?.map((level) => {
                const capacity = schedule.capacity_per_level?.[level] || 0;
                const registered = (schedule.current_registrations as Record<string, number>)?.[level] || 0;
                const available = capacity - registered;
                
                return (
                  <div key={level} className="flex items-center space-x-3 p-4 border border-border rounded-xl hover:bg-muted/50 transition-colors">
                    <RadioGroupItem value={level} id={level} />
                    <Label htmlFor={level} className="flex-1 cursor-pointer">
                      <p className="font-medium">{level}</p>
                      <p className="text-sm text-muted-foreground">
                        {available}/{capacity} kursi tersedia
                      </p>
                    </Label>
                    {formData.test_level === level && (
                      <Check className="h-5 w-5 text-accent" />
                    )}
                  </div>
                );
              })}
            </RadioGroup>

            {/* Recommendation */}
            <div className="bg-accent/10 rounded-xl p-4 flex items-start gap-3">
              <Lightbulb className="h-5 w-5 text-accent mt-0.5" />
              <div>
                <p className="font-medium text-sm">Rekomendasi berdasarkan progresmu:</p>
                <p className="text-sm text-muted-foreground">
                  Kamu sudah menyelesaikan 60% materi N5. Kami sarankan mulai dari 5級!
                </p>
              </div>
            </div>

            <Button 
              className="w-full" 
              disabled={!formData.test_level}
              onClick={handleNext}
            >
              Lanjutkan →
            </Button>
          </motion.div>
        )}

        {/* Step 2: Personal Info */}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="full_name">Nama Lengkap (sesuai KTP) *</Label>
              <Input 
                id="full_name"
                value={formData.full_name}
                onChange={(e) => updateField('full_name', e.target.value.toUpperCase())}
                placeholder="NAMA LENGKAP"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="full_name_katakana">Nama dalam Katakana *</Label>
              <Input 
                id="full_name_katakana"
                value={formData.full_name_katakana}
                onChange={(e) => updateField('full_name_katakana', e.target.value)}
                placeholder="カタカナ"
                className="font-jp"
              />
              <p className="text-xs text-muted-foreground">ℹ️ Akan tercetak di sertifikat</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="birth_date">Tanggal Lahir *</Label>
              <Input 
                id="birth_date"
                type="date"
                value={formData.birth_date}
                onChange={(e) => updateField('birth_date', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Jenis Kelamin *</Label>
              <RadioGroup 
                value={formData.gender} 
                onValueChange={(v) => updateField('gender', v)}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="male" id="male" />
                  <Label htmlFor="male">Laki-laki</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="female" id="female" />
                  <Label htmlFor="female">Perempuan</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="nationality">Kewarganegaraan *</Label>
              <Select value={formData.nationality} onValueChange={(v) => updateField('nationality', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih negara" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Indonesia">Indonesia</SelectItem>
                  <SelectItem value="Japan">Japan</SelectItem>
                  <SelectItem value="Other">Lainnya</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="id_card_number">Nomor KTP/Passport *</Label>
              <Input 
                id="id_card_number"
                value={formData.id_card_number}
                onChange={(e) => updateField('id_card_number', e.target.value)}
                placeholder="1234567890123456"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input 
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => updateField('email', e.target.value)}
                placeholder="email@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Nomor Telepon *</Label>
              <Input 
                id="phone"
                value={formData.phone}
                onChange={(e) => updateField('phone', e.target.value)}
                placeholder="+62 812-3456-7890"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Alamat</Label>
              <Input 
                id="address"
                value={formData.address}
                onChange={(e) => updateField('address', e.target.value)}
                placeholder="Jl. Contoh No. 123"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">Kota</Label>
              <Input 
                id="city"
                value={formData.city}
                onChange={(e) => updateField('city', e.target.value)}
                placeholder="Jakarta"
              />
            </div>

            <Button 
              className="w-full" 
              disabled={!formData.full_name || !formData.email || !formData.phone}
              onClick={handleNext}
            >
              Lanjutkan →
            </Button>
          </motion.div>
        )}

        {/* Step 3: Documents */}
        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label>📷 Foto (3x4 cm) *</Label>
              <div className="border-2 border-dashed border-border rounded-xl p-8 text-center">
                <div className="w-16 h-20 bg-muted rounded-lg mx-auto mb-3 flex items-center justify-center">
                  <span className="text-2xl">👤</span>
                </div>
                <Button variant="outline" size="sm">
                  📤 Upload Foto
                </Button>
              </div>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Latar belakang putih</li>
                <li>• Wajah terlihat jelas</li>
                <li>• Format JPG/PNG, maks 2MB</li>
              </ul>
            </div>

            <div className="space-y-2">
              <Label>🪪 Dokumen Identitas (KTP/Passport) *</Label>
              <div className="border-2 border-dashed border-border rounded-xl p-6 text-center">
                <Button variant="outline" size="sm">
                  📤 Upload Dokumen
                </Button>
              </div>
            </div>

            <p className="text-sm text-muted-foreground">
              ℹ️ Upload dokumen bersifat opsional saat ini. Anda dapat melengkapinya nanti.
            </p>

            <Button className="w-full" onClick={handleNext}>
              Lanjutkan →
            </Button>
          </motion.div>
        )}

        {/* Step 4: Payment */}
        {step === 4 && (
          <motion.div
            key="step4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            {/* Summary */}
            <div className="bg-muted/50 rounded-xl p-4 space-y-2 text-sm">
              <h3 className="font-semibold">📋 Ringkasan Pendaftaran</h3>
              <div className="grid grid-cols-2 gap-2">
                <span className="text-muted-foreground">Ujian:</span>
                <span>{schedule.test_name}</span>
                <span className="text-muted-foreground">Level:</span>
                <span>{formData.test_level}</span>
                <span className="text-muted-foreground">Tanggal:</span>
                <span>{formatDate(schedule.test_date)}</span>
                <span className="text-muted-foreground">Lokasi:</span>
                <span>{schedule.venue_city || 'TBA'}</span>
                <span className="text-muted-foreground">Nama:</span>
                <span>{formData.full_name}</span>
              </div>
            </div>

            {/* Payment Details */}
            <div className="bg-card rounded-xl border border-border p-4 space-y-2 text-sm">
              <h3 className="font-semibold">💰 Rincian Pembayaran</h3>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Biaya Pendaftaran:</span>
                <span>{formatCurrency(schedule.fee_amount || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Biaya Layanan:</span>
                <span>{formatCurrency(serviceFee)}</span>
              </div>
              <hr className="border-border" />
              <div className="flex justify-between font-semibold">
                <span>Total:</span>
                <span>{formatCurrency(totalAmount)}</span>
              </div>
            </div>

            {/* Payment Method */}
            <div className="space-y-2">
              <Label>Metode Pembayaran:</Label>
              <RadioGroup value={formData.payment_method} onValueChange={(v) => updateField('payment_method', v)}>
                {schedule.payment_methods?.map((method) => (
                  <div key={method} className="flex items-center space-x-3 p-3 border border-border rounded-xl">
                    <RadioGroupItem value={method} id={method} />
                    <Label htmlFor={method} className="cursor-pointer">{method}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {schedule.payment_deadline && (
              <p className="text-sm text-muted-foreground">
                ⏰ Batas pembayaran: {formatDate(schedule.payment_deadline)}
              </p>
            )}

            {/* Terms */}
            <div className="flex items-start space-x-3">
              <Checkbox 
                id="agreed" 
                checked={formData.agreed}
                onCheckedChange={(checked) => updateField('agreed', !!checked)}
              />
              <Label htmlFor="agreed" className="text-sm cursor-pointer">
                Saya menyetujui syarat dan ketentuan pendaftaran
              </Label>
            </div>

            <Button 
              className="w-full bg-gradient-primary text-primary-foreground"
              disabled={!formData.payment_method || !formData.agreed || createRegistration.isPending}
              onClick={handleSubmit}
            >
              {createRegistration.isPending ? 'Memproses...' : '💳 Lanjut ke Pembayaran'}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
