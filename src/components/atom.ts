import { atom } from "recoil";
import Leaflet from "leaflet";

export const LatlngAtom = atom({
  key: "latlng",
  default: { lat: "", lng: "" },
});

export const MarkerPosAtom = atom({
  key: "markerPos",
  default: Leaflet.latLng([35.1855, 136.89939]),
});

export const MapCenterAtom = atom({
  key: "mapcenter",
  default: { lat: 35.1855, lng: 136.89939 },
});

export const CastleNameAtom = atom({
  key: "castleName",
  default: "",
});

export const AliasesAtom = atom({
  key: "aliaess",
  default: [""],
});

export const PrefNameAtom = atom({
  key: "prefName",
  default: "",
});

export const CityNameAtom = atom({
  key: "CityName",
  default: "",
});

export const AddressAtom = atom({
  key: "address",
  default: "",
});
