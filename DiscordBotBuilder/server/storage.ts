import { bots, templates, users, analytics, type Bot, type InsertBot, type Template, type InsertTemplate, type User, type UpsertUser, type Analytics } from "@shared/schema";
import { db } from "./db.js";
import { eq, sql } from "drizzle-orm";

export interface IStorage {
  // Bot operations
  getBot(id: number): Promise<Bot | undefined>;
  getBotByToken(token: string): Promise<Bot | undefined>;
  getAllBots(): Promise<Bot[]>;
  getUserBots(userId: string): Promise<Bot[]>;
  createBot(bot: InsertBot): Promise<Bot>;
  updateBotStatus(id: number, status: string, lastSeen?: Date): Promise<Bot | undefined>;
  updateBotInviteUrl(id: number, inviteUrl: string): Promise<Bot | undefined>;
  updateBotGuildCount(id: number, guildCount: number): Promise<Bot | undefined>;
  updateBotDiscordId(id: number, discordBotId: string): Promise<Bot | undefined>;
  deleteBot(id: number): Promise<boolean>;

  // Template operations
  getTemplate(id: string): Promise<Template | undefined>;
  getAllTemplates(): Promise<Template[]>;
  getTemplatesByCategory(category: string): Promise<Template[]>;
  createTemplate(template: InsertTemplate): Promise<Template>;

  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByProviderId(providerId: string, provider: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Analytics operations
  getAnalytics(): Promise<Analytics | undefined>;
  updateAnalytics(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  constructor() {
    this.initializeTemplates();
  }

  private async initializeTemplates() {
    const defaultTemplates: InsertTemplate[] = [
      {
        id: "moderation-pro",
        name: "Moderation Pro",
        description: "Advanced moderation tools with auto-moderation and logging",
        category: "moderation",
        features: ["Auto-moderation", "Warn/Kick/Ban commands", "Detailed logging", "Spam protection"],
        price: 0,
        isPopular: true,
        isPremium: false,
      },
      {
        id: "music-master",
        name: "Music Master", 
        description: "High-quality music streaming with playlist support",
        category: "music",
        features: ["YouTube/Spotify support", "Queue management", "Audio filters", "Playlists"],
        price: 1499,
        isPopular: false,
        isPremium: true,
      },
      {
        id: "utility-hub",
        name: "Utility Hub",
        description: "Essential server utilities and management tools",
        category: "utility", 
        features: ["Server info", "Role management", "Polls & reminders", "Welcome messages"],
        price: 0,
        isPopular: false,
        isPremium: false,
      },
      {
        id: "fun-zone",
        name: "Fun Zone",
        description: "Games and entertainment for your server",
        category: "fun",
        features: ["Mini-games", "Trivia system", "Economy features", "Leaderboards"],
        price: 499,
        isPopular: false,
        isPremium: false,
      },
    ];

    // Insert templates if they don't exist
    for (const template of defaultTemplates) {
      try {
        const existing = await this.getTemplate(template.id);
        if (!existing) {
          await db.insert(templates).values(template);
        }
      } catch (error) {
        console.error(`Failed to initialize template ${template.id}:`, error);
      }
    }
  }

  async getBot(id: number): Promise<Bot | undefined> {
    const [bot] = await db.select().from(bots).where(eq(bots.id, id));
    return bot || undefined;
  }

  async getBotByToken(token: string): Promise<Bot | undefined> {
    const [bot] = await db.select().from(bots).where(eq(bots.token, token));
    return bot || undefined;
  }

  async getAllBots(): Promise<Bot[]> {
    return await db.select().from(bots);
  }

  async getUserBots(userId: string): Promise<Bot[]> {
    return await db.select().from(bots).where(eq(bots.userId, userId));
  }

  async createBot(insertBot: InsertBot): Promise<Bot> {
    const [bot] = await db
      .insert(bots)
      .values({
        ...insertBot,
        status: insertBot.status || 'offline'
      })
      .returning();
    
    // Update analytics after creating a bot
    await this.updateAnalytics();
    return bot;
  }

  async updateBotStatus(id: number, status: string, lastSeen?: Date): Promise<Bot | undefined> {
    const updateData: any = { status };
    if (lastSeen) {
      updateData.lastSeen = lastSeen;
    }
    
    const [bot] = await db
      .update(bots)
      .set(updateData)
      .where(eq(bots.id, id))
      .returning();
    return bot || undefined;
  }

  async updateBotInviteUrl(id: number, inviteUrl: string): Promise<Bot | undefined> {
    const [bot] = await db
      .update(bots)
      .set({ inviteUrl })
      .where(eq(bots.id, id))
      .returning();
    return bot || undefined;
  }

  async updateBotGuildCount(id: number, guildCount: number): Promise<Bot | undefined> {
    const [bot] = await db
      .update(bots)
      .set({ guildCount })
      .where(eq(bots.id, id))
      .returning();
    return bot || undefined;
  }

  async updateBotDiscordId(id: number, discordBotId: string): Promise<Bot | undefined> {
    const [bot] = await db
      .update(bots)
      .set({ discordBotId })
      .where(eq(bots.id, id))
      .returning();
    return bot || undefined;
  }

  async deleteBot(id: number): Promise<boolean> {
    const result = await db.delete(bots).where(eq(bots.id, id));
    await this.updateAnalytics();
    return result.rowCount !== null && result.rowCount > 0;
  }

  async getTemplate(id: string): Promise<Template | undefined> {
    const [template] = await db.select().from(templates).where(eq(templates.id, id));
    return template || undefined;
  }

  async getAllTemplates(): Promise<Template[]> {
    return await db.select().from(templates);
  }

  async getTemplatesByCategory(category: string): Promise<Template[]> {
    return await db.select().from(templates).where(eq(templates.category, category));
  }

  async createTemplate(template: InsertTemplate): Promise<Template> {
    const [newTemplate] = await db
      .insert(templates)
      .values({
        ...template,
        features: template.features || [],
        price: template.price || 0,
        isPopular: template.isPopular || false,
        isPremium: template.isPremium || false
      })
      .returning();
    return newTemplate;
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async getUserByProviderId(providerId: string, provider: string): Promise<User | undefined> {
    const [user] = await db.select().from(users)
      .where(sql`${users.providerId} = ${providerId} AND ${users.provider} = ${provider}`);
    return user || undefined;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        ...userData,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    
    await this.updateAnalytics();
    return user;
  }

  // Analytics operations
  async getAnalytics(): Promise<Analytics | undefined> {
    const [result] = await db.select().from(analytics).orderBy(sql`${analytics.updatedAt} DESC`).limit(1);
    return result || undefined;
  }

  async updateAnalytics(): Promise<void> {
    try {
      const [totalUsersResult] = await db.select({ count: sql<number>`count(*)` }).from(users);
      const [totalBotsResult] = await db.select({ count: sql<number>`count(*)` }).from(bots);
      const [onlineBotsResult] = await db.select({ count: sql<number>`count(*)` }).from(bots).where(eq(bots.status, 'online'));

      const totalUsers = totalUsersResult?.count || 0;
      const totalBots = totalBotsResult?.count || 0;
      const botsOnline = onlineBotsResult?.count || 0;

      await db.insert(analytics).values({
        totalUsers,
        totalBots,
        botsOnline,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error('Failed to update analytics:', error);
    }
  }
}

export const storage = new DatabaseStorage();
