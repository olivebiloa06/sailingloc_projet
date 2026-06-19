import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function Account() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/", { replace: true });
  };

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="font-heading text-2xl font-semibold text-navy">
        Mon compte
      </h1>

      <div className="mt-6 space-y-2 rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-700">
        <p>
          <span className="font-medium text-navy">Nom :</span> {user?.prenom}{" "}
          {user?.nom}
        </p>
        <p>
          <span className="font-medium text-navy">Email :</span> {user?.email}
        </p>
        <p>
          <span className="font-medium text-navy">Rôle :</span> {user?.role}
        </p>
      </div>

      <button
        onClick={handleLogout}
        className="mt-6 rounded-lg border border-navy px-4 py-2 text-sm font-medium text-navy transition hover:bg-navy hover:text-white"
      >
        Se déconnecter
      </button>
    </div>
  );
}
