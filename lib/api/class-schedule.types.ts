export const WEEKDAYS = [
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
  'SUNDAY',
] as const;

export type Weekday = (typeof WEEKDAYS)[number];

export type ClassSchedule = {
  id: string;
  userId: string;
  courseId: string;
  weekday: Weekday;
  startTime: string;
  endTime: string;
  room: string | null;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateClassScheduleRequest = {
  courseId: string;
  weekday: Weekday;
  startTime: string;
  endTime: string;
  room?: string | null;
  startDate: string;
  endDate: string;
};

export type UpdateClassScheduleRequest = Partial<CreateClassScheduleRequest>;

export type ClassScheduleFilters = {
  courseId?: string;
  from?: string;
  to?: string;
};

export type ClassScheduleListResponse = { data: { schedules: ClassSchedule[] } };
export type ClassScheduleResponse = { data: { schedule: ClassSchedule } };
export type CreateClassScheduleResponse = ClassScheduleResponse;
export type ClassScheduleDetailResponse = ClassScheduleResponse;
export type UpdateClassScheduleResponse = ClassScheduleResponse;
export type DeleteClassScheduleResponse = { data: { message: string } };
