import { CastleDataAtom } from "@/components/atom";
import { useRecoilState } from "recoil";
import styles from "@/styles/completion_view.module.scss";

const CompletionView = () => {
  const [castleData, setCastleData] = useRecoilState(CastleDataAtom);

  const genData = () => {
    const json = JSON.stringify(castleData);
    console.log(json);
    return json;
  };

  return (
    <div className={styles.completion_container}>
      <div className={styles.half_box}>
        <textarea>{genData()}</textarea>
      </div>
    </div>
  );
};

export default CompletionView;
