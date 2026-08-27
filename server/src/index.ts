import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/", (_req, res) => res.json({ message: "AI Employee API is running" }));

app.post("/api/agent", async (req, res) => {
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
                instructions: `You are an AI employee inside a productivity workspace. Your job is to turn a user's request into useful work. Be concise and action-oriented. Explain what you would do, identify assumptions, and clearly flag anything that requires human approval. Never claim that you sent emails, changed external systems, or completed an external action unless a connected tool actually did it.`,
                input: task,
                tools: [{ type: "web_search" }],
            }),
        });

        const data = await response.json() as { output_text?: string; error?: { message?: string } };
        if (!response.ok) return res.status(response.status).json({ message: data.error?.message || "AI request failed" });
        return res.json({ success: true, output: data.output_text || "The agent completed the request but returned no text." });
    } catch (error) {
        return res.status(500).json({ message: error instanceof Error ? error.message : "Unable to contact the AI provider" });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
