import express from 'express';
import dotenv from 'dotenv';
import resumeRoutes from './src/routes/resumeRoutes';
dotenv.config();

const app = express();

// Comma-separated list of allowed frontend origins, e.g.
// ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
// Falls back to the local dev origin if not set.

app.use(express.json());
app.get('/', (req, res) => {
    res.json({ message: 'hello there! This is the node js backend' });
});

app.use('/resume', resumeRoutes);
app.listen(3000, () => {
    console.log('running on port 3000');
});
