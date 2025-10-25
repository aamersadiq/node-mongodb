import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

/**
 * Swagger configuration
 */
const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Banking API',
      version: '1.0.0',
      description: 'API for banking operations',
      contact: {
        name: 'API Support',
        email: 'support@banking-api.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  },
  apis: [
    './src/api/routes/*.ts',
    './src/api/controllers/*.ts'
  ]
};

const swaggerSpec = swaggerJSDoc(options);

/**
 * Setup Swagger UI
 */
export const setupSwagger = (app: Express): void => {
  // Swagger UI route
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Banking API Documentation'
  }));

  // API Documentation in JSON format
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  console.log(`Swagger UI available at http://localhost:${process.env.PORT || 3000}/api-docs`);
};