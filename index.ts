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


if (!process.env.NODE_ENV || (process.env.NODE_ENV && process.env.NODE_ENV !== 'test')) {
    app.listen(PORT, () => {
        connectDB();
        console.log(`Express app running on port ${PORT}`);
        console.log(`Swagger documentation available at http://localhost:${PORT}/api-docs`);
    });
}

export default app;