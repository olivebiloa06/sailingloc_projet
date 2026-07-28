import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../hooks/useAuth";
import { resolveImageUrl } from "../utils/assets";
import BoatMark from "../components/BoatMark";

const BOAT_TYPE_LABELS = {
  voilier: "Voilier",
  bateau_moteur: "Bateau à moteur",
  catamaran: "Catamaran",
  yacht: "Yacht",
  semi_rigide: "Semi-rigide",
  autre: "Autre",
};

function diffInDays(dateDebut, dateFin) {
  if (!dateDebut || !dateFin) return 0;
  const start = new Date(dateDebut);
  const end = new Date(dateFin);
  const days = Math.round((end - start) / (1000 * 60 * 60 * 24));
  return days > 0 ? days : 0;
}

function formatLongDate(value) {
  return new Date(value).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// Convertit une date ISO ("2026-06-21T00:00:00.000Z") au format attendu par
// un <input type="date"> ("2026-06-21"), pour contraindre min/max.
function toInputDate(value) {
  return new Date(value).toISOString().slice(0, 10);
}

export default function BoatDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [boat, setBoat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [bookingForm, setBookingForm] = useState({
    dateDebut: "",
    dateFin: "",
    nombrePersonnes: 1,
  });
  const [bookingError, setBookingError] = useState("");
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(null);

  useEffect(() => {
    let active = true;

    const fetchBoat = async () => {
      setLoading(true);
      setNotFound(false);
      try {
        const { data } = await api.get(`/boats/${id}`);
        if (active) setBoat(data.boat);
      } catch {
        if (active) setNotFound(true);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchBoat();
    return () => {
      active = false;
    };
  }, [id]);

  const nombreJours = useMemo(
    () => diffInDays(bookingForm.dateDebut, bookingForm.dateFin),
    [bookingForm.dateDebut, bookingForm.dateFin]
  );

  // Calcul exact : prix du bateau par jour × nombre de jours.
  // Le prixJour est le tarif de location du bateau entier (pas par personne) —
  // c'est le modèle standard de la location nautique. La commission (10%)
  // est prélevée par SailingLoc sur le montant total.
  const sousTotal = boat && nombreJours > 0 ? nombreJours * boat.prixJour : 0;
  const commission = Math.round(sousTotal * 0.1);
  const totalEstime = sousTotal + commission;

  const isOwnBoat = user && boat && boat.User && boat.User.id === user.id;
  const availabilityWindow = boat?.availabilities?.[0] || null;

  const handleBookingChange = (key, value) => {
    setBookingForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setBookingError("");

    if (!user) {
      navigate("/login", { state: { from: { pathname: `/boats/${id}` } } });
      return;
    }

    if (!bookingForm.dateDebut || !bookingForm.dateFin) {
      setBookingError("Choisis une date de début et une date de fin.");
      return;
    }

    setBookingSubmitting(true);

    try {
      const { data } = await api.post("/bookings", {
        boatId: Number(id),
        dateDebut: bookingForm.dateDebut,
        dateFin: bookingForm.dateFin,
        nombrePersonnes: Number(bookingForm.nombrePersonnes) || 1,
      });
      setBookingSuccess(data.booking);
    } catch (err) {
      setBookingError(
        err.response?.data?.message ||
          "Impossible de créer la réservation pour le moment."
      );
    } finally {
      setBookingSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-16">
        <div className="h-72 animate-pulse rounded-2xl bg-gray-100" />
        <div className="mt-6 h-8 w-1/2 animate-pulse rounded bg-gray-100" />
        <div className="mt-3 h-4 w-1/3 animate-pulse rounded bg-gray-100" />
      </div>
    );
  }

  if (notFound || !boat) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-20 text-center">
        <h1 className="font-heading text-xl font-semibold text-navy">
          Ce bateau n'existe pas ou plus
        </h1>
        <Link
          to="/boats"
          className="mt-4 inline-block rounded-lg bg-navy px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-navy-light"
        >
          Retour à la liste
        </Link>
      </div>
    );
  }

  const image = resolveImageUrl(boat.imageUrl);

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <Link to="/boats" className="text-sm font-medium text-gray-500 hover:text-navy">
        ← Retour à la liste
      </Link>

      <div className="mt-4 grid gap-10 lg:grid-cols-[1fr_340px]">
        {/* INFO — colonne gauche */}
        <div>
          <div className="relative h-80 overflow-hidden rounded-2xl bg-gradient-to-br from-navy to-sky">
            {image ? (
              <img src={image} alt={boat.nom} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center">
                <BoatMark className="h-14 w-14 text-white/40" />
              </div>
            )}
          </div>

          <div className="mt-6 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="font-heading text-2xl font-semibold text-navy">
                {boat.nom}
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                {BOAT_TYPE_LABELS[boat.type] || boat.type} · {boat.localisation}
              </p>
            </div>
            {boat.avecSkipper && (
              <span className="rounded-full bg-cloud px-3 py-1 text-xs font-semibold text-navy">
                Avec skipper
              </span>
            )}
          </div>

          <div className="mt-6 flex gap-6 border-y border-gray-100 py-4 text-sm text-gray-600">
            <span>{boat.capacite} personnes max.</span>
            {boat.longueur && <span>{boat.longueur} m</span>}
          </div>

          <div className="mt-6">
            <h2 className="font-heading text-lg font-semibold text-navy">
              Description
            </h2>
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-gray-600">
              {boat.description}
            </p>
          </div>

          {boat.User && (
            <div className="mt-6 rounded-xl border border-gray-100 bg-cloud/60 p-4 text-sm text-gray-600">
              Proposé par{" "}
              <span className="font-medium text-navy">
                {boat.User.prenom} {boat.User.nom}
              </span>
            </div>
          )}
        </div>

        {/* RÉSERVATION — colonne droite, sticky */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <p className="font-heading text-xl font-semibold text-navy">
              {boat.prixJour} €
              <span className="text-sm font-normal text-gray-400">/jour</span>
            </p>

            {isOwnBoat ? (
              <div className="mt-4 space-y-2">
                <p className="rounded-lg bg-cloud px-4 py-3 text-sm text-gray-600">
                  C'est votre bateau — vous ne pouvez pas le réserver.
                </p>
              </div>
            ) : !user ? (
              <Link
                to="/login"
                className="mt-4 block rounded-lg bg-navy py-2.5 text-center text-sm font-semibold text-white hover:bg-navy-light"
              >
                Connexion pour contacter le propriétaire
              </Link>
            ) : bookingSuccess ? (
              <div className="mt-4 space-y-3">
                <p className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
                  Réservation créée (n°{bookingSuccess.id}). Il ne reste plus
                  qu'à régler le paiement.
                </p>
                <Link
                  to={`/mes-messages?with=${boat?.User?.id}&booking=${bookingSuccess.id}`}
                  className="block rounded-lg border border-navy py-2.5 text-center text-sm font-semibold text-navy transition hover:bg-cloud"
                >
                  💬 Contacter le propriétaire
                </Link>
                <Link
                  to={`/reservations/${bookingSuccess.id}`}
                  className="block rounded-lg bg-navy py-2.5 text-center text-sm font-semibold text-white transition hover:bg-navy-light"
                >
                  Continuer vers le paiement
                </Link>
              </div>
            ) : (
              <form onSubmit={handleBookingSubmit} className="mt-4 space-y-4">
                {bookingError && (
                  <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                    {bookingError}
                  </div>
                )}

                {/* Disponibilité affichée AVANT les champs de dates : pas
                    besoin de deviner une période au hasard et de se faire
                    rejeter — on sait déjà que le bateau est libre ici. */}
                {availabilityWindow ? (
                  <div className="rounded-lg bg-green-50 px-3 py-2 text-xs font-medium text-green-700">
                    Disponible du {formatLongDate(availabilityWindow.dateDebut)}{" "}
                    au {formatLongDate(availabilityWindow.dateFin)}
                  </div>
                ) : (
                  <div className="rounded-lg bg-cloud px-3 py-2 text-xs font-medium text-gray-500">
                    Disponibilités à confirmer avec le propriétaire
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-navy">
                      Arrivée
                    </label>
                    <input
                      type="date"
                      value={bookingForm.dateDebut}
                      onChange={(e) => handleBookingChange("dateDebut", e.target.value)}
                      min={availabilityWindow ? toInputDate(availabilityWindow.dateDebut) : undefined}
                      max={availabilityWindow ? toInputDate(availabilityWindow.dateFin) : undefined}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-sky focus:outline-none focus:ring-2 focus:ring-sky/30"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-navy">
                      Départ
                    </label>
                    <input
                      type="date"
                      value={bookingForm.dateFin}
                      onChange={(e) => handleBookingChange("dateFin", e.target.value)}
                      min={bookingForm.dateDebut || (availabilityWindow ? toInputDate(availabilityWindow.dateDebut) : undefined)}
                      max={availabilityWindow ? toInputDate(availabilityWindow.dateFin) : undefined}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-sky focus:outline-none focus:ring-2 focus:ring-sky/30"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-navy">
                    Voyageurs <span className="font-normal text-gray-400">(max {boat.capacite})</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={boat.capacite}
                    value={bookingForm.nombrePersonnes}
                    onChange={(e) =>
                      handleBookingChange("nombrePersonnes", e.target.value)
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-sky focus:outline-none focus:ring-2 focus:ring-sky/30"
                  />
                  <p className="mt-1 text-xs text-gray-400">
                    Prix du bateau entier, non multiplié par le nombre de personnes.
                  </p>
                </div>

                {nombreJours > 0 && (
                  <div className="space-y-1.5 border-t border-gray-100 pt-3 text-sm">
                    <div className="flex justify-between text-gray-500">
                      <span>{boat.prixJour} € × {nombreJours} jour{nombreJours > 1 ? "s" : ""}</span>
                      <span>{sousTotal} €</span>
                    </div>
                    <div className="flex justify-between text-gray-400 text-xs">
                      <span>Frais de service SailingLoc (10%)</span>
                      <span>{commission} €</span>
                    </div>
                    <div className="flex justify-between border-t border-gray-100 pt-2 font-semibold text-navy">
                      <span>Total</span>
                      <span>{totalEstime} €</span>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={bookingSubmitting}
                  className="w-full rounded-lg bg-navy py-2.5 text-sm font-semibold text-white transition hover:bg-navy-light disabled:opacity-60"
                >
                  {bookingSubmitting
                    ? "Réservation en cours..."
                    : user
                      ? "Réserver"
                      : "Se connecter pour réserver"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
