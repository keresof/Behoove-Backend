import contentRoutes from "./modules/content/routes/contentRoutes";
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import authRoutes from './modules/user/routes/authRoutes';
import bearerMiddleware from './middleware/bearerMiddleware';
import passport from 'passport';
import './infra/passportConfig';
import { createClient } from 'redis';
import connectDB from './infra/db';
import cors from 'cors';
import refreshToken from './modules/user/models/refreshToken';
import { CLEAR_EXPIRED_TOKENS_INTERVAL } from './utilities/constants';

const PORT = process.env.PORT || 3030;
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

// Redis Client Setup
const redisClient = createClient({ url: REDIS_URL });
redisClient.on('error', (err) => console.log('Redis Client Error', err));
redisClient.connect().catch(console.error);

// Swagger configuration
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'User Management API',
            version: '1.0.0',
            description: 'API for user authentication and management',
        },
        servers: [
            {
                url: `http://localhost:${PORT}`,
                description: 'Development server',
            },
        ],
    },
    apis: ['./index.ts', './modules/user/routes/*.ts'], // Path to the API routes
};

const swaggerSpecs = swaggerJsdoc(swaggerOptions);

export const configureApp = (middleware?: any[]) => {
    const app = express();
    app.use(express.json());

    // Initialize Passport
    app.use(passport.initialize());

    // Swagger setup
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

    if(middleware) {
        app.use(middleware);
    }
    return app;
}

const app = configureApp([bearerMiddleware]);

app.use(cors());
app.use('/api/auth', authRoutes);
app.use('/api/content', contentRoutes);

const startServer = async () => {
    try {
        await connectDB();
        console.log('Connected to MongoDB');

        await redisClient.ping();
        console.log('Connected to Redis');

        app.listen(PORT, () => {
            console.log(`Express app running on port ${PORT}`);
            console.log(`Swagger documentation available at http://localhost:${PORT}/api-docs`);

            // Clear expired tokens
            (async () => {
                console.log('Clearing expired tokens...');
                await refreshToken.deleteExpired();
                console.log('Expired tokens cleared');
                console.log(`Setting up interval to clear expired tokens every ${CLEAR_EXPIRED_TOKENS_INTERVAL} seconds`);
                setInterval(async () => {
                    console.log('Clearing expired tokens...');
                    await refreshToken.deleteExpired();
                    console.log('Expired tokens cleared');
                }, CLEAR_EXPIRED_TOKENS_INTERVAL! * 1000);
            })();
        });
    } catch (error) {
        console.error('Failed to start the server:', error);
        process.exit(1);
    }
};

startServer();

export default app;