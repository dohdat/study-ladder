import { ColorSchemeScript } from "@mantine/core";
import { Head, Html, Main, NextScript } from "next/document";

const DARK_BACKGROUND = "#1a1b1e";

export default function Document() {
  return (
    <Html lang="en" data-mantine-color-scheme="dark" style={{ backgroundColor: DARK_BACKGROUND, colorScheme: "dark" }}>
      <Head>
        <ColorSchemeScript defaultColorScheme="dark" />
      </Head>
      <body style={{ backgroundColor: DARK_BACKGROUND }}>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
