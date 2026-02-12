import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';

export interface Certificate {
  id: string;
  user_id: string;
  certificate_number: string;
  test_type: string;
  display_name: string;
  score: number;
  total_questions: number;
  score_percent: number;
  passing_score: number;
  time_spent_seconds: number | null;
  section_scores: any;
  issued_date: string;
  created_at: string;
}

export function generateCertificateNumber(testType: string): string {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.floor(1000 + Math.random() * 9000);

  const codeMap: Record<string, string> = {
    cert_jlpt_n5: 'JLPTN5',
    cert_jlpt_n4: 'JLPTN4',
    cert_jlpt_n3: 'JLPTN3',
    cert_jlpt_n2: 'JLPTN2',
    cert_kakunin: 'KAKUNIN',
  };

  const code = codeMap[testType] || 'CERT';
  return `RN-${code}-${date}-${random}`;
}

export function useMyCertificates() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['certificates', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('certificates')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Certificate[];
    },
    enabled: !!user
  });
}

export function useCertificate(id: string | undefined) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['certificate', id],
    queryFn: async () => {
      if (!id || !user) return null;
      const { data, error } = await supabase
        .from('certificates')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();
      if (error) throw error;
      return data as Certificate;
    },
    enabled: !!id && !!user
  });
}

export function useCreateCertificate() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (cert: Omit<Certificate, 'id' | 'user_id' | 'created_at'>) => {
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('certificates')
        .insert({
          ...cert,
          user_id: user.id,
        })
        .select()
        .single();
      if (error) throw error;
      return data as Certificate;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['certificates'] });
    }
  });
}
