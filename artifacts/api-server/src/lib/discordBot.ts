import { Client, GatewayIntentBits, ActivityType, PresenceStatusData } from "discord.js";
import { logger } from "./logger";
import { db } from "@workspace/db";
import { eventsTable } from "@workspace/db/schema";
import { randomUUID } from "crypto";

let client: Client | null = null;
let statsCache = {
  guildCount: 0,
  userCount: 0,
  channelCount: 0,
  commandsRun: 0,
  messagesProcessed: 0,
};

export function getClient(): Client | null {
  return client;
}

export function getStatsCache() {
  return statsCache;
}

async function logEvent(type: string, description: string, guildId?: string, guildName?: string) {
  try {
    await db.insert(eventsTable).values({
      id: randomUUID(),
      type,
      description,
      guildId: guildId ?? null,
      guildName: guildName ?? null,
    });
  } catch (err) {
    logger.error({ err }, "Failed to log event");
  }
}

export async function initDiscordBot() {
  if (client) return client;

  const token = process.env.DISCORD_BOT_TOKEN;
  if (!token) {
    logger.warn("DISCORD_BOT_TOKEN not set, bot features disabled");
    return null;
  }

  client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.MessageContent,
    ],
  });

  client.on("ready", async (c) => {
    logger.info({ tag: c.user.tag }, "Discord bot connected");
    statsCache.guildCount = c.guilds.cache.size;
    statsCache.userCount = c.guilds.cache.reduce((acc, g) => acc + (g.memberCount || 0), 0);
    statsCache.channelCount = c.channels.cache.size;
    await logEvent("BOT_READY", `Bot ${c.user.tag} is now online`);
  });

  client.on("guildCreate", async (guild) => {
    statsCache.guildCount = client!.guilds.cache.size;
    statsCache.userCount = client!.guilds.cache.reduce((acc, g) => acc + (g.memberCount || 0), 0);
    await logEvent("GUILD_JOIN", `Joined server: ${guild.name}`, guild.id, guild.name);
  });

  client.on("guildDelete", async (guild) => {
    statsCache.guildCount = client!.guilds.cache.size;
    statsCache.userCount = client!.guilds.cache.reduce((acc, g) => acc + (g.memberCount || 0), 0);
    await logEvent("GUILD_LEAVE", `Left server: ${guild.name}`, guild.id, guild.name);
  });

  client.on("messageCreate", async (msg) => {
    if (!msg.author.bot) {
      statsCache.messagesProcessed++;
    }
  });

  client.on("interactionCreate", async (interaction) => {
    if (interaction.isChatInputCommand()) {
      statsCache.commandsRun++;
      await logEvent(
        "COMMAND",
        `/${interaction.commandName} used by ${interaction.user.username}`,
        interaction.guildId ?? undefined,
        interaction.guild?.name ?? undefined
      );
    }
  });

  client.on("error", (err) => {
    logger.error({ err }, "Discord client error");
  });

  try {
    await client.login(token);
    return client;
  } catch (err) {
    logger.error({ err }, "Failed to login to Discord");
    client = null;
    return null;
  }
}

export function getBotStatus() {
  if (!client || !client.isReady()) {
    return null;
  }
  const c = client;
  const presence = c.user.presence;
  const activityType = presence.activities[0]?.type;

  const activityTypeMap: Record<number, string> = {
    [ActivityType.Playing]: "playing",
    [ActivityType.Streaming]: "streaming",
    [ActivityType.Listening]: "listening",
    [ActivityType.Watching]: "watching",
    [ActivityType.Competing]: "competing",
  };

  return {
    online: true,
    username: c.user.username,
    discriminator: c.user.discriminator,
    id: c.user.id,
    avatar: c.user.avatar,
    status: (presence.status as string) || "online",
    activityType: activityType !== undefined ? activityTypeMap[activityType] ?? null : null,
    activityName: presence.activities[0]?.name ?? null,
    uptime: Math.floor((c.uptime ?? 0) / 1000),
    ping: c.ws.ping,
    guildCount: c.guilds.cache.size,
    userCount: c.guilds.cache.reduce((acc, g) => acc + (g.memberCount || 0), 0),
    channelCount: c.channels.cache.size,
  };
}

export async function setBotActivity(
  status: PresenceStatusData,
  activityType?: string | null,
  activityName?: string | null
) {
  if (!client || !client.isReady()) {
    throw new Error("Bot is not connected");
  }

  const typeMap: Record<string, ActivityType> = {
    playing: ActivityType.Playing,
    streaming: ActivityType.Streaming,
    listening: ActivityType.Listening,
    watching: ActivityType.Watching,
    competing: ActivityType.Competing,
  };

  client.user.setPresence({
    status,
    activities:
      activityName && activityType
        ? [{ name: activityName, type: typeMap[activityType] ?? ActivityType.Playing }]
        : [],
  });
  await logEvent("BOT_STATUS_CHANGE", `Status changed to ${status}${activityName ? ` - ${activityName}` : ""}`);
}

export async function reconnectBot() {
  if (!client) return;
  const token = process.env.DISCORD_BOT_TOKEN;
  if (!token) return;
  await client.destroy();
  client = null;
  await initDiscordBot();
  await logEvent("BOT_RECONNECT", "Bot reconnected manually");
}

export function getGuilds() {
  if (!client || !client.isReady()) return [];
  return client.guilds.cache.map((g) => ({
    id: g.id,
    name: g.name,
    icon: g.icon,
    memberCount: g.memberCount || 0,
    ownerId: g.ownerId,
    joinedAt: g.joinedAt?.toISOString() ?? new Date().toISOString(),
  }));
}
