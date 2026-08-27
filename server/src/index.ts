import express, { type Request, type Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import crypto from "node:crypto";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT ?? 5000);
const CLIENT_URL = process.env.CLIENT_URL ?? "http://localhost:5173";

app.use(cors({ origin: CLIENT_URL }));
app.use(express.json({ limit: "1mb" }));

type Task = {
  id: string; title: string; description: string;
  status: "queued" | "in-progress" | "done";
  priority: "low" | "medium" | "high";
  createdAt: string; updatedAt: string;
};

type Activity = { id: string; message: string; type: "task" | "agent" | "approval"; createdAt: string };

const tasks: Task[] = [];
const activities: Activity[] = [];

function addActivity(message: string, type: Activity["type"] = "agent") {
  activities.unshift({ id: crypto.randomUUID(), message, type, createdAt: new Date().toISOString() });
}

app.get("/", (_req, res) => res.json({ name: "AI Employee API", status: "ok", version: "1.0.0" }));
app.get("/api/health", (_req, res) => res.json({ status: "healthy", timestamp: new Date().toISOString() }));

app.get("/api/tasks", (_req, res) => res.json({ tasks }));

app.post("/api/tasks", (req: Request, res: Response) => {
  const { title, description = "", priority = "medium" } = req.body ?? {};
  if (!title || typeof title !== "string") return res.status(400).json({ message: "Task title is required" });
  if (!["low", "medium", "high"].includes(priority)) return res.status(400).json({ message: "Invalid priority" });
  const now = new Date().toISOString();
  const task: Task = { id: crypto.randomUUID(), title: title.trim(), description: String(description), status: "queued", priority, createdAt: now, updatedAt: now };
  tasks.unshift(task); addActivity(`Created task: ${task.title}`, "task");
  return res.status(201).json({ task });
});

app.patch("/api/tasks/:id", (req: Request, res: Response) => {
  const task = tasks.find((item) => item.id === req.params.id);
  if (!task) return res.status(404).json({ message: "Task not found" });
  const { status, priority, title, description } = req.body ?? {};
  if (status && !["queued", "in-progress", "done"].includes(status)) return res.status(400).json({ message: "Invalid status" });
  if (priority && !["low", "medium", "high"].includes(priority)) return res.status(400).json({ message: "Invalid priority" });
  if (status) task.status = status;
  if (priority) task.priority = priority;
  if (typeof title === "string") task.title = title.trim();
  if (typeof description === "string") task.description = description;
  task.updatedAt = new Date().toISOString();
  addActivity(`Updated task: ${task.title}`, "task");
  return res.json({ task });
});

app.delete("/api/tasks/:id", (req: Request, res: Response) => {
  const index = tasks.findIndex((item) => item.id === req.params.id);
  if (index === -1) return res.status(404).json({ message: "Task not found" });
  const [removed] = tasks.splice(index, 1);
  addActivity(`Deleted task: ${removed.title}`, "task");
  return res.status(204).send();
});

app.get("/api/activity", (_req, res) => res.json({ activities: activities.slice(0, 50) }));
app.get("/api/stats", (_req, res) => res.json({ total: tasks.length, queued: tasks.filter(t => t.status === "queued").length, inProgress: tasks.filter(t => t.status === "in-progress").length, done: tasks.filter(t => t.status === "done").length }));

app.post("/api/agent", async (req: Request, res: Response) => {
  const task = typeof req.body?.task === "string" ? req.body.task.trim() : "";
  if (!task) return res.status(400).json({ message: "Task is required" });
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return res.status(503).json({ message: "OPENAI_API_KEY is not configured on the server" });

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-5",
        instructions: "You are an AI employee. Turn requests into concrete, useful work. Explain the plan, results, assumptions, and anything requiring human approval. Never claim an external action happened unless a connected tool actually performed it.",
        input: task,
        tools: [{ type: "web_search" }],
      }),
    });
    const data = await response.json() as { output_text?: string; error?: { message?: string } };
    if (!response.ok) return res.status(response.status).json({ message: data.error?.message || "AI request failed" });
    addActivity(`AI processed: ${task}`, "agent");
    return res.json({ success: true, output: data.output_text || "No output returned." });
  } catch (error) {
    return res.status(500).json({ message: error instanceof Error ? error.message : "Unable to contact AI provider" });
  }
});

app.listen(PORT, () => console.log(`AI Employee API running on http://localhost:${PORT}`));
