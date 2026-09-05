import { defineConfig, loadEnv } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import { createRequire } from "node:module"
import { fileURLToPath, URL } from "node:url"

const require = createRequire(import.meta.url)
const { mercurDashboardPlugin } = require("@mercurjs/dashboard-sdk/vite")

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "")
  const backendUrl = env.VITE_MERCUR_BACKEND_URL || env.MERCUR_BACKEND_URL

  return {
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
    plugins: [
      react(),
      tailwindcss(),
      mercurDashboardPlugin({
        medusaConfigPath: "../../packages/api/medusa-config.ts",
        name: "Spike",
        ...(backendUrl ? { backendUrl } : {}),
      }),
    ],
  }
})