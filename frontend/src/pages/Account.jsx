import { useAuth } from "../hooks/useAuth";
import RenterDashboard from "./RenterDashboard";
import OwnerDashboard from "./OwnerDashboard";
import AdminDashboard from "./AdminDashboard";

// Chaque rôle a son propre espace — Account.jsx est juste un aiguilleur.
export default function Account() {
  const { user } = useAuth();

  if (user?.role === "admin") return <AdminDashboard />;
  if (user?.role === "proprietaire") return <OwnerDashboard />;
  return <RenterDashboard />;
}
