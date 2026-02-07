export type Language = 'id' | 'en' | 'ja';

export interface TranslationKeys {
  // Common
  settings: string;
  theme: string;
  language: string;
  account: string;
  appearance: string;
  light: string;
  dark: string;
  system: string;
  profile: string;
  editProfile: string;
  changePassword: string;
  notifications: string;
  studyReminder: string;
  dailyGoal: string;
  logout: string;
  deleteAccount: string;
  save: string;
  cancel: string;
  name: string;
  email: string;
  minutes: string;
  about: string;
  version: string;
  privacy: string;
  terms: string;
  helpSupport: string;
  
  // Navigation
  home: string;
  learn: string;
  practice: string;
  chat: string;
  
  // Home page
  greeting: string;
  goodMorning: string;
  goodAfternoon: string;
  goodEvening: string;
  continueLearn: string;
  dailyStreak: string;
  totalXp: string;
  lessonsCompleted: string;
  level: string;
  days: string;
  
  // Learning
  chapters: string;
  lessons: string;
  vocabulary: string;
  grammar: string;
  exercises: string;
  quiz: string;
  complete: string;
  next: string;
  previous: string;
  startLesson: string;
  lessonComplete: string;
  xpEarned: string;
  
  // Flashcards
  flashcards: string;
  decks: string;
  cards: string;
  study: string;
  review: string;
  newCards: string;
  learning: string;
  mastered: string;
  again: string;
  hard: string;
  good: string;
  easy: string;
  tapToFlip: string;
  
  // Quiz
  quizzes: string;
  startQuiz: string;
  question: string;
  correct: string;
  incorrect: string;
  score: string;
  results: string;
  tryAgain: string;
  backToQuizzes: string;
  explanation: string;
  hint: string;
  
  // Speaking
  speaking: string;
  shadowing: string;
  conversation: string;
  roleplay: string;
  recording: string;
  tapToRecord: string;
  listening: string;
  pronunciation: string;
  
  // Mock test
  mockTest: string;
  timeRemaining: string;
  submit: string;
  section: string;
  
  // Kanji
  kanji: string;
  meanings: string;
  readings: string;
  strokeOrder: string;
  examples: string;
  onReading: string;
  kunReading: string;
  
  // Cultural tips
  culturalTips: string;
  doThis: string;
  dontDoThis: string;
  relatedPhrases: string;
  
  // Exam schedule
  examSchedule: string;
  registerNow: string;
  testDate: string;
  registrationDeadline: string;
  venue: string;
  fee: string;
  
  // Profile & stats
  achievements: string;
  badges: string;
  statistics: string;
  weeklyProgress: string;
  analytics: string;
  
  // Bookmarks
  bookmarks: string;
  noBookmarks: string;
  
  // Errors & states
  loading: string;
  error: string;
  retry: string;
  noData: string;
  comingSoon: string;
  
  // Auth
  login: string;
  signUp: string;
  forgotPassword: string;
  password: string;
  confirmPassword: string;
  
  // Dates
  today: string;
  yesterday: string;
  thisWeek: string;
  thisMonth: string;
  
  // Time units
  seconds: string;
  hours: string;
  
  // Misc
  search: string;
  filter: string;
  all: string;
  free: string;
  premium: string;
  locked: string;
  unlocked: string;
  progress: string;
  continue: string;
  start: string;
  finish: string;
  skip: string;
  close: string;
  confirm: string;
  delete: string;
  edit: string;
  add: string;
  remove: string;
  share: string;
  download: string;
  upload: string;
  install: string;
  update: string;
  refresh: string;
  
  // Onboarding
  welcome: string;
  getStarted: string;
  selectGoal: string;
  selectLevel: string;
  
  // Goals
  goalWork: string;
  goalJlpt: string;
  goalTravel: string;
  goalGeneral: string;
  
  // Levels
  beginner: string;
  intermediate: string;
  advanced: string;
  
  // Tracks
  trackKemnaker: string;
  trackJlptN5: string;
  trackJlptN4: string;
  trackJlptN3: string;
  
  // Accessibility
  accessibility: string;
  highContrast: string;
  highContrastDesc: string;
  fontSize: string;
  fontSizeDesc: string;
  reducedMotion: string;
  reducedMotionDesc: string;
  screenReader: string;
  screenReaderDesc: string;
}

export const translations: Record<Language, TranslationKeys> = {
  id: {
    // Common
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
    
    // Navigation
    home: 'Beranda',
    learn: 'Belajar',
    practice: 'Latihan',
    chat: 'Chat',
    
    // Home page
    greeting: 'Halo',
    goodMorning: 'Selamat Pagi',
    goodAfternoon: 'Selamat Siang',
    goodEvening: 'Selamat Malam',
    continueLearn: 'Lanjutkan Belajar',
    dailyStreak: 'Streak Harian',
    totalXp: 'Total XP',
    lessonsCompleted: 'Pelajaran Selesai',
    level: 'Level',
    days: 'hari',
    
    // Learning
    chapters: 'Bab',
    lessons: 'Pelajaran',
    vocabulary: 'Kosakata',
    grammar: 'Tata Bahasa',
    exercises: 'Latihan',
    quiz: 'Kuis',
    complete: 'Selesai',
    next: 'Selanjutnya',
    previous: 'Sebelumnya',
    startLesson: 'Mulai Pelajaran',
    lessonComplete: 'Pelajaran Selesai!',
    xpEarned: 'XP Diperoleh',
    
    // Flashcards
    flashcards: 'Kartu Flash',
    decks: 'Dek',
    cards: 'Kartu',
    study: 'Belajar',
    review: 'Review',
    newCards: 'Kartu Baru',
    learning: 'Dipelajari',
    mastered: 'Dikuasai',
    again: 'Ulangi',
    hard: 'Sulit',
    good: 'Bagus',
    easy: 'Mudah',
    tapToFlip: 'Ketuk untuk balik',
    
    // Quiz
    quizzes: 'Kuis',
    startQuiz: 'Mulai Kuis',
    question: 'Pertanyaan',
    correct: 'Benar',
    incorrect: 'Salah',
    score: 'Skor',
    results: 'Hasil',
    tryAgain: 'Coba Lagi',
    backToQuizzes: 'Kembali ke Kuis',
    explanation: 'Penjelasan',
    hint: 'Petunjuk',
    
    // Speaking
    speaking: 'Berbicara',
    shadowing: 'Shadowing',
    conversation: 'Percakapan',
    roleplay: 'Role-play',
    recording: 'Merekam...',
    tapToRecord: 'Ketuk untuk merekam',
    listening: 'Mendengarkan',
    pronunciation: 'Pengucapan',
    
    // Mock test
    mockTest: 'Simulasi Ujian',
    timeRemaining: 'Waktu Tersisa',
    submit: 'Kirim',
    section: 'Bagian',
    
    // Kanji
    kanji: 'Kanji',
    meanings: 'Arti',
    readings: 'Cara Baca',
    strokeOrder: 'Urutan Goresan',
    examples: 'Contoh',
    onReading: 'On-yomi',
    kunReading: 'Kun-yomi',
    
    // Cultural tips
    culturalTips: 'Tips Budaya',
    doThis: 'Lakukan',
    dontDoThis: 'Jangan Lakukan',
    relatedPhrases: 'Frasa Terkait',
    
    // Exam schedule
    examSchedule: 'Jadwal Ujian',
    registerNow: 'Daftar Sekarang',
    testDate: 'Tanggal Ujian',
    registrationDeadline: 'Batas Pendaftaran',
    venue: 'Lokasi',
    fee: 'Biaya',
    
    // Profile & stats
    achievements: 'Pencapaian',
    badges: 'Lencana',
    statistics: 'Statistik',
    weeklyProgress: 'Progres Mingguan',
    analytics: 'Analitik',
    
    // Bookmarks
    bookmarks: 'Bookmark',
    noBookmarks: 'Belum ada bookmark',
    
    // Errors & states
    loading: 'Memuat...',
    error: 'Terjadi kesalahan',
    retry: 'Coba lagi',
    noData: 'Tidak ada data',
    comingSoon: 'Segera hadir',
    
    // Auth
    login: 'Masuk',
    signUp: 'Daftar',
    forgotPassword: 'Lupa Kata Sandi?',
    password: 'Kata Sandi',
    confirmPassword: 'Konfirmasi Kata Sandi',
    
    // Dates
    today: 'Hari ini',
    yesterday: 'Kemarin',
    thisWeek: 'Minggu ini',
    thisMonth: 'Bulan ini',
    
    // Time units
    seconds: 'detik',
    hours: 'jam',
    
    // Misc
    search: 'Cari',
    filter: 'Filter',
    all: 'Semua',
    free: 'Gratis',
    premium: 'Premium',
    locked: 'Terkunci',
    unlocked: 'Terbuka',
    progress: 'Progres',
    continue: 'Lanjutkan',
    start: 'Mulai',
    finish: 'Selesai',
    skip: 'Lewati',
    close: 'Tutup',
    confirm: 'Konfirmasi',
    delete: 'Hapus',
    edit: 'Edit',
    add: 'Tambah',
    remove: 'Hapus',
    share: 'Bagikan',
    download: 'Unduh',
    upload: 'Unggah',
    install: 'Pasang',
    update: 'Perbarui',
    refresh: 'Segarkan',
    
    // Onboarding
    welcome: 'Selamat Datang',
    getStarted: 'Mulai',
    selectGoal: 'Pilih tujuan belajar',
    selectLevel: 'Pilih level kemampuan',
    
    // Goals
    goalWork: 'Bekerja di Jepang',
    goalJlpt: 'Lulus JLPT',
    goalTravel: 'Traveling ke Jepang',
    goalGeneral: 'Belajar Umum',
    
    // Levels
    beginner: 'Pemula',
    intermediate: 'Menengah',
    advanced: 'Mahir',
    
    // Tracks
    trackKemnaker: 'Kemnaker (IM Japan)',
    trackJlptN5: 'JLPT N5',
    trackJlptN4: 'JLPT N4',
    trackJlptN3: 'JLPT N3',
    
    // Accessibility
    accessibility: 'Aksesibilitas',
    highContrast: 'Kontras Tinggi',
    highContrastDesc: 'Tingkatkan kontras warna untuk visibilitas lebih baik',
    fontSize: 'Ukuran Font',
    fontSizeDesc: 'Sesuaikan ukuran teks di seluruh aplikasi',
    reducedMotion: 'Kurangi Animasi',
    reducedMotionDesc: 'Minimalkan animasi untuk kenyamanan visual',
    screenReader: 'Optimasi Screen Reader',
    screenReaderDesc: 'Optimalkan untuk pembaca layar',
  },
  
  en: {
    // Common
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
    
    // Navigation
    home: 'Home',
    learn: 'Learn',
    practice: 'Practice',
    chat: 'Chat',
    
    // Home page
    greeting: 'Hello',
    goodMorning: 'Good Morning',
    goodAfternoon: 'Good Afternoon',
    goodEvening: 'Good Evening',
    continueLearn: 'Continue Learning',
    dailyStreak: 'Daily Streak',
    totalXp: 'Total XP',
    lessonsCompleted: 'Lessons Completed',
    level: 'Level',
    days: 'days',
    
    // Learning
    chapters: 'Chapters',
    lessons: 'Lessons',
    vocabulary: 'Vocabulary',
    grammar: 'Grammar',
    exercises: 'Exercises',
    quiz: 'Quiz',
    complete: 'Complete',
    next: 'Next',
    previous: 'Previous',
    startLesson: 'Start Lesson',
    lessonComplete: 'Lesson Complete!',
    xpEarned: 'XP Earned',
    
    // Flashcards
    flashcards: 'Flashcards',
    decks: 'Decks',
    cards: 'Cards',
    study: 'Study',
    review: 'Review',
    newCards: 'New Cards',
    learning: 'Learning',
    mastered: 'Mastered',
    again: 'Again',
    hard: 'Hard',
    good: 'Good',
    easy: 'Easy',
    tapToFlip: 'Tap to flip',
    
    // Quiz
    quizzes: 'Quizzes',
    startQuiz: 'Start Quiz',
    question: 'Question',
    correct: 'Correct',
    incorrect: 'Incorrect',
    score: 'Score',
    results: 'Results',
    tryAgain: 'Try Again',
    backToQuizzes: 'Back to Quizzes',
    explanation: 'Explanation',
    hint: 'Hint',
    
    // Speaking
    speaking: 'Speaking',
    shadowing: 'Shadowing',
    conversation: 'Conversation',
    roleplay: 'Role-play',
    recording: 'Recording...',
    tapToRecord: 'Tap to record',
    listening: 'Listening',
    pronunciation: 'Pronunciation',
    
    // Mock test
    mockTest: 'Mock Test',
    timeRemaining: 'Time Remaining',
    submit: 'Submit',
    section: 'Section',
    
    // Kanji
    kanji: 'Kanji',
    meanings: 'Meanings',
    readings: 'Readings',
    strokeOrder: 'Stroke Order',
    examples: 'Examples',
    onReading: 'On-yomi',
    kunReading: 'Kun-yomi',
    
    // Cultural tips
    culturalTips: 'Cultural Tips',
    doThis: 'Do This',
    dontDoThis: "Don't Do This",
    relatedPhrases: 'Related Phrases',
    
    // Exam schedule
    examSchedule: 'Exam Schedule',
    registerNow: 'Register Now',
    testDate: 'Test Date',
    registrationDeadline: 'Registration Deadline',
    venue: 'Venue',
    fee: 'Fee',
    
    // Profile & stats
    achievements: 'Achievements',
    badges: 'Badges',
    statistics: 'Statistics',
    weeklyProgress: 'Weekly Progress',
    analytics: 'Analytics',
    
    // Bookmarks
    bookmarks: 'Bookmarks',
    noBookmarks: 'No bookmarks yet',
    
    // Errors & states
    loading: 'Loading...',
    error: 'An error occurred',
    retry: 'Retry',
    noData: 'No data',
    comingSoon: 'Coming soon',
    
    // Auth
    login: 'Login',
    signUp: 'Sign Up',
    forgotPassword: 'Forgot Password?',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    
    // Dates
    today: 'Today',
    yesterday: 'Yesterday',
    thisWeek: 'This Week',
    thisMonth: 'This Month',
    
    // Time units
    seconds: 'seconds',
    hours: 'hours',
    
    // Misc
    search: 'Search',
    filter: 'Filter',
    all: 'All',
    free: 'Free',
    premium: 'Premium',
    locked: 'Locked',
    unlocked: 'Unlocked',
    progress: 'Progress',
    continue: 'Continue',
    start: 'Start',
    finish: 'Finish',
    skip: 'Skip',
    close: 'Close',
    confirm: 'Confirm',
    delete: 'Delete',
    edit: 'Edit',
    add: 'Add',
    remove: 'Remove',
    share: 'Share',
    download: 'Download',
    upload: 'Upload',
    install: 'Install',
    update: 'Update',
    refresh: 'Refresh',
    
    // Onboarding
    welcome: 'Welcome',
    getStarted: 'Get Started',
    selectGoal: 'Select your learning goal',
    selectLevel: 'Select your skill level',
    
    // Goals
    goalWork: 'Work in Japan',
    goalJlpt: 'Pass JLPT',
    goalTravel: 'Travel to Japan',
    goalGeneral: 'General Learning',
    
    // Levels
    beginner: 'Beginner',
    intermediate: 'Intermediate',
    advanced: 'Advanced',
    
    // Tracks
    trackKemnaker: 'Kemnaker (IM Japan)',
    trackJlptN5: 'JLPT N5',
    trackJlptN4: 'JLPT N4',
    trackJlptN3: 'JLPT N3',
    
    // Accessibility
    accessibility: 'Accessibility',
    highContrast: 'High Contrast',
    highContrastDesc: 'Increase color contrast for better visibility',
    fontSize: 'Font Size',
    fontSizeDesc: 'Adjust text size across the app',
    reducedMotion: 'Reduced Motion',
    reducedMotionDesc: 'Minimize animations for visual comfort',
    screenReader: 'Screen Reader Optimization',
    screenReaderDesc: 'Optimize for screen readers',
  },
  
  ja: {
    // Common
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
    
    // Navigation
    home: 'ホーム',
    learn: '学ぶ',
    practice: '練習',
    chat: 'チャット',
    
    // Home page
    greeting: 'こんにちは',
    goodMorning: 'おはようございます',
    goodAfternoon: 'こんにちは',
    goodEvening: 'こんばんは',
    continueLearn: '学習を続ける',
    dailyStreak: '連続学習日数',
    totalXp: '合計XP',
    lessonsCompleted: '完了したレッスン',
    level: 'レベル',
    days: '日',
    
    // Learning
    chapters: '章',
    lessons: 'レッスン',
    vocabulary: '語彙',
    grammar: '文法',
    exercises: '練習',
    quiz: 'クイズ',
    complete: '完了',
    next: '次へ',
    previous: '前へ',
    startLesson: 'レッスン開始',
    lessonComplete: 'レッスン完了！',
    xpEarned: '獲得XP',
    
    // Flashcards
    flashcards: 'フラッシュカード',
    decks: 'デッキ',
    cards: 'カード',
    study: '学習',
    review: '復習',
    newCards: '新しいカード',
    learning: '学習中',
    mastered: 'マスター',
    again: 'もう一度',
    hard: '難しい',
    good: '良い',
    easy: '簡単',
    tapToFlip: 'タップして裏返す',
    
    // Quiz
    quizzes: 'クイズ',
    startQuiz: 'クイズ開始',
    question: '質問',
    correct: '正解',
    incorrect: '不正解',
    score: 'スコア',
    results: '結果',
    tryAgain: 'もう一度',
    backToQuizzes: 'クイズに戻る',
    explanation: '解説',
    hint: 'ヒント',
    
    // Speaking
    speaking: 'スピーキング',
    shadowing: 'シャドーイング',
    conversation: '会話',
    roleplay: 'ロールプレイ',
    recording: '録音中...',
    tapToRecord: 'タップして録音',
    listening: 'リスニング',
    pronunciation: '発音',
    
    // Mock test
    mockTest: '模擬試験',
    timeRemaining: '残り時間',
    submit: '提出',
    section: 'セクション',
    
    // Kanji
    kanji: '漢字',
    meanings: '意味',
    readings: '読み方',
    strokeOrder: '書き順',
    examples: '例',
    onReading: '音読み',
    kunReading: '訓読み',
    
    // Cultural tips
    culturalTips: '文化のヒント',
    doThis: 'やるべきこと',
    dontDoThis: 'やってはいけないこと',
    relatedPhrases: '関連フレーズ',
    
    // Exam schedule
    examSchedule: '試験日程',
    registerNow: '今すぐ登録',
    testDate: '試験日',
    registrationDeadline: '登録締め切り',
    venue: '会場',
    fee: '費用',
    
    // Profile & stats
    achievements: '実績',
    badges: 'バッジ',
    statistics: '統計',
    weeklyProgress: '週間進捗',
    analytics: '分析',
    
    // Bookmarks
    bookmarks: 'ブックマーク',
    noBookmarks: 'ブックマークがありません',
    
    // Errors & states
    loading: '読み込み中...',
    error: 'エラーが発生しました',
    retry: '再試行',
    noData: 'データがありません',
    comingSoon: '近日公開',
    
    // Auth
    login: 'ログイン',
    signUp: '登録',
    forgotPassword: 'パスワードを忘れた？',
    password: 'パスワード',
    confirmPassword: 'パスワード確認',
    
    // Dates
    today: '今日',
    yesterday: '昨日',
    thisWeek: '今週',
    thisMonth: '今月',
    
    // Time units
    seconds: '秒',
    hours: '時間',
    
    // Misc
    search: '検索',
    filter: 'フィルター',
    all: 'すべて',
    free: '無料',
    premium: 'プレミアム',
    locked: 'ロック',
    unlocked: 'アンロック',
    progress: '進捗',
    continue: '続ける',
    start: '開始',
    finish: '終了',
    skip: 'スキップ',
    close: '閉じる',
    confirm: '確認',
    delete: '削除',
    edit: '編集',
    add: '追加',
    remove: '削除',
    share: '共有',
    download: 'ダウンロード',
    upload: 'アップロード',
    install: 'インストール',
    update: '更新',
    refresh: '更新',
    
    // Onboarding
    welcome: 'ようこそ',
    getStarted: '始める',
    selectGoal: '学習目標を選択',
    selectLevel: 'レベルを選択',
    
    // Goals
    goalWork: '日本で働く',
    goalJlpt: 'JLPT合格',
    goalTravel: '日本旅行',
    goalGeneral: '一般学習',
    
    // Levels
    beginner: '初級',
    intermediate: '中級',
    advanced: '上級',
    
    // Tracks
    trackKemnaker: 'Kemnaker (IM Japan)',
    trackJlptN5: 'JLPT N5',
    trackJlptN4: 'JLPT N4',
    trackJlptN3: 'JLPT N3',
    
    // Accessibility
    accessibility: 'アクセシビリティ',
    highContrast: 'ハイコントラスト',
    highContrastDesc: '視認性を向上させるためにコントラストを上げる',
    fontSize: 'フォントサイズ',
    fontSizeDesc: 'アプリ全体のテキストサイズを調整',
    reducedMotion: 'アニメーション削減',
    reducedMotionDesc: '視覚的な快適さのためにアニメーションを最小化',
    screenReader: 'スクリーンリーダー最適化',
    screenReaderDesc: 'スクリーンリーダー用に最適化',
  },
};
