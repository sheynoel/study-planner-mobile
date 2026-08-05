import type { TaskPriority, TaskStatus } from '@/lib/api/task.types';

export type CalendarEvent = {
  id: string;
  userId: string;
  courseId: string | null;
  title: string;
  description: string | null;
  location: string | null;
  startAt: string;
  endAt: string | null;
  isAllDay: boolean;
  color: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateCalendarEventRequest = {
  title: string;
  description?: string | null;
  location?: string | null;
  courseId?: string | null;
  startAt: string;
  endAt?: string | null;
  isAllDay?: boolean;
  color?: string | null;
};

export type UpdateCalendarEventRequest = Partial<CreateCalendarEventRequest>;

export type CalendarEventFilters = {
  from?: string;
  to?: string;
  courseId?: string;
};

export type CalendarEventListResponse = { data: { events: CalendarEvent[] } };
export type CalendarEventResponse = { data: { event: CalendarEvent } };
export type CreateCalendarEventResponse = CalendarEventResponse;
export type CalendarEventDetailResponse = CalendarEventResponse;
export type UpdateCalendarEventResponse = CalendarEventResponse;
export type DeleteCalendarEventResponse = { data: { message: string } };

export type CalendarItemSourceType = 'event' | 'task';

export type CalendarItem = {
  id: string;
  sourceId: string;
  sourceType: CalendarItemSourceType;
  title: string;
  date: string;
  startAt: string;
  endAt: string | null;
  isAllDay: boolean;
  courseId: string | null;
  courseName: string | null;
  color: string | null;
  location: string | null;
  status: TaskStatus | null;
  priority: TaskPriority | null;
};
