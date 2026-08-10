import { router } from 'expo-router';
import { ScrollView, StyleSheet } from 'react-native';

import { AppHeader } from '@/components/app-header';
import { FileLibrary } from '@/components/files/file-library';
import { AppScreen } from '@/components/ui/app-screen';
import { DesignTokens } from '@/constants/theme';
import { fileRoutes } from '@/lib/files/routes';

export default function PersonalLibraryScreen() {
  return <AppScreen edges={['top', 'bottom']}><AppHeader compactTitle onBack={() => router.back()} onRightAction={() => router.push(fileRoutes.uploadPersonal)} rightActionLabel="Import" subtitle="Files not assigned to a course" title="Personal Library" /><ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled"><FileLibrary scope={{ kind: 'personal' }} /></ScrollView></AppScreen>;
}

const styles = StyleSheet.create({ content: { padding: DesignTokens.layout.screenPadding, paddingBottom: 48 } });
