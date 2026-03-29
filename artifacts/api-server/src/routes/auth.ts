import { Router } from "express";
import { createSession, deleteSession, requireAuth, sessionMiddleware } from "../lib/auth";

const router = Router();
const DISCORD_API = "https://discord.com/api/v10";

router.get("/discord", (_req, res) => {
  const params = new URLSearchParams({
    client_id: process.env.DISCORD_CLIENT_ID!,
    redirect_uri: getRedirectUri(),
    response_type: "code",
    scope: "identify email",
  });
  res.redirect(`https://discord.com/api/oauth2/authorize?${params}`);
});

router.get("/discord/callback", async (req, res) => {
  const { code } = req.query as { code: string };
  if (!code) {
    res.status(400).json({ message: "Missing code" });
    return;
  }

  try {
    const tokenRes = await fetch(`${DISCORD_API}/oauth2/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.DISCORD_CLIENT_ID!,
        client_secret: process.env.DISCORD_CLIENT_SECRET!,
        grant_type: "authorization_code",
        code,
        redirect_uri: getRedirectUri(),
      }),
    });

    if (!tokenRes.ok) {
      const err = await tokenRes.text();
      req.log.error({ err }, "Discord token exchange failed");
      res.status(401).json({ message: "OAuth failed" });
      return;
    }

    const tokenData = (await tokenRes.json()) as { access_token: string };
    const userRes = await fetch(`${DISCORD_API}/users/@me`, {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    if (!userRes.ok) {
      res.status(401).json({ message: "Failed to fetch user" });
      return;
    }

    const discordUser = (await userRes.json()) as {
      id: string;
      username: string;
      discriminator: string;
      avatar: string | null;
      email: string | null;
      global_name: string | null;
    };

    const user = {
      id: discordUser.id,
      username: discordUser.username,
      discriminator: discordUser.discriminator,
      avatar: discordUser.avatar,
      email: discordUser.email,
      globalName: discordUser.global_name,
    };

    const sessionId = await createSession(user);
    res.cookie("session_id", sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: "lax",
    });

    res.redirect("/");
  } catch (err) {
    req.log.error({ err }, "Auth callback error");
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/logout", sessionMiddleware, async (req, res) => {
  const sessionId = req.cookies?.session_id;
  if (sessionId) {
    await deleteSession(sessionId);
    res.clearCookie("session_id");
  }
  res.json({ message: "Logged out" });
});

router.get("/me", sessionMiddleware, requireAuth, (req, res) => {
  res.json((req as any).user);
});

function getRedirectUri() {
  const domain = process.env.REPLIT_DOMAINS?.split(",")[0];
  if (domain) return `https://${domain}/api/auth/discord/callback`;
  return `http://localhost:${process.env.PORT ?? 8080}/api/auth/discord/callback`;
}

export default router;
