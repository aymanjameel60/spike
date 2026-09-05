import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@mercurjs/vendor/index.css";
import "./spike/vendor-spike.css";
import "./spike/spike-system-ui.css";
import "./spike/ui-components.css";
import "./spike/spike-shell-v2.css";
import "./spike-tailwind.css";
import App from "@mercurjs/vendor";
import ExchangeBar from "./spike/ExchangeBar";

document.documentElement.lang = "ar";
document.documentElement.dir = "rtl";
document.documentElement.classList.remove("dark");
document.documentElement.style.colorScheme = "light";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <>
      <App />
      <ExchangeBar />
    </>
  </StrictMode>,
);
