import { pgTable, text, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const sessionsTable = pgTable("sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  userData: jsonb("user_data").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const insertSessionSchema = createInsertSchema(sessionsTable);
export type InsertSession = z.infer<typeof insertSessionSchema>;
export type Session = typeof sessionsTable.$inferSelect;
