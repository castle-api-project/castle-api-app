import dynamic from "next/dynamic";
import React from "react";
import { useState } from "react";
import { useMemo } from "react";
import { Rnd } from "react-rnd";

import DataSet from "@/components/data_set";
import MapLoading from "@/components/map_loading";
import styles from "@/styles/index.module.scss";

const App = () => {
  const [mapWindowWidth, setMapWindowWidth] = useState(50);

  const MapPage = () => {
    const Map = React.useMemo(
      () =>
        dynamic(() => import("../components/map"), {
          loading: () => <MapLoading />,
          ssr: false,
        }),
      [mapWindowWidth]
    );
    return <Map />;
  };

  const mapResizeStop = (
    e: MouseEvent,
    direction: string,
    ref: HTMLElement
  ) => {
    setMapWindowWidth(parseFloat(ref.style.width));
  };

  return (
    <>
      <Rnd
        className={styles.map_container}
        disableDragging={true}
        enableResizing={{ right: true }}
        default={{
          width: "50%",
          height: "100%",
          x: 0,
          y: -8,
        }}
        maxWidth={"90%"}
        minWidth={"10%"}
        onResizeStop={mapResizeStop}
      >
        <MapPage />
      </Rnd>
      <div
        style={{ width: 100 - mapWindowWidth + "%" }}
        className={styles.data_container}
      >
        <DataSet></DataSet>
      </div>
    </>
  );
};

export default App;
