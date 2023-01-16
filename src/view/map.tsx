import { useRef } from "react";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMapEvents,
} from "react-leaflet";
import Leaflet from "leaflet";
import icon from "leaflet/dist/images/marker-icon.png";
import { useRecoilState } from "recoil";
import { CastleName, LatlngAtom, MapCenterAtom } from "@/components/atom";
import "leaflet/dist/leaflet.css";
import { digitDesignByLatlng } from "@/components/util";

Leaflet.Marker.prototype.options.icon = Leaflet.icon({
  iconUrl: icon.src,
  iconSize: [icon.width, icon.height],
  iconAnchor: [icon.width / 2, icon.height],
  popupAnchor: [2, -40],
});

const Map = () => {
  const markerRef = useRef(null);
  const [castleName, setCastleName] = useRecoilState(CastleName);
  const [markerPosition, setMarkerPosition] = useRecoilState(LatlngAtom);
  const [mapPosition, setMapPosition] = useRecoilState(MapCenterAtom);

  const eventHandlers = {
    dragstart: () => {
      const marker = markerRef.current;
      marker.setOpacity(0.6);
    },
    dragend: () => {
      const marker = markerRef.current;
      marker.setOpacity(1);
      const latlng = digitDesignByLatlng(marker.getLatLng());
      setMarkerPosition(latlng);
    },
  };

  const MarkerContainer = () => {
    const map = useMapEvents({
      dblclick(e) {
        const latlng = digitDesignByLatlng(e.latlng);
        setMarkerPosition(latlng);
      },
      contextmenu() {
        map.panTo(markerPosition);
      },
    });

    return (
      <Marker
        ref={markerRef}
        position={markerPosition}
        draggable={true}
        eventHandlers={eventHandlers}
      >
        <Popup>{castleName || "城名わからん!"}</Popup>
      </Marker>
    );
  };

  return (
    <MapContainer
      center={[mapPosition.lat, mapPosition.lng]}
      zoom={14}
      scrollWheelZoom={true}
      style={{ height: "100%", width: "100%" }}
      doubleClickZoom={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MarkerContainer />
    </MapContainer>
  );
};

export default Map;
