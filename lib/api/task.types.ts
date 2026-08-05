export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'COMPLETED';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';
export type TaskDueFilter = 'today' | 'upcoming' | 'overdue';

export type Task = {
  id: string;
  userId: string;
  courseId: string | null;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateTaskRequest = {
  title: string;
  description?: string | null;
  courseId?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueAt?: string | null;
};

export type UpdateTaskRequest = Partial<CreateTaskRequest>;

export type TaskFilters = {
  status?: TaskStatus;
  priority?: TaskPriority;
  courseId?: string;
  due?: TaskDueFilter;
};

export type TaskListResponse = { data: { tasks: Task[] } };
export type TaskResponse = { data: { task: Task } };
export type CreateTaskResponse = TaskResponse;
export type TaskDetailResponse = TaskResponse;
export type UpdateTaskResponse = TaskResponse;
export type CompleteTaskResponse = TaskResponse;
export type DeleteTaskResponse = { data: { message: string } };
