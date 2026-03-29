import { Router } from "express";
import { requireAuth } from "../lib/auth";
import { getStatsCache } from "../lib/discordBot";
import { db } from "@workspace/db";
import { eventsTable } from "@workspace/db/schema";
import { desc } from "drizzle-orm";
import os from "os";

const router = Router();

router.get("/overview", requireAuth, (_req, res) => {
  const stats = getStatsCache();
  const memUsage = process.memoryUsage();
  const loadAvg = os.loadavg();

  res.json({
    ...stats,
    memoryUsageMb: Math.round(memUsage.heapUsed / 1024 / 1024 * 10) / 10,
    cpuUsagePercent: Math.round(loadAvg[0] * 10) / 10,
  });
});

router.get("/events", requireAuth, async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 50, 100);
  const rows = await db
    .select()
    .from(eventsTable)
    .orderBy(desc(eventsTable.createdAt))
    .limit(limit);

  res.json(
    rows.map((r) => ({
      id: r.id,
      type: r.type,
      description: r.description,
      guildId: r.guildId,
      guildName: r.guildName,
      timestamp: r.createdAt.toISOString(),
    }))
  );
});

export default router;
