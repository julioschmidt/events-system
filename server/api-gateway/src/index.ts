import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import fs from 'fs';  // Importando o módulo fs
import { createProxyMiddleware, Options } from 'http-proxy-middleware';

const url = 'http://177.44.248.73'
const app = express();

// Cria o stream de escrita para o arquivo de log
const logStream = fs.createWriteStream('access.log', { flags: 'a' }); // O 'a' garante que o arquivo será aberto para anexar novos logs

app.use(cors());
app.use(express.json());

// Usando o morgan para registrar as requisições, salvando no arquivo de log
app.use(morgan('combined', { stream: logStream }));  // 'combined' é um formato padrão e bem detalhado

const proxyOptions = { 
  changeOrigin: true,
  on: {
    proxyReq: (proxyReq: any, req: any, res: any) => {
      // Passar body
      if (req.body) {
        const bodyData = JSON.stringify(req.body);
        proxyReq.setHeader('Content-Type', 'application/json');
        proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
        proxyReq.write(bodyData);
      }
      
      // Preservar headers de autenticação
      if (req.headers['authorization']) {
        proxyReq.setHeader('Authorization', req.headers['authorization']);
      }
    }
  }
};

app.use('/api/users', createProxyMiddleware({
  ...proxyOptions,
  target: 'http://user-service:3001/users'
}));

app.use('/api/events', createProxyMiddleware({
  ...proxyOptions,
  target: 'http://event-service:3001/events'
}));

app.use('/api/registrations', createProxyMiddleware({
  ...proxyOptions,
  target: 'http://event-service:3001/registrations'
}));

app.use('/api/certificates', createProxyMiddleware({
  ...proxyOptions,
  target: 'http://certificate-service:3001/certificates'
}));

app.use('/api/mails', createProxyMiddleware({
  ...proxyOptions,
  target: 'http://certificate-service:3001/mails'
}));

// Inicia o servidor na porta 3000
app.listen(3000, () => {
  console.log('API Gateway rodando na porta 3000');
});