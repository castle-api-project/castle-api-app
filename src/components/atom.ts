import { atom } from "recoil";
import Leaflet from "leaflet";
import { CastleData } from "./util";

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

export const CastleDataAtom = atom<CastleData>({
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
    type: "平城",
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

export const DataErrsAtom = atom({
  key: "data",
  default: {
    name: "",
    alias: "",
    latlng: "",
    pref: "",
    area: "",
    city: "",
    address: "",
    build: "",
    scale: "",
    type: "",
    isTowerExist: "",
    towerConstructure: "",
    remains: "",
    restorations: "",
    categories: "",
    site: "",
    submit: "",
  },
});
