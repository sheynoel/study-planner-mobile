import { router, useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { FileCard } from '@/components/files/file-card';
import { MaterialFilterBar } from '@/components/files/material-filter-bar';
import { MaterialGridCard } from '@/components/files/material-grid-card';
import { ThemedText } from '@/components/themed-text';
import { BentoCard } from '@/components/ui/bento-card';
import { EmptyState, ErrorState } from '@/components/ui/async-state';
import { HorizontalCarousel } from '@/components/ui/horizontal-carousel';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { SectionHeader } from '@/components/ui/section-header';
import { DesignTokens } from '@/constants/theme';
import { useCourses } from '@/contexts/course-context';
import { useFiles } from '@/contexts/file-context';
import type { FileRecord } from '@/lib/api/file.types';
import { fileRoutes } from '@/lib/files/routes';
import { DEFAULT_MATERIAL_FILTERS, filterMaterialFiles, toMaterialApiFilters, type MaterialFilterState, type MaterialLibraryScope } from '@/lib/files/material-filters';

export function FileLibrary({ scope }: { scope: MaterialLibraryScope }) {
  const { courses, loadCourses } = useCourses();
  const { files, listError, listStatus, loadFiles } = useFiles();
  const [filters, setFilters] = useState<MaterialFilterState>(DEFAULT_MATERIAL_FILTERS);
  const scopeKind = scope.kind;
  const scopeCourseId = scope.kind === 'course' ? scope.courseId : undefined;
  const scopeCourseName = scope.kind === 'course' ? scope.courseName : undefined;
  const filterCourseId = filters.courseId;
  const filterSearch = filters.search;
  const apiFilters = useMemo(() => toMaterialApiFilters(scopeKind === 'course' ? { kind: 'course', courseId: scopeCourseId!, courseName: scopeCourseName! } : { kind: scopeKind }, { category: 'all', courseId: filterCourseId, search: filterSearch }), [filterCourseId, filterSearch, scopeCourseId, scopeCourseName, scopeKind]);
  const visibleFiles = useMemo(() => filterMaterialFiles(files, scope, filters), [files, filters, scope]);
  const featured = visibleFiles.slice(0, 4);
  const remaining = visibleFiles.slice(4);
  const groups = useMemo(() => groupFiles(remaining, scope), [remaining, scope]);
  const refresh = useCallback(async () => { await Promise.all([loadFiles(apiFilters), scope.kind === 'all' ? loadCourses() : Promise.resolve()]); }, [apiFilters, loadCourses, loadFiles, scope.kind]);
  useFocusEffect(useCallback(() => { void refresh().catch(() => undefined); }, [refresh]));
  const openUpload = () => router.push(scope.kind === 'course' ? fileRoutes.uploadForCourse(scope.courseId) : scope.kind === 'personal' ? fileRoutes.uploadPersonal : fileRoutes.upload);

  return <View style={styles.library}>
    <MaterialFilterBar courses={courses} filters={filters} onChange={setFilters} scope={scope} />
    {listStatus === 'idle' || listStatus === 'loading' ? <LoadingSkeleton rows={3} /> : null}
    {listStatus === 'error' ? <ErrorState message={listError ?? 'Your materials could not be loaded.'} onRetry={() => void refresh().catch(() => undefined)} /> : null}
    {listStatus === 'success' && visibleFiles.length === 0 ? <EmptyState actionLabel="Upload File" description={filters.category !== 'all' || filters.search ? 'No materials match the selected filters.' : scope.kind === 'personal' ? 'Upload a file without assigning it to a course.' : 'Upload a study material to start this library.'} onAction={openUpload} title="No materials found" /> : null}
    {listStatus === 'success' && visibleFiles.length > 0 ? <>
      <View style={styles.edgeSection}><View style={styles.heading}><SectionHeader actionLabel="Upload" onAction={openUpload} title="Recent materials" /></View><HorizontalCarousel>{featured.map((file) => <MaterialGridCard file={file} key={file.id} onPress={() => router.push(fileRoutes.details(file.id))} />)}</HorizontalCarousel></View>
      {groups.map((group) => <View key={group.key} style={styles.group}><SectionHeader title={group.title} />{group.files.map((file) => <FileCard file={file} key={file.id} onPress={() => router.push(fileRoutes.details(file.id))} />)}</View>)}
      {remaining.length === 0 ? <BentoCard tone="subtle"><ThemedText>Your current filtered materials are featured above.</ThemedText></BentoCard> : null}
    </> : null}
  </View>;
}

function groupFiles(files: FileRecord[], scope: MaterialLibraryScope): { files: FileRecord[]; key: string; title: string }[] {
  if (scope.kind === 'course') return files.length ? [{ key: scope.courseId, files, title: `${scope.courseName} materials` }] : [];
  if (scope.kind === 'personal') return files.length ? [{ key: 'personal', files, title: 'Personal & unassigned' }] : [];
  const grouped = new Map<string, FileRecord[]>();
  for (const file of files) { const key = file.courseId ?? 'personal'; grouped.set(key, [...(grouped.get(key) ?? []), file]); }
  return [...grouped.entries()].map(([key, group]) => ({ key, files: group, title: group[0]?.course?.name ?? 'Personal & unassigned' }));
}

const styles = StyleSheet.create({ library: { gap: DesignTokens.layout.sectionGap }, edgeSection: { gap: DesignTokens.spacing.sm, marginHorizontal: -DesignTokens.layout.screenPadding }, heading: { paddingHorizontal: DesignTokens.layout.screenPadding }, group: { gap: DesignTokens.spacing.md } });
