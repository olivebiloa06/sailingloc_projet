const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");
const https = require("https");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: false,
  // Render a un support IPv6 sortant instable : sans ça, Node essaie de
  // joindre smtp.gmail.com via une adresse IPv6 et plante avec ENETUNREACH.
  // family: 4 force une connexion IPv4, qui fonctionne de manière fiable.
  family: 4,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD || process.env.EMAIL_PASS,
  },
});

// Vérifie la connexion SMTP au démarrage du serveur, pour voir l'erreur
// dans les logs Render IMMÉDIATEMENT plutôt que d'attendre qu'un utilisateur réserve.
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ SMTP indisponible au démarrage :", error.message);
    console.error("   -> Vérifie EMAIL_USER et EMAIL_PASSWORD sur Render (Environment).");
  } else {
    console.log("✅ SMTP prêt à envoyer des emails (compte:", process.env.EMAIL_USER, ")");
  }
});

const isProduction = process.env.NODE_ENV === "production";

// Télécharge un fichier depuis une URL et retourne un buffer.
// Vérifie maintenant le code de statut HTTP pour ne jamais joindre une page
// d'erreur Cloudinary (401/403) à la place du vrai PDF.
function fetchBuffer(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        if (res.statusCode && res.statusCode >= 400) {
          reject(new Error(`Échec téléchargement contrat : HTTP ${res.statusCode} sur ${url}`));
          res.resume();
          return;
        }
        const chunks = [];
        res.on("data", (chunk) => chunks.push(chunk));
        res.on("end", () => resolve(Buffer.concat(chunks)));
        res.on("error", reject);
      })
      .on("error", reject);
  });
}

exports.sendEmail = async ({ to, subject, html, attachments = [] }) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || `"SailingLoc" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
      attachments,
    });
    console.log(`✅ Email envoyé à ${to} — messageId: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    // Log détaillé et explicite : on affiche le code d'erreur SMTP s'il existe,
    // ça permet de distinguer immédiatement les causes courantes.
    console.error("❌ Erreur envoi email vers", to, ":", error.message);
    if (error.code) console.error("   Code erreur SMTP:", error.code);
    if (error.responseCode) console.error("   Code réponse SMTP:", error.responseCode);
    if (error.code === "EAUTH" || error.responseCode === 535) {
      console.error("   -> Identifiants SMTP refusés. Vérifie que EMAIL_PASSWORD est bien");
      console.error("      le mot de passe d'application à 16 caractères (sans espaces),");
      console.error("      pas le mot de passe Gmail normal.");
    }
    // On ne relance plus l'erreur en silence : on la retourne pour que
    // le controller appelant puisse décider quoi faire (log, retry, alerte...).
    return { success: false, error: error.message };
  }
};

exports.sendPaymentConfirmation = async (userEmail, payment, booking, contract) => {
  const attachments = [];

  if (contract?.urlPdf) {
    try {
      if (isProduction && contract.urlPdf.startsWith("http")) {
        const buffer = await fetchBuffer(contract.urlPdf);
        attachments.push({
          filename: `contrat-sailingloc-${booking?.id || ""}.pdf`,
          content: buffer,
          contentType: "application/pdf",
        });
      } else {
        const contractsDir = path.join(__dirname, "../../uploads/contracts");
        const filePath = path.join(contractsDir, contract.urlPdf);
        if (fs.existsSync(filePath)) {
          attachments.push({
            filename: `contrat-sailingloc-${booking?.id || ""}.pdf`,
            path: filePath,
            contentType: "application/pdf",
          });
        }
      }
    } catch (e) {
      // On log clairement que le contrat n'a pas pu être joint, sans bloquer
      // l'envoi de l'email de confirmation lui-même (mieux vaut un email sans
      // pièce jointe qu'aucun email du tout).
      console.error("⚠️ Impossible d'attacher le contrat au mail:", e.message);
    }
  }

  const boat = booking?.Boat;
  const dateDebut = booking?.dateDebut
    ? new Date(booking.dateDebut).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
    : "—";
  const dateFin = booking?.dateFin
    ? new Date(booking.dateFin).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
    : "—";

  return exports.sendEmail({
    to: userEmail,
    subject: `✅ Réservation confirmée — ${boat?.nom || "Votre bateau"}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#1f2937">
        <div style="background:#0A2A43;padding:24px 32px;border-radius:12px 12px 0 0">
          <h1 style="color:#fff;font-size:22px;margin:0">SailingLoc</h1>
        </div>
        <div style="background:#f9fafb;padding:32px;border-radius:0 0 12px 12px">
          <h2 style="color:#0A2A43;font-size:20px">Paiement confirmé ✅</h2>
          <p style="color:#4b5563">Votre réservation est validée. Voici le récapitulatif :</p>

          <table style="width:100%;border-collapse:collapse;margin:20px 0;font-size:14px">
            <tr><td style="padding:8px 0;color:#6b7280;border-bottom:1px solid #e5e7eb">Bateau</td>
                <td style="padding:8px 0;font-weight:600;color:#0A2A43;border-bottom:1px solid #e5e7eb;text-align:right">${boat?.nom || "—"}</td></tr>
            <tr><td style="padding:8px 0;color:#6b7280;border-bottom:1px solid #e5e7eb">Localisation</td>
                <td style="padding:8px 0;color:#374151;border-bottom:1px solid #e5e7eb;text-align:right">${boat?.localisation || "—"}</td></tr>
            <tr><td style="padding:8px 0;color:#6b7280;border-bottom:1px solid #e5e7eb">Arrivée</td>
                <td style="padding:8px 0;color:#374151;border-bottom:1px solid #e5e7eb;text-align:right">${dateDebut}</td></tr>
            <tr><td style="padding:8px 0;color:#6b7280;border-bottom:1px solid #e5e7eb">Départ</td>
                <td style="padding:8px 0;color:#374151;border-bottom:1px solid #e5e7eb;text-align:right">${dateFin}</td></tr>
            <tr><td style="padding:8px 0;color:#6b7280;border-bottom:1px solid #e5e7eb">Voyageurs</td>
                <td style="padding:8px 0;color:#374151;border-bottom:1px solid #e5e7eb;text-align:right">${booking?.nombrePersonnes || 1}</td></tr>
            <tr><td style="padding:8px 0;font-weight:700;color:#0A2A43">Montant total</td>
                <td style="padding:8px 0;font-weight:700;color:#0A2A43;text-align:right">${booking?.montantTotal || payment?.montant || "—"} €</td></tr>
          </table>

          ${contract && attachments.length ? `<p style="color:#059669;font-size:13px">📄 Votre contrat de location est joint à cet email en PDF.</p>` : ""}

          <a href="${process.env.FRONTEND_URL}/mes-reservations"
             style="display:inline-block;margin-top:16px;background:#0A2A43;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px">
            Voir mes réservations
          </a>

          <p style="margin-top:32px;font-size:12px;color:#9ca3af">
            Bonne navigation !<br>L'équipe SailingLoc — Agence Pandawan
          </p>
        </div>
      </div>
    `,
    attachments,
  });
};

exports.sendOwnerBookingNotification = async (ownerEmail, booking) => {
  const boat = booking?.Boat;
  const renter = booking?.User;
  const dateDebut = booking?.dateDebut
    ? new Date(booking.dateDebut).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
    : "—";
  const dateFin = booking?.dateFin
    ? new Date(booking.dateFin).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
    : "—";
  const revenuNet = booking?.montantTotal ? Math.round(booking.montantTotal * 0.9) : "—";

  return exports.sendEmail({
    to: ownerEmail,
    subject: `💰 Nouvelle réservation confirmée — ${boat?.nom || "Votre bateau"}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#1f2937">
        <div style="background:#0A2A43;padding:24px 32px;border-radius:12px 12px 0 0">
          <h1 style="color:#fff;font-size:22px;margin:0">SailingLoc</h1>
        </div>
        <div style="background:#f9fafb;padding:32px;border-radius:0 0 12px 12px">
          <h2 style="color:#0A2A43;font-size:20px">Réservation confirmée 🎉</h2>
          <p style="color:#4b5563">Une nouvelle réservation a été confirmée pour votre bateau.</p>

          <table style="width:100%;border-collapse:collapse;margin:20px 0;font-size:14px">
            <tr><td style="padding:8px 0;color:#6b7280;border-bottom:1px solid #e5e7eb">Bateau</td>
                <td style="padding:8px 0;font-weight:600;color:#0A2A43;border-bottom:1px solid #e5e7eb;text-align:right">${boat?.nom || "—"}</td></tr>
            <tr><td style="padding:8px 0;color:#6b7280;border-bottom:1px solid #e5e7eb">Locataire</td>
                <td style="padding:8px 0;color:#374151;border-bottom:1px solid #e5e7eb;text-align:right">${renter?.prenom || ""} ${renter?.nom || ""}</td></tr>
            <tr><td style="padding:8px 0;color:#6b7280;border-bottom:1px solid #e5e7eb">Période</td>
                <td style="padding:8px 0;color:#374151;border-bottom:1px solid #e5e7eb;text-align:right">${dateDebut} → ${dateFin}</td></tr>
            <tr><td style="padding:8px 0;color:#6b7280;border-bottom:1px solid #e5e7eb">Montant brut</td>
                <td style="padding:8px 0;color:#374151;border-bottom:1px solid #e5e7eb;text-align:right">${booking?.montantTotal || "—"} €</td></tr>
            <tr><td style="padding:8px 0;color:#6b7280;border-bottom:1px solid #e5e7eb">Commission (10%)</td>
                <td style="padding:8px 0;color:#374151;border-bottom:1px solid #e5e7eb;text-align:right">−${booking?.commission || "—"} €</td></tr>
            <tr><td style="padding:8px 0;font-weight:700;color:#059669">Votre revenu net</td>
                <td style="padding:8px 0;font-weight:700;color:#059669;text-align:right">${revenuNet} €</td></tr>
          </table>

          <a href="${process.env.FRONTEND_URL}/mon-compte"
             style="display:inline-block;margin-top:16px;background:#0A2A43;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px">
            Voir mes réservations
          </a>

          <p style="margin-top:32px;font-size:12px;color:#9ca3af">
            Merci de faire confiance à SailingLoc !<br>L'équipe SailingLoc — Agence Pandawan
          </p>
        </div>
      </div>
    `,
  });
};

exports.sendBookingConfirmation = exports.sendPaymentConfirmation;