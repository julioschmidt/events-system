import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const SECRET_KEY = 'secreta';  // A mesma chave secreta usada para gerar o token

type UserWithoutPassword = {
  email: string;
  id: number;
  admin: boolean;
  name: string;
};

declare global {
  namespace Express {
    interface Request {
      user?: UserWithoutPassword;
    }
  }
}

// Middleware para verificar o token JWT
function verifyToken(req: Request, res: Response, next: NextFunction) {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) {
    return res.status(403).json({ message: 'Token não fornecido' });
  }

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Token inválido' });
    }

    // Adiciona as informações do usuário decodificado à requisição
    req.user = decoded as UserWithoutPassword;
    next();
  });
}

export default verifyToken;