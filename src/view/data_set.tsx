import { useRecoilState } from "recoil";
import {
  AddressAtom,
  CastleNameAtom,
  CityNameAtom,
  LatlngAtom,
  PrefNameAtom,
} from "@/components/atom";
import styles from "@/styles/data_set.module.scss";
import { digitDesignByLatlng } from "@/components/util";

const DataSet = () => {
  const [castleName, setCastleName] = useRecoilState(CastleNameAtom);
  const [markerPosition, setMarkerPosition] = useRecoilState(LatlngAtom);
  const [prefName, setPrefName] = useRecoilState(PrefNameAtom);
  const [cityName, setCityName] = useRecoilState(CityNameAtom);
  const [address, setAddress] = useRecoilState(AddressAtom);

  const getAddressByLatlng = (latlng: { lat: number; lng: number }) => {
    const url = `https://geoapi.heartrails.com/api/json?method=searchByGeoLocation&x=${latlng.lng}&y=${latlng.lat}`;

    fetch(url)
      .then(async (response) => {
        if (!response.ok) throw new Error(`HTTP error: ${response.status}`);

        const res = JSON.parse(await response.text());
        const location = res.response.location[0];

        console.log(location);
        setPrefName(location.prefecture);
        setCityName(location.city);
        setAddress(location.prefecture + location.city + location.town);
      })
      .catch((error) => console.log(`Could not fetch verse: ${error}`));
  };

  const onChangeLatlng = (
    e: React.ChangeEvent<HTMLInputElement>,
    isLat = true
  ) => {
    let latlngSnap = { lat: markerPosition.lat, lng: markerPosition.lng };

    if (isLat) latlngSnap.lat = parseFloat(e.target.value);
    else latlngSnap.lng = parseFloat(e.target.value);

    const latlng = digitDesignByLatlng(latlngSnap);
    setMarkerPosition(latlng);
    getAddressByLatlng(latlng);
  };

  const onChangeAddress = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setAddress(e.target.value.replace("\n", ""));
  };

  return (
    <div className={styles.container}>
      <div className={styles.item_box}>
        <p className={styles.title}>城名</p>
        <input
          type="text"
          placeholder="名古屋城"
          value={castleName}
          className={styles.input_value}
          onChange={(e) => setCastleName(e.target.value)}
        />
      </div>

      <div className={styles.item_box}>
        <p className={styles.title}>経緯度</p>
        <div className={styles.input_box}>
          <input
            type="number"
            placeholder="緯度"
            value={markerPosition.lat}
            onChange={(e) => onChangeLatlng(e, true)}
          />
          <input
            type="number"
            placeholder="経度"
            value={markerPosition.lng}
            onChange={(e) => onChangeLatlng(e, false)}
          />
        </div>
      </div>

      <div className={styles.item_box}>
        <p className={styles.title}>都道府県</p>
        <input
          type="text"
          placeholder="愛知県"
          value={prefName}
          className={styles.input_value}
          onChange={(e) => setPrefName(e.target.value)}
        />
      </div>

      <div className={styles.item_box}>
        <p className={styles.title}>市(区)町村</p>
        <input
          type="text"
          placeholder="名古屋市"
          value={cityName}
          className={styles.input_value}
          onChange={(e) => setCityName(e.target.value)}
        />
      </div>

      <div className={styles.item_box}>
        <p className={styles.title}>住所</p>
        <textarea
          placeholder="愛知県名古屋市中区本丸1-1"
          value={address}
          className={styles.textarea_address}
          onChange={onChangeAddress}
        ></textarea>
      </div>
    </div>
  );
};

export default DataSet;
