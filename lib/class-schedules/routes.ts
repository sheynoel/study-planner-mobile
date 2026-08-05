import type { Href } from 'expo-router';

export const classScheduleRoutes = {
  courseList(courseId: string): Href {
    return { pathname: '/courses/[id]/schedules', params: { id: courseId } } as unknown as Href;
  },
  add(courseId: string): Href {
    return { pathname: '/courses/[id]/schedules/new', params: { id: courseId } } as unknown as Href;
  },
  details(id: string): Href {
    return { pathname: '/class-schedules/[id]', params: { id } } as unknown as Href;
  },
  edit(id: string): Href {
    return { pathname: '/class-schedules/[id]/edit', params: { id } } as unknown as Href;
  },
};
