import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'WhatsApp Clone API',
      version: '1.0.0',
      description: 'API para la aplicación de mensajería'
    },
    servers: [{ url: 'https://whatsapp-clone-backend-qcw9.onrender.com' }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [{ bearerAuth: [] }]
  },
  apis: ['./routes/*.js']
};

export const specs = swaggerJsdoc(options);