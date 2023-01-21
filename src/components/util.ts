import Leaflet, { LatLng } from "leaflet";
import { AreaName, Prefs } from "./area";

const parseToLatlng = (value: string | number) => {
  let num = 0;
  if (typeof value === "string") num = parseFloat(value);
  else num = value;

  return Number(num.toFixed(5));
};

export const digitDesignByLatlng = (
  latlng: Leaflet.LatLng | { lat: number | string; lng: number | string }
) => {
  const ll = { lat: parseToLatlng(latlng.lat), lng: parseToLatlng(latlng.lng) };
  return Leaflet.latLng(ll);
};

type LatlngStr = {
  lat: string;
  lng: string;
};
export const latlngToStr = (latlng: LatlngStr | LatLng) => {
  return { lat: String(latlng.lat), lng: String(latlng.lng) };
};

export const structures = [
  "堀",
  "竪堀",
  "堀切",
  "土塁",
  "石垣",
  "虎口",
  "曲輪",
  "柵",
  "塀",
  "井戸",
  "門",
  "櫓",
  "天守閣",
  "御殿",
  "蔵",
  "奉行所",
  "庭園",
] as const;
export type Structures = typeof structures[number];

export const categories = [
  "世界遺産",
  "国宝",
  "重要文化財",
  "特別史跡",
  "国指定史跡",
  "都指定史跡",
  "道指定史跡",
  "府指定史跡",
  "県指定史跡",
  "市指定史跡",
  "区指定史跡",
  "町指定史跡",
  "村指定史跡",
  "現存天守",
  "百名城",
  "続百名城",
  "三大名城",
  "三大山城",
  "三大海城",
  "三大湖城",
] as const;
export type Categories = typeof categories[number];

export const towerConditionList = [
  "現存",
  "復元",
  "復興",
  "模擬",
  "非現像",
] as const;
export type TowerCondtion = typeof towerConditionList[number];

export const scale = {
  5: "城内が整備されている",
  4: "本丸周りは残っている",
  3: "一部の構造物はある",
  2: "看板のみある",
  1: "何も無い",
  0: "位置も曖昧",
};

export const castleTypeList = [
  "山城",
  "平山城",
  "平城",
  "海城",
  "湖城",
  "面崖式",
  "丘先式",
] as const;
export type CastleType = typeof castleTypeList[number];

export type CastleData = {
  name: string;
  alias: string[];
  latlng: {
    lat: string;
    lng: string;
  };
  pref: string;
  area: string;
  city: string;
  address: string;
  build: string;
  scale: number;
  type: CastleType;
  tower: {
    isExist: boolean;
    structure: [number, number];
    condition: TowerCondtion;
  };
  remains: Structures[];
  restorations: Structures[];
  categories: Categories[];
  site: string;
  reference: string;
};
