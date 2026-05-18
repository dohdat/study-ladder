import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { AppProviders } from "./AppProviders";
import Home from "../pages/index";

document.title = "Study Ladder";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppProviders>
      <Home />
    </AppProviders>
  </StrictMode>
);
