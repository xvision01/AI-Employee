import type { Request, Response } from "express";
import { agentService } from "../services/agent.service.js";

export const runAgent = async (req: Request, res: Response) => {
  const task = typeof req.body?.task === "string" ? req.body.task.trim() : "";
  if (!task) return res.status(400).json({ message: "Task is required" });

  try {
    const output = await agentService.run(task);
    return res.json({ success: true, output });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to run AI agent";
    return res.status(500).json({ message });
  }
};
