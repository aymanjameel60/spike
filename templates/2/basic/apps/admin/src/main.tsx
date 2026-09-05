import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@mercurjs/admin/index.css";
import App from "@mercurjs/admin";
import SpikeLaunchPanel from "./spike/SpikeLaunchPanel";
import SpikeProductPriceHelper from "./spike/SpikeProductPriceHelper";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <>
      <App />
      <SpikeLaunchPanel />
      <SpikeProductPriceHelper />
    </>
  </StrictMode>,
);
