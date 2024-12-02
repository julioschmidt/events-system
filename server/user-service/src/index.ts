import express from 'express';
import userRouter from './routes/user.routes';
import sequelize from './database.connection';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import path from 'path';

const app = express();

app.use(express.json()); // Para analisar o corpo da requisição como JSON
app.use('/users', userRouter);
const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'API de Usuários',
      version: '1.0.0',
      description: 'Documentação da API',
    },
  },
  apis: [path.join(__dirname, 'routes/*.ts')], // Caminho para arquivos com comentários JSDoc
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Conectar ao banco de dados e iniciar o servidor
sequelize
  .authenticate()
  .then(() => {
    console.log('Conexão com o banco de dados bem-sucedida');
    app.listen(3001, () => {
      console.log('User Service rodando na porta 3001');
    });
  })
  .catch((error) => {
    console.error('Erro ao conectar ao banco de dados:', error);
  });

  sequelize.sync().then(() => {
    console.log('Tabelas sincronizadas');
  });