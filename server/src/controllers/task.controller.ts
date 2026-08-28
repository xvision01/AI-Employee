import type { Request, Response } from "express";
import { taskPriorities, taskStatuses } from "../types/task.js";
import { taskService } from "../services/task.service.js";

const isOneOf = <T extends readonly string[]>(values: T, value: unknown): value is T[number] =>
  typeof value === "string" && values.includes(value);

const userId = (req: Request) => String(req.headers["x-user-id"] ?? "demo-user");

export const listTasks = async (req: Request, res: Response) =>
  res.json({ tasks: await taskService.list(userId(req)) });

export const createTask = async (req: Request, res: Response) => {
  const { title, description, priority } = req.body ?? {};
  if (typeof title !== "string" || !title.trim()) return res.status(400).json({ message: "Task title is required" });
  if (priority !== undefined && !isOneOf(taskPriorities, priority)) return res.status(400).json({ message: "Invalid priority" });
  return res.status(201).json({ task: await taskService.create(userId(req), { title, description, priority }) });
};

export const updateTask = async (req: Request, res: Response) => {
  const { title, description, status, priority } = req.body ?? {};
  if (status !== undefined && !isOneOf(taskStatuses, status)) return res.status(400).json({ message: "Invalid status" });
  if (priority !== undefined && !isOneOf(taskPriorities, priority)) return res.status(400).json({ message: "Invalid priority" });
  const result = await taskService.update(userId(req), req.params.id, { title, description, status, priority });
  return result.count ? res.json({ success: true }) : res.status(404).json({ message: "Task not found" });
};

export const deleteTask = async (req: Request, res: Response) => {
  const result = await taskService.remove(userId(req), req.params.id);
  return result.count ? res.status(204).send() : res.status(404).json({ message: "Task not found" });
};

export const getStats = async (req: Request, res: Response) => res.json(await taskService.stats(userId(req)));
