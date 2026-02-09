import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Session {
  id: string;
  user_agent: string;
  created_at: string;
  is_current: boolean;
}

export function useSessions() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const fetchSessions = useCallback(async () => {
    setIsLoading(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setSessions([]);
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/manage-sessions`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setSessions(data.sessions || []);
      } else {
        console.error('Failed to fetch sessions');
        setSessions([]);
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
      setSessions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const logoutAllSessions = async () => {
    setIsLoggingOut(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        return { error: 'Anda harus login terlebih dahulu' };
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/manage-sessions`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ action: 'logout_all' }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        return { error: data.error || 'Gagal logout dari semua perangkat' };
      }

      // Refresh sessions list
      await fetchSessions();
      
      return { error: null };
    } catch (error) {
      console.error('Logout all error:', error);
      return { error: 'Terjadi kesalahan' };
    } finally {
      setIsLoggingOut(false);
    }
  };

  return {
    sessions,
    isLoading,
    isLoggingOut,
    logoutAllSessions,
    refetch: fetchSessions,
  };
}
