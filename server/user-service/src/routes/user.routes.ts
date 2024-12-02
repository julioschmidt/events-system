import { Router } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../user.model';
import verifyToken from '../auth.middleware';

const userRouter = Router();

const SECRET_KEY = 'secreta';  // Em produção, use uma chave segura!

// Função para autenticar o usuário
async function authenticateUser(email: string, password: string) {
  // Verificar se o usuário existe no banco de dados
  const user = await User.findOne({ where: { email }, raw: true });

  if (!user) {
    throw new Error('Usuário não encontrado');
  }

  // Comparar a senha fornecida com a senha armazenada (criptografada)
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new Error('Senha incorreta');
  }

  return user;
}

/**
 * @swagger
 * /users/token:
 *   get:
 *     summary: Verifica a validade do token JWT
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token válido
 *       401:
 *         description: Token inválido ou expirado
 */
userRouter.get('/token', verifyToken, async (req, res) => {
  try {
    res.json({ message: 'Token válido para acesso', data: req.user });
  } catch (error) {
    res.status(401).send('Token inválido');
  }
});

/**
 * @swagger
 * /users/login:
 *   post:
 *     summary: Realiza o login do usuário e retorna um token JWT
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login bem-sucedido e token JWT retornado
 *       401:
 *         description: Usuário não encontrado ou senha incorreta
 */
userRouter.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await authenticateUser(email, password);
    const token = jwt.sign(
      { id: user.id, email: user.email, admin: user.admin, name: user.name },
      SECRET_KEY,
      { expiresIn: '7d' }
    );
    res.json({ message: 'Login bem-sucedido', token, admin: user.admin });
  } catch (error: any) {
    res.status(401).json({ message: error.message });
  }
});

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Retorna a lista de usuários
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuários cadastrados
 */
userRouter.get('/', verifyToken, async (req, res) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (error) {
    res.status(500).send('Erro ao acessar o banco de dados');
  }
});

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Retorna um usuário específico pelo ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do usuário
 *     responses:
 *       200:
 *         description: Detalhes do usuário encontrado
 *       404:
 *         description: Usuário não encontrado
 */
userRouter.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findOne({ where: { id } });
    res.json(user);
  } catch (error) {
    res.status(404).send('Usuário não encontrado');
  }
});

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Cria um novo usuário
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               admin:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Usuário criado com sucesso
 *       400:
 *         description: Usuário já cadastrado
 */
userRouter.post('/', async (req, res) => {
  try {
    const { name, email, password, admin } = req.body;

    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      return res.status(400).send('Usuário já cadastrado');
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const user = await User.create({ name, email, password: hashedPassword, admin });
    res.status(201).json(user);
  } catch (error) {
    res.status(500).send('Erro ao criar usuário');
  }
});

export default userRouter;
