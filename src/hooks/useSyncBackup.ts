import { useState, useCallback } from 'react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface SyncStatus {
  lastSyncAt: string | null;
  isSyncing: boolean;
  isRestoring: boolean;
  syncProgress: number;
}

interface BackupData {
  profile: Record<string, unknown> | null;
  userProgress: Record<string, unknown>[];
  flashcardProgress: Record<string, unknown>[];
  kanaProgress: Record<string, unknown>[];
  kanjiProgress: Record<string, unknown>[];
  bookmarks: Record<string, unknown>[];
  testAttempts: Record<string, unknown>[];
  practiceHistory: Record<string, unknown>[];
  settings: Record<string, unknown>;
  exportedAt: string;
  version: string;
}

const SYNC_KEY = 'rafiq_nihon_last_sync';
const LOCAL_SETTINGS_KEY = 'rafiq_nihon_settings';

export function useSyncBackup() {
  const { user } = useAuth();
  const [status, setStatus] = useState<SyncStatus>({
    lastSyncAt: localStorage.getItem(SYNC_KEY),
    isSyncing: false,
    isRestoring: false,
    syncProgress: 0,
  });

  const syncToCloud = useCallback(async () => {
    if (!user) {
      toast({ title: 'Silakan login terlebih dahulu', variant: 'destructive' });
      return false;
    }

    setStatus(prev => ({ ...prev, isSyncing: true, syncProgress: 0 }));

    try {
      // Sync local settings to profile
      const localSettings = localStorage.getItem(LOCAL_SETTINGS_KEY);
      if (localSettings) {
        setStatus(prev => ({ ...prev, syncProgress: 20 }));
      }

      // Update last active timestamp
      setStatus(prev => ({ ...prev, syncProgress: 50 }));
      
      const { error } = await supabase
        .from('profiles')
        .update({ last_active_at: new Date().toISOString() })
        .eq('user_id', user.id);

      if (error) throw error;

      setStatus(prev => ({ ...prev, syncProgress: 100 }));
      
      const syncTime = new Date().toISOString();
      localStorage.setItem(SYNC_KEY, syncTime);
      
      setStatus(prev => ({
        ...prev,
        isSyncing: false,
        lastSyncAt: syncTime,
        syncProgress: 0,
      }));

      toast({ title: 'Sinkronisasi berhasil!' });
      return true;
    } catch (error) {
      console.error('Sync error:', error);
      setStatus(prev => ({ ...prev, isSyncing: false, syncProgress: 0 }));
      toast({ title: 'Gagal sinkronisasi', variant: 'destructive' });
      return false;
    }
  }, [user]);

  const exportBackup = useCallback(async (): Promise<BackupData | null> => {
    if (!user) {
      toast({ title: 'Silakan login terlebih dahulu', variant: 'destructive' });
      return null;
    }

    setStatus(prev => ({ ...prev, isSyncing: true, syncProgress: 0 }));

    try {
      // Fetch all user data in parallel
      setStatus(prev => ({ ...prev, syncProgress: 10 }));

      const [
        profileResult,
        progressResult,
        flashcardResult,
        kanaResult,
        kanjiResult,
        bookmarksResult,
        testAttemptsResult,
        practiceHistoryResult,
      ] = await Promise.all([
        supabase.from('profiles').select('*').eq('user_id', user.id).single(),
        supabase.from('user_progress').select('*').eq('user_id', user.id),
        supabase.from('user_flashcard_progress').select('*').eq('user_id', user.id),
        supabase.from('user_kana_progress').select('*').eq('user_id', user.id),
        supabase.from('user_kanji_progress').select('*').eq('user_id', user.id),
        supabase.from('bookmarks').select('*').eq('user_id', user.id),
        supabase.from('test_attempts').select('*').eq('user_id', user.id),
        supabase.from('user_practice_history').select('*').eq('user_id', user.id),
      ]);

      setStatus(prev => ({ ...prev, syncProgress: 80 }));

      const backupData: BackupData = {
        profile: profileResult.data,
        userProgress: progressResult.data || [],
        flashcardProgress: flashcardResult.data || [],
        kanaProgress: kanaResult.data || [],
        kanjiProgress: kanjiResult.data || [],
        bookmarks: bookmarksResult.data || [],
        testAttempts: testAttemptsResult.data || [],
        practiceHistory: practiceHistoryResult.data || [],
        settings: JSON.parse(localStorage.getItem(LOCAL_SETTINGS_KEY) || '{}'),
        exportedAt: new Date().toISOString(),
        version: '1.0.0',
      };

      setStatus(prev => ({ ...prev, syncProgress: 100, isSyncing: false }));
      toast({ title: 'Backup berhasil dibuat!' });
      
      return backupData;
    } catch (error) {
      console.error('Export error:', error);
      setStatus(prev => ({ ...prev, isSyncing: false, syncProgress: 0 }));
      toast({ title: 'Gagal membuat backup', variant: 'destructive' });
      return null;
    }
  }, [user]);

  const downloadBackup = useCallback(async () => {
    const data = await exportBackup();
    if (!data) return;

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rafiq-nihon-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [exportBackup]);

  const restoreFromBackup = useCallback(async (backupData: BackupData): Promise<boolean> => {
    if (!user) {
      toast({ title: 'Silakan login terlebih dahulu', variant: 'destructive' });
      return false;
    }

    setStatus(prev => ({ ...prev, isRestoring: true, syncProgress: 0 }));

    try {
      // Validate backup version
      if (!backupData.version || !backupData.exportedAt) {
        throw new Error('Format backup tidak valid');
      }

      setStatus(prev => ({ ...prev, syncProgress: 10 }));

      // Restore profile data (excluding user_id)
      if (backupData.profile) {
        const { user_id, id, created_at, ...profileData } = backupData.profile as Record<string, unknown>;
        await supabase
          .from('profiles')
          .update(profileData)
          .eq('user_id', user.id);
      }

      setStatus(prev => ({ ...prev, syncProgress: 30 }));

      // Restore bookmarks (insert individually, skip duplicates)
      if (backupData.bookmarks.length > 0) {
        for (const bookmark of backupData.bookmarks) {
          const { id, user_id, created_at, ...bookmarkData } = bookmark as Record<string, unknown>;
          
          // Check if bookmark already exists
          const { data: existing } = await supabase
            .from('bookmarks')
            .select('id')
            .eq('user_id', user.id)
            .eq('content_type', bookmarkData.content_type as string)
            .eq('content_id', bookmarkData.content_id as string)
            .maybeSingle();

          if (!existing) {
            await supabase
              .from('bookmarks')
              .insert({
                ...bookmarkData,
                user_id: user.id,
              } as { content_id: string; content_type: string; notes?: string; user_id: string });
          }
        }
      }

      setStatus(prev => ({ ...prev, syncProgress: 50 }));

      // Restore local settings
      if (backupData.settings && Object.keys(backupData.settings).length > 0) {
        localStorage.setItem(LOCAL_SETTINGS_KEY, JSON.stringify(backupData.settings));
      }

      setStatus(prev => ({ ...prev, syncProgress: 100 }));

      const syncTime = new Date().toISOString();
      localStorage.setItem(SYNC_KEY, syncTime);

      setStatus(prev => ({
        ...prev,
        isRestoring: false,
        lastSyncAt: syncTime,
        syncProgress: 0,
      }));

      toast({ title: 'Data berhasil dipulihkan!' });
      return true;
    } catch (error) {
      console.error('Restore error:', error);
      setStatus(prev => ({ ...prev, isRestoring: false, syncProgress: 0 }));
      toast({ 
        title: 'Gagal memulihkan data', 
        description: error instanceof Error ? error.message : 'Terjadi kesalahan',
        variant: 'destructive' 
      });
      return false;
    }
  }, [user]);

  const importBackup = useCallback(async (file: File): Promise<boolean> => {
    try {
      const text = await file.text();
      const data = JSON.parse(text) as BackupData;
      return await restoreFromBackup(data);
    } catch (error) {
      console.error('Import error:', error);
      toast({ title: 'File backup tidak valid', variant: 'destructive' });
      return false;
    }
  }, [restoreFromBackup]);

  const clearLocalData = useCallback(() => {
    const keysToKeep = ['theme', 'language'];
    const allKeys = Object.keys(localStorage);
    
    allKeys.forEach(key => {
      if (!keysToKeep.includes(key) && key.startsWith('rafiq_nihon_')) {
        localStorage.removeItem(key);
      }
    });

    toast({ title: 'Data lokal berhasil dihapus' });
  }, []);

  return {
    status,
    syncToCloud,
    exportBackup,
    downloadBackup,
    importBackup,
    restoreFromBackup,
    clearLocalData,
  };
}
