export type CourseListStatus = 'idle' | 'loading' | 'success' | 'error';
export type CourseListView = 'loading' | 'error' | 'empty' | 'populated';

export function getCourseListView(status: CourseListStatus, courseCount: number): CourseListView {
  if (status === 'idle' || status === 'loading') return 'loading';
  if (status === 'error') return 'error';
  return courseCount === 0 ? 'empty' : 'populated';
}
