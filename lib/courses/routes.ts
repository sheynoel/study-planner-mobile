import type { Href } from 'expo-router';

export const courseRoutes = {
  add: '/courses/new' as Href,
  details(id: string): Href {
    return { pathname: '/courses/[id]', params: { id } } as unknown as Href;
  },
  edit(id: string): Href {
    return { pathname: '/courses/[id]/edit', params: { id } } as unknown as Href;
  },
  list: '/' as Href,
};
