import { StyleSheet, Text, type TextProps } from 'react-native';

import { useThemeColor } from '@/hooks/use-theme-color';
import { DesignTokens } from '@/constants/theme';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, type === 'link' ? 'tint' : 'text');

  return (
    <Text
      style={[
        { color },
        type === 'default' ? styles.default : undefined,
        type === 'title' ? styles.title : undefined,
        type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
        type === 'subtitle' ? styles.subtitle : undefined,
        type === 'link' ? styles.link : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    ...DesignTokens.typography.body,
  },
  defaultSemiBold: {
    ...DesignTokens.typography.body,
    fontWeight: '600',
  },
  title: {
    ...DesignTokens.typography.title,
    fontWeight: '700',
  },
  subtitle: {
    ...DesignTokens.typography.subtitle,
    fontWeight: '700',
  },
  link: {
    lineHeight: 30,
    fontSize: 16,
  },
});
