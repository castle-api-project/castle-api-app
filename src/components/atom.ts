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
    name: "名古屋城",
    alias: ["金城", ""],
    latlng: {
      lat: "35.18559",
      lng: "136.89952",
    },
    pref: "愛知県",
    area: "尾張",
    city: "名古屋市中区",
    address: "愛知県名古屋市中区本丸1-1",
    build: "1611",
    scale: 5,
    type: "平城",
    tower: {
      isExist: true,
      constructure: [5, 5],
      condition: "復元",
    },
    remains: ["櫓", "堀", "蔵"],
    restorations: ["櫓", "天守閣"],
    categories: ["特別史跡", "百名城", "三大名城"],
    site: "https://nagoya-castle.example.com/",
    reference: "書籍: 日本の城1選",
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
