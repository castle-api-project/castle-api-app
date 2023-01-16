import dynamic from "next/dynamic";
import React from "react";
import { useState } from "react";
import { Rnd } from "react-rnd";

import MapLoading from "@/view/map_loading";
import styles from "@/styles/index.module.scss";
import DataSetLoading from "@/view/data_set_loading";

const App = () => {
  const [mapWindowWidth, setMapWindowWidth] = useState(50);

  const MapPage = () => {
    const Map = React.useMemo(
      () =>
        dynamic(() => import("src/view/map"), {
          loading: () => <MapLoading />,
          ssr: false,
        }),
      [mapWindowWidth]
    );
    return <Map />;
  };

  const DataSetPage = () => {
    const DataSet = React.useMemo(
      () =>
        dynamic(() => import("@/view/data_set"), {
          loading: () => <DataSetLoading />,
          ssr: false,
        }),
      []
    );
    return <DataSet />;
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
          y: 0,
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
        <DataSetPage />
      </div>
    </>
  );
};

export default App;
