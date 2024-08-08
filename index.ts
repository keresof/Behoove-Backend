import dotenv from 'dotenv';
dotenv.config();
import cors from 'cors';
import contentRoutes from "./modules/content/routes/contentRoutes";
import express from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import authRoutes from './modules/user/routes/authRoutes';
import bearerMiddleware from './middleware/bearerMiddleware';
import passport from 'passport';
import './infra/passportConfig';
import redisClient from './infra/redisConfig';
import connectDB from './infra/db';
import schedulerService from "./utilities/schedulerService";


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

app.use(cors());
app.use('/api/auth', authRoutes);
app.use('/api/content', contentRoutes);
app.use(passport.initialize());


const startServer = async () => {
    try {
        await connectDB();
        await redisClient.ping();

        app.listen(PORT, () => {
            console.log(`Express app running on port ${PORT}`);
            console.log(`Swagger documentation available at http://localhost:${PORT}/api-docs`);

            // Start periodic tasks
            schedulerService.initialize();
        });
    } catch (error) {
        console.error('Failed to start the server:', error);
        process.exit(1);
    }
};
if (!process.env.NODE_ENV || (process.env.NODE_ENV && process.env.NODE_ENV !== 'test')){
    startServer();
}


export default app;