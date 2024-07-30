require('dotenv').config();
import express from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import authRoutes from './modules/user/routes/authRoutes';
import userRoutes from './modules/user/routes/userRoutes';
import passport from './modules/user/services/socialAuth';
import session from 'express-session';
import bearerMiddleware from './middleware/bearerMiddleware';

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

    // Session setup for Passport
    app.use(session({
        secret: process.env.SESSION_SECRET as string,
        resave: false,
        saveUninitialized: false
    }));

    // Initialize Passport
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(bearerMiddleware);

    // Swagger setup
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

    if(middleware && middleware.length > 0) {
        middleware.forEach(m => app.use(m));
    }
    return app;
}

const app = configureApp();

// Existing Swagger documentation...

// Use the routes
app.use('/auth', authRoutes);
app.use('/users', userRoutes);

// Social authentication routes
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => {
        // Successful authentication, redirect or send token
        res.json({ user: req.user, token: (req.user as any).token });
    }
);

// Similar routes for Facebook and Instagram can be added here

app.get('/', (req, res) => {
    res.send('Welcome to the User Management API');
});

if (!process.env.NODE_ENV || (process.env.NODE_ENV && process.env.NODE_ENV !== 'test')) {
    app.listen(PORT, () => {
        console.log(`Express app running on port ${PORT}`);
        console.log(`Swagger documentation available at http://localhost:${PORT}/api-docs`);
    });
}

export default app;