/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import type { ThemeColors } from '@/constants/theme';
import { useAppearance } from '@/contexts/appearance-context';

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof ThemeColors,
) {
  const { colors, resolvedMode } = useAppearance();
  const colorFromProps = props[resolvedMode];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return colors[colorName];
  }
}
