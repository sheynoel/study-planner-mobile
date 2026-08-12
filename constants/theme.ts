import { Platform } from 'react-native';

export type AppearanceMode = 'system' | 'light' | 'dark';
export type ResolvedAppearanceMode = Exclude<AppearanceMode, 'system'>;
export type ThemePackId = 'default' | 'lavender' | 'rose' | 'ocean' | 'forest' | 'sunset' | 'peach' | 'mint' | 'sky' | 'mono';

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
    body: { fontSize: 14, lineHeight: 20 },
    caption: { fontSize: 12, lineHeight: 16 },
    overline: { fontSize: 11, lineHeight: 14, letterSpacing: 1.1 },
    title: { fontSize: 29, lineHeight: 35 },
    subtitle: { fontSize: 20, lineHeight: 26 },
    display: { fontSize: 34, lineHeight: 40, fontWeight: '700' as const },
    screenTitle: { fontSize: 28, lineHeight: 34, fontWeight: '700' as const },
    sectionTitle: { fontSize: 20, lineHeight: 26, fontWeight: '600' as const },
    cardTitle: { fontSize: 16, lineHeight: 21, fontWeight: '600' as const },
    supporting: { fontSize: 13, lineHeight: 18 },
    button: { fontSize: 14, lineHeight: 20, fontWeight: '600' as const },
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
  const darkSurface = colorLuminance(values.background) < 100;
  const base = {
    tint: values.primary,
    primaryText: '#ffffff',
    icon: values.textMuted,
    tabIconDefault: values.textMuted,
    tabIconSelected: values.primary,
    danger: darkSurface ? '#d88983' : '#b4534b',
    dangerSurface: darkSurface ? '#3c2224' : '#fbeceb',
    dangerText: darkSurface ? '#f3b4b8' : '#8f3934',
    success: darkSurface ? '#91c6aa' : '#4f7a5a',
    successSurface: darkSurface ? '#20362e' : '#e6f1e8',
    warning: darkSurface ? '#e7bf79' : '#9a6a2f',
    warningSurface: darkSurface ? '#3b3020' : '#f8eedb',
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
  default: {
    id: 'default',
    name: 'Default',
    description: 'Quiet sage and paper neutrals.',
    colors: {
      light: palette({ text: '#26332a', background: '#f3f6f1', surface: '#fffefb', surfaceSubtle: '#eef3ec', surfaceAccent: '#e2ece0', textMuted: '#67756a', border: '#d2ddd0', primary: '#64806a', primaryPressed: '#526c58' }),
      dark: palette({ text: '#edf3ed', background: '#111813', surface: '#18211a', surfaceSubtle: '#202b22', surfaceAccent: '#29382c', textMuted: '#a7b5a9', border: '#354539', primary: '#86aa8d', primaryPressed: '#749a7c', primaryText: '#102015', dangerSurface: '#3a201e', dangerText: '#f3b3ae', success: '#9bcca4', successSurface: '#203827', warning: '#e3bb78', warningSurface: '#3b3020' }),
    },
  },
  lavender: {
    id: 'lavender',
    name: 'Lavender',
    description: 'Soft violet tones for calm focus.',
    colors: {
      light: palette({ text: '#342f43', background: '#f6f3f9', surface: '#fffefe', surfaceSubtle: '#efebf5', surfaceAccent: '#e5def0', textMuted: '#70687e', border: '#d9d1e3', primary: '#7d6da8', primaryPressed: '#68598f' }),
      dark: palette({ text: '#f3eff8', background: '#18151f', surface: '#211d2b', surfaceSubtle: '#2b2537', surfaceAccent: '#382f48', textMuted: '#b7acc5', border: '#463c56', primary: '#aa96d4', primaryPressed: '#9580c1', primaryText: '#1c1329', dangerSurface: '#402126', dangerText: '#f2b3ba', success: '#9ac4a3', successSurface: '#23352a', warning: '#e4bc78', warningSurface: '#3b3020' }),
    },
  },
  rose: {
    id: 'rose',
    name: 'Rose',
    description: 'Dusty rose with warm neutral surfaces.',
    colors: {
      light: palette({ text: '#402f35', background: '#faf4f5', surface: '#fffdfd', surfaceSubtle: '#f5e9ec', surfaceAccent: '#ecdde1', textMuted: '#806a71', border: '#e1cfd4', primary: '#a56577', primaryPressed: '#8d5264' }),
      dark: palette({ text: '#f8eef1', background: '#1c1518', surface: '#261d21', surfaceSubtle: '#32262b', surfaceAccent: '#432f36', textMuted: '#c4aab2', border: '#503b42', primary: '#d18ca0', primaryPressed: '#bc788d', primaryText: '#2a1119' }),
    },
  },
  ocean: {
    id: 'ocean',
    name: 'Ocean',
    description: 'Deep blue-green and cool coastal neutrals.',
    colors: {
      light: palette({ text: '#26383d', background: '#f1f7f7', surface: '#fcffff', surfaceSubtle: '#e6f1f1', surfaceAccent: '#d6e8e8', textMuted: '#637a7f', border: '#c8dddd', primary: '#437e86', primaryPressed: '#336971' }),
      dark: palette({ text: '#edf6f6', background: '#101a1d', surface: '#172428', surfaceSubtle: '#1e3035', surfaceAccent: '#274048', textMuted: '#a5bbc0', border: '#355057', primary: '#73aeb6', primaryPressed: '#5f99a2', primaryText: '#0c2024' }),
    },
  },
  forest: {
    id: 'forest',
    name: 'Forest',
    description: 'Grounded evergreen with natural paper tones.',
    colors: {
      light: palette({ text: '#29352c', background: '#f2f5f0', surface: '#fffefb', surfaceSubtle: '#e9efe6', surfaceAccent: '#dbe6d7', textMuted: '#68756a', border: '#cdd9ca', primary: '#4f7659', primaryPressed: '#3e6248' }),
      dark: palette({ text: '#eef3ed', background: '#111813', surface: '#19221b', surfaceSubtle: '#222d24', surfaceAccent: '#2b3b2f', textMuted: '#a8b6aa', border: '#38483b', primary: '#80aa89', primaryPressed: '#6d9677', primaryText: '#102016' }),
    },
  },
  sunset: {
    id: 'sunset',
    name: 'Sunset',
    description: 'Muted coral and dusky plum neutrals.',
    colors: {
      light: palette({ text: '#443137', background: '#faf3f1', surface: '#fffdfb', surfaceSubtle: '#f4e7e3', surfaceAccent: '#ecd9d3', textMuted: '#806b70', border: '#dfcec9', primary: '#b16d62', primaryPressed: '#99584f' }),
      dark: palette({ text: '#f8efec', background: '#1c1518', surface: '#271e21', surfaceSubtle: '#33272b', surfaceAccent: '#453137', textMuted: '#c4aaa9', border: '#513f42', primary: '#d79284', primaryPressed: '#c17d70', primaryText: '#2c1511' }),
    },
  },
  peach: {
    id: 'peach',
    name: 'Peach',
    description: 'Warm cream with a soft apricot accent.',
    colors: {
      light: palette({ text: '#42332c', background: '#fbf5ed', surface: '#fffdf9', surfaceSubtle: '#f5eadc', surfaceAccent: '#eedcc9', textMuted: '#7e6b60', border: '#e2d2c1', primary: '#b57858', primaryPressed: '#9c6245' }),
      dark: palette({ text: '#f8eee5', background: '#1c1713', surface: '#271f1a', surfaceSubtle: '#332820', surfaceAccent: '#443329', textMuted: '#c4ad9c', border: '#503f34', primary: '#d8a07c', primaryPressed: '#c28a68', primaryText: '#29160d' }),
    },
  },
  mint: {
    id: 'mint',
    name: 'Mint',
    description: 'Fresh mint balanced by gentle gray-green.',
    colors: {
      light: palette({ text: '#293a35', background: '#f1f8f5', surface: '#fdfffe', surfaceSubtle: '#e5f2ed', surfaceAccent: '#d4e9e0', textMuted: '#627a71', border: '#c5ddd4', primary: '#4d8a73', primaryPressed: '#3b745f' }),
      dark: palette({ text: '#ecf6f2', background: '#101a17', surface: '#17241f', surfaceSubtle: '#1e3029', surfaceAccent: '#284137', textMuted: '#a2bbb1', border: '#365148', primary: '#78b79e', primaryPressed: '#64a289', primaryText: '#0d2119' }),
    },
  },
  sky: {
    id: 'sky',
    name: 'Sky',
    description: 'Airy blue with clean cool surfaces.',
    colors: {
      light: palette({ text: '#253446', background: '#f1f6fa', surface: '#ffffff', surfaceSubtle: '#eaf2f8', surfaceAccent: '#dceaf5', textMuted: '#617386', border: '#cddce8', primary: '#507fab', primaryPressed: '#3d6b95' }),
      dark: palette({ text: '#edf5fb', background: '#101923', surface: '#172330', surfaceSubtle: '#1e2d3d', surfaceAccent: '#253a4f', textMuted: '#a6b8c8', border: '#34495d', primary: '#7eb0dc', primaryPressed: '#699bc7', primaryText: '#0d1c29' }),
    },
  },
  mono: {
    id: 'mono',
    name: 'Mono',
    description: 'Neutral graphite with minimal color.',
    colors: {
      light: palette({ text: '#292b2e', background: '#f4f4f3', surface: '#ffffff', surfaceSubtle: '#ececeb', surfaceAccent: '#dfdfdd', textMuted: '#6d7074', border: '#d3d4d2', primary: '#555a60', primaryPressed: '#41464b' }),
      dark: palette({ text: '#f0f1f1', background: '#121314', surface: '#1b1c1e', surfaceSubtle: '#25272a', surfaceAccent: '#313438', textMuted: '#acb0b4', border: '#41454a', primary: '#aeb4ba', primaryPressed: '#979da4', primaryText: '#17191b' }),
    },
  },
};

export const ThemePackList = Object.values(ThemePacks);
export const Colors = ThemePacks.default.colors;
export const PlannerColors = { event: '#8b75a8', task: '#b9794c', classSchedule: '#56847b' } as const;

export function getThemeColors(packId: ThemePackId, mode: ResolvedAppearanceMode, accentColor: string | null = null): ThemeColors {
  const colors = ThemePacks[packId].colors[mode];
  if (!accentColor || !isHexColor(accentColor)) return colors;
  const primary = accentColor.toUpperCase();
  return {
    ...colors,
    tint: primary,
    primary,
    primaryPressed: mixHex(primary, '#000000', mode === 'dark' ? 0.12 : 0.18),
    primaryText: readableText(primary),
    tabIconSelected: primary,
    primaryContainer: mixHex(colors.surface, primary, mode === 'dark' ? 0.22 : 0.14),
    surfaceAccent: mixHex(colors.surface, primary, mode === 'dark' ? 0.16 : 0.1),
  };
}

export function isHexColor(value: string): boolean { return /^#[0-9A-F]{6}$/i.test(value); }

function mixHex(base: string, overlay: string, amount: number): string {
  const left = hexChannels(base);
  const right = hexChannels(overlay);
  return `#${left.map((channel, index) => Math.round(channel + (right[index] - channel) * amount).toString(16).padStart(2, '0')).join('')}`.toUpperCase();
}

function hexChannels(value: string): number[] { return [1, 3, 5].map((index) => Number.parseInt(value.slice(index, index + 2), 16)); }
function colorLuminance(value: string): number { const [red, green, blue] = hexChannels(value); return (red * 299 + green * 587 + blue * 114) / 1000; }
function readableText(value: string): string { return colorLuminance(value) > 150 ? '#202326' : '#FFFFFF'; }

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
