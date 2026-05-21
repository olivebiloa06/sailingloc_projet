const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

exports.sendEmail = async ({ to, subject, html }) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
    });

    return info;
  } catch (error) {
    console.error("Erreur envoi email :", error.message);
    throw error;
  }
};

exports.sendBookingConfirmation = async (userEmail, booking) => {
  return exports.sendEmail({
    to: userEmail,
    subject: "Confirmation de votre réservation SailingLoc",
    html: `
      <h2>Réservation créée</h2>
      <p>Votre réservation a bien été créée.</p>
      <p>Réservation n° ${booking.id}</p>
      <p>Statut : ${booking.statut}</p>
    `,
  });
};

exports.sendPaymentConfirmation = async (userEmail, payment) => {
  return exports.sendEmail({
    to: userEmail,
    subject: "Paiement confirmé - SailingLoc",
    html: `
      <h2>Paiement confirmé</h2>
      <p>Votre paiement a bien été enregistré.</p>
      <p>Montant : ${payment.montant} €</p>
      <p>Statut : ${payment.statut}</p>
    `,
  });
};