import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";
import { sendVerificationEmail } from "./email";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function generateToken() {
  return randomBytes(32).toString("hex");
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "blogcollab-session-secret",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(
      { usernameField: "email" },
      async (email, password, done) => {
        const user = await storage.getUserByEmail(email);
        if (!user || !(await comparePasswords(password, user.password))) {
          return done(null, false);
        } else if (!user.isVerified) {
          return done(null, false, { message: "Email not verified" });
        } else {
          return done(null, user);
        }
      }
    )
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    const user = await storage.getUser(id);
    done(null, user);
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      const { email, username } = req.body;
      
      // Check if email already exists
      const existingEmailUser = await storage.getUserByEmail(email);
      if (existingEmailUser) {
        return res.status(400).json({ message: "Email already registered" });
      }
      
      // Check if username already exists
      const existingUsernameUser = await storage.getUserByUsername(username);
      if (existingUsernameUser) {
        return res.status(400).json({ message: "Username already taken" });
      }
      
      // Generate verification token
      const verificationToken = generateToken();
      
      // Create user with hashed password
      const user = await storage.createUser({
        ...req.body,
        password: await hashPassword(req.body.password),
        verificationToken,
      });
      
      // Send verification email
      await sendVerificationEmail(user.email, user.fullName, verificationToken);
      
      // Return success without logging in
      return res.status(201).json({ 
        message: "Registration successful! Please check your email to verify your account.",
        verified: false
      });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
      if (err) return next(err);
      if (!user) {
        const message = info?.message || "Invalid email or password";
        return res.status(401).json({ message });
      }
      
      req.login(user, (err) => {
        if (err) return next(err);
        return res.status(200).json(user);
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    res.json(req.user);
  });

  app.get("/api/verify-email/:token", async (req, res, next) => {
    try {
      const { token } = req.params;
      const user = await storage.getUserByVerificationToken(token);
      
      if (!user) {
        return res.status(400).json({ message: "Invalid or expired verification token" });
      }
      
      // Verify the user
      await storage.verifyUser(user.id);
      
      return res.status(200).json({ message: "Email verified successfully. You can now login." });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/forgot-password", async (req, res, next) => {
    try {
      const { email } = req.body;
      const user = await storage.getUserByEmail(email);
      
      // Don't reveal if user exists for security
      if (!user) {
        return res.status(200).json({ message: "If your email is registered, you will receive a password reset link." });
      }
      
      // Generate reset token and expiry
      const resetToken = generateToken();
      const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now
      
      // Update user with reset token
      await storage.updateUserResetToken(user.id, resetToken, resetTokenExpiry);
      
      // Send password reset email (will be implemented in email.ts)
      // await sendPasswordResetEmail(user.email, user.fullName, resetToken);
      
      return res.status(200).json({ message: "If your email is registered, you will receive a password reset link." });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/reset-password", async (req, res, next) => {
    try {
      const { token, password } = req.body;
      
      const user = await storage.getUserByResetToken(token);
      
      if (!user || !user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
        return res.status(400).json({ message: "Invalid or expired reset token" });
      }
      
      // Update password and clear reset token
      await storage.updateUserPassword(user.id, await hashPassword(password));
      
      return res.status(200).json({ message: "Password reset successful. You can now login with your new password." });
    } catch (error) {
      next(error);
    }
  });
}
