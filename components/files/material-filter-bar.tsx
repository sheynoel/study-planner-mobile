import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { AppButton } from '@/components/ui/app-button';
import { ChoiceChip } from '@/components/ui/choice-chip';
import { DesignTokens } from '@/constants/theme';
import { useAppearance } from '@/contexts/appearance-context';
import type { Course } from '@/lib/api/course.types';
import { materialCategoryLabel, type MaterialCategory, type MaterialFilterState, type MaterialLibraryScope } from '@/lib/files/material-filters';

const CATEGORIES: readonly MaterialCategory[] = ['all', 'pdf', 'slides', 'documents', 'images'];

export function MaterialFilterBar({ courses, filters, onChange, scope }: { courses: Course[]; filters: MaterialFilterState; onChange: (filters: MaterialFilterState) => void; scope: MaterialLibraryScope }) {
  const { colors } = useAppearance();
  const [search, setSearch] = useState(filters.search);
  useEffect(() => setSearch(filters.search), [filters.search]);
  const submitSearch = () => onChange({ ...filters, search: search.trim() });
  return <View style={styles.container}>
    <View style={[styles.searchRow, { backgroundColor: colors.surfaceVariant }]}><Ionicons color={colors.textSecondary} name="search" size={DesignTokens.icon.md} /><TextInput accessibilityLabel="Search materials" onChangeText={setSearch} onSubmitEditing={submitSearch} placeholder="Search materials" placeholderTextColor={colors.textSecondary} returnKeyType="search" style={[styles.search, { color: colors.textPrimary }]} value={search} /><AppButton label="Search" onPress={submitSearch} style={styles.searchButton} variant="ghost" /></View>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>{CATEGORIES.map((category) => <ChoiceChip key={category} label={materialCategoryLabel(category)} selected={filters.category === category} onPress={() => onChange({ ...filters, category })} />)}</ScrollView>
    {scope.kind === 'all' ? <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}><ChoiceChip label="All courses" selected={!filters.courseId} onPress={() => onChange({ ...filters, courseId: undefined })} /><ChoiceChip label="Personal" selected={filters.courseId === 'personal'} onPress={() => onChange({ ...filters, courseId: 'personal' })} />{courses.map((course) => <ChoiceChip key={course.id} label={course.code ?? course.name} selected={filters.courseId === course.id} onPress={() => onChange({ ...filters, courseId: course.id })} />)}</ScrollView> : null}
  </View>;
}

const styles = StyleSheet.create({ container: { gap: DesignTokens.spacing.sm }, searchRow: { alignItems: 'center', borderRadius: DesignTokens.radius.lg, flexDirection: 'row', gap: DesignTokens.spacing.sm, minHeight: DesignTokens.size.inputHeight, paddingLeft: DesignTokens.spacing.md }, search: { flex: 1, fontSize: 16, minHeight: DesignTokens.size.inputHeight }, searchButton: { minHeight: DesignTokens.size.touchTarget, paddingHorizontal: DesignTokens.spacing.md }, chips: { gap: DesignTokens.spacing.sm, paddingRight: DesignTokens.spacing.md } });
