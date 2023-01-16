import { useRef, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import Leaflet from "leaflet";
import icon from "leaflet/dist/images/marker-icon.png";
import "leaflet/dist/leaflet.css";

Leaflet.Marker.prototype.options.icon = Leaflet.icon({
  iconUrl: icon.src,
  iconSize: [icon.width, icon.height],
  iconAnchor: [icon.width / 2, icon.height],
  popupAnchor: [2, -40],
});

const Map = () => {
  const markerRef = useRef(null);
  const [markerPosition, setMarkerPosition] = useState(
    Leaflet.latLng([35.0925, 136.999])
  );

  const eventHandlers = {
    dragstart: () => {
      const marker = markerRef.current;
      marker.setOpacity(0.6);
    },
    dragend: () => {
      const marker = markerRef.current;
      marker.setOpacity(1);
      setMarkerPosition(marker.getLatLng());
    },
  };

  return (
    <MapContainer
      center={[35.0925, 136.999]}
      zoom={12}
      scrollWheelZoom={true}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker
        ref={markerRef}
        position={markerPosition}
        draggable={true}
        eventHandlers={eventHandlers}
      >
        <Popup>城</Popup>
      </Marker>
    </MapContainer>
  );
};

export default Map;
