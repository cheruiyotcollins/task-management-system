export enum TaskStatus {
  TODO = "TODO",
  IN_PROGRESS = "IN_PROGRESS",
  DONE = "DONE",
}

export enum TaskPriority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  CRITICAL = "CRITICAL",
}

export interface IUser {
  id: string;
  username: string;
  email: string;
  role: "USER" | "ADMIN";
  createdAt?: string;
  updatedAt?: string;
}

export interface ITask {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string | null;
  createdAt: string;
  updatedAt: string;
  creatorId: string;
  assigneeId?: string | null;
  assignee?: IUser | null;
  creator?: IUser;
  // Additional fields from your first interface
  assignedTo?: string; // Consider using assigneeId instead
  createdBy?: string; // Consider using creatorId instead
  assigneeName?: string; // Consider using assignee.username instead
  createdByName?: string; // Consider using creator.username instead
}

export interface ITaskFilterParams {
  status?: TaskStatus;
  priority?: TaskPriority;
  assigneeId?: string | null;
  search?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  q?: string; // Alternative to 'search' for consistency
}

export interface NewTaskDto {
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate?: string | null;
  assigneeId?: string | null;
  creatorId?: string; // Might be set server-side from auth token
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string | null;
  assigneeId?: string | null;
}

// Response interfaces for paginated results
export interface PaginatedTaskResponse {
  tasks: ITask[];
  total: number;
  page: number;
  size: number;
  hasNext: boolean;
}

// For task assignment changes
export interface AssignTaskDto {
  taskId: string;
  assigneeId: string | null;
}

// For status changes
export interface ChangeTaskStatusDto {
  taskId: string;
  status: TaskStatus;
}
