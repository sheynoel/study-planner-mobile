import type { Href } from 'expo-router';

export const fileRoutes = {
  list: '/files' as Href,
  personal: '/files/personal' as Href,
  forCourse(courseId: string): Href {
    return { pathname: '/files', params: { courseId } } as unknown as Href;
  },
  upload: '/files/upload' as Href,
  uploadPersonal: { pathname: '/files/upload', params: { library: 'personal' } } as unknown as Href,
  uploadForCourse(courseId: string): Href {
    return { pathname: '/files/upload', params: { courseId } } as unknown as Href;
  },
  uploadFromCourseDetails(courseId: string): Href {
    return { pathname: '/files/upload', params: { autoPick: '1', courseId, returnOnSuccess: '1' } } as unknown as Href;
  },
  details(id: string): Href {
    return { pathname: '/files/[id]', params: { id } } as unknown as Href;
  },
  edit(id: string): Href {
    return { pathname: '/files/[id]/edit', params: { id } } as unknown as Href;
  },
};
