import type { Href } from 'expo-router';

export const taskRoutes = {
  add: '/tasks/new' as Href,
  details(id: string): Href {
    return { pathname: '/tasks/[id]', params: { id } } as unknown as Href;
  },
  edit(id: string): Href {
    return { pathname: '/tasks/[id]/edit', params: { id } } as unknown as Href;
  },
  list: '/tasks' as Href,
};
