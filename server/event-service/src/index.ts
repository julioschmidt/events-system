import express from 'express';
import eventRouter from './routes/event.routes';
import sequelize from './database.connection';
import registrationRouter from './routes/registration.routes';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import path from 'path';

const app = express();

app.use(express.json());
app.use('/events', eventRouter);
app.use('/registrations', registrationRouter);
const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'API de Eventos',
      version: '1.0.0',
      description: 'Documentação da API',
    },
  },
  apis: [path.join(__dirname, 'routes/*.ts'), path.join(__dirname, 'routes/*.js')], // Caminho para arquivos com comentários JSDoc
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Conectar ao banco de dados e iniciar o servidor
sequelize
  .authenticate()
  .then(() => {
    console.log('Conexão com o banco de dados bem-sucedida');
    app.listen(3002, () => {
      console.log('Event Service rodando na porta 3002');
    });
  })
  .catch((error) => {
    console.error('Erro ao conectar ao banco de dados:', error);
  });

  sequelize.sync().then(() => {
    console.log('Tabelas sincronizadas');
  });