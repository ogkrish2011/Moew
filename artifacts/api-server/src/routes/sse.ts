import { Router } from "express";
import { sessionMiddleware, requireAuth } from "../lib/auth";
import { addSSEClient } from "../lib/sse";

const router = Router();

router.get("/events", sessionMiddleware, requireAuth, (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  res.write(`:connected\n\n`);
  addSSEClient(res);
});

export default router;
