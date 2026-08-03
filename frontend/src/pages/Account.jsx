import { useAuth } from "../hooks/useAuth";
import RenterDashboard from "./RenterDashboard";
import OwnerDashboard from "./OwnerDashboard";
import AdminDashboard from "./AdminDashboard";

export default function Account() {
  const { user } = useAuth();

  if (user?.role === "admin") return <AdminDashboard />;
  if (user?.role === "proprietaire") return <OwnerDashboard />;
  return <RenterDashboard />;
}
