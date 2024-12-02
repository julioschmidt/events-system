import nodemailer from 'nodemailer';

export async function sendCertificateEmail(userEmail: string, certificadoCode: string) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',  // Ou outro serviço de e-mail
    auth: {
      user: 'huliio.schmidt@gmail.com',
      pass: 'svos kxwq vjgr xaie',
    },
  });

  const mailOptions = {
    from: 'huliio.schmidt@gmail.com',
    to: userEmail,
    subject: 'Seu Certificado de Participação',
    text: `Parabéns! Você concluiu o evento. Acesse seu certificado pelo link: 
    http://localhost:5173/validate-certificate/${certificadoCode}`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log('Erro ao enviar e-mail:', error);
    } else {
      console.log('E-mail enviado:', info.response);
    }
  });
}