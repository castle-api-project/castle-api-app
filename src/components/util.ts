import Leaflet from "leaflet";

export const parseToLatlng = (value: string | number) => {
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
