export type CourseCreationResult<TCourse> = {
  course: TCourse;
  createdScheduleCount: number;
  scheduleError: unknown | null;
};

export async function createCourseWithSchedules<TCourse extends { id: string }, TSchedule>(
  createCourse: () => Promise<TCourse>,
  schedules: TSchedule[],
  createSchedule: (courseId: string, schedule: TSchedule) => Promise<unknown>,
): Promise<CourseCreationResult<TCourse>> {
  const course = await createCourse();
  let createdScheduleCount = 0;
  try {
    for (const schedule of schedules) {
      await createSchedule(course.id, schedule);
      createdScheduleCount += 1;
    }
    return { course, createdScheduleCount, scheduleError: null };
  } catch (scheduleError) {
    return { course, createdScheduleCount, scheduleError };
  }
}
