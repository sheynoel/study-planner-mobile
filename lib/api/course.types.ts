export type Course = {
  id: string;
  userId: string;
  name: string;
  code: string | null;
  description: string | null;
  instructor: string | null;
  room: string | null;
  color: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateCourseRequest = {
  name: string;
  code?: string | null;
  description?: string | null;
  instructor?: string | null;
  room?: string | null;
  color?: string;
};

export type UpdateCourseRequest = Partial<CreateCourseRequest>;

export type CourseListResponse = {
  data: {
    courses: Course[];
  };
};

export type CourseResponse = {
  data: {
    course: Course;
  };
};

export type CreateCourseResponse = CourseResponse;
export type CourseDetailResponse = CourseResponse;
export type UpdateCourseResponse = CourseResponse;

export type DeleteCourseResponse = {
  data: {
    message: string;
  };
};
