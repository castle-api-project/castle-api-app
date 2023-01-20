import { useRef } from "react";
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
import {
  CastleDataAtom,
  MapCenterPosAtom,
  MapZoomAtom,
  MarkerPosAtom,
} from "@/components/atom";
import "leaflet/dist/leaflet.css";
import { digitDesignByLatlng, latlngToStr } from "@/components/util";
import { getAreaName } from "@/components/area";

Leaflet.Marker.prototype.options.icon = Leaflet.icon({
  iconUrl: icon.src,
  iconSize: [icon.width, icon.height],
  iconAnchor: [icon.width / 2, icon.height],
  popupAnchor: [2, -40],
});

const Map = () => {
  const [markerPos, setMarkerPos] = useRecoilState(MarkerPosAtom);
  const [mapCenterPos, setMapCenterPos] = useRecoilState(MapCenterPosAtom);
  const [mapZoom, setMapZoom] = useRecoilState(MapZoomAtom);
  const [castleData, setCastleData] = useRecoilState(CastleDataAtom);
  const markerRef = useRef(null);

  const getAddressByLatlng = ({ lat, lng }: { lat: number; lng: number }) => {
    const url = `https://geoapi.heartrails.com/api/json?method=searchByGeoLocation&x=${lng}&y=${lat}`;

    fetch(url)
      .then(async (response) => {
        if (!response.ok) throw new Error(`HTTP error: ${response.status}`);

        const res = JSON.parse(await response.text());
        if (!res.response.location) {
          setCastleData({
            ...castleData,
            pref: "なし",
            area: "なし",
            city: "なし",
            address: "なし",
            latlng: { lat: String(lat), lng: String(lng) },
          });
        } else {
          const location = res.response.location[0];
          const areaNameSnap = getAreaName(location.prefecture, location.city);

          setCastleData({
            ...castleData,
            pref: location.prefecture,
            area: areaNameSnap,
            city: location.city,
            address: location.prefecture + location.city + location.town,
            latlng: { lat: String(lat), lng: String(lng) },
          });
        }
      })
      .catch(() => {
        setCastleData({
          ...castleData,
          latlng: { lat: String(lat), lng: String(lng) },
        });
      });
  };

  const eventHandlers = {
    dragstart: () => {
      const marker = markerRef.current;
      marker.setOpacity(0.6);
    },
    dragend: () => {
      const marker = markerRef.current;
      marker.setOpacity(1);
      const latlng = digitDesignByLatlng(marker.getLatLng());
      setMarkerPos(latlng);
      setCastleData({ ...castleData, latlng: latlngToStr(latlng) });
      getAddressByLatlng(latlng);
    },
  };

  const MarkerContainer = () => {
    const map = useMapEvents({
      dblclick(e) {
        const latlng = digitDesignByLatlng(e.latlng);
        setMarkerPos(latlng);
        getAddressByLatlng(latlng);
      },
      contextmenu() {
        setMapCenterPos(markerPos);
      },
      dragend() {
        setMapCenterPos(map.getCenter());
      },
      zoomend() {
        setMapCenterPos(map.getCenter());
        setMapZoom(map.getZoom());
      },
    });

    return (
      <Marker
        ref={markerRef}
        position={markerPos}
        draggable={true}
        eventHandlers={eventHandlers}
      >
        <Popup>{castleData.name || "城名わからん!"}</Popup>
      </Marker>
    );
  };

  const ChangeMapCenter = ({ lat, lng }: { lat: number; lng: number }) => {
    const map = useMap();
    map.panTo({ lat, lng });

    return null;
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
      <ChangeMapCenter lat={mapCenterPos.lat} lng={mapCenterPos.lng} />
      <MarkerContainer />
    </MapContainer>
  );
};

export default Map;
