import { Router } from "express";
import { requireAuth } from "../lib/auth";
import { db } from "@workspace/db";
import { settingsTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const router = Router();

const DEFAULT_SETTINGS = {
  theme: "dark",
  ownerId: null,
  allowedUserIds: [] as string[],
};

router.get("/", requireAuth, async (_req, res) => {
  const rows = await db.select().from(settingsTable).where(eq(settingsTable.key, "dashboard"));
  if (!rows.length) {
    res.json(DEFAULT_SETTINGS);
    return;
  }
  res.json(rows[0].value);
});

router.put("/", requireAuth, async (req, res) => {
  const settings = req.body;
  await db
    .insert(settingsTable)
    .values({ key: "dashboard", value: settings })
    .onConflictDoUpdate({ target: settingsTable.key, set: { value: settings } });
  res.json(settings);
});

export default router;
