import { CastleDataAtom } from "@/components/atom";
import { useRecoilState } from "recoil";
import styles from "@/styles/completion_view.module.scss";
import { getDatabase, push, ref } from "@firebase/database";
import { useEffect, useState } from "react";
import HourglassBottomIcon from "@mui/icons-material/HourglassBottom";
import { useRouter } from "next/router";
import { Store } from "tauri-plugin-store-api";
import { sleep } from "@/components/util";

const CompletionView = () => {
  const router = useRouter();
  const store = new Store("castles.dat");
  const [d, setCastleData] = useRecoilState(CastleDataAtom);
  const [dbStatus, setDbStatus] = useState("接続中");
  const [msg, setMsg] = useState("接続中");
  const [isOffline, setIsOffline] = useState(!window.navigator.onLine);
  const [isSent, setIsSent] = useState(false);
  const [code, setCode] = useState(() => {
    const build = d.build === "" ? "null" : Number(d.build);
    const tower = d.tower.isExist
      ? "null"
      : `{
    structure: ${JSON.stringify(d.tower.structure)},
    condition: "${d.tower.condition}",
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
    setDbStatus("送信中");
    setMsg("送信中");
    await sleep(500);

    let isSuccess = true;
    try {
      if (d.name.slice(0, 1) === "-" || d.name.slice(-1) === "-") {
        setDbStatus("送信しません");
        setMsg("送信しない設定です");
        return;
      } else if (isSent) {
        setDbStatus("送信済み");
        setMsg("送信済みです");
        return;
      }
      const db = getDatabase();
      const dbRef = ref(db, `${d.pref}/${d.area}/${d.city}/${d.name}`);
      if (isOffline) throw new Error("NetworkError");
      await push(dbRef, { json: JSON.stringify(d) });
      setDbStatus("完了!");
      setMsg("データを送信しました");
      setIsSent(true);
    } catch (e) {
      isSuccess = false;
      if (isOffline) setDbStatus("ネット未接続");
      else setDbStatus("失敗");
      setMsg("送信に失敗しました");
      await store.set(`${d.latlng.lat}-${d.latlng.lng}`, d);
      setMsg("次回起動時に再送信します");
    }
    try {
      if (isSuccess) await store.delete(`${d.latlng.lat}-${d.latlng.lng}`);
      else await store.set(`${d.latlng.lat}-${d.latlng.lng}`, d);
    } catch {}
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
    window.addEventListener("offline", () => setIsOffline(true));
    window.addEventListener("online", () => setIsOffline(false));
    sendData();
    try {
      void store.delete("incomplete");
    } catch {}
  }, []);

  return (
    <div className={styles.completion_container}>
      <div className={styles.left_box}>
        <textarea value={code} readOnly />
      </div>

      <div className={styles.right_box}>
        <div className={styles.centering_container}>
          <p className={styles.status}>
            {dbStatus}
            {["接続中", "送信中"].includes(dbStatus) && (
              <HourglassBottomIcon className={styles.loading_icon} />
            )}
          </p>

          <p className={styles.message}>{msg}</p>
        </div>

        <div className={styles.buttom_container}>
          {
            <span className={styles.button} onClick={sendData}>
              再送信
            </span>
          }
          <span className={styles.button} onClick={toTop}>
            トップにもどる
          </span>
        </div>
      </div>
    </div>
  );
};

export default CompletionView;
