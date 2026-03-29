import { Router } from "express";
import { requireAuth } from "../lib/auth";
import {
  getBotStatus,
  getGuilds,
  setBotActivity,
  reconnectBot,
} from "../lib/discordBot";
import {
  SetBotActivityBody,
} from "@workspace/api-zod";

const router = Router();

router.get("/status", requireAuth, (_req, res) => {
  const status = getBotStatus();
  if (!status) {
    res.json({
      online: false,
      username: "Unknown",
      discriminator: "0000",
      id: "0",
      avatar: null,
      status: "invisible",
      activityType: null,
      activityName: null,
      uptime: 0,
      ping: -1,
      guildCount: 0,
      userCount: 0,
      channelCount: 0,
    });
    return;
  }
  res.json(status);
});

router.get("/guilds", requireAuth, (_req, res) => {
  const guilds = getGuilds();
  res.json(guilds);
});

router.put("/activity", requireAuth, async (req, res) => {
  const body = SetBotActivityBody.parse(req.body);
  await setBotActivity(
    body.status as any,
    body.activityType ?? null,
    body.activityName ?? null
  );
  res.json({ message: "Activity updated" });
});

router.post("/reconnect", requireAuth, async (_req, res) => {
  await reconnectBot();
  res.json({ message: "Reconnecting bot..." });
});

export default router;
