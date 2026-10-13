import nodemailer from 'nodemailer';
import { config } from '../config/env.config.js';
import { logger } from './logger.js';

const transporter = nodemailer.createTransport({
    host: config.mail.host,
    port: config.mail.port,
    secure: config.mail.port === 465,
    auth: {
        user: config.mail.user,
        pass: config.mail.pass
    }
});

export const sendTicketEmail = async (userEmail, eventTitle, reservationCode, quantity) => {
    try {
        const mailOptions = {
            from: config.mail.from,
            to: userEmail,
            subject: `Confirmación de inscripción: ${eventTitle}`,
            html: `
                <h1>¡Inscripción confirmada!</h1>
                <p>Te has inscrito exitosamente al evento <strong>${eventTitle}</strong>.</p>
                <p>Cantidad de lugares: ${quantity}</p>
                <p>Tu código de reserva es: <strong>${reservationCode}</strong></p>
                <p>¡Gracias por participar!</p>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        logger.info(`Email enviado a ${userEmail}: ${info.messageId}`);
        return info;
    } catch (error) {
        logger.warning(`Error enviando email a ${userEmail}: ${error.message}`);
    }
};

export const sendCancellationEmail = async (userEmail, eventTitle, reservationCode) => {
    try {
        const mailOptions = {
            from: config.mail.from,
            to: userEmail,
            subject: `Cancelación de inscripción: ${eventTitle}`,
            html: `
                <h1>Inscripción cancelada</h1>
                <p>Tu inscripción al evento <strong>${eventTitle}</strong> ha sido cancelada.</p>
                <p>Tu código de reserva era: <strong>${reservationCode}</strong></p>
                <p>Esperamos verte en futuros eventos.</p>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        logger.info(`Email de cancelación enviado a ${userEmail}: ${info.messageId}`);
        return info;
    } catch (error) {
        logger.warning(`Error enviando email de cancelación a ${userEmail}: ${error.message}`);
    }
};
