// server.js - EventASAP Backend with Email Verification and Business Proof Upload
require('dotenv').config();
const Fastify = require("fastify");
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("@fastify/cors");
const helmet = require("@fastify/helmet");
const rateLimit = require("@fastify/rate-limit");
const multipart = require("@fastify/multipart");
const { z } = require("zod");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const fs = require("fs").promises;
const path = require("path");
const fastifyStatic = require("@fastify/static");
const stripe = process.env.STRIPE_SECRET_KEY ? require('stripe')(process.env.STRIPE_SECRET_KEY) : null;

const app = Fastify({
  bodyLimit: 100 * 1024 * 1024, // 100MB limit for base64 images and gallery uploads
  logger: {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true
      }
    }
  }
});


const prisma = new PrismaClient();

// Email configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Email templates
const emailTemplates = {
  verification: (name, verificationUrl) => ({
    subject: 'Verify Your EventASAP Account',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f97316 0%, #9333ea 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #fff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
          .button { display: inline-block; padding: 15px 30px; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to EventASAP! 🎉</h1>
          </div>
          <div class="content">
            <h2>Hi ${name},</h2>
            <p>Thank you for registering with EventASAP! We're excited to have you join our premier event marketplace.</p>
            <p>To complete your registration and start using your account, please verify your email address by clicking the button below:</p>
            <div style="text-align: center;">
              <a href="${verificationUrl}" class="button">Verify Email Address</a>
            </div>
            <p>Or copy and paste this link into your browser:</p>
            <p style="background: #f3f4f6; padding: 10px; border-radius: 5px; word-break: break-all;">${verificationUrl}</p>
            <p><strong>This link will expire in 24 hours.</strong></p>
            <p>If you didn't create an account with EventASAP, please ignore this email.</p>
            <div class="footer">
              <p>Best regards,<br>The EventASAP Team</p>
              <p style="margin-top: 20px;">
                <a href="${process.env.FRONTEND_URL}" style="color: #f97316;">Visit EventASAP</a> | 
                <a href="${process.env.FRONTEND_URL}/support" style="color: #f97316;">Contact Support</a>
              </p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  resendVerification: (name, verificationUrl) => ({
    subject: 'EventASAP - Verify Your Email',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f97316 0%, #9333ea 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #fff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
          .button { display: inline-block; padding: 15px 30px; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Verify Your Email</h1>
          </div>
          <div class="content">
            <h2>Hi ${name},</h2>
            <p>You requested a new verification link for your EventASAP account.</p>
            <div style="text-align: center;">
              <a href="${verificationUrl}" class="button">Verify Email Address</a>
            </div>
            <p>This link will expire in 24 hours.</p>
          </div>
        </div>
      </body>
      </html>
    `
  })
};

// Helper function to send email
const sendEmail = async (to, template) => {
  try {
    const info = await transporter.sendMail({
      from: `"EventASAP" <${process.env.SMTP_USER}>`,
      to,
      subject: template.subject,
      html: template.html,
    });
    app.log.info(`Email sent successfully to ${to}`, { messageId: info.messageId });
    return true;
  } catch (error) {
    // Log comprehensive error details
    app.log.error('Email sending failed:', {
      message: error.message,
      code: error.code,
      command: error.command,
      response: error.response,
      responseCode: error.responseCode,
      stack: error.stack
    });
    throw error;
  }
};

// Helper function to generate verification token
const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Validation schemas
const unifiedRegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  phoneNumber: z.string(),
  createVendorProfile: z.boolean().default(false),
  vendorData: z.object({
    businessName: z.string().min(2),
    businessEmail: z.string().email(),
    businessPhone: z.string(),
    city: z.string(),
    country: z.string().default('UK'),
    category: z.string(),
    description: z.string().optional(),
    serviceAreas: z.array(z.string()).optional(),
    whatsappEnabled: z.boolean().default(false)
  }).optional()
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

const switchRoleSchema = z.object({
  role: z.enum(['VENDOR', 'CLIENT'])
});

const addVendorProfileSchema = z.object({
  businessName: z.string().min(2),
  businessEmail: z.string().email(),
  businessPhone: z.string(),
  city: z.string(),
  country: z.string().default('UK'),
  category: z.string(),
  description: z.string().optional(),
  serviceAreas: z.array(z.string()).optional(),
  whatsappEnabled: z.boolean().default(false)
});

const resendVerificationSchema = z.object({
  email: z.string().email()
});

// Booking schemas
const bookingSchema = z.object({
  vendorId: z.string(),
  serviceId: z.string().optional(),
  serviceType: z.string(),
  eventDate: z.string(),
  eventLocation: z.string(),
  guests: z.number().min(1),
  budget: z.number().min(0),
  message: z.string().optional(),
  customRequirements: z.array(z.string()).optional(),
  bookingDate: z.string().optional()
});

const updateBookingSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED']).optional(),
  notes: z.string().optional(),
  quotedPrice: z.number().optional(),
  paymentStatus: z.enum(['PENDING', 'PARTIAL', 'PAID']).optional()
});

// Service Request schema
const serviceRequestSchema = z.object({
  serviceType: z.string(),
  description: z.string(),
  budgetRange: z.object({
    min: z.number().min(0),
    max: z.number().min(0)
  }),
  eventDate: z.string(),
  eventLocation: z.string(),
  guests: z.number().min(1),
  requirements: z.array(z.string()).optional(),
  urgency: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional()
});

// Service Package schema
const servicePackageSchema = z.object({
  title: z.string().min(2),
  description: z.string(),
  price: z.number().min(0),
  currency: z.string().default('GBP'),
  duration: z.number().min(1),
  inclusions: z.array(z.string()),
  isActive: z.boolean().default(true),
  aboutVendor: z.string().optional(),
  mainImage: z.string().optional(),
  gallery: z.array(z.string()).optional(),
  location: z.string().optional(),
  state: z.string().optional(),
  availability: z.any().optional(),
  minBooking: z.number().optional(),
  maxBooking: z.number().optional(),
  preparationTime: z.number().optional()
});

const profileUpdateSchema = z.object({
  firstName: z.string().min(2).optional(),
  lastName: z.string().min(2).optional(),
  phoneNumber: z.string().optional()
});

const vendorProfileUpdateSchema = z.object({
  businessName: z.string().min(2).optional(),
  businessEmail: z.string().email().optional(),
  businessPhone: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  category: z.string().optional(),
  description: z.string().optional(),
  website: z.string().optional().nullable(),
  serviceAreas: z.array(z.string()).optional(),
  whatsappEnabled: z.boolean().optional(),
  businessProof: z.string().optional()
});

const billingUpdateSchema = z.object({
  accountName: z.string(),
  bankName: z.string(),
  accountNumber: z.string(),
  sortCode: z.string().optional(),
  iban: z.string().optional(),
  swiftCode: z.string().optional()
});

const preferenceUpdateSchema = z.object({
  language: z.string().optional(),
  currency: z.string().optional(),
  theme: z.string().optional(),
  timezone: z.string().optional(),
  notifications: z.object({
    email: z.boolean().optional(),
    sms: z.boolean().optional(),
    push: z.boolean().optional(),
    bookingUpdates: z.boolean().optional(),
    newProposals: z.boolean().optional(),
    paymentReminders: z.boolean().optional(),
    marketing: z.boolean().optional()
  }).optional()
});

const adminRegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  phoneNumber: z.string(),
  adminSecret: z.string()
});

// Admin schemas
const vendorApprovalSchema = z.object({
  notes: z.string().optional()
});

const vendorRejectionSchema = z.object({
  reason: z.string().min(10, 'Rejection reason must be at least 10 characters')
});

const vendorSuspensionSchema = z.object({
  reason: z.string()
});

// Generate JWT tokens
const generateTokens = (user) => {
  const accessToken = jwt.sign(
    {
      userId: user.id,
      email: user.email,
      activeRole: user.activeRole
    },
    process.env.JWT_SECRET,
    { expiresIn: '15m' } // Shorter access token for security
  );

  const refreshToken = jwt.sign(
    {
      userId: user.id
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  return { accessToken, refreshToken };
};

// Authentication middleware
const authenticate = async (request, reply) => {
  try {
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.status(401).send({
        success: false,
        error: 'Authentication required'
      });
    }

    const token = authHeader.substring(7);

    // First verify the JWT token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        return reply.status(401).send({
          success: false,
          error: 'Token expired',
          code: 'TOKEN_EXPIRED'
        });
      }
      return reply.status(401).send({
        success: false,
        error: 'Invalid token'
      });
    }

    // Check if session exists in database
    const session = await prisma.session.findFirst({
      where: {
        token: token,
        userId: decoded.userId,
        expiresAt: { gt: new Date() }
      }
    });

    if (!session) {
      return reply.status(401).send({
        success: false,
        error: 'Session expired'
      });
    }

    request.user = decoded;
    request.session = session;

  } catch (error) {
    app.log.error('Authentication error:', error);
    return reply.status(500).send({
      success: false,
      error: 'Internal server error'
    });
  }
};

const optionalAuthenticate = async (request, reply) => {
  try {
    const authHeader = request.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const session = await prisma.session.findFirst({
          where: {
            token: token,
            userId: decoded.userId,
            expiresAt: { gt: new Date() }
          }
        });

        if (session) {
          request.user = decoded;
          request.session = session;
        }
      } catch (err) {
        // Silently ignore invalid tokens for optional auth
      }
    }
  } catch (error) {
    // Silently ignore errors
  }
};


async function start() {
  // Register plugins
  await app.register(cors, {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Content-Type', 'Authorization']
  });

  await app.register(helmet, {
    contentSecurityPolicy: false,
  });

  await app.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute'
  });

  await app.register(multipart, {
    limits: {
      fileSize: 10 * 1024 * 1024,
    }
  });

  // Health check
  app.get("/", async () => {
    return {
      success: true,
      message: "EventASAP API is running!",
      version: "1.0.0",
      timestamp: new Date().toISOString()
    };
  });

  // Serve static files for proof of documents
  await app.register(fastifyStatic, {
    root: path.join(__dirname, 'proof-of-document'),
    prefix: '/uploads/proofs/',
  });

  app.get("/health", async () => {
    return {
      status: "OK",
      database: "Connected",
      timestamp: new Date().toISOString()
    };
  });

  // Unified Registration with Email Verification
  app.post("/api/auth/register", async (request, reply) => {
    try {
      const data = unifiedRegisterSchema.parse(request.body);

      const existingUser = await prisma.user.findUnique({
        where: { email: data.email }
      });

      if (existingUser) {
        return reply.status(400).send({
          success: false,
          error: 'Email already registered'
        });
      }

      const hashedPassword = await bcrypt.hash(data.password, 10);
      const verificationToken = generateVerificationToken();
      const verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      const result = await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            email: data.email,
            password: hashedPassword,
            firstName: data.firstName,
            lastName: data.lastName,
            phoneNumber: data.phoneNumber,
            activeRole: 'CLIENT',
            hasClientProfile: true,
            hasVendorProfile: data.createVendorProfile,
            emailVerified: false,
            verificationToken: verificationToken,
            verificationExpiry: verificationExpiry,
            clientProfile: {
              create: {
                eventTypes: []
              }
            }
          }
        });

        let vendorProfile = null;

        if (data.createVendorProfile && data.vendorData) {
          vendorProfile = await tx.vendorProfile.create({
            data: {
              userId: user.id,
              businessName: data.vendorData.businessName,
              businessEmail: data.vendorData.businessEmail,
              businessPhone: data.vendorData.businessPhone,
              city: data.vendorData.city,
              country: data.vendorData.country,
              category: data.vendorData.category,
              description: data.vendorData.description,
              serviceAreas: data.vendorData.serviceAreas || [],
              whatsappEnabled: data.vendorData.whatsappEnabled
            }
          });
        }

        return { user, vendorProfile };
      });

      // Send verification email
      const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
      const emailTemplate = emailTemplates.verification(
        data.firstName,
        verificationUrl
      );

      try {
        await sendEmail(data.email, emailTemplate);
      } catch (emailError) {
        // Log but don't fail registration - user can resend later
        app.log.error('Failed to send verification email during registration:', {
          email: data.email,
          error: emailError.message
        });
      }

      return reply.send({
        success: true,
        message: 'Registration successful! Please check your email to verify your account.',
        data: {
          user: {
            id: result.user.id,
            email: result.user.email,
            firstName: result.user.firstName,
            lastName: result.user.lastName,
            emailVerified: result.user.emailVerified,
            hasVendorProfile: result.user.hasVendorProfile,
            hasClientProfile: result.user.hasClientProfile
          },
          requiresVerification: true
        }
      });

    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({
          success: false,
          error: 'Validation failed',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        });
      }
      app.log.error('Registration error:', error);
      return reply.status(500).send({
        success: false,
        error: 'Internal server error'
      });
    }
  });

  // Admin Registration
  app.post("/api/admin/auth/register", async (request, reply) => {
    try {
      const data = adminRegisterSchema.parse(request.body);

      // Simple secret check for demo purposes
      // In production, this should be a robust key or handled via existing admin invite
      const ADMIN_SECRET = process.env.ADMIN_SECRET || 'EVENTASAP_ADMIN_2026';
      if (data.adminSecret !== ADMIN_SECRET) {
        return reply.status(403).send({
          success: false,
          error: 'Invalid admin registration secret'
        });
      }

      const existingUser = await prisma.user.findUnique({
        where: { email: data.email }
      });

      if (existingUser) {
        return reply.status(400).send({
          success: false,
          error: 'Email already registered'
        });
      }

      const hashedPassword = await bcrypt.hash(data.password, 10);

      const user = await prisma.user.create({
        data: {
          email: data.email,
          password: hashedPassword,
          firstName: data.firstName,
          lastName: data.lastName,
          phoneNumber: data.phoneNumber,
          activeRole: 'ADMIN',
          emailVerified: true, // Auto-verify for admins for ease of setup
          hasClientProfile: false,
          hasVendorProfile: false
        }
      });

      return reply.send({
        success: true,
        message: 'Admin registered successfully!',
        data: {
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            activeRole: user.activeRole
          }
        }
      });

    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({
          success: false,
          error: 'Validation failed',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        });
      }
      app.log.error('Admin registration error:', error);
      return reply.status(500).send({
        success: false,
        error: 'Internal server error'
      });
    }
  });

  // Verify email endpoint
  app.get("/api/auth/verify-email/:token", async (request, reply) => {
    try {
      const { token } = request.params;

      const user = await prisma.user.findFirst({
        where: {
          verificationToken: token,
          verificationExpiry: { gt: new Date() }
        }
      });

      if (!user) {
        return reply.status(400).send({
          success: false,
          error: 'Invalid or expired verification token'
        });
      }

      if (user.emailVerified) {
        return reply.status(400).send({
          success: false,
          error: 'Email already verified'
        });
      }

      await prisma.user.update({
        where: { id: user.id },
        data: {
          emailVerified: true,
          verificationToken: null,
          verificationExpiry: null
        }
      });

      // Generate tokens for automatic login
      const { accessToken, refreshToken } = generateTokens(user);

      await prisma.refreshToken.create({
        data: {
          userId: user.id,
          token: refreshToken,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        }
      });

      await prisma.session.create({
        data: {
          userId: user.id,
          token: accessToken,
          ipAddress: request.ip,
          userAgent: request.headers['user-agent'],
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
        }
      });

      return reply.send({
        success: true,
        message: 'Email verified successfully! You can now login.',
        data: {
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            emailVerified: true
          },
          accessToken,
          refreshToken
        }
      });

    } catch (error) {
      app.log.error('Email verification error:', error);
      return reply.status(500).send({
        success: false,
        error: 'Internal server error'
      });
    }
  });

  // Resend verification email
  app.post("/api/auth/resend-verification", async (request, reply) => {
    try {
      const data = resendVerificationSchema.parse(request.body);

      const user = await prisma.user.findUnique({
        where: { email: data.email }
      });

      if (!user) {
        return reply.status(404).send({
          success: false,
          error: 'User not found'
        });
      }

      if (user.emailVerified) {
        return reply.status(400).send({
          success: false,
          error: 'Email already verified'
        });
      }

      const verificationToken = generateVerificationToken();
      const verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

      await prisma.user.update({
        where: { id: user.id },
        data: {
          verificationToken,
          verificationExpiry
        }
      });

      const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
      const emailTemplate = emailTemplates.resendVerification(
        user.firstName,
        verificationUrl
      );

      await sendEmail(data.email, emailTemplate);

      return reply.send({
        success: true,
        message: 'Verification email sent! Please check your inbox.'
      });

    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({
          success: false,
          error: 'Validation failed',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        });
      }
      app.log.error('Resend verification error:', error);
      return reply.status(500).send({
        success: false,
        error: 'Internal server error'
      });
    }
  });

  // Login endpoint - Check email verification
  app.post("/api/auth/login", async (request, reply) => {
    try {
      const data = loginSchema.parse(request.body);

      const user = await prisma.user.findUnique({
        where: { email: data.email },
        include: {
          vendorProfile: true,
          clientProfile: true
        }
      });

      if (!user) {
        return reply.status(401).send({
          success: false,
          error: 'Invalid credentials'
        });
      }

      const isValidPassword = await bcrypt.compare(data.password, user.password);

      if (!isValidPassword) {
        return reply.status(401).send({
          success: false,
          error: 'Invalid credentials'
        });
      }

      // Check email verification
      if (!user.emailVerified) {
        return reply.status(403).send({
          success: false,
          error: 'Email not verified. Please check your email for verification link.',
          requiresVerification: true,
          email: user.email
        });
      }

      const { accessToken, refreshToken } = generateTokens(user);

      await prisma.refreshToken.create({
        data: {
          userId: user.id,
          token: refreshToken,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        }
      });

      await prisma.session.create({
        data: {
          userId: user.id,
          token: accessToken,
          ipAddress: request.ip,
          userAgent: request.headers['user-agent'],
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
        }
      });

      return reply.send({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            activeRole: user.activeRole,
            hasVendorProfile: user.hasVendorProfile,
            hasClientProfile: user.hasClientProfile,
            emailVerified: user.emailVerified,
            isAdmin: user.activeRole === 'ADMIN',
            vendorProfile: user.vendorProfile,
            clientProfile: user.clientProfile
          },
          accessToken,
          refreshToken
        }
      });

    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({
          success: false,
          error: 'Validation failed',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        });
      }
      app.log.error('Login error:', error);
      return reply.status(500).send({
        success: false,
        error: 'Internal server error'
      });
    }
  });

  // Add vendor profile after registration
  app.post("/api/auth/add-vendor-profile", { preHandler: [authenticate] }, async (request, reply) => {
    try {
      const userId = request.user.userId;
      const data = addVendorProfileSchema.parse(request.body);

      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { vendorProfile: true }
      });

      if (user.vendorProfile) {
        return reply.status(400).send({
          success: false,
          error: 'Vendor profile already exists'
        });
      }

      const existingVendor = await prisma.vendorProfile.findUnique({
        where: { businessEmail: data.businessEmail }
      });

      if (existingVendor) {
        return reply.status(400).send({
          success: false,
          error: 'Business email already registered'
        });
      }

      const vendorProfile = await prisma.vendorProfile.create({
        data: {
          userId: userId,
          businessName: data.businessName,
          businessEmail: data.businessEmail,
          businessPhone: data.businessPhone,
          city: data.city,
          country: data.country,
          category: data.category,
          description: data.description,
          serviceAreas: data.serviceAreas || [],
          whatsappEnabled: data.whatsappEnabled
        }
      });

      await prisma.user.update({
        where: { id: userId },
        data: { hasVendorProfile: true }
      });

      return reply.send({
        success: true,
        message: 'Vendor profile created successfully! Please upload proof of business for approval.',
        data: {
          vendorProfile: {
            businessName: vendorProfile.businessName,
            status: vendorProfile.status,
            isVerified: vendorProfile.isVerified
          }
        }
      });

    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({
          success: false,
          error: 'Validation failed',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        });
      }
      app.log.error('Add vendor profile error:', error);
      return reply.status(500).send({
        success: false,
        error: 'Internal server error'
      });
    }
  });

  // Switch between roles
  app.post("/api/auth/switch-role", { preHandler: [authenticate] }, async (request, reply) => {
    try {
      const userId = request.user.userId;
      const data = switchRoleSchema.parse(request.body);

      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          vendorProfile: true,
          clientProfile: true
        }
      });

      if (data.role === 'VENDOR' && !user.vendorProfile) {
        return reply.status(400).send({
          success: false,
          error: 'Vendor profile not found. Please create one first.'
        });
      }

      if (data.role === 'CLIENT' && !user.clientProfile) {
        return reply.status(400).send({
          success: false,
          error: 'Client profile not found'
        });
      }

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { activeRole: data.role },
        include: {
          vendorProfile: data.role === 'VENDOR',
          clientProfile: data.role === 'CLIENT'
        }
      });

      await prisma.roleSwitch.create({
        data: {
          userId: userId,
          fromRole: user.activeRole,
          toRole: data.role
        }
      });

      const { accessToken, refreshToken } = generateTokens(updatedUser);

      await prisma.session.updateMany({
        where: {
          userId: userId,
          token: request.session.token
        },
        data: {
          token: accessToken,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
        }
      });

      return reply.send({
        success: true,
        message: `Switched to ${data.role.toLowerCase()} mode`,
        data: {
          user: {
            id: updatedUser.id,
            email: updatedUser.email,
            firstName: updatedUser.firstName,
            lastName: updatedUser.lastName,
            activeRole: updatedUser.activeRole,
            hasVendorProfile: updatedUser.hasVendorProfile,
            hasClientProfile: updatedUser.hasClientProfile,
            vendorProfile: updatedUser.vendorProfile,
            clientProfile: updatedUser.clientProfile
          },
          accessToken,
          refreshToken
        }
      });

    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({
          success: false,
          error: 'Validation failed',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        });
      }
      app.log.error('Switch role error:', error);
      return reply.status(500).send({
        success: false,
        error: 'Internal server error'
      });
    }
  });

  // Get current user
  app.get("/api/auth/me", { preHandler: [authenticate] }, async (request, reply) => {
    try {
      const userId = request.user.userId;

      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          vendorProfile: true,
          clientProfile: true,
          roleSwitches: {
            take: 5,
            orderBy: { switchedAt: 'desc' }
          }
        }
      });

      if (!user) {
        return reply.status(404).send({
          success: false,
          error: 'User not found'
        });
      }

      const availableRoles = ['CLIENT'];
      if (user.hasVendorProfile) {
        availableRoles.push('VENDOR');
      }

      const activeProfile = user.activeRole === 'VENDOR'
        ? { vendorProfile: user.vendorProfile }
        : { clientProfile: user.clientProfile };

      return reply.send({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            phoneNumber: user.phoneNumber,
            activeRole: user.activeRole,
            hasVendorProfile: user.hasVendorProfile,
            hasClientProfile: user.hasClientProfile,
            emailVerified: user.emailVerified,
            isAdmin: user.activeRole === 'ADMIN',
            ...activeProfile
          },
          availableRoles
        }
      });

    } catch (error) {
      app.log.error('Get current user error:', error);
      return reply.status(500).send({
        success: false,
        error: 'Internal server error'
      });
    }
  });

  // Update user profile
  app.put("/api/user/update-profile", { preHandler: [authenticate] }, async (request, reply) => {
    try {
      const userId = request.user.userId;
      const data = profileUpdateSchema.parse(request.body);

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          firstName: data.firstName,
          lastName: data.lastName,
          phoneNumber: data.phoneNumber
        }
      });

      return reply.send({
        success: true,
        message: 'Profile updated successfully',
        data: { user: updatedUser }
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({
          success: false,
          error: 'Validation failed',
          details: error.errors
        });
      }
      app.log.error('Update profile error:', error);
      return reply.status(500).send({ success: false, error: 'Internal server error' });
    }
  });

  // Update billing/payout details
  app.put("/api/user/update-billing", { preHandler: [authenticate] }, async (request, reply) => {
    try {
      const userId = request.user.userId;
      const data = billingUpdateSchema.parse(request.body);

      const userProfile = await prisma.vendorProfile.findUnique({
        where: { userId }
      });

      if (!userProfile) {
        return reply.status(400).send({
          success: false,
          error: 'Vendor profile not found'
        });
      }

      await prisma.vendorProfile.update({
        where: { id: userProfile.id },
        data: { billingDetails: data }
      });

      return reply.send({
        success: true,
        message: 'Billing details updated successfully'
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({
          success: false,
          error: 'Validation failed',
          details: error.errors
        });
      }
      app.log.error('Update billing error:', error);
      return reply.status(500).send({ success: false, error: 'Internal server error' });
    }
  });

  // Update vendor profile details (including business proof)
  app.put("/api/vendor/profile", { preHandler: [authenticate] }, async (request, reply) => {
    try {
      const userId = request.user.userId;

      // Add CORS headers explicitly
      reply.header('Access-Control-Allow-Origin', process.env.FRONTEND_URL || 'http://localhost:3000');
      reply.header('Access-Control-Allow-Credentials', 'true');

      const data = vendorProfileUpdateSchema.parse(request.body);

      const userProfile = await prisma.vendorProfile.findUnique({
        where: { userId }
      });

      if (!userProfile) {
        return reply.status(404).send({
          success: false,
          error: 'Vendor profile not found'
        });
      }

      // Prepare update data
      let updateData = {
        ...data,
        updatedAt: new Date()
      };

      // Remove businessProof from updateData initially
      delete updateData.businessProof;

      // Handle business proof document upload
      if (data.businessProof && data.businessProof.startsWith('data:')) {
        try {
          // Ensure upload directory exists
          const uploadDir = path.join(__dirname, 'proof-of-document');
          try {
            await fs.access(uploadDir);
          } catch {
            await fs.mkdir(uploadDir, { recursive: true });
            app.log.info('Created proof-of-document directory');
          }

          // Extract base64 data
          const matches = data.businessProof.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);

          if (matches && matches.length === 3) {
            const mimeType = matches[1];
            const base64Data = matches[2];

            // Validate base64 string length before converting
            if (base64Data.length > 15 * 1024 * 1024) { // ~15MB base64 = ~10MB file
              return reply.status(400).send({
                success: false,
                error: 'File size exceeds 10MB limit'
              });
            }

            const buffer = Buffer.from(base64Data, 'base64');

            // Validate file size (10MB limit)
            if (buffer.length > 10 * 1024 * 1024) {
              return reply.status(400).send({
                success: false,
                error: 'File size exceeds 10MB limit'
              });
            }

            // Determine file extension
            const extensionMap = {
              'image/png': 'png',
              'image/jpeg': 'jpg',
              'image/jpg': 'jpg',
              'application/pdf': 'pdf',
              'image/webp': 'webp'
            };
            const extension = extensionMap[mimeType] || 'bin';

            // Validate file type
            if (!['png', 'jpg', 'jpeg', 'pdf', 'webp'].includes(extension)) {
              return reply.status(400).send({
                success: false,
                error: 'Invalid file type. Only PNG, JPG, PDF, and WEBP are allowed'
              });
            }

            // Generate unique filename
            const timestamp = Date.now();
            const randomString = crypto.randomBytes(8).toString('hex');
            const filename = `proof-${userId}-${timestamp}-${randomString}.${extension}`;
            const filepath = path.join(uploadDir, filename);

            // Save file
            await fs.writeFile(filepath, buffer);
            app.log.info(`Business proof document saved: ${filename}`);

            // Delete old proof file if exists
            if (userProfile.businessProof) {
              const oldFilePath = path.join(uploadDir, userProfile.businessProof);
              try {
                await fs.unlink(oldFilePath);
                app.log.info(`Old business proof deleted: ${userProfile.businessProof}`);
              } catch (unlinkError) {
                app.log.warn(`Could not delete old proof file: ${userProfile.businessProof}`);
              }
            }

            // Update data with new filename and reset approval status
            updateData.businessProof = filename;
            updateData.status = 'PENDING';
            updateData.isVerified = false;

          } else {
            return reply.status(400).send({
              success: false,
              error: 'Invalid base64 format'
            });
          }
        } catch (fileError) {
          app.log.error('File saving error:', fileError);
          return reply.status(500).send({
            success: false,
            error: 'Failed to save business proof document',
            details: process.env.NODE_ENV === 'development' ? fileError.message : undefined
          });
        }
      }

      const updatedProfile = await prisma.vendorProfile.update({
        where: { id: userProfile.id },
        data: updateData
      });

      return reply.send({
        success: true,
        message: updateData.businessProof
          ? 'Vendor profile updated successfully. Your business proof is pending approval.'
          : 'Vendor profile updated successfully',
        data: {
          vendorProfile: {
            ...updatedProfile,
            businessProofUrl: updatedProfile.businessProof
              ? `/uploads/proofs/${updatedProfile.businessProof}`
              : null
          }
        }
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({
          success: false,
          error: 'Validation failed',
          details: error.errors
        });
      }
      app.log.error('Update vendor profile error:', error);
      return reply.status(500).send({
        success: false,
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  });

  // Update user preferences
  app.put("/api/user/update-preferences", { preHandler: [authenticate] }, async (request, reply) => {
    try {
      const userId = request.user.userId;
      const data = preferenceUpdateSchema.parse(request.body);

      await prisma.user.update({
        where: { id: userId },
        data: { preferences: data }
      });

      return reply.send({
        success: true,
        message: 'Preferences updated successfully'
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({
          success: false,
          error: 'Validation failed',
          details: error.errors
        });
      }
      app.log.error('Update preferences error:', error);
      return reply.status(500).send({ success: false, error: 'Internal server error' });
    }
  });

  // ============================================
  // ADMIN ENDPOINTS - Vendor Approval Management
  // ============================================

  // Get all vendors pending approval
  app.get("/api/admin/vendors/pending", { preHandler: [authenticate] }, async (request, reply) => {
    try {
      const userId = request.user.userId;

      // Check if user is admin
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user || user.activeRole !== 'ADMIN') {
        return reply.status(403).send({
          success: false,
          error: 'Admin access required'
        });
      }

      const { page = 1, limit = 10 } = request.query;
      const skip = (page - 1) * limit;

      const [vendors, total] = await Promise.all([
        prisma.vendorProfile.findMany({
          where: {
            status: 'PENDING',
            businessProof: { not: null }
          },
          skip,
          take: parseInt(limit),
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                phoneNumber: true,
                createdAt: true
              }
            }
          },
          orderBy: { updatedAt: 'desc' }
        }),
        prisma.vendorProfile.count({
          where: {
            status: 'PENDING',
            businessProof: { not: null }
          }
        })
      ]);

      return reply.send({
        success: true,
        data: {
          vendors: vendors.map(v => ({
            ...v,
            businessProofUrl: v.businessProof ? `/uploads/proofs/${v.businessProof}` : null
          })),
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            totalPages: Math.ceil(total / limit)
          }
        }
      });

    } catch (error) {
      app.log.error('Get pending vendors error:', error);
      return reply.status(500).send({
        success: false,
        error: 'Internal server error'
      });
    }
  });

  // Get all vendors (approved, pending, rejected) - Admin only
  app.get("/api/admin/vendors/all", { preHandler: [authenticate] }, async (request, reply) => {
    try {
      const userId = request.user.userId;

      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user || user.activeRole !== 'ADMIN') {
        return reply.status(403).send({
          success: false,
          error: 'Admin access required'
        });
      }

      const { status, page = 1, limit = 10 } = request.query;
      const skip = (page - 1) * limit;

      let whereClause = {};
      if (status) {
        whereClause.status = status;
      }

      const [vendors, total, stats] = await Promise.all([
        prisma.vendorProfile.findMany({
          where: whereClause,
          skip,
          take: parseInt(limit),
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                phoneNumber: true,
                createdAt: true
              }
            }
          },
          orderBy: { updatedAt: 'desc' }
        }),
        prisma.vendorProfile.count({ where: whereClause }),
        prisma.vendorProfile.groupBy({
          by: ['status'],
          _count: true
        })
      ]);

      return reply.send({
        success: true,
        data: {
          vendors: vendors.map(v => ({
            ...v,
            businessProofUrl: v.businessProof ? `/uploads/proofs/${v.businessProof}` : null
          })),
          stats: stats.reduce((acc, curr) => {
            acc[curr.status] = curr._count;
            return acc;
          }, {}),
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            totalPages: Math.ceil(total / limit)
          }
        }
      });

    } catch (error) {
      app.log.error('Get all vendors error:', error);
      return reply.status(500).send({
        success: false,
        error: 'Internal server error'
      });
    }
  });

  // Get platform-wide stats - Admin only
  app.get("/api/admin/stats", { preHandler: [authenticate] }, async (request, reply) => {
    try {
      const userId = request.user.userId;

      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user || user.activeRole !== 'ADMIN') {
        return reply.status(403).send({
          success: false,
          error: 'Admin access required'
        });
      }

      const [
        totalUsers,
        totalVendors,
        totalBookings,
        totalRevenue,
        pendingVendors,
        heldPayouts
      ] = await Promise.all([
        prisma.user.count(),
        prisma.vendorProfile.count(),
        prisma.booking.count(),
        prisma.payment.aggregate({
          where: { status: 'PAID' },
          _sum: { amount: true }
        }),
        prisma.vendorProfile.count({ where: { status: 'PENDING' } }),
        prisma.payment.aggregate({
          where: { payoutStatus: 'HELD', status: 'PAID' },
          _sum: { vendorPayout: true }
        })
      ]);

      return reply.send({
        success: true,
        data: {
          totalUsers,
          totalVendors,
          totalBookings,
          totalRevenue: totalRevenue._sum.amount || 0,
          pendingVendors,
          heldPayouts: heldPayouts._sum.vendorPayout || 0,
          adminCommission: (totalRevenue._sum.amount || 0) * 0.3 // Assuming 30% admin fee based on earlier logic
        }
      });

    } catch (error) {
      app.log.error('Get platform stats error:', error);
      return reply.status(500).send({
        success: false,
        error: 'Internal server error'
      });
    }
  });

  // Get all users - Admin only
  app.get("/api/admin/users/all", { preHandler: [authenticate] }, async (request, reply) => {
    try {
      const userId = request.user.userId;

      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user || user.activeRole !== 'ADMIN') {
        return reply.status(403).send({
          success: false,
          error: 'Admin access required'
        });
      }

      const users = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phoneNumber: true,
          activeRole: true,
          emailVerified: true,
          isActive: true,
          createdAt: true,
          hasVendorProfile: true,
          hasClientProfile: true
        },
        orderBy: { createdAt: 'desc' }
      });

      return reply.send({
        success: true,
        data: { users }
      });

    } catch (error) {
      app.log.error('Get all users error:', error);
      return reply.status(500).send({
        success: false,
        error: 'Internal server error'
      });
    }
  });

  // Admin: Toggle user status (Activate/Deactivate)
  app.post("/api/admin/users/:targetUserId/toggle-status", { preHandler: [authenticate] }, async (request, reply) => {
    try {
      const userId = request.user.userId;
      const { targetUserId } = request.params;

      const admin = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!admin || admin.activeRole !== 'ADMIN') {
        return reply.status(403).send({ success: false, error: 'Admin access required' });
      }

      const targetUser = await prisma.user.findUnique({
        where: { id: targetUserId }
      });

      if (!targetUser) {
        return reply.status(404).send({ success: false, error: 'User not found' });
      }

      const updatedUser = await prisma.user.update({
        where: { id: targetUserId },
        data: { isActive: !targetUser.isActive }
      });

      return reply.send({
        success: true,
        message: `User account ${updatedUser.isActive ? 'activated' : 'deactivated'} successfully`,
        data: { isActive: updatedUser.isActive }
      });
    } catch (error) {
      app.log.error('Toggle status error:', error);
      return reply.status(500).send({ success: false, error: 'Internal server error' });
    }
  });

  // Admin: Switch user role
  app.post("/api/admin/users/:targetUserId/role", { preHandler: [authenticate] }, async (request, reply) => {
    try {
      const userId = request.user.userId;
      const { targetUserId } = request.params;
      const { role } = request.body;

      if (!['CLIENT', 'VENDOR', 'ADMIN'].includes(role)) {
        return reply.status(400).send({ success: false, error: 'Invalid role' });
      }

      const admin = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!admin || admin.activeRole !== 'ADMIN') {
        return reply.status(403).send({ success: false, error: 'Admin access required' });
      }

      const updatedUser = await prisma.user.update({
        where: { id: targetUserId },
        data: { activeRole: role }
      });

      return reply.send({
        success: true,
        message: `User role updated to ${role} successfully`,
        data: { activeRole: updatedUser.activeRole }
      });
    } catch (error) {
      app.log.error('Switch role error:', error);
      return reply.status(500).send({ success: false, error: 'Internal server error' });
    }
  });

  // Admin: Reset user password (Set to a temporary random password)
  app.post("/api/admin/users/:targetUserId/reset-password", { preHandler: [authenticate] }, async (request, reply) => {
    try {
      const userId = request.user.userId;
      const { targetUserId } = request.params;

      const admin = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!admin || admin.activeRole !== 'ADMIN') {
        return reply.status(403).send({ success: false, error: 'Admin access required' });
      }

      const tempPassword = Math.random().toString(36).slice(-8);
      const hashedPassword = await bcrypt.hash(tempPassword, 10);

      await prisma.user.update({
        where: { id: targetUserId },
        data: { password: hashedPassword }
      });

      // In a real app, you would send this via email. For now, we return it to the admin.
      return reply.send({
        success: true,
        message: 'Password reset successfully',
        data: { tempPassword }
      });
    } catch (error) {
      app.log.error('Reset password error:', error);
      return reply.status(500).send({ success: false, error: 'Internal server error' });
    }
  });

  // Get all held payments - Admin only
  app.get("/api/admin/payments/held", { preHandler: [authenticate] }, async (request, reply) => {
    try {
      const userId = request.user.userId;

      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user || user.activeRole !== 'ADMIN') {
        return reply.status(403).send({
          success: false,
          error: 'Admin access required'
        });
      }

      const payments = await prisma.payment.findMany({
        where: {
          payoutStatus: 'HELD',
          status: 'PAID'
        },
        include: {
          booking: {
            include: {
              vendorProfile: {
                select: {
                  businessName: true,
                  billingDetails: true
                }
              },
              vendor: {
                include: {
                  vendorProfile: {
                    select: {
                      businessName: true,
                      billingDetails: true
                    }
                  }
                }
              },
              client: {
                select: {
                  firstName: true,
                  lastName: true,
                  email: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      // Map payments to ensure vendorProfile is always present on the booking
      const mappedPayments = payments.map(p => {
        const booking = p.booking;
        if (!booking.vendorProfile && booking.vendor?.vendorProfile) {
          booking.vendorProfile = booking.vendor.vendorProfile;
        }
        return p;
      });

      return reply.send({
        success: true,
        data: { payments: mappedPayments }
      });

    } catch (error) {
      app.log.error('Get held payments error:', error);
      return reply.status(500).send({
        success: false,
        error: 'Internal server error'
      });
    }
  });

  // Release payment to vendor - Admin only
  app.post("/api/admin/payments/:paymentId/release", { preHandler: [authenticate] }, async (request, reply) => {
    try {
      const userId = request.user.userId;
      const { paymentId } = request.params;

      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user || user.activeRole !== 'ADMIN') {
        return reply.status(403).send({
          success: false,
          error: 'Admin access required'
        });
      }

      const payment = await prisma.payment.findUnique({
        where: { id: paymentId },
        include: { booking: true }
      });

      if (!payment) {
        return reply.status(404).send({
          success: false,
          error: 'Payment not found'
        });
      }

      if (payment.payoutStatus !== 'HELD') {
        return reply.status(400).send({
          success: false,
          error: 'Payment is not in HELD status'
        });
      }

      const updatedPayment = await prisma.payment.update({
        where: { id: paymentId },
        data: {
          payoutStatus: 'RELEASED_TO_VENDOR',
          payoutDate: new Date()
        }
      });

      // Create notification for vendor
      await prisma.notification.create({
        data: {
          userId: payment.booking.vendorId,
          type: 'PAYMENT_RELEASED',
          title: 'Initial Payment Released! 💸',
          message: `70% payment for your service for booking #${payment.booking.id.slice(-6).toUpperCase()} has been authorized and paid to your bank account. The remaining 30% will be paid once the service is completed and confirmed by you.`,
          data: { paymentId, bookingId: payment.bookingId }
        }
      });

      return reply.send({
        success: true,
        message: 'Payment released successfully',
        data: { payment: updatedPayment }
      });

    } catch (error) {
      app.log.error('Release payment error:', error);
      return reply.status(500).send({
        success: false,
        error: 'Internal server error'
      });
    }
  });

  // Approve vendor
  app.post("/api/admin/vendors/:vendorId/approve", { preHandler: [authenticate] }, async (request, reply) => {
    try {
      const userId = request.user.userId;
      const { vendorId } = request.params;
      const data = vendorApprovalSchema.parse(request.body);

      // Check if user is admin
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user || user.activeRole !== 'ADMIN') {
        return reply.status(403).send({
          success: false,
          error: 'Admin access required'
        });
      }

      const vendor = await prisma.vendorProfile.findUnique({
        where: { id: vendorId },
        include: { user: true }
      });

      if (!vendor) {
        return reply.status(404).send({
          success: false,
          error: 'Vendor not found'
        });
      }

      const updatedVendor = await prisma.vendorProfile.update({
        where: { id: vendorId },
        data: {
          status: 'APPROVED',
          isVerified: true,
          approvalNotes: data.notes,
          approvedAt: new Date(),
          approvedBy: userId
        }
      });

      // Create notification for vendor
      await prisma.notification.create({
        data: {
          userId: vendor.userId,
          type: 'VENDOR_APPROVED',
          title: 'Vendor Profile Approved! 🎉',
          message: 'Congratulations! Your vendor profile has been approved. You can now start offering your services.',
          data: { vendorId, notes: data.notes }
        }
      });

      return reply.send({
        success: true,
        message: 'Vendor approved successfully',
        data: { vendor: updatedVendor }
      });

    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({
          success: false,
          error: 'Validation failed',
          details: error.errors
        });
      }
      app.log.error('Approve vendor error:', error);
      return reply.status(500).send({
        success: false,
        error: 'Internal server error'
      });
    }
  });

  // Reject vendor
  app.post("/api/admin/vendors/:vendorId/reject", { preHandler: [authenticate] }, async (request, reply) => {
    try {
      const userId = request.user.userId;
      const { vendorId } = request.params;
      const data = vendorRejectionSchema.parse(request.body);

      // Check if user is admin
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user || user.activeRole !== 'ADMIN') {
        return reply.status(403).send({
          success: false,
          error: 'Admin access required'
        });
      }

      const vendor = await prisma.vendorProfile.findUnique({
        where: { id: vendorId },
        include: { user: true }
      });

      if (!vendor) {
        return reply.status(404).send({
          success: false,
          error: 'Vendor not found'
        });
      }

      const updatedVendor = await prisma.vendorProfile.update({
        where: { id: vendorId },
        data: {
          status: 'REJECTED',
          isVerified: false,
          rejectionReason: data.reason,
          rejectedAt: new Date(),
          rejectedBy: userId
        }
      });

      // Create notification for vendor
      await prisma.notification.create({
        data: {
          userId: vendor.userId,
          type: 'VENDOR_REJECTED',
          title: 'Vendor Profile Requires Updates',
          message: `Your vendor profile submission needs attention. Reason: ${data.reason}`,
          data: { vendorId, reason: data.reason }
        }
      });

      return reply.send({
        success: true,
        message: 'Vendor rejected. Notification sent to vendor.',
        data: { vendor: updatedVendor }
      });

    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({
          success: false,
          error: 'Validation failed',
          details: error.errors
        });
      }
      app.log.error('Reject vendor error:', error);
      return reply.status(500).send({
        success: false,
        error: 'Internal server error'
      });
    }
  });

  // Get business proof document (Vendor or Admin only)
  app.get("/api/vendor/business-proof/:filename", { preHandler: [authenticate] }, async (request, reply) => {
    try {
      const { filename } = request.params;
      const userId = request.user.userId;

      // Sanitize filename to prevent directory traversal
      const sanitizedFilename = path.basename(filename);
      const filepath = path.join(__dirname, 'proof-of-document', sanitizedFilename);

      // Check file exists
      try {
        await fs.access(filepath);
      } catch {
        return reply.status(404).send({
          success: false,
          error: 'Document not found'
        });
      }

      // Check authorization - either the vendor themselves or an admin
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { vendorProfile: true }
      });

      const isOwner = user.vendorProfile?.businessProof === sanitizedFilename;
      const isAdmin = user.activeRole === 'ADMIN';

      if (!isOwner && !isAdmin) {
        return reply.status(403).send({
          success: false,
          error: 'Not authorized to view this document'
        });
      }

      // Determine content type
      const ext = path.extname(sanitizedFilename).toLowerCase();
      const contentTypes = {
        '.pdf': 'application/pdf',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.webp': 'image/webp'
      };
      const contentType = contentTypes[ext] || 'application/octet-stream';

      // Send file
      const fileBuffer = await fs.readFile(filepath);
      return reply
        .header('Content-Type', contentType)
        .header('Content-Disposition', `inline; filename="${sanitizedFilename}"`)
        .send(fileBuffer);

    } catch (error) {
      app.log.error('Get business proof error:', error);
      return reply.status(500).send({
        success: false,
        error: 'Internal server error'
      });
    }
  });

  // Logout
  app.post("/api/auth/logout", { preHandler: [authenticate] }, async (request, reply) => {
    try {
      const { refreshToken } = request.body;

      if (refreshToken) {
        await prisma.refreshToken.deleteMany({
          where: { token: refreshToken }
        });
      }

      const authHeader = request.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        await prisma.session.deleteMany({
          where: { token }
        });
      }

      return reply.send({
        success: true,
        message: 'Logged out successfully'
      });

    } catch (error) {
      app.log.error('Logout error:', error);
      return reply.status(500).send({
        success: false,
        error: 'Internal server error'
      });
    }
  });

  // Refresh token
  app.post("/api/auth/refresh-token", async (request, reply) => {
    try {
      const { refreshToken } = request.body;

      if (!refreshToken) {
        return reply.status(400).send({
          success: false,
          error: 'Refresh token required'
        });
      }

      // Verify the refresh token JWT
      let decodedRefresh;
      try {
        decodedRefresh = jwt.verify(refreshToken, process.env.JWT_SECRET);
      } catch (jwtError) {
        return reply.status(401).send({
          success: false,
          error: 'Invalid or expired refresh token'
        });
      }

      // Check if refresh token exists in database
      const tokenData = await prisma.refreshToken.findUnique({
        where: { token: refreshToken },
        include: { user: true }
      });

      if (!tokenData || tokenData.expiresAt < new Date()) {
        return reply.status(401).send({
          success: false,
          error: 'Invalid or expired refresh token'
        });
      }

      // Generate new tokens
      const { accessToken: newAccessToken, refreshToken: newRefreshToken } = generateTokens(tokenData.user);

      // Update refresh token in database
      await prisma.refreshToken.update({
        where: { id: tokenData.id },
        data: {
          token: newRefreshToken,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        }
      });

      // Update or create session
      await prisma.session.upsert({
        where: {
          userId_token: {
            userId: tokenData.userId,
            token: newAccessToken
          }
        },
        update: {
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
          ipAddress: request.ip,
          userAgent: request.headers['user-agent']
        },
        create: {
          userId: tokenData.userId,
          token: newAccessToken,
          ipAddress: request.ip,
          userAgent: request.headers['user-agent'],
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
        }
      });

      return reply.send({
        success: true,
        data: {
          accessToken: newAccessToken,
          refreshToken: newRefreshToken
        }
      });

    } catch (error) {
      app.log.error('Refresh token error:', error);
      return reply.status(500).send({
        success: false,
        error: 'Internal server error'
      });
    }
  });

  // Validate token endpoint
  app.get("/api/auth/validate-token", { preHandler: [authenticate] }, async (request, reply) => {
    try {
      return reply.send({
        success: true,
        message: 'Token is valid',
        data: {
          user: request.user,
          expiresAt: request.session.expiresAt
        }
      });
    } catch (error) {
      return reply.status(401).send({
        success: false,
        error: 'Invalid token'
      });
    }
  });

  // Check email availability
  app.get("/api/auth/check-email/:email", async (request, reply) => {
    try {
      const { email } = request.params;

      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      return reply.send({
        available: !existingUser
      });

    } catch (error) {
      app.log.error('Check email error:', error);
      return reply.status(500).send({
        success: false,
        error: 'Internal server error'
      });
    }
  });

  // Check business email availability
  app.get("/api/auth/check-business-email/:email", async (request, reply) => {
    try {
      const { email } = request.params;

      const existingVendor = await prisma.vendorProfile.findUnique({
        where: { businessEmail: email }
      });

      return reply.send({
        available: !existingVendor
      });

    } catch (error) {
      app.log.error('Check business email error:', error);
      return reply.status(500).send({
        success: false,
        error: 'Internal server error'
      });
    }
  });

  // Create a booking
  app.post("/api/bookings", { preHandler: [authenticate] }, async (request, reply) => {
    try {
      const userId = request.user.userId;

      console.log('Received booking data:', request.body);

      const data = bookingSchema.parse(request.body);

      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { clientProfile: true }
      });

      if (!user || !user.clientProfile) {
        return reply.status(403).send({
          success: false,
          error: 'Only clients can create bookings'
        });
      }

      // FIX: vendorId could be either user.id or vendorProfile.id
      // Try to find vendor by profile ID first, then by user ID
      let vendorProfile = await prisma.vendorProfile.findUnique({
        where: { id: data.vendorId },
        include: { user: true }
      });

      // If not found, try finding by userId
      if (!vendorProfile) {
        vendorProfile = await prisma.vendorProfile.findUnique({
          where: { userId: data.vendorId },
          include: { user: true }
        });
      }

      if (!vendorProfile) {
        return reply.status(404).send({
          success: false,
          error: 'Vendor not found'
        });
      }

      // Use the actual user.id for the booking
      const actualVendorUserId = vendorProfile.userId;

      // Handle empty serviceId to avoid Foreign Key constraint violation
      const serviceId = data.serviceId === '' ? undefined : data.serviceId;

      const booking = await prisma.booking.create({
        data: {
          clientId: userId,
          vendorId: actualVendorUserId, // Use user.id, not vendorProfile.id
          serviceId: serviceId,
          serviceType: data.serviceType,
          eventDate: new Date(data.eventDate),
          eventLocation: data.eventLocation,
          guests: data.guests,
          budget: data.budget,
          message: data.message,
          customRequirements: data.customRequirements || [],
          status: 'PENDING',
          bookingDate: new Date(data.bookingDate || Date.now())
        },
        include: {
          client: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phoneNumber: true
            }
          },
          vendor: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phoneNumber: true,
              vendorProfile: true
            }
          }
        }
      });

      await prisma.notification.create({
        data: {
          userId: actualVendorUserId, // Use user.id here too
          type: 'NEW_BOOKING',
          title: 'New Booking Request',
          message: `${user.firstName} ${user.lastName} has requested a booking for ${data.serviceType}`,
          data: { bookingId: booking.id }
        }
      });

      return reply.send({
        success: true,
        message: 'Booking request sent successfully',
        data: { booking }
      });

    } catch (error) {
      if (error instanceof z.ZodError) {
        console.log('Zod Validation Error:', {
          name: error.name,
          errors: error.errors,
          issues: error.issues,
          format: error.format()
        });

        return reply.status(400).send({
          success: false,
          error: 'Validation failed',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
            code: err.code
          }))
        });
      }

      // Enhanced error logging
      app.log.error('Create booking error details:', {
        message: error.message,
        code: error.code,
        meta: error.meta,
        stack: error.stack
      });

      return reply.status(500).send({
        success: false,
        error: 'Internal server error',
        message: error.message
      });
    }
  });

  // Get user bookings
  app.get("/api/bookings", { preHandler: [authenticate] }, async (request, reply) => {
    try {
      const userId = request.user.userId;
      const { status, page = 1, limit = 10 } = request.query;

      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      let whereClause = {};
      if (user.activeRole === 'CLIENT') {
        whereClause.clientId = userId;
      } else if (user.activeRole === 'VENDOR') {
        whereClause.vendorId = userId;
      }

      if (status) {
        whereClause.status = status;
      }

      const skip = (page - 1) * limit;

      const [bookings, total] = await Promise.all([
        prisma.booking.findMany({
          where: whereClause,
          skip,
          take: parseInt(limit),
          include: {
            client: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phoneNumber: true
              }
            },
            vendor: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phoneNumber: true,
                vendorProfile: true
              }
            },
            payments: {
              orderBy: { createdAt: 'desc' },
              take: 1
            }
          },
          orderBy: { bookingDate: 'desc' }
        }),
        prisma.booking.count({ where: whereClause })
      ]);

      const stats = {
        total: total,
        pending: await prisma.booking.count({ where: { ...whereClause, status: 'PENDING' } }),
        confirmed: await prisma.booking.count({ where: { ...whereClause, status: 'CONFIRMED' } }),
        cancelled: await prisma.booking.count({ where: { ...whereClause, status: 'CANCELLED' } }),
        completed: await prisma.booking.count({ where: { ...whereClause, status: 'COMPLETED' } })
      };

      return reply.send({
        success: true,
        data: {
          bookings,
          stats,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            totalPages: Math.ceil(total / limit)
          }
        }
      });

    } catch (error) {
      app.log.error('Get bookings error:', error);
      return reply.status(500).send({
        success: false,
        error: 'Internal server error'
      });
    }
  });

  // Message schemas
  const sendMessageSchema = z.object({
    receiverId: z.string(), // This is the userId of the recipient
    content: z.string().min(1, "Message cannot be empty"),
    bookingId: z.string().optional()
  });

  // Send a message
  app.post("/api/messages", { preHandler: [authenticate] }, async (request, reply) => {
    try {
      const { userId } = request.user;
      const data = sendMessageSchema.parse(request.body);

      if (userId === data.receiverId) {
        return reply.status(400).send({
          success: false,
          error: "You cannot send a message to yourself"
        });
      }

      // Check if receiver exists
      const receiver = await prisma.user.findUnique({
        where: { id: data.receiverId }
      });

      if (!receiver) {
        return reply.status(404).send({
          success: false,
          error: "Recipient not found"
        });
      }

      // Find or create conversation
      // We need to check both combinations of participants
      let conversation = await prisma.conversation.findFirst({
        where: {
          OR: [
            { participant1Id: userId, participant2Id: data.receiverId },
            { participant1Id: data.receiverId, participant2Id: userId }
          ]
        }
      });

      if (!conversation) {
        conversation = await prisma.conversation.create({
          data: {
            participant1Id: userId,
            participant2Id: data.receiverId,
            bookingId: data.bookingId
          }
        });
      }

      // Create message
      const message = await prisma.message.create({
        data: {
          senderId: userId,
          receiverId: data.receiverId,
          conversationId: conversation.id,
          content: data.content,
          bookingId: data.bookingId
        }
      });

      // Update conversation with last message
      await prisma.conversation.update({
        where: { id: conversation.id },
        data: {
          lastMessageId: message.id,
          lastActivityAt: new Date(),
          unreadCount: { increment: 1 }
        }
      });

      // Create notification for receiver
      const sender = await prisma.user.findUnique({
        where: { id: userId },
        select: { firstName: true, lastName: true }
      });

      await prisma.notification.create({
        data: {
          userId: data.receiverId,
          type: 'NEW_MESSAGE',
          title: 'New Message',
          message: `You have a new message from ${sender.firstName} ${sender.lastName}`,
          data: {
            conversationId: conversation.id,
            messageId: message.id,
            senderId: userId
          }
        }
      });

      return reply.send({
        success: true,
        message: "Message sent successfully",
        data: { message }
      });

    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({
          success: false,
          error: 'Validation failed',
          details: error.errors
        });
      }
      app.log.error('Send message error:', error);
      return reply.status(500).send({
        success: false,
        error: 'Internal server error'
      });
    }
  });

  // Get conversations for current user
  app.get("/api/conversations", { preHandler: [authenticate] }, async (request, reply) => {
    try {
      const { userId } = request.user;

      const conversations = await prisma.conversation.findMany({
        where: {
          OR: [
            { participant1Id: userId },
            { participant2Id: userId }
          ]
        },
        include: {
          participant1: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatarUrl: true
            }
          },
          participant2: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatarUrl: true
            }
          },
          lastMessage: true
        },
        orderBy: {
          lastActivityAt: 'desc'
        }
      });

      // Format conversations to identify the "other" participant
      const formattedConversations = conversations.map(conv => {
        const otherParticipant = conv.participant1Id === userId ? conv.participant2 : conv.participant1;
        return {
          ...conv,
          otherParticipant
        };
      });

      return reply.send({
        success: true,
        data: { conversations: formattedConversations }
      });

    } catch (error) {
      app.log.error('Get conversations error:', error);
      return reply.status(500).send({
        success: false,
        error: 'Internal server error'
      });
    }
  });

  // Get messages for a conversation
  app.get("/api/conversations/:id/messages", { preHandler: [authenticate] }, async (request, reply) => {
    try {
      const { userId } = request.user;
      const { id } = request.params;

      const conversation = await prisma.conversation.findUnique({
        where: { id },
        include: {
          participant1: {
            select: { id: true, firstName: true, lastName: true }
          },
          participant2: {
            select: { id: true, firstName: true, lastName: true }
          }
        }
      });

      if (!conversation) {
        return reply.status(404).send({
          success: false,
          error: "Conversation not found"
        });
      }

      // Check authorization
      if (conversation.participant1Id !== userId && conversation.participant2Id !== userId) {
        return reply.status(403).send({
          success: false,
          error: "Not authorized to view this conversation"
        });
      }

      const messages = await prisma.message.findMany({
        where: { conversationId: id },
        orderBy: { createdAt: 'asc' },
        include: {
          sender: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatarUrl: true
            }
          }
        }
      });

      // Mark conversation as read if viewing
      // Logic could be refined to only mark if last message was from other user
      if (conversation.lastMessageId) {
        // Reset unread count if needed, or implement read receipts
        // For now, simpler approach:
        /* 
        await prisma.conversation.update({
           where: { id },
           data: { unreadCount: 0 }
        });
        */
      }

      return reply.send({
        success: true,
        data: {
          conversation,
          messages
        }
      });

    } catch (error) {
      app.log.error('Get messages error:', error);
      return reply.status(500).send({
        success: false,
        error: 'Internal server error'
      });
    }
  });

  // Get single booking
  app.get("/api/bookings/:id", { preHandler: [authenticate] }, async (request, reply) => {
    try {
      const userId = request.user.userId;
      const { id } = request.params;

      const booking = await prisma.booking.findUnique({
        where: { id },
        include: {
          client: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phoneNumber: true,
              clientProfile: true
            }
          },
          vendor: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phoneNumber: true,
              vendorProfile: true
            }
          },
          payments: {
            orderBy: { createdAt: 'desc' }
          },
          review: true
        }
      });

      if (!booking) {
        return reply.status(404).send({
          success: false,
          error: 'Booking not found'
        });
      }

      // Check authorization - allow if user is either client or vendor
      // Need to handle cases where vendorId refers to VendorProfile or User
      const isClient = booking.clientId === userId;
      const isVendor = booking.vendorId === userId;

      if (!isClient && !isVendor) {
        // Double check if userId belongs to the vendor profile
        const vendorProfile = await prisma.vendorProfile.findUnique({
          where: { userId },
          select: { id: true }
        });

        if (!vendorProfile || booking.vendorProfileId !== vendorProfile.id) {
          return reply.status(403).send({
            success: false,
            error: 'Not authorized to view this booking'
          });
        }
      }

      return reply.send({
        success: true,
        data: { booking }
      });

    } catch (error) {
      app.log.error('Get booking error details:', {
        message: error.message,
        code: error.code,
        meta: error.meta,
        stack: error.stack
      });

      return reply.status(500).send({
        success: false,
        error: 'Internal server error',
        message: error.message
      });
    }
  });

  // Get dashboard stats
  app.get("/api/dashboard/stats", { preHandler: [authenticate] }, async (request, reply) => {
    try {
      const userId = request.user.userId;

      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        return reply.status(404).send({ success: false, error: 'User not found' });
      }

      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      let stats = {
        totalRevenue: 0,
        thisMonthRevenue: 0,
        totalBookings: 0,
        pendingBookings: 0,
        completedBookings: 0,
        upcomingBookings: 0,
        averageRating: 0,
        activeClients: 0, // For vendors
        activeVendors: 0, // For clients
        totalSpent: 0, // For clients
        amountToPay: 0 // For clients
      };

      if (user.activeRole === 'VENDOR') {
        // Fetch vendor's bookings
        const bookings = await prisma.booking.findMany({
          where: { vendorId: userId },
          include: {
            payments: true,
            review: true,
            client: {
              select: {
                firstName: true,
                lastName: true
              }
            },
            servicePackage: {
              select: {
                title: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        });

        stats.totalBookings = bookings.length;
        stats.pendingBookings = bookings.filter(b => b.status === 'PENDING').length;
        stats.completedBookings = bookings.filter(b => b.status === 'COMPLETED').length;
        stats.upcomingBookings = bookings.filter(b =>
          (b.status === 'CONFIRMED' || b.status === 'PENDING') &&
          new Date(b.eventDate) >= now
        ).length;

        // Calculate revenue
        bookings.forEach(b => {
          b.payments.forEach(p => {
            if (p.status === 'PAID') {
              stats.totalRevenue += p.amount;
              if (new Date(p.createdAt) >= firstDayOfMonth) {
                stats.thisMonthRevenue += p.amount;
              }
            }
          });
        });

        // Calculate average rating from reviews
        const reviews = bookings.filter(b => b.review).map(b => b.review);
        if (reviews.length > 0) {
          const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
          stats.averageRating = parseFloat((totalRating / reviews.length).toFixed(1));
        }

        // Calculate active clients (unique clients who have booked)
        const uniqueClients = new Set(bookings.map(b => b.clientId));
        stats.activeClients = uniqueClients.size;

        // Get recent bookings (last 5)
        stats.recentBookings = bookings.slice(0, 5).map(b => ({
          id: b.id,
          client: `${b.client.firstName} ${b.client.lastName}`,
          service: b.servicePackage?.title || b.serviceType || 'Custom Service',
          date: b.bookingDate,
          status: b.status,
          amount: b.payments.reduce((sum, p) => p.status === 'PAID' ? sum + p.amount : sum, 0)
        }));
      } else {
        // Client specific stats
        const bookings = await prisma.booking.findMany({
          where: { clientId: userId },
          include: { payments: true, review: true }
        });

        stats.totalBookings = bookings.length;
        stats.pendingBookings = bookings.filter(b => b.status === 'PENDING').length;
        stats.completedBookings = bookings.filter(b => b.status === 'COMPLETED').length;
        stats.upcomingBookings = bookings.filter(b =>
          (b.status === 'CONFIRMED' || b.status === 'PENDING') &&
          new Date(b.eventDate) >= now
        ).length;

        // Calculate total spent and amount to pay
        bookings.forEach(b => {
          const totalPaid = b.payments.reduce((pSum, p) => p.status === 'PAID' ? pSum + p.amount : pSum, 0);
          stats.totalSpent += totalPaid;

          if (b.status !== 'CANCELLED' && b.status !== 'REJECTED') {
            const price = b.adjustedPrice || b.quotedPrice || b.budget;
            const remaining = price - totalPaid;
            if (remaining > 0) {
              stats.amountToPay += remaining;
            }
          }
        });

        // Active vendors
        const uniqueVendors = new Set(bookings.map(b => b.vendorId));
        stats.activeVendors = uniqueVendors.size;
      }

      return reply.send({
        success: true,
        data: stats
      });

    } catch (error) {
      app.log.error('Get dashboard stats error:', error);
      return reply.status(500).send({
        success: false,
        error: 'Internal server error'
      });
    }
  });

  // Get AI Dashboard Insights
  app.get("/api/dashboard/ai-insights", { preHandler: [authenticate] }, async (request, reply) => {
    try {
      const userId = request.user.userId;
      const user = await prisma.user.findUnique({ where: { id: userId } });

      if (!user) return reply.status(404).send({ success: false, error: 'User not found' });

      // Fetch basic performance data to feed AI
      const bookings = await prisma.booking.findMany({
        where: user.activeRole === 'VENDOR' ? { vendorId: userId } : { clientId: userId },
        include: { review: true }
      });

      const totalBookings = bookings.length;
      const completedBookings = bookings.filter(b => ['COMPLETED', 'CONFIRMED'].includes(b.status)).length;
      const reviews = bookings.map(b => b.review).filter(Boolean);
      const avgRating = reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;

      // Construct Prompt
      const prompt = `You are an expert event business consultant for EventASAP. 
      Analyze this ${user.activeRole} dashboard data and provide 2 distinct, highly actionable AI-powered business insights.
      
      User Data:
      - Role: ${user.activeRole}
      - Total Bookings: ${totalBookings}
      - Completed/Confirmed: ${completedBookings}
      - Avg Rating: ${avgRating.toFixed(1)}/5
      - Member Since: ${user.createdAt}

      Return ONLY a JSON array of 2 objects with this exact structure:
      [
        {
          "title": "Short catchy title",
          "description": "Insightful 1-sentence explanation",
          "type": "Optimization" (or "Boost" or "Alert"),
          "action": "Call to action label"
        }
      ]`;

      const geminiApiKey = process.env.GEMINI_API_KEY;
      if (!geminiApiKey) {
        // Fallback for demo if API key is missing
        return reply.send({
          success: true,
          data: [
            {
              title: "Review Optimization",
              description: "You have several pending reviews. Following up with clients can boost your profile visibility.",
              type: "Optimization",
              action: "Send Reminders"
            },
            {
              title: "Peak Season Prep",
              description: "Booking requests are increasing for December. Consider updating your availability.",
              type: "Boost",
              action: "Update Calendar"
            }
          ]
        });
      }

      // Call Gemini API
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            response_mime_type: "application/json"
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const result = await response.json();
      const aiResponse = result.candidates?.[0]?.content?.parts?.[0]?.text;

      let insights = [];
      try {
        insights = aiResponse ? JSON.parse(aiResponse) : [];
      } catch (e) {
        app.log.error('Failed to parse Gemini response:', aiResponse);
        insights = [];
      }

      return reply.send({
        success: true,
        data: insights
      });

    } catch (error) {
      app.log.error('AI Insights Error:', error);
      return reply.send({
        success: true,
        data: [
          {
            title: "Performance Insight",
            description: "Based on your recent activity, maintaining a fast response rate will help convert more leads.",
            type: "Optimization",
            action: "Review Response Time"
          },
          {
            title: "Profile Visibility",
            description: "Updating your portfolio with recent high-quality photos can attract more high-budget clients.",
            type: "Boost",
            action: "Upload Photos"
          }
        ]
      });
    }
  });

  // Update booking
  app.put("/api/bookings/:id", { preHandler: [authenticate] }, async (request, reply) => {
    try {
      const userId = request.user.userId;
      const { id } = request.params;
      const data = updateBookingSchema.parse(request.body);

      const booking = await prisma.booking.findUnique({
        where: { id }
      });

      if (!booking) {
        return reply.status(404).send({
          success: false,
          error: 'Booking not found'
        });
      }

      if (booking.vendorId !== userId) {
        return reply.status(403).send({
          success: false,
          error: 'Only vendor can update booking'
        });
      }

      const updatedBooking = await prisma.booking.update({
        where: { id },
        data: {
          status: data.status || booking.status,
          notes: data.notes || booking.notes,
          quotedPrice: data.quotedPrice || booking.quotedPrice,
          paymentStatus: data.paymentStatus || booking.paymentStatus,
          updatedAt: new Date()
        }
      });

      if (data.status && data.status !== booking.status) {
        await prisma.notification.create({
          data: {
            userId: booking.clientId,
            type: 'BOOKING_STATUS_UPDATE',
            title: 'Booking Status Updated',
            message: `Your booking status has been updated to ${data.status}`,
            data: { bookingId: booking.id, status: data.status }
          }
        });
      }

      return reply.send({
        success: true,
        message: 'Booking updated successfully',
        data: { booking: updatedBooking }
      });

    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({
          success: false,
          error: 'Validation failed',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        });
      }
      app.log.error('Update booking error:', error);
      return reply.status(500).send({
        success: false,
        error: 'Internal server error'
      });
    }
  });

  // Helper function to create notifications
  async function createBookingNotification({ userId, type, title, message, actionUrl, data }) {
    try {
      await prisma.notification.create({
        data: {
          userId,
          type,
          title,
          message,
          actionUrl,
          data
        }
      });
    } catch (error) {
      app.log.error('Create notification error:', error);
    }
  }

  // Vendor adjusts booking price
  app.put("/api/bookings/:id/adjust-price", { preHandler: [authenticate] }, async (request, reply) => {
    try {
      const userId = request.user.userId;
      const { id } = request.params;
      const { adjustedPrice, priceAdjustmentReason } = request.body;

      if (!adjustedPrice || adjustedPrice <= 0) {
        return reply.status(400).send({
          success: false,
          error: 'Valid adjusted price is required'
        });
      }

      const booking = await prisma.booking.findUnique({
        where: { id }
      });

      if (!booking) {
        return reply.status(404).send({
          success: false,
          error: 'Booking not found'
        });
      }

      if (booking.vendorId !== userId) {
        return reply.status(403).send({
          success: false,
          error: 'Only the vendor can adjust the price'
        });
      }

      const updatedBooking = await prisma.booking.update({
        where: { id },
        data: {
          adjustedPrice,
          priceAdjustmentReason: priceAdjustmentReason || null,
          clientApprovalStatus: 'PENDING_APPROVAL',
          updatedAt: new Date()
        }
      });

      // Notify client about price adjustment
      await createBookingNotification({
        userId: booking.clientId,
        type: 'PRICE_ADJUSTED',
        title: 'Price Adjustment for Your Booking',
        message: `The vendor has adjusted the price to £${adjustedPrice.toFixed(2)}.${priceAdjustmentReason ? 'Reason: ' + priceAdjustmentReason : ''}`,
        actionUrl: `/ dashboard / bookings / ${id}`,
        data: { bookingId: id, adjustedPrice, priceAdjustmentReason }
      });

      return reply.send({
        success: true,
        message: 'Price adjusted successfully',
        data: updatedBooking
      });

    } catch (error) {
      app.log.error('Adjust price error:', error);
      return reply.status(500).send({
        success: false,
        error: 'Internal server error'
      });
    }
  });

  // Client approves adjusted price
  app.put("/api/bookings/:id/approve-price", { preHandler: [authenticate] }, async (request, reply) => {
    try {
      const userId = request.user.userId;
      const { id } = request.params;

      const booking = await prisma.booking.findUnique({
        where: { id }
      });

      if (!booking) {
        return reply.status(404).send({
          success: false,
          error: 'Booking not found'
        });
      }

      if (booking.clientId !== userId) {
        return reply.status(403).send({
          success: false,
          error: 'Only the client can approve the price'
        });
      }

      if (!booking.adjustedPrice) {
        return reply.status(400).send({
          success: false,
          error: 'No price adjustment to approve'
        });
      }

      const updatedBooking = await prisma.booking.update({
        where: { id },
        data: {
          clientApprovalStatus: 'APPROVED',
          quotedPrice: booking.adjustedPrice,
          updatedAt: new Date()
        }
      });

      // Notify vendor about approval
      await createBookingNotification({
        userId: booking.vendorId,
        type: 'PRICE_APPROVED',
        title: 'Client Approved Price Adjustment',
        message: `The client has approved your adjusted price of £${booking.adjustedPrice.toFixed(2)}`,
        actionUrl: `/ dashboard / bookings / ${id}`,
        data: { bookingId: id, adjustedPrice: booking.adjustedPrice }
      });

      return reply.send({
        success: true,
        message: 'Price approved successfully',
        data: updatedBooking
      });

    } catch (error) {
      app.log.error('Approve price error:', error);
      return reply.status(500).send({
        success: false,
        error: 'Internal server error'
      });
    }
  });

  // Client rejects adjusted price
  app.put("/api/bookings/:id/reject-price", { preHandler: [authenticate] }, async (request, reply) => {
    try {
      const userId = request.user.userId;
      const { id } = request.params;
      const { rejectionReason } = request.body;

      const booking = await prisma.booking.findUnique({
        where: { id }
      });

      if (!booking) {
        return reply.status(404).send({
          success: false,
          error: 'Booking not found'
        });
      }

      if (booking.clientId !== userId) {
        return reply.status(403).send({
          success: false,
          error: 'Only the client can reject the price'
        });
      }

      if (!booking.adjustedPrice) {
        return reply.status(400).send({
          success: false,
          error: 'No price adjustment to reject'
        });
      }

      const updatedBooking = await prisma.booking.update({
        where: { id },
        data: {
          clientApprovalStatus: 'REJECTED',
          updatedAt: new Date()
        }
      });

      // Notify vendor about rejection
      await createBookingNotification({
        userId: booking.vendorId,
        type: 'PRICE_REJECTED',
        title: 'Client Rejected Price Adjustment',
        message: `The client has rejected your adjusted price of £${booking.adjustedPrice.toFixed(2)}.${rejectionReason ? 'Reason: ' + rejectionReason : ''}`,
        actionUrl: `/ dashboard / bookings / ${id}`,
        data: { bookingId: id, adjustedPrice: booking.adjustedPrice, rejectionReason }
      });

      return reply.send({
        success: true,
        message: 'Price rejected',
        data: updatedBooking
      });

    } catch (error) {
      app.log.error('Reject price error:', error);
      return reply.status(500).send({
        success: false,
        error: 'Internal server error'
      });
    }
  });

  // Vendor accepts booking
  app.put("/api/bookings/:id/accept", { preHandler: [authenticate] }, async (request, reply) => {
    try {
      const userId = request.user.userId;
      const { id } = request.params;

      const booking = await prisma.booking.findUnique({
        where: { id }
      });

      if (!booking) {
        return reply.status(404).send({
          success: false,
          error: 'Booking not found'
        });
      }

      if (booking.vendorId !== userId) {
        return reply.status(403).send({
          success: false,
          error: 'Only the vendor can accept the booking'
        });
      }

      const updatedBooking = await prisma.booking.update({
        where: { id },
        data: {
          status: 'CONFIRMED',
          updatedAt: new Date()
        }
      });

      // Notify client with payment link
      await createBookingNotification({
        userId: booking.clientId,
        type: 'BOOKING_ACCEPTED',
        title: 'Booking Accepted',
        message: `Your booking has been confirmed. Please proceed with payment to secure your booking.`,
        actionUrl: `/dashboard/payments/${id}`,
        data: { bookingId: id, amount: booking.quotedPrice || booking.budget }
      });

      return reply.send({
        success: true,
        message: 'Booking accepted successfully',
        data: updatedBooking
      });

    } catch (error) {
      app.log.error('Accept booking error:', error);
      return reply.status(500).send({
        success: false,
        error: 'Internal server error'
      });
    }
  });

  // Vendor declines booking
  app.put("/api/bookings/:id/decline", { preHandler: [authenticate] }, async (request, reply) => {
    try {
      const userId = request.user.userId;
      const { id } = request.params;
      const { declineReason } = request.body;

      const booking = await prisma.booking.findUnique({
        where: { id }
      });

      if (!booking) {
        return reply.status(404).send({
          success: false,
          error: 'Booking not found'
        });
      }

      if (booking.vendorId !== userId) {
        return reply.status(403).send({
          success: false,
          error: 'Only the vendor can decline the booking'
        });
      }

      const updatedBooking = await prisma.booking.update({
        where: { id },
        data: {
          status: 'CANCELLED',
          notes: declineReason || 'Declined by vendor',
          updatedAt: new Date()
        }
      });

      // Notify client about decline
      await createBookingNotification({
        userId: booking.clientId,
        type: 'BOOKING_DECLINED',
        title: 'Booking Declined',
        message: `Unfortunately, the vendor has declined your booking.${declineReason ? 'Reason: ' + declineReason : ''} `,
        actionUrl: `/ dashboard / bookings`,
        data: { bookingId: id, declineReason }
      });

      return reply.send({
        success: true,
        message: 'Booking declined',
        data: updatedBooking
      });

    } catch (error) {
      app.log.error('Decline booking error:', error);
      return reply.status(500).send({
        success: false,
        error: 'Internal server error'
      });
    }
  });

  // Get user notifications
  app.get("/api/notifications", { preHandler: [authenticate] }, async (request, reply) => {
    try {
      const userId = request.user.userId;
      const { page = 1, limit = 20, unreadOnly = false } = request.query;

      const skip = (parseInt(page) - 1) * parseInt(limit);
      const take = parseInt(limit);

      const where = {
        userId,
        ...(unreadOnly === 'true' && { isRead: false })
      };

      const [notifications, total] = await Promise.all([
        prisma.notification.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip,
          take
        }),
        prisma.notification.count({ where })
      ]);

      const unreadCount = await prisma.notification.count({
        where: { userId, isRead: false }
      });

      return reply.send({
        success: true,
        data: {
          notifications,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            totalPages: Math.ceil(total / parseInt(limit))
          },
          unreadCount
        }
      });

    } catch (error) {
      app.log.error('Get notifications error:', error);
      return reply.status(500).send({
        success: false,
        error: 'Internal server error'
      });
    }
  });

  // Mark notification as read
  app.put("/api/notifications/:id/read", { preHandler: [authenticate] }, async (request, reply) => {
    try {
      const userId = request.user.userId;
      const { id } = request.params;

      const notification = await prisma.notification.findUnique({
        where: { id }
      });

      if (!notification) {
        return reply.status(404).send({
          success: false,
          error: 'Notification not found'
        });
      }

      if (notification.userId !== userId) {
        return reply.status(403).send({
          success: false,
          error: 'Unauthorized'
        });
      }

      const updatedNotification = await prisma.notification.update({
        where: { id },
        data: {
          isRead: true,
          readAt: new Date()
        }
      });

      return reply.send({
        success: true,
        data: updatedNotification
      });

    } catch (error) {
      app.log.error('Mark notification as read error:', error);
      return reply.status(500).send({
        success: false,
        error: 'Internal server error'
      });
    }
  });

  // Mark all notifications as read
  app.put("/api/notifications/mark-all-read", { preHandler: [authenticate] }, async (request, reply) => {
    try {
      const userId = request.user.userId;

      await prisma.notification.updateMany({
        where: {
          userId,
          isRead: false
        },
        data: {
          isRead: true,
          readAt: new Date()
        }
      });

      return reply.send({
        success: true,
        message: 'All notifications marked as read'
      });

    } catch (error) {
      app.log.error('Mark all notifications as read error:', error);
      return reply.status(500).send({
        success: false,
        error: 'Internal server error'
      });
    }
  });


  // Create Payment Intent (Stripe)
  app.post("/api/payments", { preHandler: [authenticate] }, async (request, reply) => {
    try {
      const userId = request.user.userId;
      const { bookingId } = request.body;

      if (!bookingId) {
        return reply.status(400).send({ success: false, error: 'Booking ID is required' });
      }

      const booking = await prisma.booking.findUnique({
        where: { id: bookingId }
      });

      if (!booking) return reply.status(404).send({ success: false, error: 'Booking not found' });
      if (booking.clientId !== userId) return reply.status(403).send({ success: false, error: 'Unauthorized' });

      if (!stripe) {
        return reply.status(500).send({ success: false, error: 'Stripe is not configured on the server.' });
      }

      // Calculate amount (ensure it's in cents/pence for Stripe)
      const amount = booking.adjustedPrice || booking.quotedPrice || booking.budget;
      const amountInCents = Math.round(amount * 100);

      // Create PaymentIntent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountInCents,
        currency: 'gbp',
        automatic_payment_methods: {
          enabled: true,
        },
        metadata: {
          bookingId: booking.id,
          userId: userId
        }
      });

      // Determine existing payment record or create new?
      // For now, let's create a Pending payment record to track the intent
      const payment = await prisma.payment.create({
        data: {
          bookingId,
          userId,
          amount,
          currency: 'GBP',
          paymentMethod: 'STRIPE',
          stripePaymentId: paymentIntent.id,
          status: 'PENDING',
          adminFee: amount * 0.3,
          vendorPayout: amount * 0.7,
          payoutStatus: 'HELD'
        }
      });

      return reply.send({
        success: true,
        clientSecret: paymentIntent.client_secret,
        paymentId: payment.id
      });

    } catch (error) {
      app.log.error('Stripe PaymentIntent error:', error);
      return reply.status(500).send({ success: false, error: 'Payment initialization failed' });
    }
  });

  // Verify Payment (Stripe)
  app.post("/api/payments/verify", { preHandler: [authenticate] }, async (request, reply) => {
    try {
      const { paymentIntentId } = request.body;

      if (!stripe) {
        return reply.status(500).send({ success: false, error: 'Stripe is not configured on the server.' });
      }

      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

      if (paymentIntent.status === 'succeeded') {
        const payment = await prisma.payment.findFirst({
          where: { stripePaymentId: paymentIntentId }
        });

        if (payment && payment.status !== 'PAID') {
          const updatedPayment = await prisma.$transaction(async (tx) => {
            const p = await tx.payment.update({
              where: { id: payment.id },
              data: { status: 'PAID', updatedAt: new Date() }
            });

            await tx.booking.update({
              where: { id: payment.bookingId },
              data: { paymentStatus: 'PAID', status: 'CONFIRMED' }
            });

            return p;
          });

          // Notify Vendor
          const booking = await prisma.booking.findUnique({ where: { id: payment.bookingId } });
          if (booking) {
            await createBookingNotification({
              userId: booking.vendorId,
              type: 'PAYMENT_RECEIVED',
              title: 'Payment Received',
              message: `Payment of £${payment.amount} received via Stripe`,
              data: { bookingId: payment.bookingId, paymentId: payment.id }
            });
          }

          return reply.send({ success: true, status: 'succeeded' });
        }
        return reply.send({ success: true, status: 'succeeded', message: 'Already processed' });
      } else {
        return reply.send({ success: false, status: paymentIntent.status });
      }
    } catch (error) {
      app.log.error('Payment verification error:', error);
      return reply.status(500).send({ success: false, error: 'Verification failed' });
    }
  });

  // Admin releases payout to vendor after service completion
  app.post("/api/payments/release-to-vendor", { preHandler: [authenticate] }, async (request, reply) => {
    try {
      const userId = request.user.userId;
      const { paymentId } = request.body;

      // Check if user is admin
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user || user.activeRole !== 'ADMIN') {
        return reply.status(403).send({
          success: false,
          error: 'Only admin can release payouts'
        });
      }

      const payment = await prisma.payment.findUnique({
        where: { id: paymentId },
        include: {
          booking: {
            include: {
              vendor: true
            }
          }
        }
      });

      if (!payment) {
        return reply.status(404).send({
          success: false,
          error: 'Payment not found'
        });
      }

      if (payment.status !== 'PAID') {
        return reply.status(400).send({
          success: false,
          error: 'Payment must be completed before releasing payout'
        });
      }

      if (payment.payoutStatus !== 'HELD') {
        return reply.status(400).send({
          success: false,
          error: 'Payout has already been processed'
        });
      }

      // Update payout status
      const updatedPayment = await prisma.payment.update({
        where: { id: paymentId },
        data: {
          payoutStatus: 'RELEASED_TO_VENDOR',
          updatedAt: new Date()
        }
      });

      // Notify vendor about payout release
      await createBookingNotification({
        userId: payment.booking.vendorId,
        type: 'PAYOUT_RELEASED',
        title: 'Payout Released',
        message: `Your payout of £${payment.vendorPayout.toFixed(2)} has been released and will be transferred to your account shortly.`,
        actionUrl: `/dashboard/payments`,
        data: {
          paymentId: payment.id,
          amount: payment.vendorPayout
        }
      });

      return reply.send({
        success: true,
        message: 'Payout released to vendor',
        data: updatedPayment
      });

    } catch (error) {
      app.log.error('Release payout error:', error);
      return reply.status(500).send({
        success: false,
        error: 'Internal server error'
      });
    }
  });

  // Old payment logic removed. Use Stripe endpoints instead.

  // Get payment history
  app.get("/api/payments", { preHandler: [authenticate] }, async (request, reply) => {
    try {
      const userId = request.user.userId;
      const { page = 1, limit = 10 } = request.query;

      const skip = (page - 1) * limit;

      const [payments, total] = await Promise.all([
        prisma.payment.findMany({
          where: { userId },
          skip,
          take: parseInt(limit),
          include: {
            booking: {
              select: {
                id: true,
                serviceType: true,
                vendor: {
                  select: {
                    firstName: true,
                    lastName: true,
                    vendorProfile: {
                      select: {
                        businessName: true
                      }
                    }
                  }
                }
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }),
        prisma.payment.count({ where: { userId } })
      ]);

      return reply.send({
        success: true,
        data: {
          payments,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            totalPages: Math.ceil(total / limit)
          }
        }
      });

    } catch (error) {
      app.log.error('Get payments error:', error);
      return reply.status(500).send({
        success: false,
        error: 'Internal server error'
      });
    }
  });

  // Get vendor clients
  app.get("/api/vendor/clients", { preHandler: [authenticate] }, async (request, reply) => {
    try {
      const userId = request.user.userId;

      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { vendorProfile: true }
      });

      if (!user || user.activeRole !== 'VENDOR') {
        return reply.status(403).send({
          success: false,
          error: 'Only vendors can view their clients'
        });
      }

      // Fetch all bookings for this vendor
      // Filter out cancelled bookings if desired, or keep them to show history
      const bookings = await prisma.booking.findMany({
        where: {
          vendorId: userId,
          status: { not: 'CANCELLED' }
        },
        include: {
          client: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phoneNumber: true,
              avatarUrl: true
            }
          }
        },
        orderBy: { bookingDate: 'desc' }
      });

      // Group bookings by client
      const clientsMap = new Map();

      bookings.forEach(booking => {
        const clientId = booking.clientId;
        const client = booking.client;

        if (!clientsMap.has(clientId)) {
          clientsMap.set(clientId, {
            id: client.id,
            firstName: client.firstName,
            lastName: client.lastName,
            email: client.email,
            phoneNumber: client.phoneNumber,
            avatarUrl: client.avatarUrl,
            totalBookings: 0,
            lastBookingDate: booking.bookingDate, // First one encountered is latest due to orderBy
            bookings: [] // Keep track for status calculation
          });
        }

        const clientData = clientsMap.get(clientId);
        clientData.totalBookings += 1;
        clientData.bookings.push(booking);
      });

      // Format and calculate status
      const clients = Array.from(clientsMap.values()).map(client => {
        const hasActiveBooking = client.bookings.some(b => ['PENDING', 'CONFIRMED'].includes(b.status));
        let status = 'NEW';

        if (hasActiveBooking) {
          status = 'ACTIVE';
        } else if (client.totalBookings > 1) {
          status = 'RECURRING';
        }

        return {
          id: client.id,
          firstName: client.firstName,
          lastName: client.lastName,
          email: client.email,
          phoneNumber: client.phoneNumber,
          avatarUrl: client.avatarUrl,
          totalBookings: client.totalBookings,
          lastBookingDate: client.lastBookingDate,
          status
        };
      });

      return reply.send({
        success: true,
        data: { clients }
      });

    } catch (error) {
      app.log.error('Get vendor clients error:', error);
      return reply.status(500).send({
        success: false,
        error: 'Internal server error'
      });
    }
  });

  // Get specific client details for a vendor
  app.get("/api/vendor/clients/:clientId", { preHandler: [authenticate] }, async (request, reply) => {
    try {
      const vendorId = request.user.userId;
      const { clientId } = request.params;

      const user = await prisma.user.findUnique({
        where: { id: vendorId },
        include: { vendorProfile: true }
      });

      if (!user || user.activeRole !== 'VENDOR') {
        return reply.status(403).send({
          success: false,
          error: 'Only vendors can view client details'
        });
      }

      // Fetch client profile
      const client = await prisma.user.findUnique({
        where: { id: clientId },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phoneNumber: true,
          avatarUrl: true,
          createdAt: true
        }
      });

      if (!client) {
        return reply.status(404).send({
          success: false,
          error: 'Client not found'
        });
      }

      // Fetch all bookings for this client with this vendor
      const bookings = await prisma.booking.findMany({
        where: {
          vendorId: vendorId,
          clientId: clientId
        },
        include: {
          servicePackage: {
            select: {
              title: true,
              price: true
            }
          },
          payments: true,
          review: true
        },
        orderBy: { eventDate: 'desc' }
      });

      return reply.send({
        success: true,
        data: {
          client,
          bookings: bookings.map(b => ({
            ...b,
            totalAmount: b.adjustedPrice || b.quotedPrice || b.budget || 0
          }))
        }
      });

    } catch (error) {
      app.log.error('Get vendor client detail error:', error);
      return reply.status(500).send({
        success: false,
        error: 'Internal server error'
      });
    }
  });

  // Get vendor analytics
  app.get("/api/vendor/analytics", { preHandler: [authenticate] }, async (request, reply) => {
    try {
      const userId = request.user.userId;

      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { vendorProfile: true }
      });

      if (!user || user.activeRole !== 'VENDOR') {
        return reply.status(403).send({
          success: false,
          error: 'Only vendors can view analytics'
        });
      }

      const vendorId = userId; // In this schema, bookings.vendorId refers to User.id (who is a vendor)

      // 1. Fetch all bookings with payments and package info
      const bookings = await prisma.booking.findMany({
        where: {
          vendorId: vendorId,
          status: { not: 'CANCELLED' } // Include pending/confirmed/completed
        },
        include: {
          payments: true,
          servicePackage: true
        }
      });

      // 2. Calculate Overview Stats
      const totalBookings = bookings.length;

      // Calculate revenue from PAID payments
      let totalRevenue = 0;
      bookings.forEach(b => {
        const paidAmount = b.payments
          .filter(p => p.status === 'PAID')
          .reduce((sum, p) => sum + p.amount, 0);
        totalRevenue += paidAmount;
      });

      const avgBookingValue = totalBookings > 0 ? totalRevenue / totalBookings : 0;

      // Unique clients
      const uniqueClients = new Set(bookings.map(b => b.clientId));
      const clientBase = uniqueClients.size;


      // 3. Calculate Revenue Trend (Last 6 Months)
      const revenueTrend = [];
      const now = new Date();
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthName = d.toLocaleString('default', { month: 'short' });
        const year = d.getFullYear();
        const monthIndex = d.getMonth(); // 0-11

        // Filter payments in this month
        let monthlyRevenue = 0;
        bookings.forEach(b => {
          b.payments.forEach(p => {
            if (p.status === 'PAID') {
              const pDate = new Date(p.createdAt);
              if (pDate.getMonth() === monthIndex && pDate.getFullYear() === year) {
                monthlyRevenue += p.amount;
              }
            }
          });
        });

        revenueTrend.push({
          month: monthName,
          revenue: monthlyRevenue
        });
      }

      // 4. Calculate Package Performance
      const packageStats = new Map(); // packageId -> { name, bookings, revenue, color }

      bookings.forEach(b => {
        const pkgId = b.servicePackageId || 'custom';
        const pkgName = b.servicePackage ? b.servicePackage.title : 'Custom Service';

        if (!packageStats.has(pkgId)) {
          packageStats.set(pkgId, {
            name: pkgName,
            bookings: 0,
            revenue: 0,
            // Assign color based on index or hash later if needed, hardcode for now or cycle through frontend colors
          });
        }

        const stats = packageStats.get(pkgId);
        stats.bookings += 1;

        const bookingRevenue = b.payments
          .filter(p => p.status === 'PAID')
          .reduce((sum, p) => sum + p.amount, 0);
        stats.revenue += bookingRevenue;
      });

      // Sort by revenue desc and take top 5
      const packagePerformance = Array.from(packageStats.values())
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5)
        .map((pkg, index) => {
          const colors = ['bg-orange-500', 'bg-purple-500', 'bg-blue-500', 'bg-green-500', 'bg-red-500'];
          return {
            ...pkg,
            color: colors[index % colors.length]
          };
        });


      return reply.send({
        success: true,
        data: {
          overview: {
            totalRevenue,
            totalBookings,
            avgBookingValue,
            clientBase
          },
          revenueTrend,
          packagePerformance
        }
      });

    } catch (error) {
      app.log.error('Get vendor analytics error:', error);
      return reply.status(500).send({
        success: false,
        error: 'Internal server error'
      });
    }
  });

  // Create service package
  app.post("/api/vendor/packages", { preHandler: [authenticate] }, async (request, reply) => {
    try {
      const userId = request.user.userId;
      const data = servicePackageSchema.parse(request.body);

      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { vendorProfile: true }
      });

      if (!user || user.activeRole !== 'VENDOR' || !user.vendorProfile) {
        return reply.status(403).send({
          success: false,
          error: 'Only vendors can create service packages'
        });
      }

      if (!user.vendorProfile.businessProof) {
        return reply.status(403).send({
          success: false,
          error: 'Proof of business is required to create service packages. Please update your vendor profile.'
        });
      }

      const pkg = await prisma.servicePackage.create({
        data: {
          vendorId: user.vendorProfile.id,
          title: data.title,
          description: data.description,
          price: data.price,
          currency: data.currency,
          duration: data.duration,
          inclusions: data.inclusions,
          isActive: data.isActive,
          aboutVendor: data.aboutVendor,
          mainImage: data.mainImage,
          gallery: data.gallery || [],
          location: data.location,
          state: data.state,
          availability: data.availability,
          minBooking: data.minBooking,
          maxBooking: data.maxBooking,
          preparationTime: data.preparationTime
        }
      });

      return reply.send({
        success: true,
        message: 'Service package created successfully',
        data: { package: pkg }
      });

    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({
          success: false,
          error: 'Validation failed',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        });
      }
      app.log.error('Create package error:', error);
      return reply.status(500).send({
        success: false,
        error: 'Internal server error',
        details: error.message
      });
    }
  });

  // Update service package
  app.put("/api/vendor/packages/:id", { preHandler: [authenticate] }, async (request, reply) => {
    try {
      const userId = request.user.userId;
      const { id } = request.params;
      const data = servicePackageSchema.parse(request.body);

      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { vendorProfile: true }
      });

      if (!user || user.activeRole !== 'VENDOR' || !user.vendorProfile) {
        return reply.status(403).send({
          success: false,
          error: 'Not authorized'
        });
      }

      const pkg = await prisma.servicePackage.findUnique({
        where: { id }
      });

      if (!pkg || pkg.vendorId !== user.vendorProfile.id) {
        return reply.status(404).send({
          success: false,
          error: 'Package not found or unauthorized'
        });
      }

      const updatedPkg = await prisma.servicePackage.update({
        where: { id },
        data: {
          title: data.title,
          description: data.description,
          price: data.price,
          currency: data.currency,
          duration: data.duration,
          inclusions: data.inclusions,
          isActive: data.isActive,
          aboutVendor: data.aboutVendor,
          mainImage: data.mainImage,
          gallery: data.gallery || [],
          location: data.location,
          state: data.state,
          availability: data.availability,
          minBooking: data.minBooking,
          maxBooking: data.maxBooking,
          preparationTime: data.preparationTime
        }
      });

      return reply.send({
        success: true,
        message: 'Service package updated successfully',
        data: { package: updatedPkg }
      });

    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({
          success: false,
          error: 'Validation failed',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        });
      }
      app.log.error('Update package error:', error);
      return reply.status(500).send({
        success: false,
        error: 'Internal server error'
      });
    }
  });

  // Get vendor packages
  app.get("/api/vendor/packages", { preHandler: [authenticate] }, async (request, reply) => {
    try {
      const userId = request.user.userId;

      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { vendorProfile: true }
      });

      if (!user || !user.vendorProfile) {
        return reply.status(403).send({
          success: false,
          error: 'Vendor profile not found'
        });
      }

      const packages = await prisma.servicePackage.findMany({
        where: { vendorId: user.vendorProfile.id },
        orderBy: { createdAt: 'desc' }
      });

      return reply.send({
        success: true,
        data: { packages }
      });

    } catch (error) {
      app.log.error('Get vendor packages error:', error);
      return reply.status(500).send({
        success: false,
        error: 'Internal server error'
      });
    }
  });

  // Delete service package
  app.delete("/api/vendor/packages/:id", { preHandler: [authenticate] }, async (request, reply) => {
    try {
      const userId = request.user.userId;
      const { id } = request.params;

      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { vendorProfile: true }
      });

      if (!user || !user.vendorProfile) {
        return reply.status(403).send({
          success: false,
          error: 'Not authorized'
        });
      }

      const pkg = await prisma.servicePackage.findUnique({
        where: { id }
      });

      if (!pkg || pkg.vendorId !== user.vendorProfile.id) {
        return reply.status(404).send({
          success: false,
          error: 'Package not found or unauthorized'
        });
      }

      await prisma.servicePackage.delete({
        where: { id }
      });

      return reply.send({
        success: true,
        message: 'Service package deleted successfully'
      });

    } catch (error) {
      app.log.error('Delete package error:', error);
      return reply.status(500).send({
        success: false,
        error: 'Internal server error'
      });
    }
  });

  // Get single package by ID (public) - MUST BE BEFORE /api/packages route
  app.get("/api/packages/:id", async (request, reply) => {
    try {
      const { id } = request.params;

      const pkg = await prisma.servicePackage.findUnique({
        where: {
          id,
          isActive: true
        },
        include: {
          vendor: {
            select: {
              id: true,
              userId: true,  // IMPORTANT: Include this
              businessName: true,
              category: true,
              rating: true,
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  avatarUrl: true
                }
              }
            }
          }
        }
      });

      if (!pkg) {
        return reply.status(404).send({
          success: false,
          error: 'Package not found'
        });
      }

      return reply.send({
        success: true,
        data: pkg
      });

    } catch (error) {
      app.log.error('Get package error:', error);
      return reply.status(500).send({
        success: false,
        error: 'Internal server error'
      });
    }
  });

  // Get all packages (public)
  app.get("/api/packages", async (request, reply) => {
    try {
      const { category, minPrice, maxPrice, search, page = 1, limit = 12 } = request.query;

      let whereClause = {
        isActive: true
      };

      if (category) {
        whereClause.vendor = {
          category: category
        };
      }

      if (minPrice) {
        whereClause.price = { ...whereClause.price, gte: parseFloat(minPrice) };
      }

      if (maxPrice) {
        whereClause.price = { ...whereClause.price, lte: parseFloat(maxPrice) };
      }

      if (search) {
        whereClause.OR = [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } }
        ];
      }

      const skip = (page - 1) * limit;

      const [packages, total] = await Promise.all([
        prisma.servicePackage.findMany({
          where: whereClause,
          skip,
          take: parseInt(limit),
          include: {
            vendor: {
              select: {
                id: true,
                userId: true,  // ADD THIS
                businessName: true,
                category: true,
                rating: true,
                user: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    avatarUrl: true
                  }
                }
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }),
        prisma.servicePackage.count({ where: whereClause })
      ]);

      return reply.send({
        success: true,
        data: {
          packages,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            totalPages: Math.ceil(total / limit)
          }
        }
      });

    } catch (error) {
      app.log.error('Get all packages error:', error);
      return reply.status(500).send({
        success: false,
        error: 'Internal server error'
      });
    }
  });

  // Get all vendors
  app.get("/api/vendors", async (request, reply) => {
    try {
      const { category, city, search, query, userId, page = 1, limit = 12, onlyBooked = 'false' } = request.query;

      let currentUserId = null;
      if (onlyBooked === 'true') {
        const authHeader = request.headers.authorization;
        if (!authHeader) {
          return reply.status(401).send({ success: false, error: 'Authentication required for My Vendors' });
        }
        const token = authHeader.split(' ')[1];
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          currentUserId = decoded.userId;
        } catch (err) {
          return reply.status(401).send({ success: false, error: 'Invalid token' });
        }
      }

      let whereClause = {
        status: 'APPROVED'
      };

      if (userId) {
        whereClause.userId = userId;
      }

      if (category) {
        whereClause.category = category;
      }

      if (city) {
        whereClause.city = {
          contains: city,
          mode: 'insensitive'
        };
      }

      const searchTerm = search || query;
      if (searchTerm) {
        whereClause.OR = [
          { businessName: { contains: searchTerm, mode: 'insensitive' } },
          { description: { contains: searchTerm, mode: 'insensitive' } }
        ];
      }

      if (onlyBooked === 'true' && currentUserId) {
        whereClause.user = {
          bookings: {
            some: {
              clientId: currentUserId
            }
          }
        };
      }

      const skip = (page - 1) * limit;

      const [vendors, total] = await Promise.all([
        prisma.vendorProfile.findMany({
          where: whereClause,
          skip,
          take: parseInt(limit),
          select: {
            id: true,
            userId: true,
            businessName: true,
            category: true,
            city: true,
            country: true,
            description: true,
            rating: true,
            totalReviews: true,
            portfolioImages: true,
            minBookingPrice: true,
            responseTime: true,
            isVerified: true,
            user: {
              select: {
                firstName: true,
                lastName: true,
                avatarUrl: true,
                email: true
              }
            },
            servicePackages: {
              where: { isActive: true },
              select: {
                id: true,
                title: true,
                price: true,
                currency: true,
                duration: true,
                mainImage: true
              },
              take: 3,
              orderBy: { price: 'asc' }
            }
          },
          orderBy: { rating: 'desc' }
        }),
        prisma.vendorProfile.count({ where: whereClause })
      ]);

      return reply.send({
        success: true,
        data: {
          vendors,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            totalPages: Math.ceil(total / limit)
          }
        }
      });

    } catch (error) {
      app.log.error('Get vendors error:', error);
      return reply.status(500).send({
        success: false,
        error: 'Internal server error'
      });
    }
  });

  // Get single vendor by ID
  app.get("/api/vendors/:id", async (request, reply) => {
    try {
      const { id } = request.params;

      const vendor = await prisma.vendorProfile.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phoneNumber: true,
              avatarUrl: true
            }
          },
          servicePackages: {
            where: { isActive: true },
            orderBy: { price: 'asc' }
          },
          reviews: {
            include: {
              client: {
                select: {
                  firstName: true,
                  lastName: true,
                  avatarUrl: true
                }
              }
            },
            orderBy: { createdAt: 'desc' },
            take: 10
          }
        }
      });

      if (!vendor) {
        return reply.status(404).send({
          success: false,
          error: 'Vendor not found'
        });
      }

      return reply.send({
        success: true,
        data: vendor
      });

    } catch (error) {
      app.log.error('Get vendor error:', error);
      return reply.status(500).send({
        success: false,
        error: 'Internal server error'
      });
    }
  });


  // Create service request
  app.post("/api/service-requests", { preHandler: [authenticate] }, async (request, reply) => {
    try {
      const userId = request.user.userId;
      const data = serviceRequestSchema.parse(request.body);

      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { clientProfile: true }
      });

      if (!user || !user.clientProfile) {
        return reply.status(403).send({
          success: false,
          error: 'Only clients can create service requests'
        });
      }

      const serviceRequest = await prisma.serviceRequest.create({
        data: {
          clientId: userId,
          serviceType: data.serviceType,
          description: data.description,
          budgetMin: data.budgetRange.min,
          budgetMax: data.budgetRange.max,
          eventDate: new Date(data.eventDate),
          eventLocation: data.eventLocation,
          guests: data.guests,
          requirements: data.requirements || [],
          urgency: data.urgency || 'MEDIUM',
          status: 'ACTIVE'
        },
        include: {
          client: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phoneNumber: true
            }
          }
        }
      });

      const relevantVendors = await prisma.user.findMany({
        where: {
          activeRole: 'VENDOR',
          vendorProfile: {
            category: data.serviceType
          }
        },
        take: 10
      });

      for (const vendor of relevantVendors) {
        await prisma.notification.create({
          data: {
            userId: vendor.id,
            type: 'NEW_SERVICE_REQUEST',
            title: 'New Service Request',
            message: `${user.firstName} needs ${data.serviceType} services`,
            data: {
              serviceRequestId: serviceRequest.id,
              serviceType: data.serviceType,
              budgetMin: data.budgetRange.min,
              budgetMax: data.budgetRange.max
            }
          }
        });
      }

      return reply.send({
        success: true,
        message: 'Service request posted successfully',
        data: { serviceRequest }
      });

    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({
          success: false,
          error: 'Validation failed',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        });
      }
      app.log.error('Create service request error:', error);
      return reply.status(500).send({
        success: false,
        error: 'Internal server error'
      });
    }
  });

  // Get service requests
  app.get("/api/service-requests", { preHandler: [optionalAuthenticate] }, async (request, reply) => {
    try {
      const { serviceType, minBudget, maxBudget, page = 1, limit = 10, search } = request.query;

      let whereClause = {
        status: 'ACTIVE'
      };

      if (serviceType) {
        whereClause.serviceType = serviceType;
      }

      if (minBudget) {
        whereClause.budgetMin = { gte: parseInt(minBudget) };
      }

      if (maxBudget) {
        whereClause.budgetMax = { lte: parseInt(maxBudget) };
      }

      if (search) {
        whereClause.OR = [
          { serviceType: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { eventLocation: { contains: search, mode: 'insensitive' } }
        ];
      }

      const skip = (page - 1) * limit;

      const [serviceRequests, total] = await Promise.all([
        prisma.serviceRequest.findMany({
          where: whereClause,
          skip,
          take: parseInt(limit),
          include: {
            client: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatarUrl: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }),
        prisma.serviceRequest.count({ where: whereClause })
      ]);

      return reply.send({
        success: true,
        data: {
          serviceRequests,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            totalPages: Math.ceil(total / limit)
          }
        }
      });

    } catch (error) {
      app.log.error('Get service requests error:', error);
      return reply.status(500).send({
        success: false,
        error: 'Internal server error'
      });
    }
  });

  // Get client's service requests
  app.get("/api/my-service-requests", { preHandler: [authenticate] }, async (request, reply) => {
    try {
      const userId = request.user.userId;
      const { status, page = 1, limit = 10 } = request.query;

      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (user.activeRole !== 'CLIENT') {
        return reply.status(403).send({
          success: false,
          error: 'Only clients can view their service requests'
        });
      }

      let whereClause = { clientId: userId };
      if (status) {
        whereClause.status = status;
      }

      const skip = (page - 1) * limit;

      const [serviceRequests, total] = await Promise.all([
        prisma.serviceRequest.findMany({
          where: whereClause,
          skip,
          take: parseInt(limit),
          include: {
            client: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phoneNumber: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }),
        prisma.serviceRequest.count({ where: whereClause })
      ]);

      return reply.send({
        success: true,
        data: {
          serviceRequests,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            totalPages: Math.ceil(total / limit)
          }
        }
      });

    } catch (error) {
      app.log.error('Get my service requests error:', error);
      return reply.status(500).send({
        success: false,
        error: 'Internal server error'
      });
    }
  });

  // Suspend vendor
  app.post("/api/admin/vendors/:vendorId/suspend", { preHandler: [authenticate] }, async (request, reply) => {
    try {
      const userId = request.user.userId;
      const { vendorId } = request.params;
      const data = vendorSuspensionSchema.parse(request.body);

      // Check if user is admin
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user || user.activeRole !== 'ADMIN') {
        return reply.status(403).send({
          success: false,
          error: 'Admin access required'
        });
      }

      const vendor = await prisma.vendorProfile.findUnique({
        where: { id: vendorId }
      });

      if (!vendor) {
        return reply.status(404).send({
          success: false,
          error: 'Vendor not found'
        });
      }

      const updatedVendor = await prisma.vendorProfile.update({
        where: { id: vendorId },
        data: {
          status: 'SUSPENDED',
          isVerified: false
        }
      });

      // Create notification for vendor
      await prisma.notification.create({
        data: {
          userId: vendor.userId,
          type: 'VENDOR_SUSPENDED',
          title: 'Account Suspended ⚠️',
          message: `Your vendor account has been suspended for the following reason: ${data.reason}. Please contact support for more information.`,
          data: { vendorId, reason: data.reason }
        }
      });

      return reply.send({
        success: true,
        message: 'Vendor suspended successfully',
        data: { vendor: updatedVendor }
      });

    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({
          success: false,
          error: 'Validation failed',
          details: error.errors
        });
      }
      app.log.error('Suspend vendor error:', error);
      return reply.status(500).send({
        success: false,
        error: 'Internal server error'
      });
    }
  });

  // Unsuspend vendor
  app.post("/api/admin/vendors/:vendorId/unsuspend", { preHandler: [authenticate] }, async (request, reply) => {
    try {
      const userId = request.user.userId;
      const { vendorId } = request.params;

      // Check if user is admin
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user || user.activeRole !== 'ADMIN') {
        return reply.status(403).send({
          success: false,
          error: 'Admin access required'
        });
      }

      const vendor = await prisma.vendorProfile.findUnique({
        where: { id: vendorId }
      });

      if (!vendor) {
        return reply.status(404).send({
          success: false,
          error: 'Vendor not found'
        });
      }

      const updatedVendor = await prisma.vendorProfile.update({
        where: { id: vendorId },
        data: {
          status: 'APPROVED',
          isVerified: true
        }
      });

      // Create notification for vendor
      await prisma.notification.create({
        data: {
          userId: vendor.userId,
          type: 'VENDOR_UNSUSPENDED',
          title: 'Account Reinstated! ✅',
          message: 'Your vendor account has been unsuspended and reinstated. You can now resume your activities.',
          data: { vendorId }
        }
      });

      return reply.send({
        success: true,
        message: 'Vendor unsuspended successfully',
        data: { vendor: updatedVendor }
      });

    } catch (error) {
      app.log.error('Unsuspend vendor error:', error);
      return reply.status(500).send({
        success: false,
        error: 'Internal server error'
      });
    }
  });

  // Error handler
  app.setErrorHandler((error, request, reply) => {
    app.log.error(error);

    const statusCode = error.statusCode || 500;
    const message = error.message || 'Internal Server Error';

    reply.status(statusCode).send({
      success: false,
      error: process.env.NODE_ENV === 'development' ? message : 'Something went wrong',
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
  });

  // Start server
  try {
    const PORT = process.env.PORT || 5000;
    await app.listen({ port: PORT, host: "0.0.0.0" });
    app.log.info(`🚀 Server listening on http://localhost:${PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  app.log.info('Shutting down server...');
  await app.close();
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  app.log.info('Shutting down server...');
  await app.close();
  await prisma.$disconnect();
  process.exit(0);
});

start();