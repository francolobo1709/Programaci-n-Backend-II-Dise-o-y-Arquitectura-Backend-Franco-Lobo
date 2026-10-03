import nodemailer from 'nodemailer';
import { config } from '../config/env.config.js';

const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST || 'smtp.gmail.com',
    port: process.env.MAIL_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
    }
});

export const sendTicketEmail = async (userEmail, eventTitle, reservationCode, quantity) => {
    try {
        const mailOptions = {
            from: process.env.MAIL_FROM || '"Eventos API" <no-reply@eventos.com>',
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
        console.log(`Email enviado a ${userEmail}: ${info.messageId}`);
        return info;
    } catch (error) {
        console.error(`Error enviando email a ${userEmail}:`, error);
        // No arrojamos el error para no romper el flujo principal de creación,
        // pero en un sistema robusto se podría reencolar o manejar de otra forma.
    }
};

export const sendCancellationEmail = async (userEmail, eventTitle, reservationCode) => {
    try {
        const mailOptions = {
            from: process.env.MAIL_FROM || '"Eventos API" <no-reply@eventos.com>',
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
        console.log(`Email de cancelación enviado a ${userEmail}: ${info.messageId}`);
        return info;
    } catch (error) {
        console.error(`Error enviando email de cancelación a ${userEmail}:`, error);
    }
};
