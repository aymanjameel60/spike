import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@mercurjs/vendor/index.css";
import "./spike/vendor-spike.css";
import "./spike/spike-system-ui.css";
import "./spike/ui-components.css";
import "./spike/spike-shell-v2.css";
import App from "@mercurjs/vendor";
import ExchangeBar from "./spike/ExchangeBar";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <>
      <App />
      <ExchangeBar />
    </>
  </StrictMode>,
);
