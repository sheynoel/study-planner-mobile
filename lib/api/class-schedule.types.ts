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
  scheduleGroupId: string | null;
  timezone: string;
  courseArchived: boolean;
  holidayDates: string[];
  exceptions: ClassScheduleException[];
};

export type ClassScheduleException = {
  id: string;
  date: string;
  cancelled: boolean;
  startTimeOverride: string | null;
  endTimeOverride: string | null;
  roomOverride: string | null;
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

export type ScheduleGroupRequest = {
  courseId: string;
  weekdays: Weekday[];
  startTime: string;
  endTime: string;
  room?: string | null;
  startDate: string;
  endDate: string;
  timezone: string;
};

export type ScheduleGroupResponse = { data: { groupId: string; schedules: ClassSchedule[] } };
export type UpsertScheduleExceptionRequest = {
  date: string; cancelled?: boolean; startTimeOverride?: string;
  endTimeOverride?: string; roomOverride?: string | null;
};

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
