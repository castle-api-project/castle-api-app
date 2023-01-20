import { atom } from "recoil";
import Leaflet from "leaflet";
import { categories, structures } from "./util";

export const MarkerPosAtom = atom({
  key: "markerPos",
  default: Leaflet.latLng([35.1855, 136.89939]),
});

export const MapCenterPosAtom = atom({
  key: "mapCenterPos",
  default: { lat: 35.1855, lng: 136.89939 },
});

export const MapZoomAtom = atom({
  key: "mapZoom",
  default: 14,
});

export const CastleDataAtom = atom({
  key: "castleData",
  default: {
    name: "",
    alias: [""],
    latlng: {
      lat: "",
      lng: "",
    },
    pref: "",
    area: "",
    city: "",
    address: "",
    build: "",
    scale: 3,
    type: [],
    tower: {
      isExist: true,
      constructure: [0, 0],
      condition: "復元",
    },
    remains: [],
    restorations: [],
    categories: [],
    site: "",
  },
});
