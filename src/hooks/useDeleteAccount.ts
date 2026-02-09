import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useDeleteAccount() {
  const [isDeleting, setIsDeleting] = useState(false);

  const deleteAccount = async (password: string) => {
    setIsDeleting(true);
    
    try {
      // Get current session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        return { error: 'Anda harus login terlebih dahulu' };
      }

      // Call the delete-account edge function
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-account`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ password }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return { error: data.error || 'Gagal menghapus akun' };
      }

      // Sign out locally
      await supabase.auth.signOut();

      return { error: null };
    } catch (error) {
      console.error('Delete account error:', error);
      return { error: 'Terjadi kesalahan saat menghapus akun' };
    } finally {
      setIsDeleting(false);
    }
  };

  return { deleteAccount, isDeleting };
}
