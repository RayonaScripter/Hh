import { pgTable, text, serial, integer, boolean, timestamp, jsonb, varchar, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for authentication
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for authentication
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  provider: varchar("provider").notNull(), // 'email', 'discord', 'apple'
  providerId: varchar("provider_id"), // ID from OAuth provider
  passwordHash: varchar("password_hash"), // For email auth
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const bots = pgTable("bots", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  token: text("token").notNull(),
  templateId: text("template_id").notNull(),
  status: text("status").notNull().default("offline"), // offline, online, deploying, error
  config: jsonb("config").notNull().default({}),
  inviteUrl: text("invite_url"),
  discordBotId: text("discord_bot_id"), // Discord bot's actual ID
  guildCount: integer("guild_count").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastSeen: timestamp("last_seen"),
});

export const templates = pgTable("templates", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), // moderation, music, utility, fun
  features: jsonb("features").notNull().default([]),
  price: integer("price").notNull().default(0), // in cents
  isPopular: boolean("is_popular").notNull().default(false),
  isPremium: boolean("is_premium").notNull().default(false),
});

// Analytics table for real statistics
export const analytics = pgTable("analytics", {
  id: serial("id").primaryKey(),
  totalUsers: integer("total_users").notNull().default(0),
  totalBots: integer("total_bots").notNull().default(0),
  botsOnline: integer("bots_online").notNull().default(0),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertBotSchema = createInsertSchema(bots).omit({
  id: true,
  createdAt: true,
  lastSeen: true,
});

export const insertTemplateSchema = createInsertSchema(templates);

export const upsertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Bot = typeof bots.$inferSelect;
export type InsertBot = z.infer<typeof insertBotSchema>;
export type Template = typeof templates.$inferSelect;
export type InsertTemplate = z.infer<typeof insertTemplateSchema>;
export type Analytics = typeof analytics.$inferSelect;
