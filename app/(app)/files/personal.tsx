import { router } from 'expo-router';
import { ScrollView, StyleSheet } from 'react-native';

import { AppHeader } from '@/components/app-header';
import { FileLibrary } from '@/components/files/file-library';
import { AppScreen } from '@/components/ui/app-screen';
import { DesignTokens } from '@/constants/theme';

export default function PersonalLibraryScreen() {
  return <AppScreen edges={['top', 'bottom']}><AppHeader onBack={() => router.back()} subtitle="Files that are not assigned to a course." title="Personal Library" /><ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled"><FileLibrary scope={{ kind: 'personal' }} /></ScrollView></AppScreen>;
}

const styles = StyleSheet.create({ content: { padding: DesignTokens.layout.screenPadding, paddingBottom: 48 } });
