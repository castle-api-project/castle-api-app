import { appWindow, WebviewWindow } from "@tauri-apps/api/window";
import React from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useRecoilState } from "recoil";
import styles from "@/styles/data_view.module.scss";
import { CastleDataAtom } from "@/components/atom";
import { scale } from "@/components/util";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

const DataView = () => {
  const [castleData, setCastleData] = useRecoilState(CastleDataAtom);

  const MapView = () => {
    const Map = React.useMemo(
      () =>
        dynamic(() => import("src/view/submit_map"), {
          loading: () => <></>,
          ssr: false,
        }),
      []
    );
    return <Map />;
  };

  return (
    <div className={styles.submit_container}>
      <div className={styles.header}>
        <h2>{castleData.name}</h2>
        <div className={styles.alias_box}>
          <span className={styles.title}>別名</span>
          {castleData.alias.map((alias, i) => {
            return (
              <span key={i} className={styles.value}>
                {alias}
              </span>
            );
          })}
        </div>
      </div>

      <div className={styles.whole_container}>
        <div className={styles.upper_left_container}>
          <div>
            <span className={styles.title}>都道府県</span>
            <span className={styles.value}>{castleData.pref}</span>
          </div>
          <div>
            <span className={styles.title}>地域</span>
            <span className={styles.value}>{castleData.area}</span>
          </div>
          <div>
            <span className={styles.title}>市区町村</span>
            <span className={styles.value}>{castleData.city}</span>
          </div>
          <div>
            <span className={styles.title}>住所</span>
            <span className={styles.address_area}>{castleData.address}</span>
          </div>
        </div>

        <div className={styles.upper_right_container}>
          <div>
            <span className={styles.title}>築城年</span>
            <span className={styles.value}>{castleData.build}年</span>
          </div>

          <div>
            <span className={styles.title}>城郭構造</span>
            <span className={styles.value}>{castleData.type}</span>
          </div>

          <div>
            <span className={styles.title}>規模</span>
            <span className={styles.value}>
              {castleData.scale} : {scale[castleData.scale]}
            </span>
          </div>

          {castleData.tower.isExist ? (
            <div>
              <span className={styles.title}>天守構造</span>
              <span className={styles.value}>
                {castleData.tower.constructure[0]}層
                {castleData.tower.constructure[1]}階
                {" (" + castleData.tower.condition + ")"}
              </span>
            </div>
          ) : (
            <div>
              <span className={styles.title}>天守構造</span>
              <span className={styles.value}>存在しない</span>
            </div>
          )}

          <div>
            <span className={styles.title}>現存</span>
            <span className={styles.value_area}>
              {castleData.remains.map((remain, i) => {
                return (
                  <span key={i} className={styles.item_remain}>
                    {remain}
                  </span>
                );
              })}
              {castleData.remains.length === 0 && (
                <span className={styles.item_remain}>なし</span>
              )}
            </span>
          </div>

          <div>
            <span className={styles.title}>復元</span>
            <span className={styles.value_area}>
              {castleData.restorations.map((restoration, i) => {
                return (
                  <span key={i} className={styles.item_restoration}>
                    {restoration}
                  </span>
                );
              })}
              {castleData.restorations.length === 0 && (
                <span className={styles.item_restoration}>なし</span>
              )}
            </span>
          </div>

          <div>
            <span className={styles.title}>カテゴリー</span>
            <span className={styles.value_area}>
              {castleData.categories.map((category, i) => {
                return (
                  <span key={i} className={styles.item_category}>
                    {category}
                  </span>
                );
              })}
              {castleData.categories.length === 0 && (
                <span className={styles.item_category}>なし</span>
              )}
            </span>
          </div>

          <div>
            <span className={styles.title}>サイト</span>
            {castleData.site === "" ? (
              <div className={styles.site}>なし</div>
            ) : (
              <div
                className={styles.site}
                onClick={async () => {
                  const webview = new WebviewWindow("open-new-window", {
                    url: "https://www.nagoyajo.city.nagoya.jp/",
                  });
                  const position = await appWindow.innerPosition();
                  position.x += 50;
                  position.y += 50;
                  await webview.setPosition(position);
                  await webview.setTitle(castleData.name);
                }}
              >
                <OpenInNewIcon className={styles.mui_icon} />
                <span>{castleData.site}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className={styles.map_container}>
        <MapView />
      </div>

      <div className={styles.confirm_container}>
        <Link className={styles.return} href={"/"}>
          戻る
        </Link>
        <Link className={styles.completion} href={"/completion"}>
          完了
        </Link>
      </div>
    </div>
  );
};

export default DataView;
