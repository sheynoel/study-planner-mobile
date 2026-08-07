import type { Href } from 'expo-router';

export type CourseWorkspaceTab = 'overview' | 'tasks' | 'materials' | 'schedule' | 'notes';

export const courseRoutes = {
  add: '/courses/new' as Href,
  details(id: string): Href {
    return { pathname: '/courses/[id]', params: { id } } as unknown as Href;
  },
  workspace(id: string, tab: CourseWorkspaceTab): Href {
    return { pathname: '/courses/[id]', params: { id, tab } } as unknown as Href;
  },
  edit(id: string): Href {
    return { pathname: '/courses/[id]/edit', params: { id } } as unknown as Href;
  },
  list: '/courses' as Href,
};
