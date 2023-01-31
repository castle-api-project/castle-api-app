import { useRouter } from "next/router";
import { useRecoilState } from "recoil";
import {
  CastleDataAtom,
  DataErrsAtom,
  MapCenterPosAtom,
  MarkerPosAtom,
} from "@/components/atom";
import styles from "@/styles/data_set.module.scss";
import {
  CastleData,
  castleTypeList,
  categories,
  Categories,
  digitDesignByLatlng,
  latlngToStr,
  scale,
  Structures,
  structures,
  towerConditionList,
} from "@/components/util";
import React, { useEffect, useState } from "react";
import { AreaNames, getAreaName, Prefs } from "@/components/area";
import { Store } from "tauri-plugin-store-api";
import { getDatabase, push, ref } from "@firebase/database";
import ReportGmailerrorredIcon from "@mui/icons-material/ReportGmailerrorred";
import Link from "next/link";

const DataSet = () => {
  const router = useRouter();
  const [markerPos, setMarkerPos] = useRecoilState(MarkerPosAtom);
  const [mapCenterPos, setMapCenterPos] = useRecoilState(MapCenterPosAtom);
  const [castleData, setCastleData] = useRecoilState(CastleDataAtom);
  const [dataErrs, setDataErrs] = useRecoilState(DataErrsAtom);
  const [isOffline, setIsOffline] = useState(!window.navigator.onLine);

  const store = new Store("castles.dat");

  const getAddressByLatlng = ({ lat, lng }: { lat: number; lng: number }) => {
    const url = `https://geoapi.heartrails.com/api/json?method=searchByGeoLocation&x=${lng}&y=${lat}`;

    fetch(url)
      .then(async (response) => {
        if (!response.ok) throw new Error(`HTTP error: ${response.status}`);

        const res = JSON.parse(await response.text());
        if (!res.response.location) {
          setCastleData({
            ...castleData,
            pref: "",
            area: "",
            city: "",
            address: "",
          });
          setDataErrs({
            ...dataErrs,
            pref: "見つかりませんでした",
            area: "見つかりませんでした",
            city: "見つかりませんでした",
            address: "見つかりませんでした",
            latlng: "",
          });
        } else {
          const location = res.response.location[0];
          const areaNameSnap = getAreaName(location.prefecture, location.city);

          setCastleData({
            ...castleData,
            pref: location.prefecture,
            area: areaNameSnap,
            city: location.city,
            address: location.prefecture + location.city + location.town,
          });
          setDataErrs({
            ...dataErrs,
            pref: "",
            area: "",
            city: "",
            address: "",
            latlng: "",
          });
        }
        void store.set("incomplete", castleData);
      })
      .catch();
  };

  const getLatlngByPlaceName = (prefecture: string, city: string) => {
    const areaNameSnap = getAreaName(prefecture, city);
    setCastleData({ ...castleData, area: areaNameSnap });
    void store.set("incomplete", castleData);
    let url = "https://geoapi.heartrails.com/api/json?method=getTowns";

    if (prefecture !== "") url += `&prefecture=${prefecture}`;
    if (city !== "") url += `&city=${city}`;
    else if (prefecture !== "") return;

    fetch(url)
      .then(async (response) => {
        if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
        const res = JSON.parse(await response.text());

        if (!res.response.location) {
          return;
        } else {
          const location = res.response.location[0];
          setMapCenterPos({ lat: Number(location.y), lng: Number(location.x) });
        }
      })
      .catch();
  };

  const getLatlngErrMsg = () => {
    const latlng = castleData.latlng;
    if (latlng.lat === "" && latlng.lat === "")
      return "経緯度を入力してください";
    else if (latlng.lat === "") return "緯度を入力してください";
    else if (latlng.lng === "") return "経度を入力してください";
    else if (Number(latlng.lat) < -90 || Number(latlng.lat) > 90)
      return "緯度は -90度 ~ 90度 です";
    else if (Number(latlng.lng) < -180 || Number(latlng.lng) > 180)
      return "経度は -180度 ~ 180度 です";
    else return "";
  };

  const onClickSubmit = () => {
    const errs = structuredClone(dataErrs);
    errs.submit = "";

    // 城名
    if (castleData.name === "") errs.name = "入力してください";
    else errs.name = "";

    // 経緯度
    errs.latlng = getLatlngErrMsg();

    // 都道府県
    if (Prefs.includes(castleData.pref as Prefs)) errs.pref = "";
    else if (castleData.pref === "") errs.pref = "都道府県名を入力してください";
    else if (!castleData.pref.match(/[都|道|府|県]$/))
      errs.pref = "「都」「道」「府」「県」を追加してください";
    else errs.pref = "都道府県名が見つかりませんでした";

    // 地域
    if (AreaNames.includes(castleData.area)) errs.area = "";
    else errs.area = "地域名が見つかりませんでした";

    // 市区町村
    if (castleData.city === "") errs.city = "入力してください";
    else if (castleData.city.match(/^[\D]+郡/))
      errs.city = "郡名は省略してください";
    else errs.city = "";

    // 住所
    if (castleData.address === "") errs.address = "入力してください";
    else errs.address = "";

    // 築城年
    if (castleData.build.match(/\D/))
      errs.build = "数字以外は入力できません";
    else if (castleData.build.match(/^[0-9]{1,4}$/)) errs.build = "";
    else errs.build = "桁が間違っています";

    // 天守
    if (castleData.tower.isExist) {
      const structure = castleData.tower.structure;
      if (structure[0] === 0 || structure[1] === 0)
        errs.towerstructure = "入力してください";
      else errs.towerstructure = "";
    } else {
      errs.towerstructure = "";
    }

    let isExistError =
      Object.values(errs).filter((err) => {
        return err !== "";
      }).length !== 0;

    if (isExistError) {
      errs.submit = "正しくないデータがあります";
      setDataErrs(errs);
    } else {
      setCastleData({
        ...castleData,
        alias: castleData.alias.filter((alias) => {
          return alias !== "";
        }),
      });
      void store.set("incomplete", castleData);
      router.push("/submit");
    }
  };

  const onBlurLatlng = () => {
    let lat = castleData.latlng.lat;
    let lng = castleData.latlng.lng;

    if (lat === "" || lng === "") return;
    if (lat.match(/[^0-9.]+/g) || lng.match(/[^0-9.]+/g)) {
      setDataErrs({ ...dataErrs, latlng: "数字以外は使えません" });
      return;
    }
    const latlngSnap = digitDesignByLatlng({ lat, lng });
    const latlngErr = getLatlngErrMsg();
    if (latlngErr === "") setMarkerPos(latlngSnap);
    setDataErrs({ ...dataErrs, latlng: latlngErr });
    setCastleData({ ...castleData, latlng: latlngToStr(latlngSnap) });
    getAddressByLatlng(digitDesignByLatlng(latlngSnap));
    void store.set("incomplete", castleData);
  };

  const onBlurAlias = () => {
    const aliasesSnap = castleData.alias.filter((alias) => {
      return alias.length !== 0;
    });
    aliasesSnap.push("");
    setCastleData({ ...castleData, alias: aliasesSnap });
    void store.set("incomplete", castleData);
  };

  const onChangeStructure = (
    e: React.ChangeEvent<HTMLInputElement>,
    i: number
  ) => {
    const value = Number(e.target.value.slice(-1));
    if (Number.isNaN(value)) return;

    const tower = structuredClone(castleData.tower);
    tower.structure[i] = value;
    setCastleData({ ...castleData, tower });
    void store.set("incomplete", castleData);
  };

  const onChangeStrctures = (
    e: React.ChangeEvent<HTMLInputElement>,
    structure: Structures,
    isRemain = true
  ) => {
    const isChecked = e.target.checked;
    if (isRemain) {
      const remains = castleData.remains;
      if (isChecked)
        setCastleData({ ...castleData, remains: [...remains, structure] });
      else
        setCastleData({
          ...castleData,
          remains: remains.filter((remain) => {
            return remain !== structure;
          }),
        });
    } else {
      const restorations = castleData.restorations;
      if (isChecked)
        setCastleData({
          ...castleData,
          restorations: [...restorations, structure],
        });
      else
        setCastleData({
          ...castleData,
          restorations: restorations.filter((restoration) => {
            return restoration !== structure;
          }),
        });
    }
    void store.set("incomplete", castleData);
  };

  const onChangeCategories = (
    e: React.ChangeEvent<HTMLInputElement>,
    category: Categories
  ) => {
    const isChecked = e.target.checked;
    if (isChecked) {
      setCastleData({
        ...castleData,
        categories: [...castleData.categories, category],
      });
    } else {
      setCastleData({
        ...castleData,
        categories: [
          ...castleData.categories.filter((c) => {
            return c !== category;
          }),
        ],
      });
    }
    void store.set("incomplete", castleData);
  };

  const strToLatlng = (value: string) => {
    if (value.match(/^[北|南][\d]+.?[\d]*°, [東|西][\d]+.?[\d]*°$/)) {
      const latlng = value
        .replace(/[北|東|°| ]/g, "")
        .replace(/[南|西]/g, "-")
        .split(",");

      setCastleData({
        ...castleData,
        latlng: {
          lat: latlng[0],
          lng: latlng[1],
        },
      });
      return true;
    } else if (
      value.match(
        /^[北南]緯[\d]+度[\d]+分[\d]+.?[\d]*秒 [東西]経[\d]+度[\d]+分[\d]+.?[\d]*秒/
      )
    ) {
      const llSplit = value
        .replace(/[北東緯経|°|\s]/g, "")
        .replace(/[南西]/g, "-")
        .split(/[度分秒]/g);

      const latlng = [
        Number(llSplit[0]) +
          Number(llSplit[1]) / 60 +
          Number(llSplit[2]) / 3600,
        Number(llSplit[3]) +
          Number(llSplit[4]) / 60 +
          Number(llSplit[5]) / 3600,
      ];

      setCastleData({
        ...castleData,
        latlng: {
          lat: latlng[0].toFixed(5).toString(),
          lng: latlng[1].toFixed(5).toString(),
        },
      });
      return true;
    } else {
      return false;
    }
  };

  const sendData = async () => {
    const values = await store.values();
    await store.clear();

    if (isOffline) return;
    values.map(async (d: any) => {
      console.log(d.name);

      if (!d.latlng || !d.latlng.lat || !d.latlng.lng) return;

      try {
        const db = getDatabase();
        const dbRef = ref(db, `${d.pref}/${d.area}/${d.city}/${d.name}`);
        await push(dbRef, {
          json: JSON.stringify(d),
        });
      } catch (e) {
        await store.set(`${d.latlng.lat}-${d.latlng.lng}`, d);
      }
    });
  };

  const dataInit = async () => {
    const incompleteData: CastleData = await store.get("incomplete");
    console.log(incompleteData);
    if (incompleteData) setCastleData(incompleteData);
  };

  useEffect(() => {
    window.addEventListener("offline", () => setIsOffline(true));
    window.addEventListener("online", () => setIsOffline(false));
    dataInit();
    sendData();
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.item_box}>
        <p className={styles.title}>
          <span>城名*</span>
          <span className={styles.err_message}>{dataErrs.name}</span>
        </p>
        <input
          type="text"
          placeholder="名古屋城"
          value={castleData.name}
          className={styles.input_value}
          onChange={(e) => {
            setCastleData({ ...castleData, name: e.target.value });
            void store.set("incomplete", castleData);
          }}
          onBlur={() => {
            if (castleData.name !== "") setDataErrs({ ...dataErrs, name: "" });
          }}
        />
      </div>

      <div className={styles.item_box}>
        <p className={styles.title}>
          <span>別名</span>
          <span className={styles.err_message}>{dataErrs.alias}</span>
        </p>
        {castleData.alias.map((alias, i) => {
          return (
            <input
              key={i}
              type="text"
              placeholder="別名"
              value={castleData.alias[i]}
              className={styles.input_value}
              onChange={(e) => {
                const alias = [
                  ...castleData.alias.map((alias, index) => {
                    if (index === i)
                      return e.target.value.split(/[.,、。]/).reverse();
                    else return alias;
                  }),
                ];

                setCastleData({
                  ...castleData,
                  alias: alias.flat(),
                });

                void store.set("incomplete", castleData);
              }}
              onBlur={onBlurAlias}
            />
          );
        })}
      </div>

      <div className={styles.item_box}>
        <p className={styles.title}>
          <span>経緯度*</span>
          <span className={styles.err_message}>{dataErrs.latlng}</span>
        </p>
        <div className={styles.input_box}>
          <input
            type="text"
            placeholder="緯度"
            value={castleData.latlng.lat}
            onChange={(e) => {
              if (!strToLatlng(e.target.value)) {
                const lat = String(e.target.value.match(/[\d]+.?[\d]*/));
                setCastleData({
                  ...castleData,
                  latlng: {
                    ...castleData.latlng,
                    lat: lat === "null" ? "" : lat,
                  },
                });
                void store.set("incomplete", castleData);
              }
            }}
            onBlur={onBlurLatlng}
          />
          <input
            type="text"
            placeholder="経度"
            value={castleData.latlng.lng}
            onChange={(e) => {
              if (!strToLatlng(e.target.value)) {
                const lng = String(e.target.value.match(/[\d]+.?[\d]*/));
                setCastleData({
                  ...castleData,
                  latlng: {
                    ...castleData.latlng,
                    lng: lng === "null" ? "" : lng,
                  },
                });
                void store.set("incomplete", castleData);
              }
            }}
            onBlur={onBlurLatlng}
          />
        </div>
      </div>

      <div className={styles.item_box}>
        <p className={styles.title}>
          <span>都道府県*</span>
          <span className={styles.err_message}>{dataErrs.pref}</span>
        </p>
        <input
          type="text"
          placeholder="愛知県"
          value={castleData.pref}
          className={styles.input_value}
          onChange={(e) => {
            setCastleData({ ...castleData, pref: e.target.value });
            void store.set("incomplete", castleData);
          }}
          onBlur={() => {
            getLatlngByPlaceName(castleData.pref, castleData.city);
            if (castleData.pref !== "") setDataErrs({ ...dataErrs, pref: "" });
          }}
        />
      </div>

      <div className={styles.item_box}>
        <p className={styles.title}>
          <span>地域*</span>
          <span className={styles.err_message}>{dataErrs.area}</span>
        </p>
        <input
          type="text"
          placeholder="尾張"
          value={castleData.area}
          className={styles.input_value}
          onChange={(e) => {
            setCastleData({ ...castleData, area: e.target.value });
            void store.set("incomplete", castleData);
          }}
          onBlur={() => {
            if (castleData.area !== "") setDataErrs({ ...dataErrs, area: "" });
          }}
        />
      </div>

      <div className={styles.item_box}>
        <p className={styles.title}>
          <span>市区町村*</span>
          <span className={styles.err_message}>{dataErrs.city}</span>
        </p>
        <input
          type="text"
          placeholder="名古屋市"
          value={castleData.city}
          className={styles.input_value}
          onChange={(e) => {
            setCastleData({ ...castleData, city: e.target.value });
            void store.set("incomplete", castleData);
          }}
          onBlur={() => {
            getLatlngByPlaceName(castleData.pref, castleData.city);
            if (castleData.city !== "") setDataErrs({ ...dataErrs, city: "" });
          }}
        />
      </div>

      <div className={styles.item_box}>
        <p className={styles.title}>
          <span>住所*</span>
          <span className={styles.err_message}>{dataErrs.address}</span>
        </p>
        <textarea
          placeholder="愛知県名古屋市中区本丸1-1"
          value={castleData.address}
          className={styles.textarea_address}
          onChange={(e) => {
            setCastleData({
              ...castleData,
              address: e.target.value.replace("\n", ""),
            });
            void store.set("incomplete", castleData);
          }}
          onBlur={() => {
            if (castleData.address !== "")
              setDataErrs({ ...dataErrs, address: "" });
          }}
        ></textarea>
      </div>

      <div className={styles.item_box}>
        <p className={styles.title}>
          <span>築城年</span>
          <span className={styles.err_message}>{dataErrs.build}</span>
        </p>
        <input
          type="text"
          placeholder="1610"
          value={castleData.build}
          className={styles.input_value}
          onChange={(e) => {
            setCastleData({
              ...castleData,
              build: String(e.target.value.match(/[0-9]*/)),
            });
            void store.set("incomplete", castleData);
          }}
          onBlur={() => {
            if (castleData.build !== "")
              setDataErrs({ ...dataErrs, build: "" });
          }}
        />
      </div>

      <div className={styles.item_box}>
        <p className={styles.title}>
          <span>規模*</span>
          <span className={styles.err_message}>{dataErrs.scale}</span>
        </p>
        <div className={styles.radio_container}>
          {Object.keys(scale)
            .reverse()
            .map((key) => {
              return (
                <div key={key}>
                  <input
                    type="radio"
                    name="scale"
                    id={`scale_${key}`}
                    checked={castleData.scale === Number(key)}
                    onChange={() => {
                      setCastleData({ ...castleData, scale: Number(key) });
                      void store.set("incomplete", castleData);
                    }}
                  />
                  <label htmlFor={`scale_${key}`}>
                    {key}:{scale[key]}
                  </label>
                </div>
              );
            })}
        </div>
      </div>

      <div className={styles.item_box}>
        <p className={styles.title}>
          <span>城郭構造*</span>
          <span className={styles.err_message}>{dataErrs.type}</span>
        </p>
        <div className={styles.radio_container}>
          {castleTypeList.map((type, i) => {
            return (
              <div key={i}>
                <input
                  type="radio"
                  name="castle_type"
                  id={`type_${i}`}
                  checked={type === castleData.type}
                  onChange={() => {
                    setCastleData({ ...castleData, type });
                    void store.set("incomplete", castleData);
                  }}
                />
                <label htmlFor={`type_${i}`}>{type}</label>
              </div>
            );
          })}
        </div>
      </div>

      <div className={styles.item_box}>
        <p className={styles.title}>
          <span>天守の存在*</span>
          <span className={styles.err_message}>{dataErrs.isTowerExist}</span>
        </p>
        <input
          type="checkbox"
          id="is_exist_tower"
          checked={castleData.tower.isExist}
          className={styles.checkbox}
          onChange={() => {
            const tower = structuredClone(castleData.tower);
            tower.isExist = !tower.isExist;
            setCastleData({ ...castleData, tower });
            void store.set("incomplete", castleData);
          }}
        />
        <label htmlFor="is_exist_tower" className={styles.is_exist}>
          {castleData.tower.isExist ? "存在する(した)" : "存在しない"}
        </label>
      </div>

      {castleData.tower.isExist && (
        <div className={styles.item_box}>
          <p className={styles.title}>
            <span>天守構造*</span>
            <span className={styles.err_message}>
              {dataErrs.towerstructure}
            </span>
          </p>

          <div className={styles.towerstructure_container}>
            <input
              type="text"
              placeholder="5"
              value={castleData.tower.structure[0] || ""}
              onChange={(e) => onChangeStructure(e, 0)}
              onBlur={() => {
                const structure = castleData.tower.structure;
                if (structure[0] !== 0 && structure[1] !== 0)
                  setDataErrs({ ...dataErrs, towerstructure: "" });
              }}
            />
            <span>層</span>
            <input
              type="text"
              placeholder="5"
              value={castleData.tower.structure[1] || ""}
              onChange={(e) => onChangeStructure(e, 1)}
              onBlur={() => {
                const structure = castleData.tower.structure;
                if (structure[0] !== 0 && structure[1] !== 0)
                  setDataErrs({ ...dataErrs, towerstructure: "" });
              }}
            />
            <span>階</span>
          </div>

          <div className={styles.radio_container}>
            {towerConditionList.map((condition, i) => {
              return (
                <div key={i}>
                  <input
                    type="radio"
                    name="tower_condition"
                    id={`condition_${i}`}
                    checked={condition === castleData.tower.condition}
                    onChange={() => {
                      const tower = structuredClone(castleData.tower);
                      tower.condition = condition;
                      setCastleData({ ...castleData, tower });
                      void store.set("incomplete", castleData);
                    }}
                  />
                  <label htmlFor={`condition_${i}`}>{condition}</label>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className={styles.item_box}>
        <p className={styles.title}>
          <span>現存する構造物</span>
          <span className={styles.err_message}>{dataErrs.remains}</span>
        </p>
        <div className={styles.many_items_container}>
          {structures.map((structure, i) => {
            return (
              <div key={i}>
                <input
                  type="checkbox"
                  name="remain"
                  id={`remain_${i}`}
                  checked={castleData.remains.includes(structure)}
                  onChange={(e) => onChangeStrctures(e, structure)}
                />
                <label htmlFor={`remain_${i}`}>{structure}</label>
              </div>
            );
          })}
        </div>
      </div>

      <div className={styles.item_box}>
        <p className={styles.title}>
          <span>復元された構造物</span>
          <span className={styles.err_message}>{dataErrs.restorations}</span>
        </p>
        <div className={styles.many_items_container}>
          {structures.map((structure, i) => {
            return (
              <div key={i}>
                <input
                  type="checkbox"
                  name="restoration"
                  id={`restoration_${i}`}
                  checked={castleData.restorations.includes(structure)}
                  onChange={(e) => onChangeStrctures(e, structure, false)}
                />
                <label htmlFor={`restoration_${i}`}>{structure}</label>
              </div>
            );
          })}
        </div>
      </div>

      <div className={styles.item_box}>
        <p className={styles.title}>
          <span>カテゴリー</span>
          <span className={styles.err_message}>{dataErrs.categories}</span>
        </p>
        <div className={styles.many_items_container}>
          {categories.map((category, i) => {
            return (
              <div key={i}>
                <input
                  type="checkbox"
                  name="category"
                  id={`category_${i}`}
                  checked={castleData.categories.includes(category)}
                  onChange={(e) => onChangeCategories(e, category)}
                />
                <label htmlFor={`category_${i}`}>{category}</label>
              </div>
            );
          })}
        </div>
      </div>

      <div className={styles.item_box}>
        <p className={styles.title}>
          <span>サイト</span>
          <span className={styles.err_message}>{dataErrs.site}</span>
        </p>
        <input
          type="text"
          placeholder="https://example.com/..."
          value={castleData.site}
          className={styles.input_value}
          onChange={(e) => {
            setCastleData({ ...castleData, site: e.target.value });
            void store.set("incomplete", castleData);
          }}
        />
      </div>

      <div className={styles.item_box}>
        <p className={styles.title}>
          <span>参考資料</span>
          <span className={styles.err_message}>{dataErrs.site}</span>
        </p>
        <input
          type="text"
          placeholder="書籍: マニアックな城1万選"
          value={castleData.reference}
          className={styles.input_value}
          onChange={(e) => {
            setCastleData({ ...castleData, reference: e.target.value });
            void store.set("incomplete", castleData);
          }}
        />
      </div>

      <div className={styles.submit_container}>
        <div className={styles.submit} onClick={onClickSubmit}>
          完了
        </div>
        <p className={styles.err_message}>{dataErrs.submit}</p>
      </div>

      <Link href={"/report"} className={styles.report_container}>
        <ReportGmailerrorredIcon className={styles.report} />
      </Link>
    </div>
  );
};

export default DataSet;
