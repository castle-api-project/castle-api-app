import { useEffect, useState } from "react";
import KeyboardReturnIcon from "@mui/icons-material/KeyboardReturn";
import styles from "@/styles/report.module.scss";
import { useRouter } from "next/router";
import { Store } from "tauri-plugin-store-api";
import { sleep } from "@/components/util";
import { getDatabase, push, ref } from "@firebase/database";
import { appWindow, WebviewWindow } from "@tauri-apps/api/window";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

const Report = () => {
  const router = useRouter();
  const store = new Store("castles.dat");
  const [report, setReport] = useState("");
  const [dbStatus, setDbStatus] = useState("");
  const [isOffline, setIsOffline] = useState(!window.navigator.onLine);

  const sendReport = async () => {
    setDbStatus("送信中");
    await sleep(500);

    const date = new Date();
    const time = Math.floor(date.getTime() / 1000);
    const reportSendTime = await store.get("report_send_time");

    if (report.length < 15) {
      setDbStatus("15文字以上入力してください");
      return;
    } else if (isOffline) {
      setDbStatus("ネットに接続していません");
      return;
    } else if (reportSendTime && time - Number(reportSendTime) < 180) {
      setDbStatus("3分以上開けて送信してください");
      return;
    }

    try {
      const db = getDatabase();
      const dbRef = ref(db, "report");
      await push(dbRef, { msg: report });
      setDbStatus("送信しました");
      await store.set("report_send_time", time);
      setReport("");
    } catch (e) {
      setDbStatus("送信に失敗しました");
    }
  };

  useEffect(() => {
    window.addEventListener("offline", () => setIsOffline(true));
    window.addEventListener("online", () => setIsOffline(false));
  }, []);

  return (
    <div className={styles.report_container}>
      <div className={styles.report_box}>
        <p className={styles.title}>質問・報告・その他</p>
        <div className={styles.box}>
          <textarea
            placeholder="カテゴリーに〇〇を追加してください"
            value={report}
            onChange={(e) => {
              setReport(e.target.value);
              setDbStatus("");
            }}
          />
          <div className={styles.submit} onClick={sendReport}>
            送信
          </div>
        </div>
        <p className={styles.status_message}>{dbStatus}</p>
      </div>

      <div className={styles.text_container}>
        <p>
          ・バグや追加してほしい項目等があれば上記フォームよりお願いします。
        </p>
        <p>
          ・個人的な連絡や返信が必要な内容等は <span>Twitter</span>{" "}
          よりお願いします。
        </p>
      </div>

      <div className={styles.back_container} onClick={() => router.back()}>
        <KeyboardReturnIcon className={styles.back} />
      </div>

      <div
        className={styles.usage_container}
        onClick={async () => {
          const webview = new WebviewWindow("open-new-window", {
            url: "https://github.com/SatooRu65536/castle-api-app/blob/main/README.md#%E4%BD%BF%E3%81%84%E6%96%B9",
          });
          const position = await appWindow.innerPosition();
          position.x += 50;
          position.y += 50;
          await webview.setPosition(position);
          await webview.setTitle("使い方");
        }}
      >
        <p className={styles.title}>
          使い方
          <OpenInNewIcon className={styles.mui_icon} />
        </p>
      </div>
    </div>
  );
};

export default Report;
