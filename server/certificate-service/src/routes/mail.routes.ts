import { Router } from 'express';
import axios from 'axios';	
import { sendCertificateEmail } from '../mail.service';
import Certificate from '../certificate.model';
import verifyToken from '../auth.middleware';

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

const mailRouter = Router();

/**
 * @swagger
 * /mail:
 *   post:
 *     summary: Envia o certificado por e-mail para o usuário
 *     tags: [Correio]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: integer
 *               eventId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: E-mail com o certificado enviado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 email:
 *                   type: string
 *                   description: E-mail enviado
 *       404:
 *         description: Certificado não encontrado
 *       500:
 *         description: Erro ao acessar o banco de dados
 */
mailRouter.post('/', verifyToken, async (req, res) => {
    try {
      const { userId, eventId } = req.body;

      const userMail = req.user!.email;

      const certificate = await Certificate.findOne({ where: { userId, eventId }, raw: true });

      if (!certificate) {
        return res.status(404).send('Certificado não encontrado');
      }

      const email = await sendCertificateEmail(userMail, certificate.certificadoCode);
      res.json(email);
    } catch (error) {
      console.log(error);
      res.status(500).send('Erro ao acessar o banco de dados');
    }
  });

export default mailRouter;