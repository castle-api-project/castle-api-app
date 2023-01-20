import React from "react";
import dynamic from "next/dynamic";

const Comfirm = () => {
  const ComfirmPage = () => {
    const ComfirmView = React.useMemo(
      () =>
        dynamic(() => import("@/view/completion_view"), {
          loading: () => <></>,
          ssr: false,
        }),
      []
    );
    return <ComfirmView />;
  };

  return <ComfirmPage />;
};

export default Comfirm;
