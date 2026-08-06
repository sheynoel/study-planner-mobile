import { Platform } from 'react-native';

export type AppearanceMode = 'system' | 'light' | 'dark';
export type ResolvedAppearanceMode = Exclude<AppearanceMode, 'system'>;
export type ThemePackId = 'sage' | 'latte' | 'sky' | 'lavender' | 'academia';

export type ThemeColors = {
  text: string;
  background: string;
  surface: string;
  surfaceSubtle: string;
  surfaceAccent: string;
  textMuted: string;
  border: string;
  tint: string;
  primary: string;
  primaryPressed: string;
  primaryText: string;
  icon: string;
  tabIconDefault: string;
  tabIconSelected: string;
  danger: string;
  dangerSurface: string;
  dangerText: string;
  success: string;
  successSurface: string;
  warning: string;
  warningSurface: string;
  surfaceVariant: string;
  primaryContainer: string;
  textPrimary: string;
  textSecondary: string;
  outline: string;
  overdue: string;
  overdueContainer: string;
  completed: string;
  completedContainer: string;
};

export type ThemePack = {
  id: ThemePackId;
  name: string;
  description: string;
  colors: Record<ResolvedAppearanceMode, ThemeColors>;
};

export const DesignTokens = {
  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 32 },
  radius: { sm: 8, md: 12, lg: 16, xl: 20, xxl: 28, pill: 999 },
  size: { touchTarget: 44, buttonHeight: 50, inputHeight: 50, bottomBar: 72 },
  icon: { sm: 16, md: 20, lg: 24, xl: 30 },
  motion: { fast: 120, normal: 220, slow: 320 },
  layout: { screenPadding: 20, cardPadding: 16, formGap: 18, sectionGap: 24 },
  typography: {
    body: { fontSize: 16, lineHeight: 24 },
    caption: { fontSize: 13, lineHeight: 18 },
    overline: { fontSize: 12, lineHeight: 16, letterSpacing: 1.2 },
    title: { fontSize: 30, lineHeight: 36 },
    subtitle: { fontSize: 20, lineHeight: 26 },
    display: { fontSize: 34, lineHeight: 40, fontWeight: '700' as const },
    screenTitle: { fontSize: 28, lineHeight: 34, fontWeight: '700' as const },
    sectionTitle: { fontSize: 20, lineHeight: 26, fontWeight: '600' as const },
    cardTitle: { fontSize: 17, lineHeight: 23, fontWeight: '600' as const },
    supporting: { fontSize: 14, lineHeight: 20 },
    button: { fontSize: 15, lineHeight: 20, fontWeight: '600' as const },
  },
} as const;

export const Shadows = Platform.select({
  android: { elevation: 2 },
  default: {
    shadowColor: '#1f2937',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.09,
    shadowRadius: 10,
  },
  web: { boxShadow: '0 3px 14px rgba(31, 41, 55, 0.09)' },
});

function palette(values: Partial<ThemeColors> & Pick<ThemeColors, 'background' | 'border' | 'primary' | 'primaryPressed' | 'surface' | 'surfaceAccent' | 'surfaceSubtle' | 'text' | 'textMuted'>): ThemeColors {
  const base = {
    tint: values.primary,
    primaryText: '#ffffff',
    icon: values.textMuted,
    tabIconDefault: values.textMuted,
    tabIconSelected: values.primary,
    danger: '#b4534b',
    dangerSurface: '#fbeceb',
    dangerText: '#8f3934',
    success: '#4f7a5a',
    successSurface: '#e6f1e8',
    warning: '#9a6a2f',
    warningSurface: '#f8eedb',
    ...values,
  };
  return {
    ...base,
    surfaceVariant: values.surfaceSubtle,
    primaryContainer: values.surfaceAccent,
    textPrimary: values.text,
    textSecondary: values.textMuted,
    outline: values.border,
    overdue: base.danger,
    overdueContainer: base.dangerSurface,
    completed: base.success,
    completedContainer: base.successSurface,
  };
}

export const ThemePacks: Record<ThemePackId, ThemePack> = {
  sage: {
    id: 'sage',
    name: 'Sage Study',
    description: 'Fresh greens and quiet paper tones.',
    colors: {
      light: palette({ text: '#26332a', background: '#f3f6f1', surface: '#fffefb', surfaceSubtle: '#eef3ec', surfaceAccent: '#e2ece0', textMuted: '#67756a', border: '#d2ddd0', primary: '#64806a', primaryPressed: '#526c58' }),
      dark: palette({ text: '#edf3ed', background: '#111813', surface: '#18211a', surfaceSubtle: '#202b22', surfaceAccent: '#29382c', textMuted: '#a7b5a9', border: '#354539', primary: '#86aa8d', primaryPressed: '#749a7c', primaryText: '#102015', dangerSurface: '#3a201e', dangerText: '#f3b3ae', success: '#9bcca4', successSurface: '#203827', warning: '#e3bb78', warningSurface: '#3b3020' }),
    },
  },
  latte: {
    id: 'latte',
    name: 'Latte Notes',
    description: 'Warm notebooks, coffee, and cream.',
    colors: {
      light: palette({ text: '#3c2d27', background: '#f8f2e9', surface: '#fffaf3', surfaceSubtle: '#f3e8da', surfaceAccent: '#ead8c5', textMuted: '#7d6a60', border: '#dfd0c0', primary: '#a56d4f', primaryPressed: '#8d593e' }),
      dark: palette({ text: '#f8ede2', background: '#1c1612', surface: '#261e19', surfaceSubtle: '#312720', surfaceAccent: '#413126', textMuted: '#c3aa99', border: '#4b3b31', primary: '#d29a78', primaryPressed: '#bd8565', primaryText: '#25140b', dangerSurface: '#402321', dangerText: '#f3b8b1', success: '#a9c697', successSurface: '#263522', warning: '#e8bd7c', warningSurface: '#3d3020' }),
    },
  },
  sky: {
    id: 'sky',
    name: 'Sky Planner',
    description: 'Clear blues for an open, focused day.',
    colors: {
      light: palette({ text: '#253446', background: '#f1f6fa', surface: '#ffffff', surfaceSubtle: '#eaf2f8', surfaceAccent: '#dceaf5', textMuted: '#617386', border: '#cddce8', primary: '#507fab', primaryPressed: '#3d6b95' }),
      dark: palette({ text: '#edf5fb', background: '#101923', surface: '#172330', surfaceSubtle: '#1e2d3d', surfaceAccent: '#253a4f', textMuted: '#a6b8c8', border: '#34495d', primary: '#7eb0dc', primaryPressed: '#699bc7', primaryText: '#0d1c29', dangerSurface: '#3c2224', dangerText: '#f3b4b8', success: '#91c6aa', successSurface: '#20362e', warning: '#e7bf79', warningSurface: '#3b3020' }),
    },
  },
  lavender: {
    id: 'lavender',
    name: 'Lavender Focus',
    description: 'Soft violet tones for calm concentration.',
    colors: {
      light: palette({ text: '#342f43', background: '#f6f3f9', surface: '#fffefe', surfaceSubtle: '#efebf5', surfaceAccent: '#e5def0', textMuted: '#70687e', border: '#d9d1e3', primary: '#7d6da8', primaryPressed: '#68598f' }),
      dark: palette({ text: '#f3eff8', background: '#18151f', surface: '#211d2b', surfaceSubtle: '#2b2537', surfaceAccent: '#382f48', textMuted: '#b7acc5', border: '#463c56', primary: '#aa96d4', primaryPressed: '#9580c1', primaryText: '#1c1329', dangerSurface: '#402126', dangerText: '#f2b3ba', success: '#9ac4a3', successSurface: '#23352a', warning: '#e4bc78', warningSurface: '#3b3020' }),
    },
  },
  academia: {
    id: 'academia',
    name: 'Dark Academia',
    description: 'Library wood, parchment, and ink.',
    colors: {
      light: palette({ text: '#332b22', background: '#f1eadc', surface: '#faf5e9', surfaceSubtle: '#e9dfcd', surfaceAccent: '#ded0b8', textMuted: '#746858', border: '#d3c4ad', primary: '#76583f', primaryPressed: '#614631' }),
      dark: palette({ text: '#eee4d2', background: '#15120e', surface: '#1f1a14', surfaceSubtle: '#292219', surfaceAccent: '#392f22', textMuted: '#baaa91', border: '#483d2e', primary: '#b89468', primaryPressed: '#a37f57', primaryText: '#1d140b', dangerSurface: '#3b211c', dangerText: '#efb4a8', success: '#a7bd8f', successSurface: '#293323', warning: '#d9b46f', warningSurface: '#3a2e1c' }),
    },
  },
};

export const ThemePackList = Object.values(ThemePacks);
export const Colors = ThemePacks.sage.colors;
export const PlannerColors = { event: '#8b75a8', task: '#b9794c', classSchedule: '#56847b' } as const;

export function getThemeColors(packId: ThemePackId, mode: ResolvedAppearanceMode): ThemeColors {
  return ThemePacks[packId].colors[mode];
}

export const Fonts = Platform.select({
  ios: { sans: 'system-ui', serif: 'ui-serif', rounded: 'ui-rounded', mono: 'ui-monospace' },
  default: { sans: 'normal', serif: 'serif', rounded: 'normal', mono: 'monospace' },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
