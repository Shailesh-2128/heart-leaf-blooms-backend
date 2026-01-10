const swaggerJsdoc = require('swagger-jsdoc');
const path = require('path');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Heart Leaf Blooms API',
            version: '1.0.0',
            description: 'API documentation for Heart Leaf Blooms Backend',
        },
        servers: [
            {
                url: 'http://localhost:7071', // Update this based on your actual PORT if needed
                description: 'Development server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
    },
    apis: [path.join(__dirname, '../routes/*.js')], // Absolute path to the API docs
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
