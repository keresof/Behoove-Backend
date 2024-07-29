import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Your API',
            version: '1.0.0',
            description: 'API documentation for your Express application',
        },
        servers: [
            {
                url: 'http://localhost:3030', // Update this to your server URL
            },
        ],
    },
    apis: ['./modules/user/routes/*.ts'], // Path to the API routes
};

const specs = swaggerJsdoc(options);

export { swaggerUi, specs };