import { CardColorTheme } from '../types';

export interface ThemeStyles {
  id: CardColorTheme;
  name: string;
  bg: string;
  border: string;
  hoverBorder: string;
  imageBg: string;
  progressBar: string;
  percentBadge: string;
  dotColor: string;
}

export const CARD_THEMES: Record<CardColorTheme, ThemeStyles> = {
  peach: {
    id: 'peach',
    name: 'Персик',
    bg: 'bg-[#FFF8F3]',
    border: 'border-[#F7E7D9]',
    hoverBorder: 'hover:border-[#E8CEB8]',
    imageBg: 'bg-[#FFF3EB]/80',
    progressBar: 'from-amber-400 to-[#FED766]',
    percentBadge: 'bg-amber-100/80 text-amber-900',
    dotColor: '#F59E0B'
  },
  pink: {
    id: 'pink',
    name: 'Розовый',
    bg: 'bg-[#FFF5F7]',
    border: 'border-[#FCE3E8]',
    hoverBorder: 'hover:border-[#F8BCC8]',
    imageBg: 'bg-[#FEEBF0]/80',
    progressBar: 'from-rose-400 to-[#F8B4C0]',
    percentBadge: 'bg-rose-100/80 text-rose-900',
    dotColor: '#F43F5E'
  },
  mint: {
    id: 'mint',
    name: 'Мята',
    bg: 'bg-[#F3FAF7]',
    border: 'border-[#DDF1EA]',
    hoverBorder: 'hover:border-[#BCE4D7]',
    imageBg: 'bg-[#EAF6F2]/80',
    progressBar: 'from-teal-400 to-teal-500',
    percentBadge: 'bg-teal-100/80 text-teal-900',
    dotColor: '#14B8A6'
  },
  lavender: {
    id: 'lavender',
    name: 'Лаванда',
    bg: 'bg-[#FAF6FE]',
    border: 'border-[#EFE5FB]',
    hoverBorder: 'hover:border-[#DCC8F7]',
    imageBg: 'bg-[#F4EBFC]/80',
    progressBar: 'from-violet-400 to-indigo-400',
    percentBadge: 'bg-violet-100/80 text-violet-900',
    dotColor: '#8B5CF6'
  },
  vanilla: {
    id: 'vanilla',
    name: 'Ваниль',
    bg: 'bg-[#FFFDF2]',
    border: 'border-[#FDF4D4]',
    hoverBorder: 'hover:border-[#FCE5A4]',
    imageBg: 'bg-[#FEFAEC]/80',
    progressBar: 'from-yellow-400 to-amber-400',
    percentBadge: 'bg-yellow-100/80 text-yellow-900',
    dotColor: '#EAB308'
  },
  sky: {
    id: 'sky',
    name: 'Небо',
    bg: 'bg-[#F4FAFE]',
    border: 'border-[#E0F0FB]',
    hoverBorder: 'hover:border-[#BCDDF6]',
    imageBg: 'bg-[#EBF5FC]/80',
    progressBar: 'from-sky-400 to-cyan-500',
    percentBadge: 'bg-sky-100/80 text-sky-900',
    dotColor: '#0EA5E9'
  }
};

const THEME_CYCLE: CardColorTheme[] = ['peach', 'pink', 'mint', 'lavender', 'vanilla', 'sky'];

export function getCardTheme(theme?: CardColorTheme, index: number = 0): ThemeStyles {
  if (theme && CARD_THEMES[theme]) {
    return CARD_THEMES[theme];
  }
  const fallback = THEME_CYCLE[index % THEME_CYCLE.length];
  return CARD_THEMES[fallback];
}
