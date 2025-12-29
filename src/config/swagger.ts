import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Order Management API',
      version: '1.0.0',
      description: 'API para gerenciamento de pedidos laboratoriais com autenticação JWT e controle de estado',
      contact: {
        name: 'API Support',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
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
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: '507f1f77bcf86cd799439011',
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'user@example.com',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Service: {
          type: 'object',
          required: ['name', 'value'],
          properties: {
            name: {
              type: 'string',
              example: 'Exame de sangue',
            },
            value: {
              type: 'number',
              example: 100.50,
            },
            status: {
              type: 'string',
              enum: ['PENDING', 'DONE'],
              default: 'PENDING',
            },
          },
        },
        Order: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: '507f1f77bcf86cd799439011',
            },
            lab: {
              type: 'string',
              example: 'Lab XYZ',
            },
            patient: {
              type: 'string',
              example: 'João Silva',
            },
            customer: {
              type: 'string',
              example: 'Cliente ABC',
            },
            state: {
              type: 'string',
              enum: ['CREATED', 'ANALYSIS', 'COMPLETED'],
              example: 'CREATED',
            },
            status: {
              type: 'string',
              enum: ['ACTIVE', 'DELETED'],
              example: 'ACTIVE',
            },
            services: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Service',
              },
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              example: 'Error message',
            },
            details: {
              type: 'string',
              example: 'Detailed error information',
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.ts', './src/routes/*.swagger.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
