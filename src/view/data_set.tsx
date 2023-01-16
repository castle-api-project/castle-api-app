import { useRecoilState } from "recoil";
import { CastleName, LatlngAtom } from "@/components/atom";
import styles from "@/styles/data_set.module.scss";
import { digitDesignByLatlng } from "@/components/util";

const DataSet = () => {
  const [castleName, setCastleName] = useRecoilState(CastleName);
  const [markerPosition, setMarkerPosition] = useRecoilState(LatlngAtom);

  const onChangeLatlng = (e:React.ChangeEvent<HTMLInputElement>, isLat = true) => {
    let latlngSnap = { lat: markerPosition.lat, lng: markerPosition.lng };

    if (isLat) latlngSnap.lat = parseFloat(e.target.value);
    else latlngSnap.lng = parseFloat(e.target.value);

    const latlng = digitDesignByLatlng(latlngSnap);
    setMarkerPosition(latlng);
  };

  return (
    <div className={styles.container}>
      <div className={styles.item_box}>
        <p className={styles.title}>城名</p>
        <input
          type="text"
          name="name"
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
            name="lat"
            placeholder="緯度"
            value={markerPosition.lat}
            onChange={(e) => onChangeLatlng(e, true)}
          />
          <input
            type="number"
            name="lat"
            placeholder="経度"
            value={markerPosition.lng}
            onChange={(e) => onChangeLatlng(e, false)}
          />
        </div>
      </div>
    </div>
  );
};

export default DataSet;
