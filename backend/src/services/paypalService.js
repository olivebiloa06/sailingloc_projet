// Intégration PayPal via l'API REST v2 directement (pas de SDK officiel
// ajouté : ça fait une dépendance de plus pour trois appels HTTP simples,
// et Node 24 a fetch nativement). Toujours en mode sandbox ici — c'est
// l'environnement de test PayPal, équivalent du mode test de Stripe.
const PAYPAL_API_BASE = "https://api-m.sandbox.paypal.com";

async function getAccessToken() {
  const auth = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
  ).toString("base64");

  const response = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    throw new Error(
      "Impossible de s'authentifier auprès de PayPal — vérifie PAYPAL_CLIENT_ID et PAYPAL_CLIENT_SECRET dans .env"
    );
  }

  const data = await response.json();
  return data.access_token;
}

// Crée une commande PayPal pour le montant exact de la réservation (jamais
// un montant fourni par le client) et fournit une URL d'approbation vers
// laquelle rediriger le navigateur, exactement comme session.url chez
// Stripe.
exports.createOrder = async ({ booking }) => {
  const accessToken = await getAccessToken();

  const response = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          custom_id: String(booking.id),
          description: `Réservation SailingLoc n°${booking.id}`,
          amount: {
            currency_code: "EUR",
            value: booking.montantTotal.toFixed(2),
          },
        },
      ],
      application_context: {
        return_url: `${process.env.FRONTEND_URL}/booking/success?provider=paypal`,
        cancel_url: `${process.env.FRONTEND_URL}/booking/cancel`,
      },
    }),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.message || "Échec de création de la commande PayPal");
  }

  return response.json();
};

// Finalise le paiement après que l'utilisateur a approuvé côté PayPal.
// Contrairement à Stripe (confirmé via webhook), PayPal en redirect simple
// se confirme par cet appel explicite juste après le retour sur le site.
exports.captureOrder = async (orderId) => {
  const accessToken = await getAccessToken();

  const response = await fetch(
    `${PAYPAL_API_BASE}/v2/checkout/orders/${orderId}/capture`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.message || "Échec de la capture du paiement PayPal");
  }

  return response.json();
};

// Utilisé par cancelBooking : un remboursement PayPal cible la capture (pas
// la commande), via son identifiant stocké dans Payment.referenceTransaction.
exports.refundCapture = async (captureId) => {
  const accessToken = await getAccessToken();

  const response = await fetch(
    `${PAYPAL_API_BASE}/v2/payments/captures/${captureId}/refund`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.message || "Échec du remboursement PayPal");
  }

  return response.json();
};