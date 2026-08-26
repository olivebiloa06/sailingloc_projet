import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../services/api";
import { resolveImageUrl } from "../utils/assets";
import { boatAltText } from "../utils/boatAlt";
import BoatMark from "../components/BoatMark";

function formatDate(value) {
  return new Date(value).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function Reservation() {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [payingStripe, setPayingStripe] = useState(false);
  const [payingPaypal, setPayingPaypal] = useState(false);
  const [payError, setPayError] = useState("");

  useEffect(() => {
    let active = true;
    api.get(`/bookings/${id}`)
      .then(({ data }) => { if (active) setBooking(data.booking); })
      .catch((err) => {
        if (active) setError(err.response?.data?.message || "Impossible de récupérer cette réservation.");
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id]);

  const handleStripe = async () => {
    setPayError("");
    setPayingStripe(true);
    try {
      const { data } = await api.post(`/payments/stripe/create-session/${id}`);
      window.location.href = data.url;
    } catch (err) {
      setPayError(err.response?.data?.message || "Impossible de lancer le paiement Stripe.");
    } finally {
      setPayingStripe(false);
    }
  };

  const handlePaypal = async () => {
    setPayError("");
    setPayingPaypal(true);
    try {
      const { data } = await api.post(`/payments/paypal/create-order/${id}`);
      if (data.url) {
        window.location.href = data.url;
      } else {
        setPayError("Impossible d'obtenir l'URL PayPal. Vérifie la configuration PAYPAL_CLIENT_ID.");
      }
    } catch (err) {
      setPayError(err.response?.data?.message || "Impossible de lancer le paiement PayPal.");
    } finally {
      setPayingPaypal(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-gray-500">
        Chargement...
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="mx-auto max-w-lg px-6 py-12">
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error || "Réservation introuvable."}
        </div>
        <Link to="/boats" className="mt-4 block text-sm text-sky">
          ← Retour aux bateaux
        </Link>
      </div>
    );
  }

  const boat = booking.Boat;
  const image = resolveImageUrl(boat?.imageUrl);
  const alreadyPaid = booking.statut === "confirmee";

  return (
    <div className="mx-auto max-w-lg px-6 py-12">
      <h1 className="font-heading text-2xl font-semibold text-navy">
        Récapitulatif de réservation
      </h1>

      <div className="mt-6 flex gap-4 rounded-xl border border-gray-200 bg-white p-4">
        <div className="h-20 w-28 shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-navy to-sky">
          {image ? (
            <img src={image} alt={boatAltText(boat)} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center">
              <BoatMark className="h-8 w-8 text-white/40" />
            </div>
          )}
        </div>
        <div>
          <h2 className="font-heading text-base font-semibold text-navy">
            {boat?.nom || "Bateau"}
          </h2>
          <p className="mt-1 text-sm text-gray-500">{boat?.localisation}</p>
          <p className="mt-1 text-sm text-gray-500">
            Du {formatDate(booking.dateDebut)} au {formatDate(booking.dateFin)}
          </p>
          <p className="mt-2 text-base font-semibold text-navy">
            {booking.montantTotal} €
          </p>
        </div>
      </div>

      {alreadyPaid ? (
        <div className="mt-6 rounded-xl bg-green-50 px-4 py-4 text-sm text-green-700">
          Cette réservation est déjà confirmée et payée.
          <Link to="/mes-reservations" className="mt-2 block font-medium text-sky">
            Voir mes réservations →
          </Link>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          <p className="text-xs text-gray-400 text-center">
            Vous ne serez débité qu'en cas d'acceptation du propriétaire.
          </p>

          {payError && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
              {payError}
            </div>
          )}

          <button
            type="button"
            onClick={handleStripe}
            disabled={payingStripe || payingPaypal}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-navy py-3 text-sm font-semibold text-white transition hover:bg-navy-light disabled:opacity-50"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-white">
              <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z" />
            </svg>
            {payingStripe ? "Redirection..." : "Payer par carte bancaire"}
          </button>

          <button
            type="button"
            onClick={handlePaypal}
            disabled={payingStripe || payingPaypal}
            className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-[#0070ba] bg-[#0070ba] py-3 text-sm font-semibold text-white transition hover:bg-[#005ea6] disabled:opacity-50"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-white" xmlns="http://www.w3.org/2000/svg">
              <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c1.379 3.087.417 6.93-3.034 8.826l-.037.023c-.54.31-.82.964-.695 1.578l.752 3.822c.08.406.44.695.854.695h3.12c.524 0 .968-.382 1.05-.9l1.326-8.373c.213-1.338-.15-2.794-2.729-5.13z" />
            </svg>
            {payingPaypal ? "Redirection..." : "Payer avec PayPal"}
          </button>

          <Link
            to={`/boats/${boat?.id}`}
            className="block text-center text-xs text-gray-400 hover:text-gray-600"
          >
            ← Retour à la fiche bateau
          </Link>
        </div>
      )}
    </div>
  );
}
