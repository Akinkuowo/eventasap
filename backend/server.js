// server.js - EventASAP Backend with Email Verification
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

const app = Fastify({
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
    await transporter.sendMail({
      from: `"EventASAP" <${process.env.SMTP_USER}>`,
      to,
      subject: template.subject,
      html: template.html,
    });
    return true;
  } catch (error) {
    app.log.error('Email sending error:', error);
    return false;
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


// In generateTokens function, update to:
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
// Update the authenticate middleware:
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
          error: 'Token expired'
        });
      }
      if (jwtError.name === 'JsonWebTokenError') {
        return reply.status(401).send({
          success: false,
          error: 'Invalid token'
        });
      }
      throw jwtError;
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
    // This catch block is for database errors, not JWT errors
    app.log.error('Authentication error:', error);
    return reply.status(500).send({
      success: false,
      error: 'Internal server error'
    });
  }
};

async function start() {
  // Register plugins
  await app.register(cors, {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
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

      await sendEmail(data.email, emailTemplate);

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
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // Consistent 24 hours
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
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
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
        message: 'Vendor profile created successfully! Awaiting approval.',
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
  // Update the refresh token endpoint:
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
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
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
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
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

  // Add this endpoint to validate tokens without expiring them
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

  // Check business email availability (for vendors)
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

  // Create a booking (Client creates booking with vendor)
  app.post("/api/bookings", { preHandler: [authenticate] }, async (request, reply) => {
    try {
      const userId = request.user.userId;
      const data = bookingSchema.parse(request.body);

      // Check if user is a client
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

      // Check if vendor exists
      const vendor = await prisma.user.findUnique({
        where: { id: data.vendorId },
        include: { vendorProfile: true }
      });

      if (!vendor || !vendor.vendorProfile) {
        return reply.status(404).send({
          success: false,
          error: 'Vendor not found'
        });
      }

      const booking = await prisma.booking.create({
        data: {
          clientId: userId,
          vendorId: data.vendorId,
          serviceId: data.serviceId,
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

      // Create notification for vendor
      await prisma.notification.create({
        data: {
          userId: data.vendorId,
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
        return reply.status(400).send({
          success: false,
          error: 'Validation failed',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        });
      }
      app.log.error('Create booking error:', error);
      return reply.status(500).send({
        success: false,
        error: 'Internal server error'
      });
    }
  });

  // Get user bookings (both client and vendor)
  app.get("/api/bookings", { preHandler: [authenticate] }, async (request, reply) => {
    try {
      const userId = request.user.userId;
      const { role, status, page = 1, limit = 10 } = request.query;

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

      // Calculate stats
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
          reviews: true
        }
      });

      if (!booking) {
        return reply.status(404).send({
          success: false,
          error: 'Booking not found'
        });
      }

      // Check authorization
      if (booking.clientId !== userId && booking.vendorId !== userId) {
        return reply.status(403).send({
          success: false,
          error: 'Not authorized to view this booking'
        });
      }

      return reply.send({
        success: true,
        data: { booking }
      });

    } catch (error) {
      app.log.error('Get booking error:', error);
      return reply.status(500).send({
        success: false,
        error: 'Internal server error'
      });
    }
  });

  // Update booking (vendor updates status, price, etc.)
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

      // Only vendor can update booking
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

      // Create notification for client
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

  // Payments API

  // Process a payment (Mock flow)
  app.post("/api/payments", { preHandler: [authenticate] }, async (request, reply) => {
    try {
      const userId = request.user.userId;
      const { bookingId, amount, paymentMethod, description } = request.body;

      if (!bookingId || !amount) {
        return reply.status(400).send({
          success: false,
          error: 'Booking ID and amount are required'
        });
      }

      const booking = await prisma.booking.findUnique({
        where: { id: bookingId }
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
          error: 'Not authorized to pay for this booking'
        });
      }

      // Create payment record
      const payment = await prisma.$transaction(async (tx) => {
        const p = await tx.payment.create({
          data: {
            bookingId,
            userId,
            amount: parseFloat(amount),
            paymentMethod: paymentMethod || 'CARD',
            status: 'PAID',
            description: description || `Payment for booking ${bookingId}`
          }
        });

        // Update booking status
        await tx.booking.update({
          where: { id: bookingId },
          data: {
            paymentStatus: 'PAID',
            status: 'CONFIRMED'
          }
        });

        return p;
      });

      // Create notification for vendor
      await prisma.notification.create({
        data: {
          userId: booking.vendorId,
          type: 'PAYMENT_RECEIVED',
          title: 'Payment Received',
          message: `Payment of £${amount} received for booking ${bookingId}`,
          data: { bookingId, paymentId: payment.id }
        }
      });

      return reply.send({
        success: true,
        message: 'Payment processed successfully',
        data: { payment }
      });

    } catch (error) {
      app.log.error('Process payment error:', error);
      return reply.status(500).send({
        success: false,
        error: 'Internal server error'
      });
    }
  });

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

  // Get all approved vendors
  app.get("/api/vendors", async (request, reply) => {
    try {
      const { category, city, search, page = 1, limit = 12, onlyBooked = 'false' } = request.query;

      // Check authentication if onlyBooked is requested
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

      if (category) {
        whereClause.category = category;
      }

      if (city) {
        whereClause.city = {
          contains: city,
          mode: 'insensitive'
        };
      }

      if (search) {
        whereClause.OR = [
          { businessName: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } }
        ];
      }

      // Filter by vendors booked by the current user
      if (onlyBooked === 'true' && currentUserId) {
        whereClause.bookings = {
          some: {
            clientId: currentUserId
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
                avatarUrl: true
              }
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

  // Service Requests (Client posts service needs)

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

      // Find relevant vendors and notify them
      const relevantVendors = await prisma.user.findMany({
        where: {
          activeRole: 'VENDOR',
          vendorProfile: {
            category: data.serviceType
          }
        },
        take: 10 // Limit notifications
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

  // Get service requests (for vendors)
  app.get("/api/service-requests", { preHandler: [authenticate] }, async (request, reply) => {
    try {
      const userId = request.user.userId;
      const { serviceType, minBudget, maxBudget, page = 1, limit = 10 } = request.query;

      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (user.activeRole !== 'VENDOR') {
        return reply.status(403).send({
          success: false,
          error: 'Only vendors can view service requests'
        });
      }

      const vendor = await prisma.vendorProfile.findUnique({
        where: { userId }
      });

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