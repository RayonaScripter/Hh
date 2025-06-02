import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage.js";
import { botManager } from "./discord-bot-manager.js";
import { insertBotSchema } from "@shared/schema.js";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // WebSocket server for real-time updates
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  // Store WebSocket connections
  const wsConnections = new Set<WebSocket>();

  wss.on('connection', (ws) => {
    wsConnections.add(ws);
    console.log('WebSocket client connected');

    ws.on('close', () => {
      wsConnections.delete(ws);
      console.log('WebSocket client disconnected');
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      wsConnections.delete(ws);
    });
  });

  // Broadcast message to all connected clients
  function broadcast(message: any) {
    const data = JSON.stringify(message);
    wsConnections.forEach(ws => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(data);
      }
    });
  }

  // Set up bot manager event listener
  botManager.onStatusChange((botId, status, data) => {
    broadcast({
      type: 'bot_status_change',
      botId,
      status,
      data
    });
  });

  // Validate Discord bot token
  app.post("/api/validate-token", async (req, res) => {
    try {
      const { token } = req.body;
      
      if (!token || typeof token !== 'string') {
        return res.status(400).json({ message: "Token is required" });
      }

      // Check if token is already in use
      const existingBot = await storage.getBotByToken(token);
      if (existingBot) {
        return res.status(409).json({ message: "This token is already in use by another bot" });
      }

      const validation = await botManager.validateToken(token);
      
      if (validation.valid) {
        res.json({ 
          valid: true, 
          botInfo: validation.botInfo 
        });
      } else {
        res.status(400).json({ 
          valid: false, 
          error: validation.error 
        });
      }
    } catch (error: any) {
      console.error("Token validation error:", error);
      res.status(500).json({ message: "Failed to validate token" });
    }
  });

  // Get all templates
  app.get("/api/templates", async (req, res) => {
    try {
      const templates = await storage.getAllTemplates();
      res.json(templates);
    } catch (error: any) {
      console.error("Get templates error:", error);
      res.status(500).json({ message: "Failed to fetch templates" });
    }
  });

  // Get templates by category
  app.get("/api/templates/:category", async (req, res) => {
    try {
      const { category } = req.params;
      const templates = await storage.getTemplatesByCategory(category);
      res.json(templates);
    } catch (error: any) {
      console.error("Get templates by category error:", error);
      res.status(500).json({ message: "Failed to fetch templates" });
    }
  });

  // Create and deploy bot
  app.post("/api/bots", async (req, res) => {
    try {
      const botData = insertBotSchema.parse(req.body);
      
      // Validate template exists
      const template = await storage.getTemplate(botData.templateId);
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }

      // Check if token is already in use
      const existingBot = await storage.getBotByToken(botData.token);
      if (existingBot) {
        return res.status(409).json({ message: "This token is already in use" });
      }

      // Create bot record
      const bot = await storage.createBot({
        ...botData,
        status: 'deploying'
      });

      // Start deployment process asynchronously
      botManager.deployBot(bot.id, botData.token, botData.templateId, botData.config)
        .catch(error => {
          console.error(`Failed to deploy bot ${bot.id}:`, error);
        });

      res.status(201).json(bot);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid bot data", errors: error.errors });
      }
      console.error("Create bot error:", error);
      res.status(500).json({ message: "Failed to create bot" });
    }
  });

  // Get all bots
  app.get("/api/bots", async (req, res) => {
    try {
      const bots = await storage.getAllBots();
      res.json(bots);
    } catch (error: any) {
      console.error("Get bots error:", error);
      res.status(500).json({ message: "Failed to fetch bots" });
    }
  });

  // Get bot by ID
  app.get("/api/bots/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid bot ID" });
      }

      const bot = await storage.getBot(id);
      if (!bot) {
        return res.status(404).json({ message: "Bot not found" });
      }

      res.json(bot);
    } catch (error: any) {
      console.error("Get bot error:", error);
      res.status(500).json({ message: "Failed to fetch bot" });
    }
  });

  // Stop/delete bot
  app.delete("/api/bots/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid bot ID" });
      }

      const bot = await storage.getBot(id);
      if (!bot) {
        return res.status(404).json({ message: "Bot not found" });
      }

      // Stop the bot instance
      await botManager.stopBot(id);
      
      // Delete from storage
      const deleted = await storage.deleteBot(id);
      if (deleted) {
        res.json({ message: "Bot stopped and deleted successfully" });
      } else {
        res.status(500).json({ message: "Failed to delete bot" });
      }
    } catch (error: any) {
      console.error("Delete bot error:", error);
      res.status(500).json({ message: "Failed to delete bot" });
    }
  });

  // Get bot status
  app.get("/api/bots/:id/status", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid bot ID" });
      }

      const bot = await storage.getBot(id);
      if (!bot) {
        return res.status(404).json({ message: "Bot not found" });
      }

      const instance = botManager.getBotInstance(id);
      
      res.json({
        id: bot.id,
        name: bot.name,
        status: bot.status,
        lastSeen: bot.lastSeen,
        inviteUrl: bot.inviteUrl,
        isRunning: !!instance,
        guildCount: instance?.client.guilds.cache.size || 0
      });
    } catch (error: any) {
      console.error("Get bot status error:", error);
      res.status(500).json({ message: "Failed to fetch bot status" });
    }
  });

  return httpServer;
}
