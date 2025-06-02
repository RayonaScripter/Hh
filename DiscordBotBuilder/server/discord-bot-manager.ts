import { Client, GatewayIntentBits, REST, Routes, PermissionFlagsBits } from 'discord.js';
import { storage } from './storage.js';
import { moderationBotHandler } from './templates/moderation-bot.js';
import { musicBotHandler } from './templates/music-bot.js';
import { utilityBotHandler } from './templates/utility-bot.js';
import { funBotHandler } from './templates/fun-bot.js';

export interface BotInstance {
  id: number;
  client: Client;
  templateId: string;
  status: 'starting' | 'online' | 'offline' | 'error';
}

export class DiscordBotManager {
  private instances: Map<number, BotInstance> = new Map();
  private eventCallbacks: Map<string, (botId: number, status: string, data?: any) => void> = new Map();

  onStatusChange(callback: (botId: number, status: string, data?: any) => void) {
    this.eventCallbacks.set('statusChange', callback);
  }

  private emitStatusChange(botId: number, status: string, data?: any) {
    const callback = this.eventCallbacks.get('statusChange');
    if (callback) {
      callback(botId, status, data);
    }
  }

  async validateToken(token: string): Promise<{ valid: boolean; botInfo?: any; error?: string }> {
    try {
      const rest = new REST({ version: '10' }).setToken(token);
      const botInfo = await rest.get(Routes.user('@me'));
      return { valid: true, botInfo };
    } catch (error: any) {
      return { 
        valid: false, 
        error: error.code === 'TokenInvalid' ? 'Invalid bot token' : 'Failed to validate token'
      };
    }
  }

  async deployBot(botId: number, token: string, templateId: string, config: any): Promise<void> {
    try {
      // Update status to deploying
      await storage.updateBotStatus(botId, 'deploying');
      this.emitStatusChange(botId, 'deploying');

      // Create Discord client
      const client = new Client({
        intents: [
          GatewayIntentBits.Guilds,
          GatewayIntentBits.GuildMessages,
          GatewayIntentBits.MessageContent,
          GatewayIntentBits.GuildMembers,
          GatewayIntentBits.GuildModeration,
          GatewayIntentBits.GuildVoiceStates,
        ],
      });

      // Set up event handlers based on template
      this.setupBotTemplate(client, templateId, config);

      // Set up basic event handlers
      client.once('ready', async () => {
        console.log(`Bot ${client.user?.tag} is ready!`);
        
        try {
          // Update bot presence to show BotForge branding
          await client.user?.setPresence({
            activities: [{
              name: 'Made by BotForge',
              type: 4, // Custom status
              state: 'Made by BotForge'
            }],
            status: 'online'
          });

          // Update bot's application description if possible
          if (client.application) {
            try {
              await client.application.edit({
                description: 'Made by botforge.vercel.app, best and easiest discord bot maker!'
              });
            } catch (error: any) {
              console.log('Could not update bot description:', error?.message || 'Unknown error');
            }
          }
        } catch (error: any) {
          console.log('Could not update bot presence:', error?.message || 'Unknown error');
        }
        
        // Generate invite URL
        const inviteUrl = `https://discord.com/api/oauth2/authorize?client_id=${client.user?.id}&permissions=${this.getPermissionsForTemplate(templateId)}&scope=bot%20applications.commands`;
        
        // Update bot status, invite URL, Discord ID, and guild count
        await storage.updateBotStatus(botId, 'online', new Date());
        await storage.updateBotInviteUrl(botId, inviteUrl);
        
        // Store the Discord bot ID and initial guild count
        const bot = await storage.getBot(botId);
        if (bot) {
          await storage.updateBotGuildCount(botId, client.guilds.cache.size);
          // Update the Discord bot ID if not already set
          if (!bot.discordBotId) {
            await storage.updateBotDiscordId(botId, client.user?.id || '');
          }
        }
        
        this.emitStatusChange(botId, 'online', { 
          botTag: client.user?.tag,
          inviteUrl,
          guildCount: client.guilds.cache.size 
        });
      });

      client.on('error', async (error) => {
        console.error(`Bot ${botId} error:`, error);
        await storage.updateBotStatus(botId, 'error');
        this.emitStatusChange(botId, 'error', { error: error.message });
      });

      client.on('disconnect', async () => {
        console.log(`Bot ${botId} disconnected`);
        await storage.updateBotStatus(botId, 'offline');
        this.emitStatusChange(botId, 'offline');
      });

      // Store instance
      const instance: BotInstance = {
        id: botId,
        client,
        templateId,
        status: 'starting',
      };
      this.instances.set(botId, instance);

      // Login to Discord
      await client.login(token);

    } catch (error: any) {
      console.error(`Failed to deploy bot ${botId}:`, error);
      await storage.updateBotStatus(botId, 'error');
      this.emitStatusChange(botId, 'error', { error: error.message });
      throw error;
    }
  }

  private setupBotTemplate(client: Client, templateId: string, config: any) {
    switch (templateId) {
      case 'moderation-pro':
        moderationBotHandler(client, config);
        break;
      case 'music-master':
        musicBotHandler(client, config);
        break;
      case 'utility-hub':
        utilityBotHandler(client, config);
        break;
      case 'fun-zone':
        funBotHandler(client, config);
        break;
      default:
        console.warn(`Unknown template: ${templateId}`);
    }
  }

  private getPermissionsForTemplate(templateId: string): string {
    const basePermissions = [
      PermissionFlagsBits.SendMessages,
      PermissionFlagsBits.ReadMessageHistory,
      PermissionFlagsBits.ViewChannel,
    ];

    switch (templateId) {
      case 'moderation-pro':
        return [
          ...basePermissions,
          PermissionFlagsBits.KickMembers,
          PermissionFlagsBits.BanMembers,
          PermissionFlagsBits.ManageMessages,
          PermissionFlagsBits.ManageRoles,
          PermissionFlagsBits.ModerateMembers,
        ].reduce((acc, perm) => acc | perm, BigInt(0)).toString();
      
      case 'music-master':
        return [
          ...basePermissions,
          PermissionFlagsBits.Connect,
          PermissionFlagsBits.Speak,
        ].reduce((acc, perm) => acc | perm, BigInt(0)).toString();
      
      case 'utility-hub':
        return [
          ...basePermissions,
          PermissionFlagsBits.ManageRoles,
          PermissionFlagsBits.CreatePublicThreads,
        ].reduce((acc, perm) => acc | perm, BigInt(0)).toString();
      
      case 'fun-zone':
        return basePermissions.reduce((acc, perm) => acc | perm, 0n).toString();
      
      default:
        return basePermissions.reduce((acc, perm) => acc | perm, 0n).toString();
    }
  }

  async stopBot(botId: number): Promise<void> {
    const instance = this.instances.get(botId);
    if (instance) {
      await instance.client.destroy();
      this.instances.delete(botId);
      await storage.updateBotStatus(botId, 'offline');
      this.emitStatusChange(botId, 'offline');
    }
  }

  getBotInstance(botId: number): BotInstance | undefined {
    return this.instances.get(botId);
  }

  async getAllRunningBots(): Promise<BotInstance[]> {
    return Array.from(this.instances.values());
  }
}

export const botManager = new DiscordBotManager();
