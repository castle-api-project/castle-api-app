import { atom } from "recoil";
import Leaflet from "leaflet";

export const LatlngAtom = atom({
  key: "latlng",
  default: Leaflet.latLng([35.1855, 136.89939]),
});

export const MapCenterAtom = atom({
  key: "mapcenter",
  default: { lat: 35.1855, lng: 136.89939 },
});

export const CastleName = atom({
  key: "castleName",
  default: "",
});
