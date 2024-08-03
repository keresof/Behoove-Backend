import contentRoutes from "./modules/content/routes/contentRoutes";

require('dotenv').config();
import express from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import authRoutes from './modules/user/routes/authRoutes';
import userRoutes from './modules/user/routes/userRoutes';
import bearerMiddleware from './middleware/bearerMiddleware';
import passport from 'passport';
import './infra/passportConfig';
import './infra/redisConfig';
import connectDB from './infra/db';
import refreshToken from './modules/user/models/refreshToken';
import { CLEAR_EXPIRED_TOKENS_INTERVAL } from './utilities/constants';

const PORT = process.env.PORT || 3030;

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

// Existing Swagger documentation...

// Use the routes
// app.use('/api', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/content', contentRoutes);

if (!process.env.NODE_ENV || (process.env.NODE_ENV && process.env.NODE_ENV !== 'test')) {
    app.listen(PORT, () => {
        connectDB();
        // clear expired refresh tokens on startup and setup interval to clear them periodically
        // use iife to avoid top-level await
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
        console.log(`Express app running on port ${PORT}`);
        console.log(`Swagger documentation available at http://localhost:${PORT}/api-docs`);
    });
}

export default app;