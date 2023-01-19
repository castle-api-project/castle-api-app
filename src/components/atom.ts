import { atom } from "recoil";
import Leaflet from "leaflet";
import { categories, structures } from "./util";

export const MarkerPosAtom = atom({
  key: "markerPos",
  default: Leaflet.latLng([35.1855, 136.89939]),
});

// export const CastleDataAtom = atom({
//   key: "castleData",
//   default: {
//     name: "",
//     alias: [""],
//     latlng: {
//       lat: "",
//       lng: "",
//     },
//     pref: "",
//     area: "",
//     city: "",
//     address: "",
//     build: "",
//     scale: 3,
//     type: [],
//     tower: {
//       isExist: true,
//       constructure: [0, 0]
//     },
//     remains: [],
//     restorations: [],
//     categories: [],
//     site: "",
//   },
// });

export const CastleDataAtom = atom({
  key: "castleData",
  default: {
    name: "名古屋城",
    alias: ["金城"],
    latlng: {
      lat: "35.18559",
      lng: "136.89952",
    },
    pref: "愛知県",
    area: "尾張",
    city: "名古屋市",
    address: "愛知県名古屋市中区本丸1",
    build: "1611",
    scale: 5,
    type: "平城",
    tower: {
      isExist: true,
      constructure: [5, 6],
      condition: "復元",
    },
    remains: ["櫓", "堀", "蔵"],
    restorations: ["櫓", "天守閣"],
    categories: ["特別史跡", "百名城", "三大名城"],
    site: "https://nagoya-castle.example.com/",
  },
});
