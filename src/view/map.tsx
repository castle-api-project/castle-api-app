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
  AreaNameAtom,
  CastleNameAtom,
  CityNameAtom,
  LatlngAtom,
  MapCenterAtom,
  MarkerPosAtom,
  PrefNameAtom,
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
  const markerRef = useRef(null);
  const [mapPos, setMapPos] = useRecoilState(MapCenterAtom);
  const [markerPos, setMarkerPos] = useRecoilState(MarkerPosAtom);
  const [latlng, setLatlng] = useRecoilState(LatlngAtom);
  const [castleName, setCastleName] = useRecoilState(CastleNameAtom);
  const [prefName, setPrefName] = useRecoilState(PrefNameAtom);
  const [areaName, setAreaName] = useRecoilState(AreaNameAtom);
  const [cityName, setCityName] = useRecoilState(CityNameAtom);
  const [address, setAddress] = useRecoilState(AddressAtom);

  const getAddressByLatlng = ({ lat, lng }: { lat: number; lng: number }) => {
    const url = `https://geoapi.heartrails.com/api/json?method=searchByGeoLocation&x=${lng}&y=${lat}`;

    fetch(url)
      .then(async (response) => {
        if (!response.ok) throw new Error(`HTTP error: ${response.status}`);

        const res = JSON.parse(await response.text());
        if (!res.response.location) {
          setAreaName("なし");
          setPrefName("なし");
          setCityName("なし");
          setAddress("なし");
        } else {
          const location = res.response.location[0];
          const areaNameSnap = getAreaName(location.prefecture, location.city);

          setAreaName(areaNameSnap);
          setPrefName(location.prefecture);
          setCityName(location.city);
          setAddress(location.prefecture + location.city + location.town);
        }
      })
      .catch();
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
      setLatlng(latlngToStr(latlng));
      getAddressByLatlng(latlng);
    },
  };

  const MarkerContainer = () => {
    const map = useMapEvents({
      dblclick(e) {
        const latlng = digitDesignByLatlng(e.latlng);
        setMarkerPos(latlng);
        setLatlng(latlngToStr(latlng));
        getAddressByLatlng(latlng);
      },
      contextmenu() {
        map.panTo(markerPos);
      },
    });

    return (
      <Marker
        ref={markerRef}
        position={markerPos}
        draggable={true}
        eventHandlers={eventHandlers}
      >
        <Popup>{castleName || "城名わからん!"}</Popup>
      </Marker>
    );
  };

  return (
    <MapContainer
      center={[mapPos.lat, mapPos.lng]}
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
