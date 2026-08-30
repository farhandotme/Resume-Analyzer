import express from 'express';
import dotenv from 'dotenv';
import resumeRoutes from './src/routes/resumeRoutes';
dotenv.config();
import cors from 'cors';

const app = express();

// Comma-separated list of allowed frontend origins, e.g.
// ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
// Falls back to the local dev origin if not set.
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'https://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

app.use(
    cors({
        origin: (origin, callback) => {
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
                return;
            }
            callback(new Error('Not allowed by CORS'));
        },
        credentials: true,
    }),
);

app.use(express.json());
app.get('/', (req, res) => {
    res.json({ message: 'hello there! This is the node js backend' });
});

app.use('/resume', resumeRoutes);
app.listen(3000, () => {
    console.log('running on port 3000');
});
