import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth';
import { useRecommendations } from './useRecommendations';
import { useProfile } from './useProfile';

interface ReminderSettings {
  enabled: boolean;
  time: string; // HH:mm format
  lastShownDate: string | null;
}

const STORAGE_KEY = 'study-reminder-settings';
const LAST_REMINDER_KEY = 'last-study-reminder';

const DEFAULT_SETTINGS: ReminderSettings = {
  enabled: true,
  time: '09:00',
  lastShownDate: null
};

export function useStudyReminder() {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const { recommendations, hasWeakTopics, weakTopicsCount } = useRecommendations(3);
  
  const [settings, setSettings] = useState<ReminderSettings>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : DEFAULT_SETTINGS;
  });
  
  const [showReminder, setShowReminder] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | null>(null);

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  // Check notification permission
  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  // Request notification permission
  const requestNotificationPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      return false;
    }
    
    const permission = await Notification.requestPermission();
    setNotificationPermission(permission);
    return permission === 'granted';
  }, []);

  // Update reminder settings
  const updateSettings = useCallback((newSettings: Partial<ReminderSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  // Check if we should show reminder today
  const shouldShowReminder = useCallback(() => {
    if (!settings.enabled || !user) return false;
    
    const today = new Date().toISOString().split('T')[0];
    const lastShown = localStorage.getItem(LAST_REMINDER_KEY);
    
    if (lastShown === today) return false;
    
    const now = new Date();
    const [hours, minutes] = settings.time.split(':').map(Number);
    const reminderTime = new Date();
    reminderTime.setHours(hours, minutes, 0, 0);
    
    // Show reminder if current time is past reminder time
    return now >= reminderTime;
  }, [settings, user]);

  // Generate reminder message based on recommendations
  const getReminderMessage = useCallback(() => {
    const firstName = profile?.full_name?.split(' ')[0] || 'Pelajar';
    
    if (hasWeakTopics && recommendations.length > 0) {
      const topRec = recommendations[0];
      return {
        title: `🔔 Waktunya Belajar, ${firstName}!`,
        body: `${topRec.reasonIcon} ${topRec.title} - ${topRec.reason}`,
        topicTitle: topRec.title,
        topicRoute: topRec.route,
        weakCount: weakTopicsCount
      };
    }
    
    if (profile?.current_streak && profile.current_streak > 0) {
      return {
        title: `🔥 Jaga Streak ${profile.current_streak} Hari!`,
        body: 'Lanjutkan belajar hari ini untuk mempertahankan streak-mu.',
        topicTitle: null,
        topicRoute: '/learn',
        weakCount: 0
      };
    }
    
    return {
      title: `📚 Halo ${firstName}!`,
      body: 'Yuk mulai belajar bahasa Jepang hari ini.',
      topicTitle: null,
      topicRoute: '/learn',
      weakCount: 0
    };
  }, [profile, hasWeakTopics, recommendations, weakTopicsCount]);

  // Show browser notification
  const showBrowserNotification = useCallback(async () => {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
      return false;
    }
    
    const message = getReminderMessage();
    
    const notification = new Notification(message.title, {
      body: message.body,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: 'study-reminder',
      requireInteraction: true
    });
    
    notification.onclick = () => {
      window.focus();
      if (message.topicRoute) {
        window.location.href = message.topicRoute;
      }
      notification.close();
    };
    
    return true;
  }, [getReminderMessage]);

  // Check and trigger reminder
  const checkReminder = useCallback(() => {
    if (shouldShowReminder()) {
      const today = new Date().toISOString().split('T')[0];
      localStorage.setItem(LAST_REMINDER_KEY, today);
      
      // Try browser notification first, fall back to in-app
      if (notificationPermission === 'granted') {
        showBrowserNotification();
      }
      
      setShowReminder(true);
    }
  }, [shouldShowReminder, notificationPermission, showBrowserNotification]);

  // Dismiss reminder
  const dismissReminder = useCallback(() => {
    setShowReminder(false);
  }, []);

  // Check reminder on mount and periodically
  useEffect(() => {
    if (!user) return;
    
    // Check immediately
    checkReminder();
    
    // Check every minute
    const interval = setInterval(checkReminder, 60000);
    
    return () => clearInterval(interval);
  }, [user, checkReminder]);

  return {
    settings,
    updateSettings,
    showReminder,
    dismissReminder,
    getReminderMessage,
    notificationPermission,
    requestNotificationPermission,
    showBrowserNotification
  };
}
