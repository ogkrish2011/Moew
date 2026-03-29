import { Request, Response, NextFunction } from "express";
import { db } from "@workspace/db";
import { sessionsTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

export interface DiscordUser {
  id: string;
  username: string;
  discriminator: string;
  avatar: string | null;
  email: string | null;
  globalName: string | null;
}

export function generateSessionId(): string {
  return randomUUID();
}

export async function createSession(user: DiscordUser): Promise<string> {
  const sessionId = generateSessionId();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  await db.insert(sessionsTable).values({
    id: sessionId,
    userId: user.id,
    userData: user as unknown as Record<string, unknown>,
    expiresAt,
  });

  return sessionId;
}

export async function getSession(sessionId: string): Promise<DiscordUser | null> {
  const rows = await db
    .select()
    .from(sessionsTable)
    .where(eq(sessionsTable.id, sessionId))
    .limit(1);

  if (!rows.length) return null;
  const session = rows[0];
  if (new Date() > session.expiresAt) {
    await db.delete(sessionsTable).where(eq(sessionsTable.id, sessionId));
    return null;
  }

  return session.userData as unknown as DiscordUser;
}

export async function deleteSession(sessionId: string): Promise<void> {
  await db.delete(sessionsTable).where(eq(sessionsTable.id, sessionId));
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!(req as any).user) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
  next();
}

export async function sessionMiddleware(req: Request, res: Response, next: NextFunction) {
  const sessionId = req.cookies?.session_id;
  if (sessionId) {
    const user = await getSession(sessionId);
    if (user) {
      (req as any).user = user;
    }
  }
  next();
}
