export type Task = {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  priority: "low" | "medium" | "high";
  status: "todo" | "in-progress" | "done";
  userId: string;
  createdAt?: string;
  updatedAt?: string;
};

export type CreateTaskInput = {
  title: string;
  description?: string;
  priority?: "low" | "medium" | "high";
  dueDate?: string;
};

export interface SessionUser {
  id: string;
  name?: string | null;
  email?: string | null;
  accessToken?: string;
}