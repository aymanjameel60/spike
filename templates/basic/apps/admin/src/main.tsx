import "./index.css"
import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "@mercurjs/admin/index.css"
import "./index.css"
import "./spike-shared/spike-dashboard-global.css"
import "./spike-shared/spike-system-ui.css"
import "./spike-shared/spike-shell-v2.css"
import App from "@mercurjs/admin"

document.documentElement.lang = "ar"
document.documentElement.dir = "rtl"
document.documentElement.classList.remove("dark")
document.documentElement.style.colorScheme = "light"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
