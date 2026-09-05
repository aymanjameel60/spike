import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "@mercurjs/admin/index.css"
import "./spike-shared/spike-dashboard-global.css"
import "./spike-shared/spike-system-ui.css"
import "./spike-shared/spike-shell-v2.css"
import App from "@mercurjs/admin"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <>
      <App />
    </>
  </StrictMode>,
)
