import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import fs from 'fs';
import { createProxyMiddleware, Options } from 'http-proxy-middleware';

const app = express();

const logStream = fs.createWriteStream('access.log', { flags: 'a' });

app.use(cors());
app.use(express.json());
app.use(morgan('combined', { stream: logStream }));

// Função para criar opções de proxy
const createProxyOptions = (target: string) => ({
  target: target,
  changeOrigin: true,
  pathRewrite: {
    '^/api': '',
  },
  on: {
    proxyReq: (proxyReq: any, req: any) => {
      // Log para debug
      console.log(`Proxying request to ${target}${req.url}`);
      proxyReq.setHeader('Content-Type', 'application/json');

      /* if (req.body && (req.method === 'POST' || req.method === 'PUT')) {
        const bodyData = JSON.stringify(req.body);
        proxyReq.write(bodyData);
      } */

      if (req.headers['authorization']) {
        proxyReq.setHeader('Authorization', req.headers['authorization']);
      }
    },
    error: (err: any, req: any, res: any) => {
      console.error('Proxy Error Details:', {
        message: err.message,
        stack: err.stack,
        code: err.code,
        target: err.target
      });

      // Verificar se res existe antes de usar
      if (res && res.status) {
        res.status(500).json({ 
          message: 'Proxy error', 
          error: err.message 
        });
      } else {
        console.error('Response object is undefined');
      }
    }
  }
});

// Configuração dos proxies com URLs completas e corretas
app.use('/api/users', createProxyMiddleware(createProxyOptions('http://user-service:3001/users')));
app.use('/api/events', createProxyMiddleware(createProxyOptions('http://event-service:3002/events')));
app.use('/api/registrations', createProxyMiddleware(createProxyOptions('http://event-service:3002/registrations')));
app.use('/api/certificates', createProxyMiddleware(createProxyOptions('http://certificate-service:3003/certificates')));
app.use('/api/mails', createProxyMiddleware(createProxyOptions('http://certificate-service:3003/mails')));

// Rota de teste para verificar se o gateway está funcionando
app.get('/', (req, res) => {
  res.json({ message: 'API Gateway is running' });
});

// Tratamento de erros global
app.use((err: any, req: any, res: any, next: any) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({ 
    message: 'Internal server error', 
    error: err.message 
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API Gateway rodando na porta ${PORT}`);
});