import { useRecoilState } from "recoil";
import {
  AddressAtom,
  AliasesAtom,
  AreaNameAtom,
  CastleNameAtom,
  CityNameAtom,
  LatlngAtom,
  MarkerPosAtom,
  PrefNameAtom,
} from "@/components/atom";
import styles from "@/styles/data_set.module.scss";
import {
  categories,
  Categories,
  digitDesignByLatlng,
  latlngToStr,
  structures,
  Structures,
} from "@/components/util";
import React, { useState } from "react";
import { getAreaName } from "@/components/area";
import Leaflet from "leaflet";

const DataSet = () => {
  const [castleName, setCastleName] = useRecoilState(CastleNameAtom);
  const [aliases, setAliases] = useRecoilState(AliasesAtom);
  const [markerPos, setMarkerPos] = useRecoilState(MarkerPosAtom);
  const [latlng, setLatlng] = useRecoilState(LatlngAtom);
  const [latlngErr, setLatlngError] = useState("");
  const [prefName, setPrefName] = useRecoilState(PrefNameAtom);
  const [areaName, setAreaName] = useRecoilState(AreaNameAtom);
  const [cityName, setCityName] = useRecoilState(CityNameAtom);
  const [address, setAddress] = useRecoilState(AddressAtom);
  const [build, setBuild] = useState<"" | number>("");
  const [isExistTower, setIsExistTower] = useState(false);
  const [structure, setStructure] = useState<["" | number, "" | number]>([
    "",
    "",
  ]);
  const [remains, setRemains] = useState<Structures[]>([]);
  const [restorations, setRestorations] = useState<Structures[]>([]);
  const [selectCategories, setCategories] = useState<Categories[]>([]);
  const [site, setSite] = useState("");

  const scaleList = [
    "5 : 城内が整備されている",
    "4 : 本丸周りは残っている",
    "3 : 一部の建物や堀・石垣・曲輪はある",
    "2 : 看板のみある",
    "1 : 何も無い",
    "0 : 位置も曖昧",
  ] as const;
  const castleTypeList = [
    "山城",
    "平山城",
    "平城",
    "海城",
    "湖城",
    "面崖式",
    "丘先式",
  ] as const;

  const towerConditionList = ["現存", "復元", "復興", "模擬"] as const;

  const getAddressByLatlng = ({ lat, lng }: { lat: number; lng: number }) => {
    const url = `https://geoapi.heartrails.com/api/json?method=searchByGeoLocation&x=${lng}&y=${lat}`;

    fetch(url)
      .then(async (response) => {
        if (!response.ok) throw new Error(`HTTP error: ${response.status}`);

        const res = JSON.parse(await response.text());
        if (!res.response.location) {
          setAreaName("なし");
          setPrefName("なし");
          setCityName("なし");
          setAddress("なし");
        } else {
          const location = res.response.location[0];
          const areaNameSnap = getAreaName(location.prefecture, location.city);

          setAreaName(areaNameSnap);
          setPrefName(location.prefecture);
          setCityName(location.city);
          setAddress(location.prefecture + location.city + location.town);
        }
      })
      .catch();
  };

  const getLatlngByPlaceName = (prefecture: string, city: string) => {
    const areaNameSnap = getAreaName(prefecture, city);
    setAreaName(areaNameSnap);
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
          console.log(location);
          setMarkerPos(
            Leaflet.latLng([Number(location.y), Number(location.x)])
          );
        }
      })
      .catch();
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
    if (lat.match(/[^0-9.]+/g) || lng.match(/[^0-9.]+/g)) {
      setLatlngError("数字以外は使えません");
      return;
    }
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
    setLatlng(latlngToStr(latlngSnap));
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

  const changeBuild = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const year = Number(value.match(/[0-9]+/)) || "";
    setBuild(year);
  };

  const changeConstructure = (
    e: React.ChangeEvent<HTMLInputElement>,
    i: number
  ) => {
    const value = Number(e.target.value);
    if (Number.isNaN(value)) return;

    if (i == 0) setStructure([value, structure[1]]);
    else setStructure([structure[0], value]);
  };

  const onChangeConstrctures = (
    e: React.ChangeEvent<HTMLInputElement>,
    structure: Structures,
    isRemain = true
  ) => {
    const isChecked = e.target.checked;

    if (isChecked) {
      if (isRemain) setRemains([...remains, structure]);
      else setRestorations([...restorations, structure]);
    } else {
      if (isRemain)
        setRemains(
          remains.filter((remain) => {
            return remain !== structure;
          })
        );
      else
        setRestorations(
          restorations.filter((restoration) => {
            return restoration !== structure;
          })
        );
    }
  };

  const onChangeCategories = (
    e: React.ChangeEvent<HTMLInputElement>,
    category: Categories
  ) => {
    const isChecked = e.target.checked;
    if (isChecked) {
      setCategories([...selectCategories, category]);
    } else {
      setCategories(
        selectCategories.filter((c) => {
          return c !== category;
        })
      );
    }
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
          onBlur={() => getLatlngByPlaceName(prefName, cityName)}
        />
      </div>

      <div className={styles.item_box}>
        <p className={styles.title}>地方</p>
        <input
          type="text"
          placeholder="尾張"
          value={areaName}
          className={styles.input_value}
          onChange={() => {}}
        />
      </div>

      <div className={styles.item_box}>
        <p className={styles.title}>市区町村</p>
        <input
          type="text"
          placeholder="名古屋市"
          value={cityName}
          className={styles.input_value}
          onChange={(e) => setCityName(e.target.value)}
          onBlur={() => getLatlngByPlaceName(prefName, cityName)}
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

      <div className={styles.item_box}>
        <p className={styles.title}>築城年</p>
        <input
          type="text"
          placeholder="1600"
          value={build}
          className={styles.input_value}
          onChange={changeBuild}
        />
      </div>

      <div className={styles.item_box}>
        <p className={styles.title}>規模</p>
        <div className={styles.radio_container}>
          {scaleList.map((scale, i) => {
            return (
              <div key={i}>
                <input
                  type="radio"
                  name="scale"
                  id={`scale_${i}`}
                  defaultChecked={i == 2}
                />
                <label htmlFor={`scale_${i}`}>{scale}</label>
              </div>
            );
          })}
        </div>
      </div>

      <div className={styles.item_box}>
        <p className={styles.title}>城郭構造</p>
        <div className={styles.radio_container}>
          {castleTypeList.map((type, i) => {
            return (
              <div key={i}>
                <input
                  type="radio"
                  name="castle_type"
                  id={`type_${i}`}
                  defaultChecked={i == 2}
                />
                <label htmlFor={`type_${i}`}>{type}</label>
              </div>
            );
          })}
        </div>
      </div>

      <div className={styles.item_box}>
        <p className={styles.title}>天守の存在</p>
        <input
          type="checkbox"
          id="is_exist_tower"
          checked={isExistTower}
          className={styles.checkbox}
          onChange={() => setIsExistTower(!isExistTower)}
        />
        <label htmlFor="is_exist_tower" className={styles.is_exist}>
          {isExistTower ? "ある" : "ない"}
        </label>
      </div>

      {isExistTower && (
        <div className={styles.item_box}>
          <p className={styles.title}>天守構造</p>
          <div className={styles.towerstructure_container}>
            <input
              type="text"
              value={structure[0]}
              onChange={(e) => changeConstructure(e, 0)}
            />
            <span>重</span>
            <input
              type="text"
              value={structure[1]}
              onChange={(e) => changeConstructure(e, 1)}
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
                    defaultChecked={i == 1}
                  />
                  <label htmlFor={`type_${i}`}>{condition}</label>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className={styles.item_box}>
        <p className={styles.title}>現存する構造物</p>
        <div className={styles.many_items_container}>
          {structures.map((structure, i) => {
            return (
              <div key={i}>
                <input
                  type="checkbox"
                  name="remain"
                  id={`remain_${i}`}
                  checked={remains.includes(structure)}
                  onChange={(e) => onChangeConstrctures(e, structure)}
                />
                <label htmlFor={`remain_${i}`}>{structure}</label>
              </div>
            );
          })}
        </div>
      </div>

      <div className={styles.item_box}>
        <p className={styles.title}>復元された構造物</p>
        <div className={styles.many_items_container}>
          {structures.map((structure, i) => {
            return (
              <div key={i}>
                <input
                  type="checkbox"
                  name="restoration"
                  id={`restoration_${i}`}
                  checked={restorations.includes(structure)}
                  onChange={(e) => onChangeConstrctures(e, structure, false)}
                />
                <label htmlFor={`restoration_${i}`}>{structure}</label>
              </div>
            );
          })}
        </div>
      </div>

      <div className={styles.item_box}>
        <p className={styles.title}>カテゴリー</p>
        <div className={styles.many_items_container}>
          {categories.map((category, i) => {
            return (
              <div key={i}>
                <input
                  type="checkbox"
                  name="category"
                  id={`category_${i}`}
                  checked={selectCategories.includes(category)}
                  onChange={(e) => onChangeCategories(e, category)}
                />
                <label htmlFor={`category_${i}`}>{category}</label>
              </div>
            );
          })}
        </div>
      </div>

      <div className={styles.item_box}>
        <p className={styles.title}>サイト</p>
        <input
          type="text"
          placeholder="https://example.com/..."
          value={site}
          className={styles.input_value}
          onChange={(e) => setSite(e.target.value)}
        />
      </div>
    </div>
  );
};

export default DataSet;
