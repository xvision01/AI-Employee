import type { Request, Response } from "express";
import { taskPriorities, taskStatuses } from "../types/task.js";
import { taskService } from "../services/task.service.js";

const isOneOf = <T extends readonly string[]>(values: T, value: unknown): value is T[number] =>
  typeof value === "string" && values.includes(value);

export const listTasks = (_req: Request, res: Response) => res.json({ tasks: taskService.list() });

export const createTask = (req: Request, res: Response) => {
  const { title, description, priority } = req.body ?? {};
  if (typeof title !== "string" || !title.trim()) return res.status(400).json({ message: "Task title is required" });
  if (priority !== undefined && !isOneOf(taskPriorities, priority)) return res.status(400).json({ message: "Invalid priority" });
  return res.status(201).json({ task: taskService.create({ title, description, priority }) });
};

export const updateTask = (req: Request, res: Response) => {
  const { title, description, status, priority } = req.body ?? {};
  if (status !== undefined && !isOneOf(taskStatuses, status)) return res.status(400).json({ message: "Invalid status" });
  if (priority !== undefined && !isOneOf(taskPriorities, priority)) return res.status(400).json({ message: "Invalid priority" });
  const task = taskService.update(req.params.id, { title, description, status, priority });
  return task ? res.json({ task }) : res.status(404).json({ message: "Task not found" });
};

export const deleteTask = (req: Request, res: Response) => {
  const task = taskService.remove(req.params.id);
  return task ? res.status(204).send() : res.status(404).json({ message: "Task not found" });
};

export const getStats = (_req: Request, res: Response) => res.json(taskService.stats());
