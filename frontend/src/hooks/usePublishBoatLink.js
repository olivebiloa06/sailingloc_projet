import { useAuth } from "./useAuth";


export function usePublishBoatLink() {
  const { user } = useAuth();
  return user?.role === "proprietaire" ? "/mes-bateaux/nouveau" : "/register?role=proprietaire";
}
