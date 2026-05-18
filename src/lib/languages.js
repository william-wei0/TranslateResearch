export const LANGUAGES = [
  { code: 'fr',    label: 'Français',    flag: '🇫🇷', name: 'French' },
  { code: 'es',    label: 'Español',     flag: '🇪🇸', name: 'Spanish' },
  { code: 'de',    label: 'Deutsch',     flag: '🇩🇪', name: 'German' },
  { code: 'zh',    label: '中文',         flag: '🇨🇳', name: 'Mandarin Chinese' },
  { code: 'ja',    label: '日本語',       flag: '🇯🇵', name: 'Japanese' },
  { code: 'ko',    label: '한국어',       flag: '🇰🇷', name: 'Korean' },
  { code: 'pt',    label: 'Português',   flag: '🇧🇷', name: 'Portuguese' },
  { code: 'ar',    label: 'العربية',     flag: '🇸🇦', name: 'Arabic', rtl: true },
  { code: 'hi',    label: 'हिन्दी',      flag: '🇮🇳', name: 'Hindi' },
  { code: 'ru',    label: 'Русский',     flag: '🇷🇺', name: 'Russian' },
  { code: 'it',    label: 'Italiano',    flag: '🇮🇹', name: 'Italian' },
  { code: 'nl',    label: 'Nederlands',  flag: '🇳🇱', name: 'Dutch' },
  { code: 'sv',    label: 'Svenska',     flag: '🇸🇪', name: 'Swedish' },
  { code: 'tr',    label: 'Türkçe',      flag: '🇹🇷', name: 'Turkish' },
  { code: 'pl',    label: 'Polski',      flag: '🇵🇱', name: 'Polish' },
]

export function getLanguageByCode(code) {
  return LANGUAGES.find(l => l.code === code)
}
