import { CastleDataAtom } from "@/components/atom";
import { useRecoilState } from "recoil";
import styles from "@/styles/completion_view.module.scss";
import { getDatabase, push, ref } from "@firebase/database";
import { useEffect, useState } from "react";
import HourglassBottomIcon from "@mui/icons-material/HourglassBottom";
import { useRouter } from "next/router";

const CompletionView = () => {
  const router = useRouter();
  const [d, setCastleData] = useRecoilState(CastleDataAtom);
  const [dbStatus, setDbStatus] = useState("connecting");
  const [msg, setMsg] = useState("");
  const [code, setCode] = useState(() => {
    const build = d.build === "" ? "null" : Number(d.build);
    const tower = d.tower.isExist
      ? "null"
      : `{
    structure: ${JSON.stringify(d.tower.structure)},
    condition: "復元",
  }`;

    return `{
  name: "${d.name}",
  alias: ${JSON.stringify(d.alias)},
  build: ${build},
  scale: ${d.scale},
  type: "${d.type}",
  latlng: [${Number(d.latlng.lat)}, ${Number(d.latlng.lng)}],
  place: {
    prefecture: "${d.pref}",
    area: "${d.area}",
    city: "${d.city}",
    address: "${d.address}",
  },
  castle_tower: ${tower},
  remains: ${JSON.stringify(d.remains)},
  restorations: ${JSON.stringify(d.restorations)},
  categories: ${JSON.stringify(d.categories)},
  site: "${d.site}",
},`;
  });

  const sendData = async () => {
    console.log("start");
    try {
      setDbStatus("sending");
      const db = getDatabase();
      const dbRef = ref(db, `${d.pref}/${d.area}/${d.city}/${d.name}`);
      await push(dbRef, {
        json: JSON.stringify(d),
      });
      setDbStatus("sent");
      setMsg("データを送信しました");
    } catch (e) {
      console.log(e);
      setDbStatus("error");
      setMsg("次回起動時に再送信します");
    }
  };

  const toTop = () => {
    setCastleData({
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
        structure: [0, 0],
        condition: "復元",
      },
      remains: [],
      restorations: [],
      categories: [],
      site: "",
      reference: "",
    });
    router.push("/");
  };

  useEffect(() => {
    sendData();
  }, []);

  return (
    <div className={styles.completion_container}>
      <div className={styles.left_box}>
        <textarea value={code} readOnly />
      </div>

      <div className={styles.right_box}>
        <div className={styles.centering_container}>
          <p className={styles.status}>
            {dbStatus === "connecting" && "接続中"}
            {dbStatus === "sending" && "送信中"}
            {dbStatus === "sent" && "完了!"}
            {dbStatus === "error" && "失敗"}

            {["connecting", "sending"].includes(dbStatus) && (
              <HourglassBottomIcon className={styles.loading_icon} />
            )}
          </p>

          <p className={styles.message}>{msg}</p>
        </div>

        <div className={styles.buttom_container}>
          <span className={styles.button} onClick={toTop}>
            トップにもどる
          </span>
        </div>
      </div>
    </div>
  );
};

export default CompletionView;
