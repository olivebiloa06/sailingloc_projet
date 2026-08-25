import { useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import { Link } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";

// Marqueur bateau — même silhouette que BoatMark, en pin blanc sur fond navy.
const boatIcon = L.divIcon({
  className: "",
  html: `<div class="flex h-9 w-9 -translate-x-1/2 -translate-y-full items-center justify-center rounded-full border-2 border-white bg-navy text-white shadow-lg">
    <svg viewBox="0 0 32 32" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <line x1="16" y1="4" x2="16" y2="22" />
      <path d="M16 6 L24 20 L16 20 Z" />
      <path d="M5 24 Q16 30 27 24" />
    </svg>
  </div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -36],
});

function clusterIcon(cluster) {
  const count = cluster.getChildCount();
  return L.divIcon({
    html: `<div class="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-sky text-sm font-bold text-white shadow-lg">${count}</div>`,
    className: "",
    iconSize: [40, 40],
  });
}

const FRANCE_CENTER = [46.6, 2.4];

export default function BoatMap({ boats, onCenterChange }) {
  const located = useMemo(
    () => boats.filter((b) => b.latitude != null && b.longitude != null),
    [boats]
  );

  const center = located.length ? [located[0].latitude, located[0].longitude] : FRANCE_CENTER;

  return (
    <MapContainer
      center={center}
      zoom={located.length ? 6 : 5}
      className="h-full w-full rounded-2xl"
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MarkerClusterGroup iconCreateFunction={clusterIcon} chunkedLoading>
        {located.map((boat) => (
          <Marker
            key={boat.id}
            position={[boat.latitude, boat.longitude]}
            icon={boatIcon}
            eventHandlers={{
              click: () => onCenterChange?.({ latitude: boat.latitude, longitude: boat.longitude, name: boat.localisation }),
            }}
          >
            <Popup>
              <Link to={`/boats/${boat.id}`} className="block w-40">
                <p className="font-heading font-semibold text-navy">{boat.nom}</p>
                <p className="text-xs text-gray-500">{boat.localisation}</p>
                <p className="mt-1 text-sm font-semibold text-navy">
                  {boat.prixJour} €<span className="font-normal text-gray-400">/jour</span>
                </p>
              </Link>
            </Popup>
          </Marker>
        ))}
      </MarkerClusterGroup>
    </MapContainer>
  );
}
