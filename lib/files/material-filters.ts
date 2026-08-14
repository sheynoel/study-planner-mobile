import type { FileListFilters, FileRecord } from '@/lib/api/file.types';

export type MaterialCategory = 'all' | 'pdf' | 'slides' | 'documents' | 'spreadsheets' | 'images' | 'others';
export type MaterialSort = 'newest' | 'oldest' | 'name_asc' | 'name_desc' | 'largest' | 'smallest';
export type MaterialCourseSelection = string | 'personal' | undefined;
export type MaterialLibraryScope = { kind: 'all' } | { kind: 'personal' } | { kind: 'course'; courseId: string; courseName: string };
export type MaterialFilterState = { category: MaterialCategory; courseId?: MaterialCourseSelection; search: string; sort?: MaterialSort };
export const DEFAULT_MATERIAL_FILTERS: MaterialFilterState = { category: 'all', search: '', sort: 'newest' };

const CATEGORY_EXTENSIONS: Record<Exclude<MaterialCategory, 'all'>, readonly string[]> = {
  pdf: ['pdf'], slides: ['ppt', 'pptx'], documents: ['doc', 'docx', 'txt'],
  spreadsheets: ['xls', 'xlsx', 'csv'], images: ['png', 'jpg', 'jpeg', 'webp', 'gif', 'heic'], others: [],
};

export function toMaterialApiFilters(scope: MaterialLibraryScope, filters: MaterialFilterState): FileListFilters {
  const selectedCourse = scope.kind === 'course' ? scope.courseId : scope.kind === 'all' && filters.courseId !== 'personal' ? filters.courseId : undefined;
  return { ...(selectedCourse ? { courseId: selectedCourse } : {}), ...(filters.search.trim() ? { search: filters.search.trim() } : {}) };
}

export function filterMaterialFiles(files: FileRecord[], scope: MaterialLibraryScope, filters: MaterialFilterState): FileRecord[] {
  const search = filters.search.trim().toLocaleLowerCase();
  const filtered = files.filter((file) => {
    if (scope.kind === 'personal' && file.courseId !== null) return false;
    if (scope.kind === 'course' && file.courseId !== scope.courseId) return false;
    if (scope.kind === 'all' && filters.courseId === 'personal' && file.courseId !== null) return false;
    if (scope.kind === 'all' && filters.courseId && filters.courseId !== 'personal' && file.courseId !== filters.courseId) return false;
    if (search && !`${file.displayName} ${file.originalName}`.toLocaleLowerCase().includes(search)) return false;
    if (filters.category === 'all') return true;
    const extension = file.extension?.toLowerCase() ?? '';
    if (filters.category === 'others') return !Object.entries(CATEGORY_EXTENSIONS).some(([category, extensions]) => category !== 'others' && extensions.includes(extension));
    return CATEGORY_EXTENSIONS[filters.category].includes(extension);
  });
  return filtered.sort((left, right) => {
    switch (filters.sort ?? 'newest') {
      case 'oldest': return Date.parse(left.createdAt) - Date.parse(right.createdAt);
      case 'name_asc': return left.displayName.localeCompare(right.displayName);
      case 'name_desc': return right.displayName.localeCompare(left.displayName);
      case 'largest': return right.sizeBytes - left.sizeBytes;
      case 'smallest': return left.sizeBytes - right.sizeBytes;
      default: return Date.parse(right.createdAt) - Date.parse(left.createdAt);
    }
  });
}

export function materialCategoryLabel(category: MaterialCategory): string {
  return { all: 'All', pdf: 'PDF', slides: 'Presentations', documents: 'Documents', spreadsheets: 'Spreadsheets', images: 'Images', others: 'Others' }[category];
}
