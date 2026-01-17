// server.js - Add these routes to your existing file
const Fastify = require("fastify");
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const cors = require("@fastify/cors");
const jwt = require("jsonwebtoken");
const path = require('path');
const fs = require("fs");
const util = require("util");
const pump = util.promisify(require("stream").pipeline);
const multipart = require("@fastify/multipart");

const app = Fastify({ logger: true });
const prisma = new PrismaClient();

// Decorate app with prisma so it's available everywhere
app.decorate("prisma", prisma);

async function start() {
  // Register CORS globally
  await app.register(cors, {
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // allow needed methods
    allowedHeaders: ["Content-Type", "Authorization"],    // important!
    credentials: true,
  });

  await app.register(multipart, {
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB
    },
  });



  // Root route
  app.get("/", async () => {
    return { message: "Fastify + Prisma + PostgreSQL is running!" };
  });

  // Signup endpoint
  app.post("/api/auth/signup", {
    schema: {
      body: {
        type: 'object',
        required: ['first_name', 'last_name', 'username', 'email', 'password'],
        properties: {
          first_name: { type: 'string', minLength: 1 },
          last_name: { type: 'string', minLength: 1 },
          username: { type: 'string', minLength: 3 },
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 6 }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { first_name, last_name, username, email, password } = request.body;

      // Check if email exists
      const existingEmail = await app.prisma.user.findUnique({ where: { email } });
      if (existingEmail) {
        return reply.status(409).send({ success: false, message: 'Email already exists' });
      }

      // Check if username exists
      const existingUsername = await app.prisma.user.findUnique({ where: { username } });
      if (existingUsername) {
        return reply.status(409).send({ success: false, message: 'Username already taken' });
      }

      // Generate user ID & verification token
      const userId = generateUserId();
      const token = crypto.randomBytes(32).toString("hex");

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create user
      const user = await app.prisma.user.create({
        data: {
          userId,
          firstName: first_name,
          lastName: last_name,
          username,
          email,
          password: hashedPassword,
          verificationToken: token
        }
      });

      // Send verification email
      const transporter = nodemailer.createTransport({
        service: "gmail", // or your SMTP provider
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });

      const verificationUrl = `${process.env.FRONTEND_URL}/verify?token=${token}`;

      await transporter.sendMail({
        from: `"Swophere" <${process.env.SMTP_USER}>`,
        to: email,
        subject: "Verify Your LetSwap Account",
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #6b21a8;">Welcome to LetSwap!</h2>
        <p>Thank you for signing up. Please verify your email address to activate your account.</p>
        <a href="${verificationUrl}" 
           style="display: inline-block; padding: 12px 24px; background-color: #6b21a8; color: white; text-decoration: none; border-radius: 4px;">
          Verify Email Address
        </a>
        <p>Or copy and paste this link in your browser:</p>
        <p>${verificationUrl}</p>
        <p>This link will expire in 24 hours.</p>
      </div>
    `,
      });

      return {
        success: true,
        message: 'Registration successful! Please check your email to verify your account.'
      };

    } catch (error) {
      app.log.error('Signup error:', error);
      reply.status(500).send({ success: false, message: 'Internal server error', details: error.message });
    }
  });

  //Email verify endpoint
  app.get("/api/auth/verify", async (request, reply) => {
    const { token } = request.query;

    if (!token) {
      return reply.status(400).send({ success: false, message: "Invalid token" });
    }

    const user = await app.prisma.user.findFirst({ where: { verificationToken: token } });

    if (!user) {
      return reply.status(400).send({ success: false, message: "Invalid or expired token" });
    }

    await app.prisma.user.update({
      where: { id: user.id },
      data: { isVerified: true, verificationToken: null }
    });

    return { success: true, message: "Email verified successfully. You can now log in." };
  });

  // Login endpoint
  app.post("/api/auth/login", {
    schema: {
      body: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", format: "email" },
          password: { type: "string", minLength: 6 }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { email, password } = request.body;

      // Find user by email
      const user = await app.prisma.user.findUnique({ where: { email } });

      if (!user) {
        return reply.status(401).send({ success: false, message: "Invalid email or password" });
      }

      // ✅ Block unverified emails
      if (!user.isVerified) {
        return reply.status(403).send({ success: false, message: "Please verify your email before logging in." });
      }

      // Check password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return reply.status(401).send({ success: false, message: "Invalid email or password" });
      }

      // Update last login
      await app.prisma.user.update({
        where: { id: user.id },
        data: { lastLogin: new Date() }
      });

      // ✅ Create JWT session
      const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      return reply.send({
        success: true,
        message: "Login successful",
        user: {
          id: user.id,
          userId: user.userId,
          firstName: user.firstName,
          lastName: user.lastName,
          username: user.username,
          email: user.email
        },
        session: {
          token,
          expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString()
        }
      });
    } catch (error) {
      app.log.error("Login error:", error);
      return reply.status(500).send({ success: false, message: "Internal server error" });
    }
  });

  // Check username availability
  app.get("/api/auth/check-username/:username", async (request, reply) => {
    try {
      const { username } = request.params;

      const existingUser = await app.prisma.user.findUnique({
        where: { username }
      });

      return {
        available: !existingUser
      };
    } catch (error) {
      app.log.error('Username check error:', error);
      reply.status(500).send({ error: 'Internal server error' });
    }
  });

  // Check email availability
  app.get("/api/auth/check-email/:email", async (request, reply) => {
    try {
      const { email } = request.params;

      const existingUser = await app.prisma.user.findUnique({
        where: { email }
      });

      return {
        available: !existingUser
      };
    } catch (error) {
      app.log.error('Email check error:', error);
      reply.status(500).send({ error: 'Internal server error' });
    }
  });

  // ✅ Get User Profile
  app.get("/api/user/profile", async (request, reply) => {
    try {
      const { userId } = request.query;
      if (!userId) {
        return reply.status(400).send({ success: false, message: "userId is required" });
      }

      const user = await prisma.user.findUnique({
        where: { userId },
        select: {
          id: true,
          userId: true,
          firstName: true,
          lastName: true,
          username: true,
          email: true,
        },
      });

      if (!user) {
        return reply.status(404).send({ success: false, message: "User not found" });
      }

      return { success: true, user };
    } catch (err) {
      app.log.error(err);
      return reply.status(500).send({ success: false, message: "Internal server error" });
    }
  });

  // Get user profile by username
  app.get("/api/user/profile/:username", async (request, reply) => {
    try {
      const { username } = request.params;

      const user = await app.prisma.user.findUnique({
        where: { username },
        select: {
          userId: true,
          firstName: true,
          lastName: true,
          username: true,
          email: true,
          phone: true,
          dateOfBirth: true,
          country: true,
          state: true,
          address: true,
          facebook: true,
          twitter: true,
          linkedin: true,
          instagram: true,
          createdAt: true
        }
      });

      if (!user) {
        return reply.status(404).send({
          success: false,
          message: 'User not found'
        });
      }

      return { success: true, user };
    } catch (error) {
      app.log.error('Profile fetch error:', error);
      reply.status(500).send({ success: false, message: "Internal server error", details: error.message });
    }
  });


  // Start server

  try {
    await app.listen({ port: 4000, host: "0.0.0.0" });
    app.log.info("🚀 Server listening on http://localhost:4000");
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();