import type {
  CreateTaskRequest,
  Task,
  TaskPriority,
  TaskStatus,
  UpdateTaskRequest,
} from '@/lib/api/task.types';

export const TASK_STATUSES: readonly TaskStatus[] = ['TODO', 'IN_PROGRESS', 'COMPLETED'];
export const TASK_PRIORITIES: readonly TaskPriority[] = ['LOW', 'MEDIUM', 'HIGH'];

export type TaskFormValues = {
  title: string;
  description: string;
  courseId: string | null;
  dueDate: string;
  dueTime: string;
  priority: TaskPriority;
  status: TaskStatus;
};

export type TaskFormField = keyof TaskFormValues;
export type TaskFormErrors = Partial<Record<TaskFormField, string>>;

export const EMPTY_TASK_FORM: TaskFormValues = {
  title: '',
  description: '',
  courseId: null,
  dueDate: '',
  dueTime: '',
  priority: 'MEDIUM',
  status: 'TODO',
};

export function taskToFormValues(task: Task): TaskFormValues {
  const dueDate = task.dueAt ? new Date(task.dueAt) : null;

  return {
    title: task.title,
    description: task.description ?? '',
    courseId: task.courseId,
    dueDate: dueDate ? formatDateInput(dueDate) : '',
    dueTime: dueDate ? formatTimeInput(dueDate) : '',
    priority: task.priority,
    status: task.status,
  };
}

export function validateTaskForm(values: TaskFormValues): TaskFormErrors {
  const errors: TaskFormErrors = {};
  const title = values.title.trim();

  if (!title) errors.title = 'Task title is required.';
  else if (title.length > 200) errors.title = 'Task title must be at most 200 characters.';

  if (values.description.trim().length > 2_000) {
    errors.description = 'Description must be at most 2,000 characters.';
  }

  if (values.dueDate && !parseDateInput(values.dueDate)) {
    errors.dueDate = 'Use a valid date in YYYY-MM-DD format.';
  }

  if (values.dueTime && !/^([01]\d|2[0-3]):[0-5]\d$/.test(values.dueTime)) {
    errors.dueTime = 'Use 24-hour time in HH:mm format.';
  }

  if (values.dueTime && !values.dueDate) {
    errors.dueDate = 'Add a due date before adding a due time.';
  }

  return errors;
}

export function toCreateTaskRequest(values: TaskFormValues): CreateTaskRequest {
  return {
    title: values.title.trim(),
    description: nullableTrimmed(values.description),
    courseId: values.courseId,
    dueAt: toDueAt(values),
    priority: values.priority,
    status: values.status,
  };
}

export function toUpdateTaskRequest(values: TaskFormValues): UpdateTaskRequest {
  return toCreateTaskRequest(values);
}

function nullableTrimmed(value: string): string | null {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function toDueAt(values: TaskFormValues): string | null {
  const dateParts = parseDateInput(values.dueDate);

  if (!dateParts) return null;

  const [hours, minutes] = values.dueTime
    ? values.dueTime.split(':').map(Number)
    : [23, 59];
  return new Date(
    dateParts.year,
    dateParts.month - 1,
    dateParts.day,
    hours,
    minutes,
    0,
    0,
  ).toISOString();
}

function parseDateInput(value: string): { year: number; month: number; day: number } | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);

  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day
    ? { year, month, day }
    : null;
}

function formatDateInput(value: Date): string {
  return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}`;
}

function formatTimeInput(value: Date): string {
  return `${pad(value.getHours())}:${pad(value.getMinutes())}`;
}

function pad(value: number): string {
  return String(value).padStart(2, '0');
}
