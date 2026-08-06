import type { FileListFilters, FileRecord } from '@/lib/api/file.types';

export type MaterialCategory = 'all' | 'pdf' | 'slides' | 'documents' | 'images';
export type MaterialCourseSelection = string | 'personal' | undefined;
export type MaterialLibraryScope = { kind: 'all' } | { kind: 'personal' } | { kind: 'course'; courseId: string; courseName: string };
export type MaterialFilterState = { category: MaterialCategory; courseId?: MaterialCourseSelection; search: string };

export const DEFAULT_MATERIAL_FILTERS: MaterialFilterState = { category: 'all', search: '' };

const CATEGORY_EXTENSIONS: Record<Exclude<MaterialCategory, 'all'>, readonly string[]> = {
  pdf: ['pdf'],
  slides: ['ppt', 'pptx'],
  documents: ['doc', 'docx', 'txt'],
  images: ['png', 'jpg', 'jpeg', 'webp'],
};

export function toMaterialApiFilters(scope: MaterialLibraryScope, filters: MaterialFilterState): FileListFilters {
  const selectedCourse = scope.kind === 'course' ? scope.courseId : scope.kind === 'all' && filters.courseId !== 'personal' ? filters.courseId : undefined;
  return { ...(selectedCourse ? { courseId: selectedCourse } : {}), ...(filters.search.trim() ? { search: filters.search.trim() } : {}) };
}

export function filterMaterialFiles(files: FileRecord[], scope: MaterialLibraryScope, filters: MaterialFilterState): FileRecord[] {
  return files.filter((file) => {
    if (scope.kind === 'personal' && file.courseId !== null) return false;
    if (scope.kind === 'course' && file.courseId !== scope.courseId) return false;
    if (scope.kind === 'all' && filters.courseId === 'personal' && file.courseId !== null) return false;
    if (filters.category === 'all') return true;
    return CATEGORY_EXTENSIONS[filters.category].includes(file.extension?.toLowerCase() ?? '');
  });
}

export function materialCategoryLabel(category: MaterialCategory): string {
  return { all: 'All', pdf: 'PDF', slides: 'Slides', documents: 'Documents', images: 'Images' }[category];
}
