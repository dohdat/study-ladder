import "@mantine/core/styles.css";

import type { AppProps } from "next/app";
import { MantineProvider, createTheme } from "@mantine/core";

const theme = createTheme({
  primaryColor: "blue",
  defaultRadius: "md"
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <MantineProvider theme={theme} forceColorScheme="dark">
      <Component {...pageProps} />
    </MantineProvider>
  );
}
