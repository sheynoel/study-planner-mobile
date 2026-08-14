import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ChoiceChip } from '@/components/ui/choice-chip';
import { DesignTokens } from '@/constants/theme';
import { useAppearance } from '@/contexts/appearance-context';
import type { Course } from '@/lib/api/course.types';
import { materialCategoryLabel, type MaterialCategory, type MaterialFilterState, type MaterialLibraryScope, type MaterialSort } from '@/lib/files/material-filters';

const CATEGORIES: readonly MaterialCategory[] = ['all', 'pdf', 'documents', 'slides', 'spreadsheets', 'images', 'others'];
const SORTS: readonly { id: MaterialSort; label: string }[] = [{ id: 'newest', label: 'Newest added' }, { id: 'oldest', label: 'Oldest added' }, { id: 'name_asc', label: 'Name A–Z' }, { id: 'name_desc', label: 'Name Z–A' }, { id: 'largest', label: 'Largest' }, { id: 'smallest', label: 'Smallest' }];

export function MaterialFilterBar({ courses, filters, onChange, scope }: { courses: Course[]; filters: MaterialFilterState; onChange: (filters: MaterialFilterState) => void; scope: MaterialLibraryScope }) {
  const { colors } = useAppearance();
  return <View style={styles.container}><View style={[styles.searchRow, { backgroundColor: colors.surfaceVariant }]}><Ionicons color={colors.textSecondary} name="search" size={17} /><TextInput accessibilityLabel="Search files by name" onChangeText={(search) => onChange({ ...filters, search })} placeholder="Search filenames" placeholderTextColor={colors.textSecondary} style={[styles.search, { color: colors.textPrimary }]} value={filters.search} /></View><FilterRow label="Type">{CATEGORIES.map((category) => <ChoiceChip key={category} label={materialCategoryLabel(category)} onPress={() => onChange({ ...filters, category })} selected={filters.category === category} />)}</FilterRow>{scope.kind === 'all' ? <FilterRow label="Course"><ChoiceChip label="All" onPress={() => onChange({ ...filters, courseId: undefined })} selected={!filters.courseId} /><ChoiceChip label="Personal" onPress={() => onChange({ ...filters, courseId: 'personal' })} selected={filters.courseId === 'personal'} />{courses.map((course) => <ChoiceChip key={course.id} label={course.code ?? course.name} onPress={() => onChange({ ...filters, courseId: course.id })} selected={filters.courseId === course.id} />)}</FilterRow> : null}<FilterRow label="Sort">{SORTS.map((sort) => <ChoiceChip key={sort.id} label={sort.label} onPress={() => onChange({ ...filters, sort: sort.id })} selected={(filters.sort ?? 'newest') === sort.id} />)}</FilterRow></View>;
}
function FilterRow({ children, label }: { children: React.ReactNode; label: string }) { const { colors } = useAppearance(); return <View style={styles.filterRow}><ThemedText style={[styles.label, { color: colors.textSecondary }]}>{label}</ThemedText><ScrollView contentContainerStyle={styles.chips} horizontal showsHorizontalScrollIndicator={false}>{children}</ScrollView></View>; }
const styles = StyleSheet.create({ container: { gap: DesignTokens.spacing.sm }, searchRow: { alignItems: 'center', borderRadius: DesignTokens.radius.md, flexDirection: 'row', gap: DesignTokens.spacing.sm, minHeight: 40, paddingHorizontal: DesignTokens.spacing.md }, search: { flex: 1, fontSize: 12, minHeight: 40 }, filterRow: { gap: 4 }, label: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase' }, chips: { gap: 7, paddingRight: DesignTokens.spacing.md } });
