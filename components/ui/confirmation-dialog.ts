import { Alert, Platform } from 'react-native';

export function showDestructiveConfirmation({ confirmLabel = 'Delete', message, onConfirm, title }: { confirmLabel?: string; message: string; onConfirm: () => void; title: string }) {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && window.confirm(`${title}\n\n${message}`)) onConfirm();
    return;
  }
  Alert.alert(title, message, [
    { text: 'Cancel', style: 'cancel' },
    { text: confirmLabel, style: 'destructive', onPress: onConfirm },
  ]);
}
