import express from 'express';
import sequelize from './database.connection';
import certificateRouter from './routes/certificate.routes';
import mailRouter from './routes/mail.routes';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import path from 'path';
import cors from 'cors';

const app = express();

app.use(express.json()); // Para analisar o corpo da requisição como JSON
app.use(cors());
app.use('/certificates', certificateRouter);
app.use('/mails', mailRouter);
const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'API de Certificados',
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
    app.listen(3003, () => {
      console.log('Certificate Service rodando na porta 3003');
    });
  })
  .catch((error) => {
    console.error('Erro ao conectar ao banco de dados:', error);
  });

  sequelize.sync().then(() => {
    console.log('Tabelas sincronizadas');
  });