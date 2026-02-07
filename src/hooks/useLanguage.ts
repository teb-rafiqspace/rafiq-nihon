import { useState, useEffect, useCallback } from 'react';

type Language = 'id' | 'en' | 'ja';

interface LanguageConfig {
  code: Language;
  name: string;
  nativeName: string;
  flag: string;
}

export const LANGUAGES: LanguageConfig[] = [
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', flag: '🇮🇩' },
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
];

const LANGUAGE_KEY = 'rafiq-nihon-language';

export function useLanguage() {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(LANGUAGE_KEY) as Language | null;
      return saved || 'id';
    }
    return 'id';
  });

  useEffect(() => {
    localStorage.setItem(LANGUAGE_KEY, language);
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = useCallback((newLang: Language) => {
    setLanguageState(newLang);
  }, []);

  const currentLanguage = LANGUAGES.find(l => l.code === language) || LANGUAGES[0];

  return {
    language,
    setLanguage,
    currentLanguage,
    languages: LANGUAGES,
  };
}

// Simple translation helper - for future expansion
export const translations = {
  id: {
    settings: 'Pengaturan',
    theme: 'Tema',
    language: 'Bahasa',
    account: 'Akun',
    appearance: 'Tampilan',
    light: 'Terang',
    dark: 'Gelap',
    system: 'Sistem',
    profile: 'Profil',
    editProfile: 'Edit Profil',
    changePassword: 'Ubah Kata Sandi',
    notifications: 'Notifikasi',
    studyReminder: 'Pengingat Belajar',
    dailyGoal: 'Target Harian',
    logout: 'Keluar',
    deleteAccount: 'Hapus Akun',
    save: 'Simpan',
    cancel: 'Batal',
    name: 'Nama',
    email: 'Email',
    minutes: 'menit',
    about: 'Tentang',
    version: 'Versi',
    privacy: 'Kebijakan Privasi',
    terms: 'Syarat & Ketentuan',
    helpSupport: 'Bantuan & Dukungan',
  },
  en: {
    settings: 'Settings',
    theme: 'Theme',
    language: 'Language',
    account: 'Account',
    appearance: 'Appearance',
    light: 'Light',
    dark: 'Dark',
    system: 'System',
    profile: 'Profile',
    editProfile: 'Edit Profile',
    changePassword: 'Change Password',
    notifications: 'Notifications',
    studyReminder: 'Study Reminder',
    dailyGoal: 'Daily Goal',
    logout: 'Logout',
    deleteAccount: 'Delete Account',
    save: 'Save',
    cancel: 'Cancel',
    name: 'Name',
    email: 'Email',
    minutes: 'minutes',
    about: 'About',
    version: 'Version',
    privacy: 'Privacy Policy',
    terms: 'Terms of Service',
    helpSupport: 'Help & Support',
  },
  ja: {
    settings: '設定',
    theme: 'テーマ',
    language: '言語',
    account: 'アカウント',
    appearance: '外観',
    light: 'ライト',
    dark: 'ダーク',
    system: 'システム',
    profile: 'プロフィール',
    editProfile: 'プロフィール編集',
    changePassword: 'パスワード変更',
    notifications: '通知',
    studyReminder: '学習リマインダー',
    dailyGoal: '毎日の目標',
    logout: 'ログアウト',
    deleteAccount: 'アカウント削除',
    save: '保存',
    cancel: 'キャンセル',
    name: '名前',
    email: 'メール',
    minutes: '分',
    about: 'について',
    version: 'バージョン',
    privacy: 'プライバシーポリシー',
    terms: '利用規約',
    helpSupport: 'ヘルプとサポート',
  },
};

export function useTranslation() {
  const { language } = useLanguage();
  
  const t = useCallback((key: keyof typeof translations.id): string => {
    return translations[language]?.[key] || translations.id[key] || key;
  }, [language]);
  
  return { t, language };
}
