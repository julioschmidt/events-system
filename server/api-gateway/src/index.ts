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
  // Adicione estas configurações importantes
  router: {
    '/api/users': 'http://user-service:3001',
    '/api/events': 'http://event-service:3002',
    '/api/registrations': 'http://event-service:3002',
    '/api/certificates': 'http://certificate-service:3003',
    '/api/mails': 'http://certificate-service:3003'
  },
  pathRewrite: {
    '^/api/users': '/users',
    '^/api/events': '/events',
    '^/api/registrations': '/registrations', 
    '^/api/certificates': '/certificates',
    '^/api/mails': '/mails'
  },
  on: {
    proxyReq: (proxyReq: any, req: any) => {
      if (req.body && (req.method === 'POST' || req.method === 'PUT')) {
        const bodyData = JSON.stringify(req.body);
        proxyReq.setHeader('Content-Type', 'application/json');
        proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
        proxyReq.write(bodyData);
      }

      if (req.headers['authorization']) {
        proxyReq.setHeader('Authorization', req.headers['authorization']);
      }
    },
    error: (err: any, req: any, res: any) => {
      console.error('Proxy error:', err);
      res.status(500).json({ message: 'Proxy error', error: err.message });
    }
  }
};

app.use('/api/users', createProxyMiddleware(proxyOptions));
app.use('/api/events', createProxyMiddleware(proxyOptions));
app.use('/api/registrations', createProxyMiddleware(proxyOptions));
app.use('/api/certificates', createProxyMiddleware(proxyOptions));
app.use('/api/mails', createProxyMiddleware(proxyOptions));

// Inicia o servidor na porta 3000
app.listen(3000, () => {
  console.log('API Gateway rodando na porta 3000');
});