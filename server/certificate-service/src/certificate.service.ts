import jwt from 'jsonwebtoken';
import Certificate from './certificate.model';

const SECRET_KEY = 'secreta';  // Em produção, use uma chave segura!

// Função para gerar o certificado
export async function generateCertificate(userId: number, eventId: number) {
  // Gerar um código único para o certificado
  const certificadoCode = jwt.sign({ userId, eventId }, SECRET_KEY, {
    expiresIn: '1y',  // O certificado é válido por 1 ano
  });

  // Salvar no banco de dados
  const certificate = await Certificate.create({
    userId,
    eventId,
    certificadoCode,
  });

  return certificate;
}

export async function validateCertificate(certificadoCode: string) {
  try {
    // Verificar o certificado no banco de dados
    const certificate = await Certificate.findOne({
      where: { certificadoCode },
    });

    if (!certificate) {
      return { valid: false, message: 'Certificado não encontrado' };
    }

    // Verificar validade do JWT
    jwt.verify(certificadoCode, SECRET_KEY);  // Se não for válido, erro será lançado

    return { valid: true, message: 'Certificado válido' };
  } catch (error) {
    return { valid: false, message: 'Certificado inválido ou expirado' };
  }
}

// Exemplo de uso
/* validateCertificate('código-do-certificado')
  .then(result => console.log(result))
  .catch(err => console.error(err)); */

// Exemplo de uso
/* generateCertificate(1, 101)  // Gerar certificado para o usuário 1 e evento 101
  .then(cert => console.log('Certificado gerado:', cert))
  .catch(err => console.error('Erro ao gerar certificado:', err)); */