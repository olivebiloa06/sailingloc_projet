const Stripe = require("stripe");

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

exports.createCheckoutSession = async ({ booking }) => {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",

    line_items: [
      {
        price_data: {
          currency: "eur",
          product_data: {
            name: `Réservation SailingLoc n°${booking.id}`,
            description: "Paiement de réservation de bateau",
          },
          unit_amount: Math.round(booking.montantTotal * 100),
        },
        quantity: 1,
      },
    ],

    metadata: {
      bookingId: booking.id,
      userId: booking.userId,
    },

    success_url: `${process.env.FRONTEND_URL}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.FRONTEND_URL}/booking/cancel`,
  });

  return session;
};