import type { AppProps } from "next/app";
import { RecoilRoot } from "recoil";
import { Noto_Sans_JP } from "@next/font/google";
import { initializeFirebaseApp } from "@/lib/firebase";
import "../styles/globals.scss";

const noto = Noto_Sans_JP({
  weight: ["100", "300", "400", "500", "700", "900"],
  preload: false,
});

initializeFirebaseApp();
export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <main className={noto.className}>
      <RecoilRoot>
        <Component {...pageProps} />
      </RecoilRoot>
    </main>
  );
}
