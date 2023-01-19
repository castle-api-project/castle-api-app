import { CastleDataAtom } from "@/components/atom";
import { useRecoilState } from "recoil";
import styles from "@/styles/submit.module.scss";

const Submit = () => {
  const [castleData, setCastleData] = useRecoilState(CastleDataAtom);

  return (
    <div className={styles.submit_container}>
      <h2>{castleData.name}</h2>
      <div className={styles.item_box}>
        <p>
          <span>都道府県</span>
          <span>{castleData.pref}</span>
        </p>
        <p>
          <span>地域</span>
          <span>{castleData.area}</span>
        </p>
        <p>
          <span>市区町村</span>
          <span>{castleData.city}</span>
        </p>
      </div>
    </div>
  );
};

export default Submit;
