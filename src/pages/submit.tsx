import React from "react";
import dynamic from "next/dynamic";

const Submit = () => {
  const DataViewPage = () => {
    const DataView = React.useMemo(
      () =>
        dynamic(() => import("@/view/data_view"), {
          loading: () => <></>,
          ssr: false,
        }),
      []
    );
    return <DataView />;
  };

  return <DataViewPage />;
};

export default Submit;
