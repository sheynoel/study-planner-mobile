import { StyleSheet } from 'react-native';

import { AppButton } from '@/components/ui/app-button';
import { DesignTokens, Shadows } from '@/constants/theme';

export function FloatingActionButton({ bottom = 92, label, onPress }: { bottom?: number; label: string; onPress: () => void }) {
  return <AppButton label={`+ ${label}`} onPress={onPress} style={[styles.button, { bottom }]} />;
}

const styles = StyleSheet.create({
  button: {
    borderRadius: DesignTokens.radius.lg,
    position: 'absolute',
    right: DesignTokens.layout.screenPadding,
    ...Shadows,
  },
});
