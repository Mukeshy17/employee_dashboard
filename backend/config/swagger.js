import swaggerJSDoc from 'swagger-jsdoc';
import path from 'path';

const options = {
 definition: {
  openapi: '3.0.0',
  info: {
    title: 'Employee Management API',
    version: '1.0.0',
    description: 'API docs for Employee Management backend'
  },
  servers: [
    {
      url: `http://localhost:${process.env.PORT || 5000}/api`,
      description: 'Local server'
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
  },
  security: []
},
apis: [
  path.join(process.cwd(), 'routes', '*.js'),
  path.join(process.cwd(), 'routes', '**', '*.js'),
  path.join(process.cwd(), 'controllers', '*.js')
]

};

const swaggerSpec = swaggerJSDoc(options);
export default swaggerSpec;