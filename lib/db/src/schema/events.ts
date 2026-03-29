import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const eventsTable = pgTable("bot_events", {
  id: text("id").primaryKey(),
  type: text("type").notNull(),
  description: text("description").notNull(),
  guildId: text("guild_id"),
  guildName: text("guild_name"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const insertEventSchema = createInsertSchema(eventsTable);
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type BotEvent = typeof eventsTable.$inferSelect;
