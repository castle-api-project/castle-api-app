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
import {
  AddressAtom,
  CastleNameAtom,
  CityNameAtom,
  LatlngAtom,
  MapCenterAtom,
  PrefNameAtom,
} from "@/components/atom";
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
  const [mapPosition, setMapPosition] = useRecoilState(MapCenterAtom);
  const [markerPosition, setMarkerPosition] = useRecoilState(LatlngAtom);
  const [castleName, setCastleName] = useRecoilState(CastleNameAtom);
  const [prefName, setPrefName] = useRecoilState(PrefNameAtom);
  const [cityName, setCityName] = useRecoilState(CityNameAtom);
  const [address, setAddress] = useRecoilState(AddressAtom);

  const getAddressByLatlng = (latlng: { lat: number; lng: number }) => {
    const url = `https://geoapi.heartrails.com/api/json?method=searchByGeoLocation&x=${latlng.lng}&y=${latlng.lat}`;

    fetch(url)
      .then(async (response) => {
        if (!response.ok) throw new Error(`HTTP error: ${response.status}`);

        const res = JSON.parse(await response.text());
        const location = res.response.location[0];

        console.log(location);
        setPrefName(location.prefecture);
        setCityName(location.city);
        setAddress(location.prefecture + location.city + location.town);
      })
      .catch((error) => console.log(`Could not fetch verse: ${error}`));
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
      setMarkerPosition(latlng);
      getAddressByLatlng(latlng);
    },
  };

  const MarkerContainer = () => {
    const map = useMapEvents({
      dblclick(e) {
        const latlng = digitDesignByLatlng(e.latlng);
        setMarkerPosition(latlng);
        getAddressByLatlng(latlng);
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
