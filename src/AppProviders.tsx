import "@mantine/core/styles.css";
import "./global.css";

import { MantineProvider, createTheme } from "@mantine/core";
import type { ReactNode } from "react";

const theme = createTheme({
  defaultRadius: "md",
  primaryColor: "blue"
});

export function AppProviders(props: { children: ReactNode }) {
  return (
    <MantineProvider theme={theme} forceColorScheme="dark">
      {props.children}
    </MantineProvider>
  );
}
