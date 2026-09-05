import type { RouteConfig } from "@mercurjs/dashboard-sdk"
import SpikeAdminPage from "../../spike/SpikeAdminPage"

export const config: RouteConfig = {
  label: "Spike",
  rank: -20,
}

export default function SpikePage() {
  return <SpikeAdminPage />
}
