import { useRef, useState } from "react";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import Leaflet from "leaflet";
import icon from "leaflet/dist/images/marker-icon.png";
import { useRecoilState } from "recoil";
import { CastleDataAtom } from "@/components/atom";
import "leaflet/dist/leaflet.css";

Leaflet.Marker.prototype.options.icon = Leaflet.icon({
  iconUrl: icon.src,
  iconSize: [icon.width, icon.height],
  iconAnchor: [icon.width / 2, icon.height],
  popupAnchor: [2, -40],
});

const Map = () => {
  const [castleData, setCastleData] = useRecoilState(CastleDataAtom);
  const markerRef = useRef(null);
  const latlng = castleData.latlng;
  const markerPos = Leaflet.latLng(Number(latlng.lat), Number(latlng.lng));

  const MarkerContainer = () => {
    const map = useMapEvents({
      contextmenu() {
        map.panTo(markerPos);
      },
    });

    return (
      <Marker ref={markerRef} position={markerPos} draggable={true}>
        <Popup>{castleData.name}</Popup>
      </Marker>
    );
  };

  return (
    <MapContainer
      center={[35.1855, 136.89939]}
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
