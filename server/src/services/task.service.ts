import crypto from "node:crypto";
import type { Task, TaskPriority, TaskStatus } from "../types/task.js";

const tasks: Task[] = [];

export const taskService = {
  list: () => tasks,

  create: (input: { title: string; description?: string; priority?: TaskPriority }) => {
    const now = new Date().toISOString();
    const task: Task = {
      id: crypto.randomUUID(),
      title: input.title.trim(),
      description: input.description?.trim() ?? "",
      status: "queued",
      priority: input.priority ?? "medium",
      createdAt: now,
      updatedAt: now,
    };
    tasks.unshift(task);
    return task;
  },

  update: (id: string, input: Partial<Pick<Task, "title" | "description" | "status" | "priority">>) => {
    const task = tasks.find((item) => item.id === id);
    if (!task) return undefined;
    Object.assign(task, input, { updatedAt: new Date().toISOString() });
    return task;
  },

  remove: (id: string) => {
    const index = tasks.findIndex((item) => item.id === id);
    if (index === -1) return undefined;
    return tasks.splice(index, 1)[0];
  },

  stats: () => ({
    total: tasks.length,
    queued: tasks.filter(({ status }) => status === "queued").length,
    inProgress: tasks.filter(({ status }) => status === "in-progress").length,
    done: tasks.filter(({ status }) => status === "done").length,
  }),
};
