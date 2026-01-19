// src/middleware/auth.js
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function authenticate(request, reply) {
    try {
        const authHeader = request.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return reply.status(401).send({
                success: false,
                error: 'Authentication required'
            });
        }

        const token = authHeader.substring(7);

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Check if session exists
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

        // Attach user to request
        request.user = decoded;
        request.session = session;

    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return reply.status(401).send({
                success: false,
                error: 'Token expired'
            });
        }

        if (error.name === 'JsonWebTokenError') {
            return reply.status(401).send({
                success: false,
                error: 'Invalid token'
            });
        }

        throw error;
    }
}

module.exports = authenticate;