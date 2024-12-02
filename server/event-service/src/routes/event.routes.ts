import { Router } from 'express';
import Event from '../models/event.model';
import verifyToken from '../auth.middleware';

const eventRouter = Router();

/**
 * @swagger
 * /events:
 *   get:
 *     summary: Retorna a lista de eventos
 *     tags: [Eventos]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de todos os eventos cadastrados
 *       500:
 *         description: Erro ao acessar o banco de dados
 */
eventRouter.get('/', verifyToken, async (req, res) => {
  try {
    const events = await Event.findAll();
    res.json(events);
  } catch (error) {
    res.status(500).send('Erro ao acessar o banco de dados');
  }
});

/**
 * @swagger
 * /events/{id}:
 *   get:
 *     summary: Retorna um evento específico pelo ID
 *     tags: [Eventos]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do evento
 *     responses:
 *       200:
 *         description: Detalhes do evento especificado
 *       404:
 *         description: Evento não encontrado
 *       500:
 *         description: Erro ao acessar o banco de dados
 */
eventRouter.get('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findOne({ where: { id } });
    res.json(event);
  } catch (error) {
    console.log(error);
    res.status(500).send('Erro ao acessar o banco de dados');
  }
});

export default eventRouter;
