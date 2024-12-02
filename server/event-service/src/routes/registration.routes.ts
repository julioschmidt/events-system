import axios from 'axios';
import e, { Router } from 'express';
import Registration from '../models/registration.model';
import Event from '../models/event.model';
import verifyToken from '../auth.middleware';

const registrationRouter = Router();

/**
 * @swagger
 * /registrations:
 *   post:
 *     summary: Realiza a inscrição de um usuário em um evento
 *     tags: [Inscrições]
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
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Inscrição realizada com sucesso
 *       500:
 *         description: Erro ao realizar inscrição
 */
registrationRouter.post('/', verifyToken, async (req, res) => {
  try {
    const {userId, eventId, status} = req.body;

    const registrationExists = await Registration.findOne({where: {userId, eventId}});

    console.log(registrationExists);
    console.log(userId, eventId, status);

    if (registrationExists && registrationExists.get('status') == status) {
      return res.status(200).send('Usuário já inscrito no evento');
    } 
    
    if (registrationExists && registrationExists.status != status) {
      await Registration.update(
        { status },
        { where: { id: registrationExists.get('id') } }
      );
      return res.status(200).send('Status de inscrição atualizado');
    }
    
    const registration = await Registration.create({ userId, eventId, status: status ?? 'ACTIVE' });
    return res.json(registration);
    
  } catch (error) {
    console.log(error)
    res.status(500).send('Erro ao acessar o banco de dados');
  }
});

/**
 * @swagger
 * /registrations/checkin:
 *   post:
 *     summary: Realiza o check-in de um usuário em um evento
 *     tags: [Inscrições]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               eventId:
 *                 type: integer
 *               userId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Check-in realizado com sucesso
 *       404:
 *         description: Inscrição não encontrada ou não ativa
 *       500:
 *         description: Erro ao realizar check-in
 */
registrationRouter.post('/checkin', async (req, res) => {
  const { eventId, userId } = req.body;

  try {

    // Verificar se o usuário está inscrito no evento
    const registration = await Registration.findOne({
      where: { userId: Number(userId), eventId: Number(eventId), status: 'ACTIVE' },
      raw: true
    });
    
    if (!registration) {
      return res.status(404).send('Inscrição não encontrada ou não ativa');
    }
    
    // Atualizar diretamente no banco de dados
    await Registration.update(
      { status: 'CHECKED_IN' },
      { where: { id: registration.id } }
    );
    
    res.status(200).json({ message: 'Check-in realizado com sucesso' });
    
  } catch (error) {
    console.error(error);
    res.status(500).send('Erro ao realizar check-in');
  }
});

/**
 * @swagger
 * /registrations/by-event/{eventId}:
 *   get:
 *     summary: Retorna todas as inscrições de um evento
 *     tags: [Inscrições]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do evento
 *     responses:
 *       200:
 *         description: Lista de inscrições do evento
 *       500:
 *         description: Erro ao acessar o banco de dados
 */
registrationRouter.get('/by-event/:eventId', verifyToken, async (req, res) => {
  try {
    const {eventId} = req.params;
    const registrations = await Registration.findAll({where: {eventId}, raw: true});
    res.json(registrations);
  } catch (error) {
    console.log(error)
    res.status(500).send('Erro ao acessar o banco de dados');
  }
});

/**
 * @swagger
 * /registrations/{userId}/checkins:
 *   get:
 *     summary: Retorna todos os check-ins de um usuário
 *     tags: [Inscrições]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de check-ins do usuário
 *       500:
 *         description: Erro ao acessar o banco de dados
 */
registrationRouter.get('/:userId/checkins', verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const checkins = await Registration.findAll({
      where: { userId, status: 'CHECKED_IN' },  // Considerando 'CHECKED_IN' como status de check-in
      include: { model: Event, as: 'event' }
    });
    res.json(checkins);
  } catch (error) {
    console.error(error);
    res.status(500).send('Erro ao acessar o banco de dados');
  }
});

/**
 * @swagger
 * /registrations/{userId}/{eventId}:
 *   get:
 *     summary: Retorna a inscrição de um usuário em um evento
 *     tags: [Inscrições]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do usuário
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do evento
 *     responses:
 *       200:
 *         description: Inscrição encontrada
 *       500:
 *         description: Erro ao acessar o banco de dados
 */
registrationRouter.get('/:userId/:eventId', verifyToken, async (req, res) => {
  try {
    const {userId, eventId} = req.params;
    const registration = await Registration.findOne({where: {userId, eventId}});
    res.json(registration);
  } catch (error) {
    res.status(500).send('Erro ao acessar o banco de dados');
  }
});

/**
 * @swagger
 * /registrations/{userId}:
 *   get:
 *     summary: Retorna todas as inscrições de um usuário
 *     tags: [Inscrições]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do usuário
 *     responses:
 *       200:
 *         description: Lista de inscrições do usuário
 *       500:
 *         description: Erro ao acessar o banco de dados
 */
registrationRouter.get('/:userId', verifyToken, async (req, res) => {
  try {
    const {userId} = req.params;
    const registration = await Registration.findAll({where: {userId, status: 'ACTIVE'}, include: { model: Event, as: 'event' }});
    res.json(registration);
  } catch (error) {
    console.log(error);
    res.status(500).send('Erro ao acessar o banco de dados');
  }
});

/**
 * @swagger
 * /registrations/{id}:
 *   delete:
 *     summary: Deleta uma inscrição
 *     tags: [Inscrições]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da inscrição
 *     responses:
 *       200:
 *         description: Inscrição deletada
 *       500:
 *         description: Erro ao deletar inscrição
 */
registrationRouter.delete('/:id', verifyToken, async (req, res) => {
  try {
    const {id} = req.params;
    const registration = await Registration.destroy({where: {id}});
    res.json(registration);
  } catch (error) {
    res.status(500).send('Erro ao acessar o banco de dados');
  }
});

/**
 * @swagger
 * /registrations:
 *   get:
 *     summary: Retorna a lista de inscrições
 *     tags: [Inscrições]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de inscrições cadastradas
 *       500:
 *         description: Erro ao acessar o banco de dados
 */
registrationRouter.get('/', verifyToken, async (req, res) => {
  try {
    const registrations = await Registration.findAll();
    res.json(registrations);
  } catch (error) {
    res.status(500).send('Erro ao acessar o banco de dados');
  }
});

export default registrationRouter;