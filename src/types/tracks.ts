export type Language = 'japanese' | 'english';
export type Track = 'kemnaker' | 'jlpt_n5' | 'jlpt_n4' | 'jlpt_n3' | 'jlpt_n2' | 'jlpt_n1' | 'ielts' | 'toefl';

export interface LanguageOption {
  id: Language;
  label: string;
  emoji: string;
}

export interface TrackOption {
  id: Track;
  language: Language;
  label: string;
  emoji: string;
  description: string;
}

export const LANGUAGES: LanguageOption[] = [
  { id: 'japanese', label: 'Jepang', emoji: '\u{1F1EF}\u{1F1F5}' },
  // { id: 'english', label: 'Inggris', emoji: '\u{1F1EC}\u{1F1E7}' },
];

export const TRACKS: TrackOption[] = [
  { id: 'kemnaker', language: 'japanese', label: 'Kemnaker', emoji: '\u{1F3ED}', description: 'IM Japan' },
  { id: 'jlpt_n5', language: 'japanese', label: 'N5', emoji: '\u{1F4DC}', description: 'Pemula' },
  { id: 'jlpt_n4', language: 'japanese', label: 'N4', emoji: '\u{1F4D7}', description: 'Dasar' },
  { id: 'jlpt_n3', language: 'japanese', label: 'N3', emoji: '\u{1F4D8}', description: 'Menengah' },
  { id: 'jlpt_n2', language: 'japanese', label: 'N2', emoji: '\u{1F4D5}', description: 'Lanjutan' },
  { id: 'jlpt_n1', language: 'japanese', label: 'N1', emoji: '\u{1F4D5}', description: 'Mahir' },
  // { id: 'ielts', language: 'english', label: 'IELTS', emoji: '\u{1F393}', description: 'Band 5.0-7.5' },
  // { id: 'toefl', language: 'english', label: 'TOEFL', emoji: '\u{1F4DD}', description: 'Score 80-110' },
];

export function getTracksByLanguage(language: Language): TrackOption[] {
  return TRACKS.filter(t => t.language === language);
}

export function getLanguageForTrack(track: Track): Language {
  return TRACKS.find(t => t.id === track)?.language || 'japanese';
}

export function isEnglishTrack(track: string): boolean {
  return track === 'ielts' || track === 'toefl';
}

export function isJapaneseTrack(track: string): boolean {
  return !isEnglishTrack(track);
}
