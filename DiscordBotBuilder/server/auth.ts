import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as DiscordStrategy } from "passport-discord";
import type { Express, RequestHandler } from "express";
import connectPg from "connect-pg-simple";
import { storage } from "./storage.js";
import bcrypt from "bcrypt";
import crypto from "crypto";

if (!process.env.SESSION_SECRET) {
  throw new Error("SESSION_SECRET must be set");
}

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  
  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: sessionTtl,
    },
  });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  // Local email/password strategy
  passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
  }, async (email, password, done) => {
    try {
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return done(null, false, { message: 'Invalid email or password' });
      }

      const isValid = await bcrypt.compare(password, user.passwordHash || '');
      if (!isValid) {
        return done(null, false, { message: 'Invalid email or password' });
      }

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }));

  // Discord OAuth strategy
  if (process.env.DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_SECRET) {
    passport.use(new DiscordStrategy({
      clientID: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
      callbackURL: "/api/auth/discord/callback",
      scope: ['identify', 'email']
    }, async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await storage.getUserByProviderId(profile.id, 'discord');
        
        if (!user) {
          user = await storage.upsertUser({
            id: crypto.randomUUID(),
            email: profile.email,
            firstName: profile.username,
            lastName: null,
            profileImageUrl: profile.avatar ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png` : null,
            provider: 'discord',
            providerId: profile.id,
          });
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }));
  }

  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  // Auth routes
  app.post('/api/auth/register', async (req, res) => {
    try {
      const { email, password, firstName, lastName } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
      }

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({ message: 'User already exists' });
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 12);
      
      // Create user
      const user = await storage.upsertUser({
        id: crypto.randomUUID(),
        email,
        firstName: firstName || null,
        lastName: lastName || null,
        profileImageUrl: null,
        provider: 'email',
        passwordHash,
      });

      // Log in user
      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ message: 'Registration successful but login failed' });
        }
        res.json({ user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName } });
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Failed to register user' });
    }
  });

  app.post('/api/auth/login', (req, res, next) => {
    passport.authenticate('local', (err: any, user: any, info: any) => {
      if (err) {
        return res.status(500).json({ message: 'Authentication error' });
      }
      if (!user) {
        return res.status(401).json({ message: info?.message || 'Authentication failed' });
      }
      
      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ message: 'Login failed' });
        }
        res.json({ user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName } });
      });
    })(req, res, next);
  });

  app.get('/api/auth/discord', passport.authenticate('discord'));
  
  app.get('/api/auth/discord/callback', 
    passport.authenticate('discord', { failureRedirect: '/login' }),
    (req, res) => {
      res.redirect('/');
    }
  );

  app.post('/api/auth/logout', (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: 'Logout failed' });
      }
      res.json({ message: 'Logged out successfully' });
    });
  });

  app.get('/api/auth/user', (req, res) => {
    if (req.isAuthenticated()) {
      const user = req.user as any;
      res.json({ 
        id: user.id, 
        email: user.email, 
        firstName: user.firstName, 
        lastName: user.lastName,
        profileImageUrl: user.profileImageUrl,
        provider: user.provider
      });
    } else {
      res.status(401).json({ message: 'Not authenticated' });
    }
  });
}

export const requireAuth: RequestHandler = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: 'Authentication required' });
};