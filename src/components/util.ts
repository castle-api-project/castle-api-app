import Leaflet from "leaflet";

const parseToLatlng = (value: string | number) => {
  let num = 0;
  if (typeof value === "string") num = parseFloat(value);
  else num = value;

  return Number(num.toFixed(5));
};

export const digitDesignByLatlng = (
  latlng: Leaflet.LatLng | { lat: number; lng: number }
) => {
  const ll = { lat: parseToLatlng(latlng.lat), lng: parseToLatlng(latlng.lng) };
  return Leaflet.latLng(ll);
};
