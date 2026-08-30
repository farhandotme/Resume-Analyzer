import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import resumeRoutes from './src/routes/resumeRoutes';
dotenv.config();
import cors from 'cors';

const app = express();

// Trust the reverse proxy (nginx / load balancer) in front of this service
// so req.ip / req.protocol reflect the real client, not the proxy hop.
app.set('trust proxy', 1);

const PORT = Number(process.env.PORT) || 3000;

// CORS origins are supplied via env so the same image can be deployed to any
// environment without a code change. Comma-separated list, e.g.:
// FRONTEND_URL=https://app.example.com,https://staging.example.com
const allowedOrigins = (process.env.FRONTEND_URL ?? 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

app.use(
    cors({
        origin: (origin, callback) => {
            // Allow non-browser requests (curl, server-to-server, health checks)
            // that don't send an Origin header at all.
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
                return;
            }
            callback(new Error('Not allowed by CORS'));
        },
        credentials: true,
    }),
);

app.use(express.json({ limit: '2mb' }));

app.get('/', (req, res) => {
    res.json({ message: 'hello there! This is the node js backend' });
});

// Liveness/readiness probe for Docker healthcheck / load balancers / orchestrators.
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

app.use('/resume', resumeRoutes);

// Centralized error handler — catches thrown errors (e.g. CORS rejection)
// so the process never crashes on a bad request and always returns JSON.
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error('Unhandled error:', err.message);
    res.status(err.message === 'Not allowed by CORS' ? 403 : 500).json({
        success: false,
        error: err.message || 'Internal server error',
    });
});

const server = app.listen(PORT, () => {
    console.log(`running on port ${PORT}`);
});

// Graceful shutdown so container orchestrators (Docker/K8s) can stop the
// process cleanly instead of killing in-flight requests.
const shutdown = (signal: string) => {
    console.log(`${signal} received, shutting down gracefully`);
    server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
    });
};
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
