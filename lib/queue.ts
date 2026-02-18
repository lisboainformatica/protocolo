
import { Queue } from 'bullmq';

// Reuse the Redis connection if possible or create new.
// For Vercel/Serverless, we need to be careful with connections.
// Usually we use a separate worker process or API route to process.
// Here we just define the queue for adding jobs.

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

export const emailQueue = new Queue('email-queue', {
    connection: {
        url: REDIS_URL,
    },
});

export const addEmailJob = async (to: string, subject: string, body: string) => {
    try {
        await emailQueue.add('send-email', { to, subject, body });
    } catch (error) {
        console.error('Error adding email job', error);
        // Fallback: log or try direct send if critical
    }
};
