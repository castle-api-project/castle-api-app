import React from "react";
import dynamic from "next/dynamic";

const Report = () => {
  const ReportPage = () => {
    const ReportView = React.useMemo(
      () =>
        dynamic(() => import("@/view/report_view"), {
          loading: () => <></>,
          ssr: false,
        }),
      []
    );
    return <ReportView />;
  };

  return <ReportPage />;
};

export default Report;
