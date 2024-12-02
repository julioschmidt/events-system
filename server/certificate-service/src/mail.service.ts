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

export async function sendCheckinEmail(eventTitle: string, date: string, userEmail: string) {
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
    subject: 'Checkin no evento',
    text: `Você fez checkin no evento ${eventTitle} em ${date}, obrigado pela presença!`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log('Erro ao enviar e-mail:', error);
    } else {
      console.log('E-mail enviado:', info.response);
    }
  });
}

export async function sendRegistrationEmail(eventTitle: string, eventDate: string, userEmail: string) {
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
    subject: 'Inscrição no evento',
    text: `Você se inscreveu no evento ${eventTitle} que ocorrerá em ${eventDate}, obrigado pela inscrição!`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log('Erro ao enviar e-mail:', error);
    } else {
      console.log('E-mail enviado:', info.response);
    }
  });
}

export async function sendCancelationEmail(eventTitle: string, eventDate: string, userEmail: string) {
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
    subject: 'Cancelamento de inscrição',
    text: `Você cancelou a inscrição no evento ${eventTitle} que ocorreria em ${eventDate}, lamentamos a sua ausência!`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log('Erro ao enviar e-mail:', error);
    } else {
      console.log('E-mail enviado:', info.response);
    }
  });
}