import { Router } from "express";
import { runAgent } from "../controllers/agent.controller.js";

export const agentRouter = Router();

agentRouter.post("/", runAgent);
