import type { Href } from 'expo-router';

export const calendarRoutes = {
  list: '/calendar' as Href,
  add: '/calendar/new' as Href,
  addForDate(date: string): Href {
    return { pathname: '/calendar/new', params: { date } } as unknown as Href;
  },
  details(id: string): Href {
    return { pathname: '/calendar/[id]', params: { id } } as unknown as Href;
  },
  edit(id: string): Href {
    return { pathname: '/calendar/[id]/edit', params: { id } } as unknown as Href;
  },
};
