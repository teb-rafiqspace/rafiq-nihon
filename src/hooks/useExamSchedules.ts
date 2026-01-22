import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';

export interface TestType {
  id: string;
  name_ja: string;
  name_id: string;
  name_en: string | null;
  description: string | null;
  levels: string[] | null;
  icon_name: string | null;
  color: string | null;
}

export interface TestInstitution {
  id: string;
  name_ja: string;
  name_id: string;
  name_en: string | null;
  institution_type: string;
  city: string | null;
  province: string | null;
  email: string | null;
  phone: string | null;
  website_url: string | null;
}

export interface TestSchedule {
  id: string;
  test_type_id: string | null;
  institution_id: string | null;
  test_name: string;
  test_date: string;
  test_time_start: string | null;
  test_time_end: string | null;
  levels_available: string[] | null;
  registration_start: string;
  registration_end: string;
  announcement_date: string | null;
  venue_name: string | null;
  venue_address: string | null;
  venue_city: string | null;
  capacity_per_level: Record<string, number> | null;
  current_registrations: Record<string, number> | null;
  fee_amount: number | null;
  fee_currency: string | null;
  payment_methods: string[] | null;
  payment_deadline: string | null;
  requirements: string[] | null;
  notes: string | null;
  status: string | null;
  external_registration_url: string | null;
  allow_in_app_registration: boolean | null;
  test_type?: TestType;
  institution?: TestInstitution;
}

export interface UserRegistration {
  id: string;
  user_id: string;
  schedule_id: string | null;
  test_level: string;
  full_name: string;
  full_name_katakana: string | null;
  birth_date: string | null;
  gender: string | null;
  nationality: string | null;
  id_card_number: string | null;
  email: string;
  phone: string;
  address: string | null;
  city: string | null;
  registration_status: string | null;
  payment_status: string | null;
  payment_amount: number | null;
  payment_method: string | null;
  exam_number: string | null;
  seat_number: string | null;
  exam_room: string | null;
  submitted_at: string | null;
  confirmed_at: string | null;
  created_at: string | null;
  schedule?: TestSchedule;
}

export interface UserSavedTest {
  id: string;
  user_id: string;
  schedule_id: string | null;
  reminder_set: boolean | null;
  reminder_date: string | null;
  notes: string | null;
}

export function useTestTypes() {
  return useQuery({
    queryKey: ['test-types'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('test_types')
        .select('*')
        .order('name_id');
      
      if (error) throw error;
      return data as TestType[];
    },
  });
}

export function useTestSchedules(filters?: {
  testType?: string;
  city?: string;
  level?: string;
}) {
  return useQuery({
    queryKey: ['test-schedules', filters],
    queryFn: async () => {
      let query = supabase
        .from('test_schedules')
        .select(`
          *,
          test_type:test_types(*),
          institution:test_institutions(*)
        `)
        .order('test_date', { ascending: true });

      if (filters?.testType && filters.testType !== 'all') {
        query = query.eq('test_type_id', filters.testType);
      }
      if (filters?.city && filters.city !== 'all') {
        query = query.eq('venue_city', filters.city);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      // Filter by level on client side (since it's an array)
      let results = data as TestSchedule[];
      if (filters?.level && filters.level !== 'all') {
        results = results.filter(s => 
          s.levels_available?.some(l => l.includes(filters.level!.replace('/', '')))
        );
      }
      
      return results;
    },
  });
}

export function useTestScheduleDetail(scheduleId: string) {
  return useQuery({
    queryKey: ['test-schedule', scheduleId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('test_schedules')
        .select(`
          *,
          test_type:test_types(*),
          institution:test_institutions(*)
        `)
        .eq('id', scheduleId)
        .single();

      if (error) throw error;
      return data as TestSchedule;
    },
    enabled: !!scheduleId,
  });
}

export function useUserRegistrations() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['user-registrations', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('user_test_registrations')
        .select(`
          *,
          schedule:test_schedules(
            *,
            test_type:test_types(*),
            institution:test_institutions(*)
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as UserRegistration[];
    },
    enabled: !!user?.id,
  });
}

export function useUserSavedTests() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['user-saved-tests', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('user_saved_tests')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      return data as UserSavedTest[];
    },
    enabled: !!user?.id,
  });
}

export function useSaveTest() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (scheduleId: string) => {
      if (!user?.id) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('user_saved_tests')
        .insert({
          user_id: user.id,
          schedule_id: scheduleId,
          reminder_set: true,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-saved-tests'] });
      toast.success('Pengingat berhasil diatur!');
    },
    onError: () => {
      toast.error('Gagal mengatur pengingat');
    },
  });
}

export function useRemoveSavedTest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (savedTestId: string) => {
      const { error } = await supabase
        .from('user_saved_tests')
        .delete()
        .eq('id', savedTestId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-saved-tests'] });
      toast.success('Pengingat dihapus');
    },
  });
}

export function useCreateRegistration() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: {
      schedule_id: string;
      test_level: string;
      full_name: string;
      full_name_katakana?: string;
      birth_date?: string;
      gender?: string;
      nationality?: string;
      id_card_number?: string;
      email: string;
      phone: string;
      address?: string;
      city?: string;
      payment_method?: string;
    }) => {
      if (!user?.id) throw new Error('Not authenticated');
      
      const { data: result, error } = await supabase
        .from('user_test_registrations')
        .insert({
          user_id: user.id,
          ...data,
          registration_status: 'submitted',
          payment_status: 'unpaid',
          submitted_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-registrations'] });
      toast.success('Pendaftaran berhasil dikirim!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Gagal mendaftar');
    },
  });
}

export function getScheduleStatus(schedule: TestSchedule): 'registration_open' | 'upcoming' | 'registration_closed' | 'completed' {
  const now = new Date();
  const regStart = new Date(schedule.registration_start);
  const regEnd = new Date(schedule.registration_end);
  const testDate = new Date(schedule.test_date);
  
  if (now > testDate) return 'completed';
  if (now >= regStart && now <= regEnd) return 'registration_open';
  if (now < regStart) return 'upcoming';
  return 'registration_closed';
}

export function formatCurrency(amount: number, currency: string = 'IDR'): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateString: string, options?: Intl.DateTimeFormatOptions): string {
  return new Date(dateString).toLocaleDateString('id-ID', options || {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function getDaysRemaining(dateString: string): number {
  const now = new Date();
  const target = new Date(dateString);
  const diff = target.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}
