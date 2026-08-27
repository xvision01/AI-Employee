import { env, requireOpenAiKey } from "../config/env.js";

export const agentService = {
  async run(task: string) {
    const apiKey = requireOpenAiKey();

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: env.openAiModel,
        instructions: "You are an AI employee. Turn requests into concrete, useful work. Explain the plan, results, assumptions, and anything requiring human approval. Never claim an external action happened unless a connected tool actually performed it.",
        input: task,
        tools: [{ type: "web_search" }],
      }),
    });

    const data = await response.json() as { output_text?: string; error?: { message?: string } };
    if (!response.ok) throw new Error(data.error?.message ?? "AI request failed");
    return data.output_text ?? "No output returned.";
  },
};
