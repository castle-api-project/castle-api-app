import { useRecoilState } from "recoil";
import {
  AddressAtom,
  AliasesAtom,
  CastleNameAtom,
  CityNameAtom,
  LatlngAtom,
  MarkerPosAtom,
  PrefNameAtom,
} from "@/components/atom";
import styles from "@/styles/data_set.module.scss";
import { digitDesignByLatlng } from "@/components/util";
import { useState } from "react";

const DataSet = () => {
  const [castleName, setCastleName] = useRecoilState(CastleNameAtom);
  const [aliases, setAliases] = useRecoilState(AliasesAtom);
  const [markerPos, setMarkerPos] = useRecoilState(MarkerPosAtom);
  const [latlng, setLatlng] = useRecoilState(LatlngAtom);
  const [latlngErr, setLatlngError] = useState("");
  const [prefName, setPrefName] = useRecoilState(PrefNameAtom);
  const [cityName, setCityName] = useRecoilState(CityNameAtom);
  const [address, setAddress] = useRecoilState(AddressAtom);

  const getAddressByLatlng = (latlng: { lat: number; lng: number }) => {
    const url = `https://geoapi.heartrails.com/api/json?method=searchByGeoLocation&x=${latlng.lng}&y=${latlng.lat}`;

    fetch(url).then(async (response) => {
      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);

      const res = JSON.parse(await response.text());
      if (!res.response.location) return;
      const location = res.response.location[0];

      setPrefName(location.prefecture);
      setCityName(location.city);
      setAddress(location.prefecture + location.city + location.town);
    });
  };

  const onChangeLatlng = (
    e: React.ChangeEvent<HTMLInputElement>,
    isLat = true
  ) => {
    let lat = latlng.lat;
    let lng = latlng.lng;

    if (isLat) lat = e.target.value;
    else lng = e.target.value;

    setLatlng({ lat, lng });
  };

  const onBlurLatlng = () => {
    let lat = latlng.lat;
    let lng = latlng.lng;

    if (lat === "" || lng === "") return;
    const latlngSnap = digitDesignByLatlng({ lat, lng });

    if (latlngSnap.lat < -90 || latlngSnap.lat > 90) {
      setLatlngError("緯度は -90度 ~ 90度 までです");
      return;
    } else if (latlngSnap.lng < -180 || latlngSnap.lng > 180) {
      setLatlngError("経度は -180度 ~ 180度 までです");
      return;
    }
    setLatlngError("");

    setMarkerPos(latlngSnap);
    getAddressByLatlng(digitDesignByLatlng(latlngSnap));
  };

  const onChangeAddress = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setAddress(e.target.value.replace("\n", ""));
  };

  const onChangeAlias = (e: React.ChangeEvent<HTMLInputElement>, i: number) => {
    const als = aliases.map((alias, index) => {
      if (index === i) return e.target.value;
      else return alias;
    });
    setAliases(als);
  };

  const onBlurAlias = () => {
    const aliasesSnap = aliases.filter((alias) => {
      return alias.length !== 0;
    });
    aliasesSnap.push("");
    setAliases(aliasesSnap);
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
        <p className={styles.title}>別名</p>
        {aliases.map((alias, i) => {
          return (
            <input
              key={i}
              type="text"
              placeholder="別名"
              value={aliases[i]}
              className={styles.input_value}
              onChange={(e) => onChangeAlias(e, i)}
              onBlur={onBlurAlias}
            />
          );
        })}
      </div>

      <div className={styles.item_box}>
        <p className={styles.title}>
          <span>経緯度 </span>
          <span className={styles.latlng_err}>{latlngErr}</span>
        </p>
        <div className={styles.input_box}>
          <input
            type="text"
            placeholder="緯度"
            value={latlng.lat}
            onChange={(e) => onChangeLatlng(e, true)}
            onBlur={onBlurLatlng}
          />
          <input
            type="text"
            placeholder="経度"
            value={latlng.lng}
            onChange={(e) => onChangeLatlng(e, false)}
            onBlur={onBlurLatlng}
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
