import type { Href } from 'expo-router';

export const noteRoutes = {
  list: '/notes' as Href,
  forCourse(courseId: string): Href { return { pathname: '/notes', params: { courseId } } as unknown as Href; },
  add: '/notes/new' as Href,
  addForCourse(courseId: string): Href { return { pathname: '/notes/new', params: { courseId } } as unknown as Href; },
  details(id: string): Href { return { pathname: '/notes/[id]', params: { id } } as unknown as Href; },
  edit(id: string): Href { return { pathname: '/notes/[id]/edit', params: { id } } as unknown as Href; },
};
