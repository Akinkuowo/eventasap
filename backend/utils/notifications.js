// Booking workflow endpoints - price adjustments and approvals

// Helper function to create notifications
async function createNotification({ userId, type, title, message, actionUrl, data }) {
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
        console.error('Create notification error:', error);
    }
}

module.exports = { createNotification };
