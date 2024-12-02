import { Router } from 'express';
import Certificate from '../certificate.model';
import { generateCertificate, validateCertificate } from '../certificate.service';
import verifyToken from '../auth.middleware';

const certificateRouter = Router();

/**
 * @swagger
 * /certificates/{code}:
 *   get:
 *     summary: Retorna um certificado específico pelo código
 *     tags: [Certificados]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: Código do certificado
 *     responses:
 *       200:
 *         description: Certificado encontrado e validado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 certificadoCode:
 *                   type: string
 *                 userId:
 *                   type: integer
 *                 eventId:
 *                   type: integer
 *       404:
 *         description: Certificado não encontrado
 *       400:
 *         description: Certificado inválido
 *       500:
 *         description: Erro ao acessar o banco de dados
 */
certificateRouter.get('/:code', verifyToken, async (req, res) => {
  try {
    const { code } = req.params;
    const certificate = await Certificate.findOne({ where: { certificadoCode: code } });

    if (!certificate) {
      return res.status(404).send('Certificado não encontrado');
    }

    const certificateValidated = await validateCertificate(certificate.certificadoCode);

    if (!certificateValidated) {
      return res.status(400).send('Certificado inválido');
    }

    res.json(certificate);
  } catch (error) {
    console.log(error);
    res.status(500).send('Erro ao acessar o banco de dados');
  }
});

/**
 * @swagger
 * /certificates:
 *   post:
 *     summary: Gera um certificado para um usuário em um evento
 *     tags: [Certificados]
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
 *         description: Certificado gerado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 certificadoCode:
 *                   type: string
 *                 userId:
 *                   type: integer
 *                 eventId:
 *                   type: integer
 *       500:
 *         description: Erro ao acessar o banco de dados
 */
certificateRouter.post('/', verifyToken, async (req, res) => {
  try {
    const { userId, eventId } = req.body;
    const certificate = await generateCertificate(userId, eventId);
    res.json(certificate);
  } catch (error) {
    res.status(500).send('Erro ao acessar o banco de dados');
  }
});

export default certificateRouter;
